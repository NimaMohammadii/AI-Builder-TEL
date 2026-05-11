import { aiReply } from './ai';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v3';
import { trackTelegramBotUser } from './admin-users';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  await trackTelegramBotUser(env, bot.id, update).catch((error) => console.warn('admin user tracking skipped', error));
  try {
    if (update.pre_checkout_query) {
      await handleStarsPreCheckout(env, update.pre_checkout_query);
      return;
    }
    if (update.message?.successful_payment) {
      const userId = update.message.from?.id ?? update.message.chat.id;
      await handleStarsSuccessfulPayment(env, userId, update.message.successful_payment);
      return;
    }
    if (update.message && (await handleMainBotGroupMessage(env, bot, update))) return;
    if (isGroupUpdate(update)) return;
    await baseProcessTelegramUpdate(env, bot, update);
  } catch (error) {
    console.error('safe builder runtime caught error', error);
    await notifyBuilderFailure(env, bot, update, error).catch((notifyError) => console.error('failed to notify builder error', notifyError));
  }
}

async function handleMainBotGroupMessage(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<boolean> {
  const message = update.message;
  if (!message || !isGroupChat(message.chat.type)) return false;

  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return true;

  const text = message.text?.trim() ?? '';
  if (!mentionsVexa(text, bot.username)) return true;

  const prompt = cleanGroupPrompt(text, bot.username);
  if (!prompt) return true;

  const token = await decryptUserToken(env, bot.encrypted_token);
  const reply = await groupReply(env, prompt);
  await telegram(token, 'sendMessage', { chat_id: message.chat.id, text: reply, reply_to_message_id: message.message_id }).catch((error) => console.warn('main bot group reply failed', error));
  return true;
}

function isGroupUpdate(update: TelegramUpdate): boolean {
  if (update.my_chat_member && isGroupChat(update.my_chat_member.chat.type)) return true;
  return Boolean(update.message && isGroupChat(update.message.chat.type));
}

function isGroupChat(type: string): boolean {
  return type === 'group' || type === 'supergroup';
}

function mentionsVexa(text: string, username: string | null): boolean {
  const lower = text.toLowerCase();
  return /(^|\s|[،,.!؟?])(?:vexa|وکسا)($|\s|[،,.!؟?:])/i.test(text) || Boolean(username && lower.includes('@' + username.toLowerCase())) || /(^|\s)@[a-z0-9_]+bot(\s|$)/i.test(text);
}

function cleanGroupPrompt(text: string, username: string | null): string {
  let cleaned = text.replace(/(^|\s|[،,.!؟?])(?:vexa|وکسا)([،,.!؟?:\s-]*)/ig, ' ');
  if (username) cleaned = cleaned.replace(new RegExp('@' + username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), ' ');
  cleaned = cleaned.replace(/(^|\s)@[a-z0-9_]+bot(\s|$)/ig, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

async function groupReply(env: Env, prompt: string): Promise<string> {
  const system = 'You are Vexa inside a Telegram group. Reply in the user language, be warm, friendly, helpful, and concise. Use live web search when current facts are useful. Do not mention tools.';
  if (!env.OPENAI_API_KEY) return aiReply(env, system, prompt, []);
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, instructions: system, input: prompt.slice(0, 2500), tools: [{ type: 'web_search_preview' }], max_output_tokens: 450 }),
    });
    const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
    const text = extractText(data);
    if (text) return text.slice(0, 1200);
  } catch (error) {
    console.warn('group live reply failed', error);
  }
  return aiReply(env, system, prompt, []);
}

function extractText(data: ResponsesApiResult | null): string | null {
  if (!data) return null;
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  return data.error?.message ?? null;
}

async function notifyBuilderFailure(env: Env, bot: BotRecord, update: TelegramUpdate, error: unknown): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return;

  const callback = update.callback_query;
  const message = update.message;
  const chatId = callback?.message?.chat.id ?? message?.chat.id;
  if (!chatId) return;

  const token = await decryptUserToken(env, bot.encrypted_token);
  const text = buildFailureText(error);

  if (callback?.message?.message_id) {
    await telegram(token, 'editMessageText', {
      chat_id: chatId,
      message_id: callback.message.message_id,
      text,
      reply_markup: { inline_keyboard: [] },
    }).catch(async () => {
      await telegram(token, 'sendMessage', { chat_id: chatId, text });
    });
    return;
  }

  await telegram(token, 'sendMessage', { chat_id: chatId, text });
}

function buildFailureText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || 'unknown error');
  return 'Change was not completed. Reason: ' + message.slice(0, 500) + '\n\nThe pending request was not removed. You can confirm again or send a clearer request.';
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<T>;
}

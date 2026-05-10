import { aiReply } from './ai';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v3';
import { trackTelegramBotUser } from './admin-users';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

type GroupInfo = { chatId: string; type: string; title: string; username: string; lastSeenAt: string };
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
    if (update.message && (await handleGroupVexaMessage(env, bot, update))) return;
    await baseProcessTelegramUpdate(env, bot, update);
  } catch (error) {
    console.error('safe builder runtime caught error', error);
    await notifyBuilderFailure(env, bot, update, error).catch((notifyError) => console.error('failed to notify builder error', notifyError));
  }
}

async function handleGroupVexaMessage(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<boolean> {
  const message = update.message;
  if (!message || !isGroupChat(message.chat.type)) return false;

  const settings = safeParseJson<{ isBuilderBot?: boolean; groups?: GroupInfo[] }>(bot.settings_json, {});
  if (settings.isBuilderBot) return false;

  await saveGroup(env, bot, settings, message.chat as { id: number; type: string; title?: string; username?: string }).catch((error) => console.warn('group save skipped', error));

  const text = message.text?.trim() ?? '';
  if (!mentionsVexa(text, bot.username)) return true;

  const prompt = cleanGroupPrompt(text, bot.username);
  if (!prompt) return true;

  const token = await decryptUserToken(env, bot.encrypted_token);
  const reply = await groupReply(env, bot, prompt);
  await telegram(token, 'sendMessage', { chat_id: message.chat.id, text: reply, reply_to_message_id: message.message_id }).catch((error) => console.warn('group reply failed', error));
  return true;
}

function isGroupChat(type: string): boolean {
  return type === 'group' || type === 'supergroup';
}

function mentionsVexa(text: string, username: string | null): boolean {
  const lower = text.toLowerCase();
  return /(^|\s|[،,.!؟?])vexa($|\s|[،,.!؟?:])/i.test(text) || Boolean(username && lower.includes('@' + username.toLowerCase()));
}

function cleanGroupPrompt(text: string, username: string | null): string {
  let cleaned = text.replace(/(^|\s|[،,.!؟?])vexa([،,.!؟?:\s-]*)/ig, ' ');
  if (username) cleaned = cleaned.replace(new RegExp('@' + username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

async function saveGroup(env: Env, bot: BotRecord, settings: { groups?: GroupInfo[] }, chat: { id: number; type: string; title?: string; username?: string }): Promise<void> {
  const now = new Date().toISOString();
  const chatId = String(chat.id);
  const groups = Array.isArray(settings.groups) ? settings.groups.filter((group) => group && group.chatId !== chatId) : [];
  settings.groups = [{ chatId, type: chat.type, title: chat.title || chat.username || chatId, username: chat.username || '', lastSeenAt: now }, ...groups].slice(0, 30);
  await env.DB.prepare('UPDATE bots SET settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(settings), bot.id).run();
  await env.BOT_CACHE.delete(`bot:${bot.id}`).catch(() => undefined);
  await env.DB.prepare('INSERT INTO bot_groups (bot_id, chat_id, chat_type, title, username, last_seen_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(bot_id, chat_id) DO UPDATE SET chat_type = excluded.chat_type, title = excluded.title, username = excluded.username, last_seen_at = CURRENT_TIMESTAMP')
    .bind(bot.id, chatId, chat.type, chat.title || null, chat.username || null)
    .run()
    .catch(() => undefined);
}

async function groupReply(env: Env, bot: BotRecord, prompt: string): Promise<string> {
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

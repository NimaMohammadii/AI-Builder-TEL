import { aiReply } from './ai';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v3';
import { trackTelegramBotUser } from './admin-users';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import type { BotRecord, Env, TelegramChat, TelegramUpdate, TelegramUser } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

const GROUP_REPLY_COST_NANO = 400000;

type GroupReplyMessage = { reply_to_message?: { from?: { is_bot?: boolean; username?: string } } };
type MainGroupBillingRow = { added_by_user_id: string | null };
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
    if (update.my_chat_member && (await handleMainBotGroupMembership(env, bot, update))) return;
    if (update.message && (await handleMainBotGroupMessage(env, bot, update))) return;
    if (isGroupUpdate(update)) return;
    await baseProcessTelegramUpdate(env, bot, update);
  } catch (error) {
    console.error('safe builder runtime caught error', error);
    await notifyBuilderFailure(env, bot, update, error).catch((notifyError) => console.error('failed to notify builder error', notifyError));
  }
}

async function handleMainBotGroupMembership(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<boolean> {
  const member = update.my_chat_member;
  if (!member || !isGroupChat(member.chat.type)) return false;
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return true;
  const status = member.new_chat_member?.status || '';
  if (status === 'left' || status === 'kicked') await removeMainGroup(env, member.chat);
  else await saveMainGroup(env, member.chat, member.from);
  return true;
}

async function handleMainBotGroupMessage(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<boolean> {
  const message = update.message;
  if (!message || !isGroupChat(message.chat.type)) return false;

  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return true;

  await saveMainGroup(env, message.chat).catch((error) => console.warn('main group message save skipped', error));

  const text = message.text?.trim() ?? '';
  const calledByName = mentionsVexa(text, bot.username);
  const calledByReply = isReplyToBot(message as unknown as GroupReplyMessage, bot.username);
  if (!calledByName && !calledByReply) return true;

  const prompt = cleanGroupPrompt(text, bot.username);
  if (!prompt) return true;

  const token = await decryptUserToken(env, bot.encrypted_token);
  const charged = await chargeGroupAdder(env, message.chat);
  if (!charged.ok) {
    await telegram(token, 'sendMessage', { chat_id: message.chat.id, text: charged.message, reply_to_message_id: message.message_id }).catch((error) => console.warn('main bot billing message failed', error));
    return true;
  }

  await addGroupTonUsage(env, message.chat, GROUP_REPLY_COST_NANO);
  const reply = await groupReply(env, prompt);
  await telegram(token, 'sendMessage', { chat_id: message.chat.id, text: reply, reply_to_message_id: message.message_id }).catch((error) => console.warn('main bot group reply failed', error));
  return true;
}

async function saveMainGroup(env: Env, chat: TelegramChat, addedBy?: TelegramUser): Promise<void> {
  await ensureMainGroupColumns(env);
  if (!addedBy) {
    await env.DB.prepare(`INSERT INTO bot_groups (bot_id, chat_id, chat_type, title, username, first_seen_at, last_seen_at, ton_spent_nano)
      VALUES ('main', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
      ON CONFLICT(bot_id, chat_id) DO UPDATE SET
        chat_type = excluded.chat_type,
        title = excluded.title,
        username = excluded.username,
        last_seen_at = CURRENT_TIMESTAMP`)
      .bind(String(chat.id), chat.type, chat.title || null, chat.username || null)
      .run();
    return;
  }

  const ownerId = String(addedBy.id);
  await env.DB.prepare(`INSERT INTO bot_groups (bot_id, chat_id, chat_type, title, username, added_by_user_id, added_by_username, added_by_first_name, first_seen_at, last_seen_at, ton_spent_nano)
    VALUES ('main', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
    ON CONFLICT(bot_id, chat_id) DO UPDATE SET
      chat_type = excluded.chat_type,
      title = excluded.title,
      username = excluded.username,
      added_by_user_id = COALESCE(bot_groups.added_by_user_id, excluded.added_by_user_id),
      added_by_username = COALESCE(bot_groups.added_by_username, excluded.added_by_username),
      added_by_first_name = COALESCE(bot_groups.added_by_first_name, excluded.added_by_first_name),
      last_seen_at = CURRENT_TIMESTAMP`)
    .bind(String(chat.id), chat.type, chat.title || null, chat.username || null, ownerId, addedBy.username || null, addedBy.first_name || null)
    .run();
}

async function removeMainGroup(env: Env, chat: TelegramChat): Promise<void> {
  await ensureMainGroupColumns(env);
  await env.DB.prepare("DELETE FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?").bind(String(chat.id)).run().catch(() => undefined);
}

async function chargeGroupAdder(env: Env, chat: TelegramChat): Promise<{ ok: boolean; message: string }> {
  await ensureMainGroupColumns(env);
  const group = await env.DB.prepare("SELECT added_by_user_id FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?")
    .bind(String(chat.id))
    .first<MainGroupBillingRow>();
  const userId = cleanUserId(group?.added_by_user_id || '');
  if (!userId) return { ok: false, message: 'پرداخت‌کننده‌ی این گروه شناسایی نشد. لطفاً Vexa را دوباره به گروه اضافه کنید.' };
  await ensureTonBalanceColumn(env);
  const balance = await env.DB.prepare('SELECT ton_balance_nano FROM app_users WHERE telegram_user_id = ?')
    .bind(userId)
    .first<{ ton_balance_nano: number }>();
  const current = Math.max(0, Math.floor(Number(balance?.ton_balance_nano) || 0));
  if (current < GROUP_REPLY_COST_NANO) return { ok: false, message: 'موجودی TON کاربری که Vexa را به این گروه اضافه کرده کافی نیست. برای هر پاسخ Vexa مقدار 0.0004 TON نیاز است.' };
  const result = await env.DB.prepare(`UPDATE app_users SET ton_balance_nano = ton_balance_nano - ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_user_id = ? AND ton_balance_nano >= ?`)
    .bind(GROUP_REPLY_COST_NANO, userId, GROUP_REPLY_COST_NANO)
    .run();
  if (!result.success || (result.meta?.changes ?? 0) < 1) return { ok: false, message: 'موجودی TON کاربری که Vexa را به این گروه اضافه کرده کافی نیست.' };
  return { ok: true, message: 'charged' };
}

async function addGroupTonUsage(env: Env, chat: TelegramChat, amountNano: number): Promise<void> {
  await ensureMainGroupColumns(env);
  await env.DB.prepare("UPDATE bot_groups SET ton_spent_nano = COALESCE(ton_spent_nano, 0) + ?, last_seen_at = CURRENT_TIMESTAMP WHERE bot_id = 'main' AND chat_id = ?")
    .bind(Math.max(0, Math.floor(amountNano)), String(chat.id))
    .run()
    .catch((error) => console.warn('group TON usage tracking skipped', error));
}

async function ensureMainGroupColumns(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS bot_groups (
    bot_id TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    chat_type TEXT NOT NULL,
    title TEXT,
    username TEXT,
    first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ton_spent_nano INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (bot_id, chat_id)
  )`).run();
  await env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_user_id TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_username TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_first_name TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN ton_spent_nano INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
}

async function ensureTonBalanceColumn(env: Env): Promise<void> {
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN ton_balance_nano INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
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

function isReplyToBot(message: GroupReplyMessage, username: string | null): boolean {
  const replied = message.reply_to_message?.from;
  if (!replied?.is_bot) return false;
  if (!username) return true;
  return replied.username?.toLowerCase() === username.toLowerCase();
}

function cleanGroupPrompt(text: string, username: string | null): string {
  let cleaned = text.replace(/(^|\s|[،,.!؟?])(?:vexa|وکسا)([،,.!؟?:\s-]*)/ig, ' ');
  if (username) cleaned = cleaned.replace(new RegExp('@' + username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), ' ');
  cleaned = cleaned.replace(/(^|\s)@[a-z0-9_]+bot(\s|$)/ig, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

function cleanUserId(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
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

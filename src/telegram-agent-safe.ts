import { aiReply } from './ai';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v3';
import { trackTelegramBotUser } from './admin-users';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import { selectedGroupReply } from './group-ai-provider';
import { isGroupAiDisabled } from './group-ai-access';
import { awardGroupReplyXp } from './xp-rewards';
import { animatedTelegramAiReply } from './telegram-chat-animation';
import type { BotRecord, Env, TelegramChat, TelegramMessage, TelegramUpdate, TelegramUser } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

const GROUP_REPLY_COST_NANO = 400000;
const GROUP_CONTEXT_LIMIT = 30;
const EMPTY_GROUP_CALL_PROMPT = 'The user called Vexa without adding a specific question. Use the recent group context and reply naturally. If there is a clear ongoing discussion, give a short helpful or funny reaction. If the context is unclear, ask a brief friendly follow-up question.';

type GroupReplyMessage = { reply_to_message?: { message_id?: number; text?: string; from?: { id?: number; is_bot?: boolean; first_name?: string; username?: string } } };
type GroupMembershipMessage = { new_chat_members?: TelegramUser[]; left_chat_member?: TelegramUser };
type MainGroupBillingRow = { added_by_user_id: string | null };
type GroupMessageContextRow = { message_id: string; user_id: string | null; first_name: string | null; username: string | null; text: string | null; created_at: string };
type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  await trackTelegramBotUser(env, bot.id, update).catch((error) => console.warn('admin user tracking skipped', error));
  try {
    const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});

    if (update.pre_checkout_query) {
      if (settings.isBuilderBot) {
        await handleStarsPreCheckout(env, update.pre_checkout_query);
        return;
      }
      const token = await decryptUserToken(env, bot.encrypted_token);
      const payload = String(update.pre_checkout_query.invoice_payload || '');
      const ok = update.pre_checkout_query.currency === 'XTR' && (payload.startsWith('dslpay:') || payload.startsWith('stars:'));
      await telegram(token, 'answerPreCheckoutQuery', {
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok,
        error_message: ok ? undefined : 'Payment request is no longer valid.',
      });
      return;
    }

    if (update.message?.successful_payment) {
      if (settings.isBuilderBot) {
        const userId = update.message.from?.id ?? update.message.chat.id;
        await handleStarsSuccessfulPayment(env, userId, update.message.successful_payment);
        return;
      }
      await baseProcessTelegramUpdate(env, bot, update);
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
  else await saveMainGroup(env, member.chat, member.from, true);
  return true;
}

async function handleMainBotGroupMessage(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<boolean> {
  const message = update.message;
  if (!message || !isGroupChat(message.chat.type)) return false;

  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return true;

  const addedBy = isBotAddedServiceMessage(message as unknown as GroupMembershipMessage) ? message.from : undefined;
  await saveMainGroup(env, message.chat, addedBy, Boolean(addedBy)).catch((error) => console.warn('main group message save skipped', error));
  await saveGroupMessage(env, message).catch((error) => console.warn('group message context save skipped', error));

  const text = message.text?.trim() ?? '';
  const calledByName = mentionsVexa(text, bot.username);
  const calledByReply = isReplyToBot(message as unknown as GroupReplyMessage, bot.username);
  if (!calledByName && !calledByReply) return true;

  const disabled = await isGroupAiDisabled(env, message.chat).catch((error) => {
    console.warn('group AI access check skipped', error);
    return false;
  });
  if (disabled) return true;

  const prompt = cleanGroupPrompt(text, bot.username) || EMPTY_GROUP_CALL_PROMPT;

  const token = await decryptUserToken(env, bot.encrypted_token);
  const charged = await chargeGroupAdder(env, message.chat);
  if (!charged.ok) {
    await telegram(token, 'sendMessage', { chat_id: message.chat.id, text: charged.message, reply_to_message_id: message.message_id }).catch((error) => console.warn('main bot billing message failed', error));
    return true;
  }

  await addGroupTonUsage(env, message.chat, GROUP_REPLY_COST_NANO);
  const contextPrompt = await buildGroupContextPrompt(env, message, prompt).catch((error) => {
    console.warn('group context prompt skipped', error);
    return prompt;
  });
  await animatedTelegramAiReply(
    telegram,
    token,
    message.chat.id,
    () => selectedGroupReply(env, contextPrompt),
    'الان نتوانستم جواب گروه را بسازم. لطفاً دوباره صدام کن.',
    undefined,
    { reply_to_message_id: message.message_id },
    'light',
  ).catch(async (error) => {
    console.warn('main bot animated group reply failed', error);
    const reply = await selectedGroupReply(env, contextPrompt);
    await telegram(token, 'sendMessage', { chat_id: message.chat.id, text: reply, reply_to_message_id: message.message_id }).catch((sendError) => console.warn('main bot group reply failed', sendError));
  });
  await awardGroupReplyXp(env, message.chat).catch((error) => console.warn('group reply XP milestone skipped', error));
  return true;
}

async function saveMainGroup(env: Env, chat: TelegramChat, addedBy?: TelegramUser, replaceOwner = false): Promise<void> {
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
  const forceOwner = replaceOwner ? 1 : 0;
  await env.DB.prepare(`INSERT INTO bot_groups (bot_id, chat_id, chat_type, title, username, added_by_user_id, added_by_username, added_by_first_name, first_seen_at, last_seen_at, ton_spent_nano)
    VALUES ('main', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
    ON CONFLICT(bot_id, chat_id) DO UPDATE SET
      chat_type = excluded.chat_type,
      title = excluded.title,
      username = excluded.username,
      added_by_user_id = CASE WHEN ? = 1 THEN excluded.added_by_user_id ELSE COALESCE(bot_groups.added_by_user_id, excluded.added_by_user_id) END,
      added_by_username = CASE WHEN ? = 1 THEN excluded.added_by_username ELSE COALESCE(bot_groups.added_by_username, excluded.added_by_username) END,
      added_by_first_name = CASE WHEN ? = 1 THEN excluded.added_by_first_name ELSE COALESCE(bot_groups.added_by_first_name, excluded.added_by_first_name) END,
      last_seen_at = CURRENT_TIMESTAMP`)
    .bind(String(chat.id), chat.type, chat.title || null, chat.username || null, ownerId, addedBy.username || null, addedBy.first_name || null, forceOwner, forceOwner, forceOwner)
    .run();
}

async function removeMainGroup(env: Env, chat: TelegramChat): Promise<void> {
  await ensureMainGroupColumns(env);
  await env.DB.prepare("DELETE FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?").bind(String(chat.id)).run().catch(() => undefined);
  await env.DB.prepare('DELETE FROM group_messages WHERE chat_id = ?').bind(String(chat.id)).run().catch(() => undefined);
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

async function saveGroupMessage(env: Env, message: TelegramMessage): Promise<void> {
  const text = message.text?.trim();
  if (!text || !message.from) return;
  await ensureGroupMessagesTable(env);
  await env.DB.prepare(`INSERT INTO group_messages (chat_id, message_id, user_id, first_name, username, text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(chat_id, message_id) DO UPDATE SET
      user_id = excluded.user_id,
      first_name = excluded.first_name,
      username = excluded.username,
      text = excluded.text,
      created_at = excluded.created_at`)
    .bind(String(message.chat.id), String(message.message_id), String(message.from.id), message.from.first_name || null, message.from.username || null, text.slice(0, 1000))
    .run();
  await pruneGroupMessages(env, String(message.chat.id));
}

async function pruneGroupMessages(env: Env, chatId: string): Promise<void> {
  await env.DB.prepare(`DELETE FROM group_messages
    WHERE chat_id = ?
      AND message_id NOT IN (
        SELECT message_id FROM group_messages
        WHERE chat_id = ?
        ORDER BY datetime(created_at) DESC, CAST(message_id AS INTEGER) DESC
        LIMIT ?
      )`)
    .bind(chatId, chatId, GROUP_CONTEXT_LIMIT)
    .run();
}

async function buildGroupContextPrompt(env: Env, message: TelegramMessage, prompt: string): Promise<string> {
  const rows = await loadGroupMessages(env, String(message.chat.id));
  const currentUser = describeUser(message.from);
  const replyContext = describeReplyContext(message as unknown as GroupReplyMessage);
  const recent = rows.length ? rows.map(formatContextRow).join('\n') : 'No recent group messages saved yet.';
  return [
    'Telegram group context for Vexa:',
    'Use the recent messages to understand the discussion. You may naturally use names when helpful, but do not overdo it.',
    '',
    'Current speaker: ' + currentUser,
    replyContext ? 'Reply context: ' + replyContext : '',
    '',
    'Recent messages, oldest to newest:',
    recent,
    '',
    'Current cleaned message:',
    prompt,
  ].filter(Boolean).join('\n');
}

async function loadGroupMessages(env: Env, chatId: string): Promise<GroupMessageContextRow[]> {
  await ensureGroupMessagesTable(env);
  const result = await env.DB.prepare(`SELECT message_id, user_id, first_name, username, text, created_at
    FROM group_messages
    WHERE chat_id = ?
    ORDER BY datetime(created_at) DESC, CAST(message_id AS INTEGER) DESC
    LIMIT ?`)
    .bind(chatId, GROUP_CONTEXT_LIMIT)
    .all<GroupMessageContextRow>();
  return (result.results || []).slice().reverse();
}

async function ensureGroupMessagesTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS group_messages (
    chat_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    user_id TEXT,
    first_name TEXT,
    username TEXT,
    text TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, message_id)
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_group_messages_chat_created ON group_messages (chat_id, created_at)').run().catch(() => undefined);
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

function isBotAddedServiceMessage(message: GroupMembershipMessage): boolean {
  return Array.isArray(message.new_chat_members) && message.new_chat_members.some((member) => Boolean(member?.is_bot));
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

function describeUser(user?: TelegramUser): string {
  if (!user) return 'Unknown user';
  const name = user.first_name || 'Unknown';
  return [name, user.username ? '@' + user.username : '', 'id=' + user.id].filter(Boolean).join(' ');
}

function describeReplyContext(message: GroupReplyMessage): string {
  const reply = message.reply_to_message;
  if (!reply) return '';
  const who = describeUser(reply.from as TelegramUser | undefined);
  const text = reply.text ? sanitizeContextText(reply.text, 500) : '';
  return text ? who + ' said: ' + text : who;
}

function formatContextRow(row: GroupMessageContextRow): string {
  const name = row.first_name || row.username || row.user_id || 'Unknown';
  const handle = row.username ? ' @' + row.username : '';
  return name + handle + ': ' + sanitizeContextText(row.text || '', 500);
}

function sanitizeContextText(value: string, maxLength: number): string {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
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

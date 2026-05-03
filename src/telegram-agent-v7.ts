import { aiReply, type ChatHistoryMessage } from './ai';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v2';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL, safeParseJson } from './utils';

export { setTelegramWebhook };

type PendingAction = {
  action?: 'edit_bot' | 'publish_bot' | 'activate_bot' | 'pause_bot';
  targetBotId?: string | null;
  text?: string;
  proposal?: string;
  createdAt?: number;
};

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const data = update.callback_query?.data;
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (settings.isBuilderBot && (data === 'builder:confirm' || data === 'builder:reject')) {
    await handleDecision(env, bot, update, data === 'builder:confirm');
    return;
  }
  return baseProcessTelegramUpdate(env, bot, update);
}

async function handleDecision(env: Env, bot: BotRecord, update: TelegramUpdate, accepted: boolean): Promise<void> {
  const q = update.callback_query;
  if (!q?.message) return;
  const chatId = q.message.chat.id;
  const messageId = q.message.message_id;
  const userId = String(q.from.id);
  const token = env.TELEGRAM_BOT_TOKEN;
  await telegram(token, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);

  const pendingRaw = await env.BOT_CACHE.get(pendingKey(userId)).catch(() => null);
  const pending = pendingRaw ? safeParseJson<PendingAction | null>(pendingRaw, null) : null;
  await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);

  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const dashboard = await loadDashboard(env, userId);

  let operationResult = '';
  if (accepted && pending?.action && pending.targetBotId) {
    operationResult = await executePending(pending);
  }

  const reply = await finalAiText(env, accepted, pending, operationResult, dashboard, history);
  await env.BOT_CACHE.put(historyKey, JSON.stringify([...history, { role: 'assistant', content: reply }].slice(-16)), { expirationTtl: 7200 }).catch(() => undefined);
  await editMessage(token, chatId, messageId, reply);
}

async function executePending(pending: PendingAction): Promise<string> {
  try {
    if (pending.action === 'edit_bot') {
      const res = await fetch(`${PUBLIC_BASE_URL}/app/api/bots/${encodeURIComponent(pending.targetBotId ?? '')}/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ instruction: pending.text ?? '' }),
      });
      return await res.text();
    }
    if (pending.action === 'pause_bot' || pending.action === 'activate_bot') {
      const status = pending.action === 'pause_bot' ? 'paused' : 'active';
      const res = await fetch(`${PUBLIC_BASE_URL}/app/api/bots/${encodeURIComponent(pending.targetBotId ?? '')}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await res.text();
    }
    if (pending.action === 'publish_bot') {
      const res = await fetch(`${PUBLIC_BASE_URL}/app/api/bots/${encodeURIComponent(pending.targetBotId ?? '')}/publish`, { method: 'POST' });
      return await res.text();
    }
    return 'No executable action was found.';
  } catch (error) {
    return error instanceof Error ? error.message : 'Unknown execution error';
  }
}

async function finalAiText(env: Env, accepted: boolean, pending: PendingAction | null, operationResult: string, dashboard: unknown, history: ChatHistoryMessage[]): Promise<string> {
  const instructions = [
    'You are AI Builder TEL and you oversee the user dashboard.',
    'The user pressed one of the confirmation buttons under your previous proposal.',
    'Edit that previous message into the final answer.',
    'Do not use canned wording. Reply in the user language and base the answer on the real operation result and dashboard data.',
    `button_pressed=${accepted ? 'confirm' : 'reject'}`,
    `pending_action=${JSON.stringify(pending ?? {})}`,
    `operation_result=${operationResult || 'no operation executed'}`,
    `dashboard=${JSON.stringify(dashboard)}`,
  ].join('\n');
  return aiReply(env, instructions, pending?.text || 'Respond to the confirmation decision.', history);
}

async function loadDashboard(env: Env, userId: string): Promise<unknown> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, username, status, settings_json, updated_at FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 10').bind(userId).all();
    return rows.results ?? [];
  } catch {
    return [];
  }
}

async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> {
  const raw = await env.BOT_CACHE.get(key).catch(() => null);
  const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : [];
  return Array.isArray(parsed) ? parsed.filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-16) : [];
}

function pendingKey(userId: string): string { return `builder-pending-action:${userId}`; }

async function editMessage(token: string, chatId: number, messageId: number, text: string): Promise<void> {
  await telegram(token, 'editMessageText', { chat_id: chatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } });
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const res = await fetch(['https://api.telegram.org', 'bot' + token, method].join('/'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json() as Promise<T>;
}

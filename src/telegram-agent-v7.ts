import { aiReply, defaultBlueprint, defaultFlow, improveBlueprint, improveFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v2';
import type { BotBlueprint, BotRecord, Env, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';

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
    await handleDecision(env, update, data === 'builder:confirm');
    return;
  }
  return baseProcessTelegramUpdate(env, bot, update);
}

async function handleDecision(env: Env, update: TelegramUpdate, accepted: boolean): Promise<void> {
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
  const dashboardBefore = await loadDashboard(env, userId);

  let operationResult = '';
  if (accepted && pending?.action && pending.targetBotId) {
    operationResult = await executePending(env, pending);
  }

  const dashboardAfter = await loadDashboard(env, userId);
  const reply = await finalAiText(env, accepted, pending, operationResult, { before: dashboardBefore, after: dashboardAfter }, history);
  await env.BOT_CACHE.put(historyKey, JSON.stringify([...history, { role: 'assistant', content: reply }].slice(-16)), { expirationTtl: 7200 }).catch(() => undefined);
  await editMessage(token, chatId, messageId, reply);
}

async function executePending(env: Env, pending: PendingAction): Promise<string> {
  try {
    const bot = pending.targetBotId ? await getBot(env, pending.targetBotId) : null;
    if (!bot) return JSON.stringify({ ok: false, error: 'target_bot_not_found' });

    if (pending.action === 'edit_bot') {
      const currentBlueprint = safeParseJson<BotBlueprint>(bot.blueprint_json, defaultBlueprint('Telegram bot'));
      const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
      const currentFlow = (settings.flow as BotFlow | undefined) ?? defaultFlow('Telegram bot');
      const instruction = [
        'Apply the confirmed user request to this Telegram bot.',
        'The live bot runs from settings.flow. Any menu, button, keyboard, question, or navigation must be represented inside the returned flow.nodes.',
        'If the user asks for a reply keyboard, use keyboard: "reply" on the relevant flow node.',
        `bot_id=${bot.id}`,
        `bot_title=${bot.title}`,
        `bot_username=${bot.username ?? ''}`,
        `confirmed_request=${pending.text ?? ''}`,
      ].join('\n');
      const [blueprintResult, flowResult] = await Promise.all([
        improveBlueprint(env, currentBlueprint, instruction),
        improveFlow(env, currentFlow, instruction),
      ]);
      settings.flow = flowResult.flow;
      await env.DB.prepare('UPDATE bots SET blueprint_json = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(JSON.stringify(blueprintResult.blueprint), JSON.stringify(settings), bot.id)
        .run();
      await env.BOT_CACHE.delete(`bot:${bot.id}`).catch(() => undefined);
      return JSON.stringify({ ok: true, action: 'edit_bot', botId: bot.id, flowSummary: flowResult.summary, blueprintSummary: blueprintResult.summary });
    }

    const userBotToken = await decryptUserToken(env, bot.encrypted_token);
    if (pending.action === 'pause_bot') {
      await telegram(userBotToken, 'deleteWebhook', { drop_pending_updates: true }).catch(() => undefined);
      await env.DB.prepare("UPDATE bots SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(bot.id).run();
      await env.BOT_CACHE.delete(`bot:${bot.id}`).catch(() => undefined);
      return JSON.stringify({ ok: true, action: 'pause_bot', botId: bot.id });
    }

    if (pending.action === 'activate_bot' || pending.action === 'publish_bot') {
      const webhookUrl = `${PUBLIC_BASE_URL}/bot/${bot.id}/webhook`;
      const result = await telegram<{ ok: boolean; description?: string }>(userBotToken, 'setWebhook', { url: webhookUrl, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
      if (!result.ok) return JSON.stringify({ ok: false, action: pending.action, botId: bot.id, telegram: result });
      const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
      settings.webhookUrl = webhookUrl;
      await env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), bot.id).run();
      await env.BOT_CACHE.delete(`bot:${bot.id}`).catch(() => undefined);
      return JSON.stringify({ ok: true, action: pending.action, botId: bot.id, webhookUrl });
    }

    return JSON.stringify({ ok: false, error: 'unsupported_action', action: pending.action });
  } catch (error) {
    return JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown_error' });
  }
}

async function getBot(env: Env, botId: string): Promise<BotRecord | null> {
  try {
    return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(botId).first<BotRecord>()) ?? null;
  } catch {
    return null;
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

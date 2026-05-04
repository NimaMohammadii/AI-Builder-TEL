import { aiReply, defaultBlueprint, defaultFlow, improveBlueprint, improveFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { decideBuilderAgentAction, type AgentDashboardBot } from './agent-decision';
import { processTelegramUpdate as runtimeProcessTelegramUpdate, setTelegramWebhook } from './telegram';
import type { BotBlueprint, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

type BotView = AgentDashboardBot & { flow?: BotFlow | null; blueprint?: BotBlueprint | null };
type RealAction = 'edit_bot' | 'publish_bot' | 'activate_bot' | 'pause_bot';
type PendingAction = { action: RealAction; targetBotId: string | null; originalRequest: string; proposalText: string; createdAt: number };
type ActionResult = Record<string, unknown> & { ok: boolean; action: RealAction };

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return runtimeProcessTelegramUpdate(env, bot, update);
  const key = await decryptUserToken(env, bot.encrypted_token);
  if (update.callback_query) return onCallback(env, key, update.callback_query);
  if (update.message) return onMessage(env, key, update.message);
}

async function onMessage(env: Env, key: string, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';
  const chatKey = `builder-ai-chat:${userId}`;
  const historyKey = `builder-ai-history:${userId}`;

  if (!text || text === '/start') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
    await mainMenu(key, chatId);
    return;
  }
  if (text === 'End Chat' || text === '/cancel') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await env.BOT_CACHE.delete(historyKey).catch(() => undefined);
    await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
    await tg(key, 'sendMessage', { chat_id: chatId, text: 'AI chat closed.', reply_markup: { remove_keyboard: true } });
    await mainMenu(key, chatId);
    return;
  }

  const active = await env.BOT_CACHE.get(chatKey).catch(() => null);
  if (!active) return mainMenu(key, chatId);

  const pending = await getPending(env, userId);
  if (pending) {
    const history = await loadHistory(env, historyKey);
    const decision = await classifyPendingReply(env, pending, history, text);
    if (decision === 'confirm') {
      await executePending(env, key, chatId, userId, pending, null);
      return;
    }
    if (decision === 'reject') {
      await rejectPending(env, key, chatId, userId, null);
      return;
    }
  }

  await agent(env, key, chatId, userId, text);
}

async function onCallback(env: Env, key: string, q: TelegramCallbackQuery): Promise<void> {
  const chatId = q.message?.chat.id ?? q.from.id;
  const userId = String(q.from.id);
  await tg(key, 'answerCallbackQuery', { callback_query_id: q.id });

  if (q.data === 'builder:confirm') {
    const pending = await getPending(env, userId);
    if (!pending) return send(key, chatId, 'No pending change found.');
    return executePending(env, key, chatId, userId, pending, q);
  }
  if (q.data === 'builder:reject') return rejectPending(env, key, chatId, userId, q);
  if (q.data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: 7200 }).catch(() => undefined);
    await tg(key, 'sendMessage', { chat_id: chatId, text: 'AI chat is open.', reply_markup: { keyboard: [[{ text: 'End Chat' }]], resize_keyboard: true, one_time_keyboard: false } });
    return;
  }
  if (q.data === 'builder:mybots') return showBots(env, key, chatId, userId);
  if (q.data === 'builder:help') return send(key, chatId, 'I can inspect your dashboard and propose real bot edits.');
  await mainMenu(key, chatId);
}

async function agent(env: Env, key: string, chatId: number, userId: string, text: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const bots = await dashboard(env, userId);
  const decision = await decideBuilderAgentAction(env, text, history, bots.map(toPlan));
  const target = decision.targetBotId ? bots.find((b) => b.id === decision.targetBotId) ?? null : null;

  if (isRealAction(decision.action)) {
    const proposal = await propose(env, text, history, bots, target, decision.action);
    const pending: PendingAction = { action: decision.action, targetBotId: target?.id ?? null, originalRequest: text, proposalText: proposal, createdAt: Date.now() };
    await env.BOT_CACHE.put(pendingKey(userId), JSON.stringify(pending), { expirationTtl: 900 }).catch(() => undefined);
    await saveHistory(env, historyKey, history, text, proposal);
    await tg(key, 'sendMessage', { chat_id: chatId, text: proposal, reply_markup: { inline_keyboard: [[{ text: 'Confirm', callback_data: 'builder:confirm' }, { text: 'Reject', callback_data: 'builder:reject' }]] } });
    return;
  }
  const reply = await answer(env, text, history, bots, target);
  await saveHistory(env, historyKey, history, text, reply);
  await send(key, chatId, reply);
}

async function executePending(env: Env, key: string, chatId: number, userId: string, pending: PendingAction, callback: TelegramCallbackQuery | null): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const bots = await dashboard(env, userId);
  const target = pending.targetBotId ? bots.find((b) => b.id === pending.targetBotId) ?? null : null;
  const before = target ? sum(target) : 'none';
  let result: ActionResult;

  if (pending.action === 'edit_bot') result = await edit(env, pending.originalRequest, history, bots, target);
  else result = await state(env, pending.originalRequest, history, bots, target, pending.action);

  if (result.ok) await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);

  const afterBots = await dashboard(env, userId);
  const after = target ? (afterBots.find((b) => b.id === target.id) ? sum(afterBots.find((b) => b.id === target.id)!) : 'missing') : 'none';
  const finalText = await aiReply(env,
    'You are AI Builder TEL. Generate a final response in user language. Do not claim success unless operation_result.ok is true.',
    JSON.stringify({ user_original_request: pending.originalRequest, pending_proposal: pending.proposalText, operation_result: result, dashboard_before: before, dashboard_after: after })
  , history);

  if (callback?.message?.message_id) {
    await tg(key, 'editMessageText', { chat_id: chatId, message_id: callback.message.message_id, text: finalText }).catch(async () => send(key, chatId, finalText));
  } else {
    await send(key, chatId, finalText);
  }
  await saveHistory(env, historyKey, history, `PENDING:${pending.originalRequest}`, finalText);
}

async function rejectPending(env: Env, key: string, chatId: number, userId: string, callback: TelegramCallbackQuery | null): Promise<void> {
  const pending = await getPending(env, userId);
  await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
  const reply = await aiReply(env, 'Generate a short rejection acknowledgement in user language. No DB change happened.', JSON.stringify({ pending_action: pending }));
  if (callback?.message?.message_id) await tg(key, 'editMessageText', { chat_id: chatId, message_id: callback.message.message_id, text: reply }).catch(async () => send(key, chatId, reply));
  else await send(key, chatId, reply);
}

async function classifyPendingReply(env: Env, pending: PendingAction, history: ChatHistoryMessage[], userReply: string): Promise<'confirm'|'reject'|'other'> {
  const out = await aiReply(env, 'Return strict JSON only: {"decision":"confirm"|"reject"|"other"}.', JSON.stringify({ pending_action: pending, recent_history: history.slice(-8), user_reply: userReply }));
  try { const parsed = JSON.parse(out); return parsed.decision === 'confirm' || parsed.decision === 'reject' ? parsed.decision : 'other'; } catch { return 'other'; }
}

async function edit(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null): Promise<ActionResult> { if (!target) return { ok: false, action: 'edit_bot', error: 'target_not_found' };
  const full = await getBot(env, target.id); if (!full) return { ok: false, action: 'edit_bot', botId: target.id, error: 'bot_not_found' };
  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {}); const bpNow = safeParseJson<BotBlueprint>(full.blueprint_json, defaultBlueprint('Telegram bot')); const flowNow = (settings.flow as BotFlow | undefined) ?? defaultFlow('Telegram bot');
  const instruction = `selected=${sum(target)}\nrequest=${text}\nhistory=${history.slice(-10).map((m) => `${m.role}:${m.content}`).join('\n')}`;
  const flow = await improveFlow(env, flowNow, instruction); const changed = JSON.stringify(flowNow) !== JSON.stringify(flow.flow);
  if (!changed) return { ok: false, action: 'edit_bot', botId: full.id, flowChanged: false, error: 'flow_not_changed', pendingKeptForRetry: true };
  const bp = await improveBlueprint(env, bpNow, instruction); settings.flow = flow.flow;
  try { await env.DB.prepare('UPDATE bots SET blueprint_json = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(bp.blueprint), JSON.stringify(settings), full.id).run(); await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined); }
  catch (e) { return { ok: false, action: 'edit_bot', botId: full.id, flowChanged: true, error: `db_update_failed:${String(e)}`, pendingKeptForRetry: true }; }
  return { ok: true, action: 'edit_bot', botId: full.id, flowChanged: true, flowSummary: flow.summary, blueprintSummary: bp.summary };
}

async function state(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, action: 'publish_bot' | 'activate_bot' | 'pause_bot'): Promise<ActionResult> { return { ok: false, action, error: 'not_implemented_in_this_change', request: text, historyCount: history.length, botsCount: bots.length, target: target?.id ?? null }; }
async function propose(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, action: RealAction): Promise<string> { return aiReply(env, 'Create short proposal in user language. Mention Confirm/Reject.', JSON.stringify({ action, target_bot: target ? sum(target) : 'none', dashboard_bots: bots.map(sum), user_request: text }), history); }
async function answer(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, extra = ''): Promise<string> { return aiReply(env, `You are AI Builder TEL. Reply in user language. ${extra}`, JSON.stringify({ target_bot: target ? sum(target) : 'none', connected_bots_count: bots.length, dashboard_bots: bots.map(sum), user_text: text }), history); }
async function dashboard(env: Env, userId: string): Promise<BotView[]> { try { const rows = await env.DB.prepare('SELECT id, title, username, status, blueprint_json, settings_json, created_at, updated_at FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 10').bind(userId).all<BotRecord>(); return (rows.results ?? []).map((bot) => { const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {}); const flow = (settings.flow as BotFlow | undefined) ?? null; return { id: bot.id, title: bot.title, username: bot.username, status: bot.status, created_at: bot.created_at, updated_at: bot.updated_at, blueprint: safeParseJson<BotBlueprint | null>(bot.blueprint_json, null), flow, flowName: flow?.name ?? null, flowDescription: flow?.description ?? null }; }); } catch { return []; } }
async function getBot(env: Env, id: string): Promise<BotRecord | null> { try { return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(id).first<BotRecord>()) ?? null; } catch { return null; } }
async function getPending(env: Env, userId: string): Promise<PendingAction | null> { const raw = await env.BOT_CACHE.get(pendingKey(userId)).catch(() => null); return raw ? safeParseJson<PendingAction | null>(raw, null) : null; }
function toPlan(b: BotView): AgentDashboardBot { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flowName: b.flowName ?? b.flow?.name ?? null, flowDescription: b.flowDescription ?? b.flow?.description ?? null }; }
function sum(b: BotView): string { return [b.title, b.username ? `@${b.username}` : null, `id=${b.id}`, `status=${b.status}`].filter(Boolean).join(', '); }
async function showBots(env: Env, key: string, chatId: number, userId: string): Promise<void> { const bots = await dashboard(env, userId); await send(key, chatId, bots.length ? bots.map((b, i) => `${i + 1}. ${b.title}`).join('\n') : 'No connected bots yet.'); }
async function mainMenu(key: string, chatId: number): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text: 'AI Builder TEL', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'My Bots', callback_data: 'builder:mybots' }, { text: 'Help', callback_data: 'builder:help' }]] } }); }
async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> { const raw = await env.BOT_CACHE.get(key).catch(() => null); return raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : []; }
async function saveHistory(env: Env, key: string, h: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> { const next = [...h, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16); await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: 7200 }).catch(() => undefined); }
function isRealAction(action: string): action is RealAction { return action === 'edit_bot' || action === 'publish_bot' || action === 'activate_bot' || action === 'pause_bot'; }
function pendingKey(userId: string): string { return `builder-pending-action:${userId}`; }
async function send(key: string, chatId: number, text: string): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text }); }
async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); return response.json() as Promise<T>; }

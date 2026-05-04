import { aiReply, defaultFlow, improveFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { decideBuilderAgentAction, type AgentDashboardBot } from './agent-decision';
import { processTelegramUpdate as runtimeProcessTelegramUpdate, setTelegramWebhook } from './telegram';
import { handleExpandedFlowCallback, handleExpandedFlowMessage } from './telegram-flow-runtime';
import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

type BotView = AgentDashboardBot & { flow?: BotFlow | null };
type RealAction = 'edit_bot' | 'publish_bot' | 'activate_bot' | 'pause_bot';
type PendingAction = { action: RealAction; targetBotId: string | null; originalRequest: string; proposalText: string; createdAt: number; proposalMessageId?: number; proposalChatId?: number };
type ActionResult = Record<string, unknown> & { ok: boolean; action: RealAction };
type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };

const CHAT_TTL = 7200;
const PENDING_TTL = 900;

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean; flow?: BotFlow }>(bot.settings_json, {});
  const key = await decryptUserToken(env, bot.encrypted_token);

  if (!settings.isBuilderBot) {
    if (settings.flow && update.callback_query) return handleExpandedFlowCallback(env, key, bot, settings.flow, update.callback_query, flowRuntimeDeps);
    if (settings.flow && update.message) return handleExpandedFlowMessage(env, key, bot, settings.flow, update.message, flowRuntimeDeps);
    return runtimeProcessTelegramUpdate(env, bot, update);
  }

  if (update.callback_query) return onCallback(env, key, update.callback_query);
  if (update.message) return onMessage(env, key, update.message);
}

const flowRuntimeDeps = {
  telegramApi: tg,
  sendText: send,
  runtimeAiReply: (env: Env, systemPrompt: string, text: string) => aiReply(env, systemPrompt, text),
  renderTemplate,
};

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
    const reply = await aiReply(env, 'The user closed AI chat. Reply naturally in the user language.', text, []);
    await tg(key, 'sendMessage', { chat_id: chatId, text: reply, reply_markup: { remove_keyboard: true } });
    await mainMenu(key, chatId);
    return;
  }

  if (!(await env.BOT_CACHE.get(chatKey).catch(() => null))) return mainMenu(key, chatId);

  const pending = await getPending(env, userId);
  if (pending) {
    const history = await loadHistory(env, historyKey);
    const decision = await classifyPendingReply(env, pending, history, text);
    if (decision === 'confirm') return executePending(env, key, chatId, userId, pending, null, text);
    if (decision === 'reject') return rejectPending(env, key, chatId, userId, pending, null, text);
  }

  await agent(env, key, chatId, userId, text);
}

async function onCallback(env: Env, key: string, q: TelegramCallbackQuery): Promise<void> {
  const chatId = q.message?.chat.id ?? q.from.id;
  const userId = String(q.from.id);
  await tg(key, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);

  if (q.data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: CHAT_TTL }).catch(() => undefined);
    const bots = await dashboard(env, userId);
    const reply = await aiReply(env, 'The user opened AI chat. Reply in the user language. Use only these real connected bots.', JSON.stringify({ bots: bots.map(botSnapshot) }), []);
    await tg(key, 'sendMessage', { chat_id: chatId, text: reply, reply_markup: { keyboard: [[{ text: 'End Chat' }]], resize_keyboard: true, one_time_keyboard: false } });
    return;
  }

  if (q.data === 'builder:confirm') {
    const pending = await getPending(env, userId);
    if (!pending) return editOrSend(key, chatId, q, null, 'درخواست معلقی برای تأیید وجود ندارد.');
    return executePending(env, key, chatId, userId, pending, q, 'Confirm');
  }

  if (q.data === 'builder:reject') {
    const pending = await getPending(env, userId);
    return rejectPending(env, key, chatId, userId, pending, q, 'Reject');
  }

  if (q.data === 'builder:mybots') return showBots(env, key, chatId, userId);
  if (q.data === 'builder:help') return send(key, chatId, 'از Chat with AI برای ساخت و تغییر ربات استفاده کن. تغییرات واقعی بعد از تأیید روی flow ذخیره می‌شوند.');
  await mainMenu(key, chatId);
}

async function agent(env: Env, key: string, chatId: number, userId: string, text: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const bots = await dashboard(env, userId);
  const decision = await decideBuilderAgentAction(env, text, history, bots.map(toPlan));
  const target = decision.targetBotId ? bots.find((b) => b.id === decision.targetBotId) ?? null : bots[0] ?? null;

  if (isRealAction(decision.action)) {
    const proposal = await aiReply(env, 'Create a short proposal in the user language. Explain exactly what will change. Ask for confirmation. Do not claim it is applied yet.', JSON.stringify({ action: decision.action, target_bot: target ? botSnapshot(target) : null, request: text }), history);
    const sent = await tg<{ ok: boolean; result?: { message_id: number } }>(key, 'sendMessage', { chat_id: chatId, text: proposal, reply_markup: { inline_keyboard: [[{ text: 'Confirm', callback_data: 'builder:confirm' }, { text: 'Reject', callback_data: 'builder:reject' }]] } });
    const pending: PendingAction = { action: decision.action, targetBotId: target?.id ?? null, originalRequest: text, proposalText: proposal, createdAt: Date.now(), proposalMessageId: sent.result?.message_id, proposalChatId: chatId };
    await env.BOT_CACHE.put(pendingKey(userId), JSON.stringify(pending), { expirationTtl: PENDING_TTL }).catch(() => undefined);
    await saveHistory(env, historyKey, history, text, proposal);
    return;
  }

  const reply = await aiReply(env, 'Reply in the user language. Use only the real dashboard/flow data provided. Do not invent menus or buttons.', JSON.stringify({ request: text, bots: bots.map(botSnapshot) }), history);
  await saveHistory(env, historyKey, history, text, reply);
  await send(key, chatId, reply);
}

async function executePending(env: Env, key: string, chatId: number, userId: string, pending: PendingAction, callback: TelegramCallbackQuery | null, confirmationText: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const progress = async (text: string) => editOrSend(key, chatId, callback, pending, text);

  try {
    await progress('✅ تأیید شد؛ دارم flow واقعی ربات را می‌خوانم...');
    const botsBefore = await dashboard(env, userId);
    const target = pending.targetBotId ? botsBefore.find((b) => b.id === pending.targetBotId) ?? null : botsBefore[0] ?? null;

    let result: ActionResult;
    if (pending.action === 'edit_bot') result = await edit(env, pending.originalRequest, history, target, userId, progress);
    else result = await state(env, target, pending.action, progress);

    if (result.ok) await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
    const botsAfter = await dashboard(env, userId);
    const afterTarget = target ? botsAfter.find((b) => b.id === target.id) ?? null : null;
    const finalText = await aiReply(env, 'Reply in the user language. Do not claim success unless operation_result.ok is true. Keep it short.', JSON.stringify({ confirmationText, request: pending.originalRequest, operation_result: result, bot_after: afterTarget ? botSnapshot(afterTarget) : null }), history);
    await editOrSend(key, chatId, callback, pending, finalText);
    await saveHistory(env, historyKey, history, `CONFIRM:${pending.originalRequest}`, finalText);
  } catch (error) {
    const finalText = `تغییر کامل نشد. علت: ${(error instanceof Error ? error.message : String(error)).slice(0, 500)}`;
    await editOrSend(key, chatId, callback, pending, finalText);
  }
}

async function edit(env: Env, text: string, history: ChatHistoryMessage[], target: BotView | null, userId: string, progress: (text: string) => Promise<void>): Promise<ActionResult> {
  if (!target) return { ok: false, action: 'edit_bot', error: 'target_not_found' };
  const full = await getBot(env, target.id);
  if (!full) return { ok: false, action: 'edit_bot', botId: target.id, error: 'bot_not_found' };

  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {});
  const flowNow = (settings.flow as BotFlow | undefined) ?? defaultFlow('Telegram bot');
  const instruction = [
    'Apply the confirmed user request to the selected Telegram bot.',
    'IMPORTANT: settings.flow is the only runtime source of truth. Do not use blueprint.',
    'Return/produce a changed executable flow with valid nodes, buttons, next targets, keyboard, saveInputAs, notifyOwner, end, media, condition, url, webAppUrl, copyText, requestContact, and requestLocation fields.',
    `current_flow=${JSON.stringify(compactFlow(flowNow))}`,
    `request=${text}`,
    `history=${history.slice(-8).map((m) => `${m.role}: ${m.content}`).join('\n')}`,
  ].join('\n\n');

  await progress('⚙️ دارم تغییر را فقط روی settings.flow می‌سازم...');
  const flow = await improveFlow(env, flowNow, instruction);
  if (JSON.stringify(flowNow) === JSON.stringify(flow.flow)) return { ok: false, action: 'edit_bot', botId: full.id, error: 'flow_not_changed', flowSummary: flow.summary };

  settings.flow = flow.flow;
  await progress('💾 دارم flow جدید را ذخیره و کش را پاک می‌کنم...');
  await env.DB.prepare('UPDATE bots SET settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(settings), full.id).run();
  await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
  await env.BOT_CACHE.delete(`flow-state:${full.id}:${userId}`).catch(() => undefined);

  return { ok: true, action: 'edit_bot', botId: full.id, flowChanged: true, flowSummary: flow.summary, runtimeSource: 'settings.flow', blueprintTouched: false, runtimeStateReset: true };
}

async function state(env: Env, target: BotView | null, action: 'publish_bot' | 'activate_bot' | 'pause_bot', progress: (text: string) => Promise<void>): Promise<ActionResult> {
  if (!target) return { ok: false, action, error: 'target_not_found' };
  const full = await getBot(env, target.id);
  if (!full) return { ok: false, action, botId: target.id, error: 'bot_not_found' };
  const userKey = await decryptUserToken(env, full.encrypted_token);
  await progress('🌐 دارم وضعیت webhook ربات را به‌روزرسانی می‌کنم...');

  if (action === 'pause_bot') {
    await tg(userKey, 'deleteWebhook', { drop_pending_updates: true }).catch(() => undefined);
    await env.DB.prepare("UPDATE bots SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(full.id).run();
    await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
    return { ok: true, action, botId: full.id };
  }

  const url = `${PUBLIC_BASE_URL}/bot/${full.id}/webhook`;
  const result = await tg<{ ok: boolean; description?: string }>(userKey, 'setWebhook', { url, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
  if (!result.ok) return { ok: false, action, botId: full.id, error: result.description ?? 'telegram_set_webhook_failed' };
  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {});
  settings.webhookUrl = url;
  await env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), full.id).run();
  await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
  return { ok: true, action, botId: full.id, webhookUrl: url };
}

async function rejectPending(env: Env, key: string, chatId: number, userId: string, pending: PendingAction | null, callback: TelegramCallbackQuery | null, userText: string): Promise<void> {
  await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const reply = await aiReply(env, 'The user rejected a pending change. Reply in user language. Make clear nothing was applied.', JSON.stringify({ userText, pending }), history);
  await editOrSend(key, chatId, callback, pending, reply);
  await saveHistory(env, historyKey, history, `REJECT:${pending?.originalRequest ?? ''}`, reply);
}

async function classifyPendingReply(env: Env, pending: PendingAction, history: ChatHistoryMessage[], userReply: string): Promise<'confirm' | 'reject' | 'other'> {
  if (!env.OPENAI_API_KEY) return 'other';
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, { method: 'POST', headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: OPENAI_MODEL, instructions: 'Classify reply to pending bot change. Return strict JSON: {"decision":"confirm"|"reject"|"other"}.', input: JSON.stringify({ pending, history: history.slice(-6), userReply }), max_output_tokens: 80, reasoning: { effort: 'low' } }) });
    const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
    const parsed = safeParseJson<{ decision?: string }>(extractJson(extractText(data) ?? ''), {});
    return parsed.decision === 'confirm' || parsed.decision === 'reject' ? parsed.decision : 'other';
  } catch { return 'other'; }
}

async function dashboard(env: Env, userId: string): Promise<BotView[]> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, username, status, settings_json, created_at, updated_at FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 10').bind(userId).all<BotRecord>();
    return (rows.results ?? []).map((bot) => {
      const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
      const flow = (settings.flow as BotFlow | undefined) ?? null;
      return { id: bot.id, title: bot.title, username: bot.username, status: bot.status, created_at: bot.created_at, updated_at: bot.updated_at, flow, flowName: flow?.name ?? null, flowDescription: flow?.description ?? null };
    });
  } catch { return []; }
}

async function getBot(env: Env, id: string): Promise<BotRecord | null> { try { return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(id).first<BotRecord>()) ?? null; } catch { return null; } }
async function getPending(env: Env, userId: string): Promise<PendingAction | null> { const raw = await env.BOT_CACHE.get(pendingKey(userId)).catch(() => null); const parsed = raw ? safeParseJson<PendingAction | null>(raw, null) : null; return parsed?.action ? parsed : null; }
async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> { const raw = await env.BOT_CACHE.get(key).catch(() => null); const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : []; return Array.isArray(parsed) ? parsed.filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-16) : []; }
async function saveHistory(env: Env, key: string, h: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> { const next = [...h, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16); await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: CHAT_TTL }).catch(() => undefined); }
async function showBots(env: Env, key: string, chatId: number, userId: string): Promise<void> { const bots = await dashboard(env, userId); const reply = await aiReply(env, 'Summarize connected bots in the user language. Use only actual data.', JSON.stringify({ bots: bots.map(botSnapshot) }), []); await send(key, chatId, reply); }
async function mainMenu(key: string, chatId: number): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text: 'AI Builder TEL', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'My Bots', callback_data: 'builder:mybots' }, { text: 'Help', callback_data: 'builder:help' }]] } }); }
async function editOrSend(key: string, chatId: number, callback: TelegramCallbackQuery | null, pending: PendingAction | null, text: string): Promise<void> { const messageId = callback?.message?.message_id ?? pending?.proposalMessageId; const targetChatId = callback?.message?.chat.id ?? pending?.proposalChatId ?? chatId; if (messageId) await tg(key, 'editMessageText', { chat_id: targetChatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } }).catch(async () => send(key, chatId, text)); else await send(key, chatId, text); }
async function send(key: string, chatId: number, text: string): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text }); }
async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); return response.json() as Promise<T>; }
function isRealAction(action: string): action is RealAction { return action === 'edit_bot' || action === 'publish_bot' || action === 'activate_bot' || action === 'pause_bot'; }
function pendingKey(userId: string): string { return `builder-pending-action:${userId}`; }
function toPlan(b: BotView): AgentDashboardBot { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flowName: b.flowName ?? b.flow?.name ?? null, flowDescription: b.flowDescription ?? b.flow?.description ?? null }; }
function compactFlow(flow: BotFlow | null | undefined): unknown { if (!flow) return null; return { name: flow.name, description: flow.description, start: flow.start, variables: flow.variables, nodes: Object.values(flow.nodes ?? {}).map((node) => ({ id: node.id, message: node.message, keyboard: node.keyboard ?? 'inline', buttons: (node.buttons ?? []).map((button) => ({ text: button.text, next: button.next, url: button.url, webAppUrl: button.webAppUrl, copyText: button.copyText, requestContact: button.requestContact, requestLocation: button.requestLocation })), saveInputAs: node.saveInputAs, next: node.next, notifyOwner: node.notifyOwner, end: node.end, media: node.media, condition: node.condition })) }; }
function botSnapshot(b: BotView): unknown { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flow: compactFlow(b.flow) }; }
function extractText(data: ResponsesApiResult | null): string | null { if (!data) return null; if (data.output_text) return data.output_text; for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text; return null; }
function extractJson(value: string): string { const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim(); const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}'); return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned; }
function renderTemplate(template: string, data: Record<string, string>): string { return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => data[key] ?? ''); }

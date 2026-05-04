import { aiReply, defaultBlueprint, defaultFlow, improveBlueprint, improveFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { decideBuilderAgentAction, type AgentDashboardBot } from './agent-decision';
import { processTelegramUpdate as runtimeProcessTelegramUpdate, setTelegramWebhook } from './telegram';
import type { BotBlueprint, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

type BotView = AgentDashboardBot & { flow?: BotFlow | null; blueprint?: BotBlueprint | null };
type RealAction = 'edit_bot' | 'publish_bot' | 'activate_bot' | 'pause_bot';
type PendingAction = { action: RealAction; targetBotId: string | null; originalRequest: string; proposalText: string; createdAt: number; proposalMessageId?: number; proposalChatId?: number };
type ActionResult = Record<string, unknown> & { ok: boolean; action: RealAction };
type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
type ProgressPhase = 'accepted' | 'reading_dashboard' | 'reading_bot' | 'reading_flow' | 'planning_change' | 'generating_flow' | 'checking_flow' | 'generating_blueprint' | 'saving_db' | 'clearing_cache' | 'publishing' | 'finalizing' | 'failed' | 'rejecting';
type ProgressFn = (phase: ProgressPhase, details?: unknown) => Promise<void>;

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
    const reply = await aiReply(env, 'The user closed AI chat. Reply naturally in the user language.', text, []);
    await tg(key, 'sendMessage', { chat_id: chatId, text: reply, reply_markup: { remove_keyboard: true } });
    await mainMenu(key, chatId);
    return;
  }

  const active = await env.BOT_CACHE.get(chatKey).catch(() => null);
  if (!active) return mainMenu(key, chatId);

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

  if (q.data === 'builder:confirm') {
    const pending = await getPending(env, userId);
    if (!pending) {
      const reply = await aiReply(env, 'The user pressed Confirm but no pending change exists. Reply naturally in the user language.', 'No pending change exists.', []);
      return editOrSend(key, chatId, q, null, reply);
    }
    return executePending(env, key, chatId, userId, pending, q, 'Confirm');
  }

  if (q.data === 'builder:reject') {
    const pending = await getPending(env, userId);
    return rejectPending(env, key, chatId, userId, pending, q, 'Reject');
  }

  if (q.data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: 7200 }).catch(() => undefined);
    const bots = await dashboard(env, userId);
    const reply = await aiReply(env, 'The user opened AI chat. You can inspect their dashboard and connected bots. Reply naturally in the user language. Use only the provided dashboard data; do not invent menus or bot capabilities.', JSON.stringify({ connected_bots_count: bots.length, dashboard_bots: bots.map(botSnapshot) }), []);
    await tg(key, 'sendMessage', { chat_id: chatId, text: reply, reply_markup: { keyboard: [[{ text: 'End Chat' }]], resize_keyboard: true, one_time_keyboard: false } });
    return;
  }

  if (q.data === 'builder:mybots') return showBots(env, key, chatId, userId);
  if (q.data === 'builder:help') {
    const reply = await aiReply(env, 'The user pressed Help. Explain briefly that you can inspect dashboard and propose/apply bot edits after confirmation. Reply in user language.', 'Help', []);
    return send(key, chatId, reply);
  }
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
    const sent = await tg<{ ok: boolean; result?: { message_id: number } }>(key, 'sendMessage', { chat_id: chatId, text: proposal, reply_markup: { inline_keyboard: [[{ text: 'Confirm', callback_data: 'builder:confirm' }, { text: 'Reject', callback_data: 'builder:reject' }]] } });
    const pending: PendingAction = { action: decision.action, targetBotId: target?.id ?? null, originalRequest: text, proposalText: proposal, createdAt: Date.now(), proposalMessageId: sent.result?.message_id, proposalChatId: chatId };
    await env.BOT_CACHE.put(pendingKey(userId), JSON.stringify(pending), { expirationTtl: 900 }).catch(() => undefined);
    await saveHistory(env, historyKey, history, text, proposal);
    return;
  }

  const reply = await answer(env, text, history, bots, target);
  await saveHistory(env, historyKey, history, text, reply);
  await send(key, chatId, reply);
}

async function executePending(env: Env, key: string, chatId: number, userId: string, pending: PendingAction, callback: TelegramCallbackQuery | null, confirmationText: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const progress: ProgressFn = async (phase, details) => updateProgress(env, key, chatId, callback, pending, phase, details, history);

  try {
    await progress('accepted', { user_confirmation: confirmationText });
    await progress('reading_dashboard');
    const botsBefore = await dashboard(env, userId);
    const target = pending.targetBotId ? botsBefore.find((b) => b.id === pending.targetBotId) ?? null : null;
    const before = target ? botSnapshot(target) : null;

    let result: ActionResult;
    if (pending.action === 'edit_bot') result = await edit(env, pending.originalRequest, history, botsBefore, target, progress);
    else result = await state(env, pending.originalRequest, history, botsBefore, target, pending.action, progress);

    if (result.ok) await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);

    await progress(result.ok ? 'finalizing' : 'failed', { operation_result: result });
    const botsAfter = await dashboard(env, userId);
    const afterTarget = target ? botsAfter.find((b) => b.id === target.id) ?? null : null;
    const finalText = await aiReply(env,
      'You are AI Builder TEL. Generate a final response in the user language. Do not claim success unless operation_result.ok is true. If ok is false, explain that the change was not applied and what failed. If pendingKeptForRetry is true, say the user can confirm/retry again. Use only provided dashboard data.',
      JSON.stringify({ user_confirmation: confirmationText, user_original_request: pending.originalRequest, pending_proposal: pending.proposalText, operation_result: result, dashboard_before: before, dashboard_after: afterTarget ? botSnapshot(afterTarget) : null }),
      history
    );

    await editOrSend(key, chatId, callback, pending, finalText);
    await saveHistory(env, historyKey, history, `CONFIRM:${pending.originalRequest}`, finalText);
  } catch (error) {
    const result: ActionResult = { ok: false, action: pending.action, error: error instanceof Error ? error.message : String(error), pendingKeptForRetry: true };
    await progress('failed', { operation_result: result });
    const finalText = await aiReply(env,
      'You are AI Builder TEL. A confirmed bot change crashed before completion. Reply in the user language. Do not claim success. Say the pending action is still available for retry. Use the real error details.',
      JSON.stringify({ user_original_request: pending.originalRequest, pending_proposal: pending.proposalText, operation_result: result }),
      history
    );
    await editOrSend(key, chatId, callback, pending, finalText);
  }
}

async function rejectPending(env: Env, key: string, chatId: number, userId: string, pending: PendingAction | null, callback: TelegramCallbackQuery | null, userText: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  if (pending) await updateProgress(env, key, chatId, callback, pending, 'rejecting', { user_text: userText }, history);
  await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
  const reply = await aiReply(env, 'The user rejected a pending bot change. Reply naturally in the user language and make clear no bot change was applied.', JSON.stringify({ user_text: userText, pending_action: pending }), history);
  await editOrSend(key, chatId, callback, pending, reply);
  await saveHistory(env, historyKey, history, `REJECT:${pending?.originalRequest ?? ''}`, reply);
}

async function classifyPendingReply(env: Env, pending: PendingAction, history: ChatHistoryMessage[], userReply: string): Promise<'confirm' | 'reject' | 'other'> {
  if (!env.OPENAI_API_KEY) return 'other';
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, instructions: ['Classify the user reply to a pending Telegram bot change proposal.', 'Use meaning and context, not keyword rules.', 'Return strict JSON only: {"decision":"confirm"} or {"decision":"reject"} or {"decision":"other"}.', 'confirm means the user wants the pending change executed now.', 'reject means the user cancels/refuses it.', 'other means unrelated or a new request/details instead of approval/cancel.'].join('\n'), input: JSON.stringify({ pending_action: pending, recent_history: history.slice(-8), user_reply: userReply }), max_output_tokens: 80, reasoning: { effort: 'low' } }),
    });
    const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
    const text = data ? extractText(data) : null;
    if (!response.ok || !text) return 'other';
    const parsed = JSON.parse(extractJson(text)) as { decision?: string };
    return parsed.decision === 'confirm' || parsed.decision === 'reject' ? parsed.decision : 'other';
  } catch { return 'other'; }
}

async function edit(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, progress?: ProgressFn): Promise<ActionResult> {
  if (!target) return { ok: false, action: 'edit_bot', error: 'target_not_found', pendingKeptForRetry: true };
  await progress?.('reading_bot', { target: botSnapshot(target) });
  const full = await getBot(env, target.id);
  if (!full) return { ok: false, action: 'edit_bot', botId: target.id, error: 'bot_not_found', pendingKeptForRetry: true };

  await progress?.('reading_flow');
  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {});
  const bpNow = safeParseJson<BotBlueprint>(full.blueprint_json, defaultBlueprint('Telegram bot'));
  const flowNow = (settings.flow as BotFlow | undefined) ?? defaultFlow('Telegram bot');
  const instruction = ['Apply the confirmed user request to the selected Telegram bot.', 'The live bot runs from settings.flow. Any menu, button, reply keyboard, question, payment-like step, notification, or navigation must be represented inside returned flow.nodes.', 'If the user asks for a reply keyboard, use keyboard: "reply" on the relevant flow node.', `selected=${JSON.stringify(botSnapshot(target))}`, `current_flow=${JSON.stringify(compactFlow(flowNow))}`, `request=${text}`, `history=${history.slice(-10).map((m) => `${m.role}: ${m.content}`).join('\n')}`].join('\n\n');

  await progress?.('planning_change', { current_flow: compactFlow(flowNow), request: text });
  await progress?.('generating_flow');
  const flow = await improveFlow(env, flowNow, instruction);
  await progress?.('checking_flow', { flow_summary: flow.summary });
  const changed = JSON.stringify(flowNow) !== JSON.stringify(flow.flow);
  if (!changed) return { ok: false, action: 'edit_bot', botId: full.id, flowChanged: false, error: 'flow_not_changed', pendingKeptForRetry: true, flowSummary: flow.summary };

  await progress?.('generating_blueprint');
  const bp = await improveBlueprint(env, bpNow, instruction);
  settings.flow = flow.flow;
  try {
    await progress?.('saving_db', { botId: full.id });
    await env.DB.prepare('UPDATE bots SET blueprint_json = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(bp.blueprint), JSON.stringify(settings), full.id).run();
    await progress?.('clearing_cache', { botId: full.id });
    await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
  } catch (e) { return { ok: false, action: 'edit_bot', botId: full.id, flowChanged: true, error: `db_update_failed:${String(e)}`, pendingKeptForRetry: true }; }
  return { ok: true, action: 'edit_bot', botId: full.id, flowChanged: true, flowSummary: flow.summary, blueprintSummary: bp.summary };
}

async function state(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, action: 'publish_bot' | 'activate_bot' | 'pause_bot', progress?: ProgressFn): Promise<ActionResult> {
  if (!target) return { ok: false, action, error: 'target_not_found', pendingKeptForRetry: true };
  await progress?.('reading_bot', { target: botSnapshot(target) });
  const full = await getBot(env, target.id);
  if (!full) return { ok: false, action, botId: target.id, error: 'bot_not_found', pendingKeptForRetry: true };
  const userKey = await decryptUserToken(env, full.encrypted_token);
  await progress?.('publishing', { action, botId: full.id });
  if (action === 'pause_bot') {
    await tg(userKey, 'deleteWebhook', { drop_pending_updates: true }).catch(() => undefined);
    await env.DB.prepare("UPDATE bots SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(full.id).run();
    await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
    return { ok: true, action, botId: full.id, request: text, historyCount: history.length, botsCount: bots.length };
  }
  const url = `${PUBLIC_BASE_URL}/bot/${full.id}/webhook`;
  const result = await tg<{ ok: boolean; description?: string }>(userKey, 'setWebhook', { url, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
  if (!result.ok) return { ok: false, action, botId: full.id, error: result.description ?? 'telegram_set_webhook_failed', pendingKeptForRetry: true };
  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {});
  settings.webhookUrl = url;
  await env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), full.id).run();
  await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
  return { ok: true, action, botId: full.id, webhookUrl: url };
}

async function propose(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, action: RealAction): Promise<string> { return aiReply(env, 'Create a short proposal in the user language. Explain exactly what will be changed. Ask for confirmation. The UI will show Confirm and Reject buttons. Use only the actual bot snapshot below; do not invent existing menus or capabilities.', JSON.stringify({ action, target_bot: target ? botSnapshot(target) : null, dashboard_bots: bots.map(botSnapshot), user_request: text }), history); }
async function answer(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, extra = ''): Promise<string> { return aiReply(env, `You are AI Builder TEL. Reply in user language. You can inspect dashboard data. Use only the actual bot snapshot below; do not invent existing menus, screens, APIs, balances, positions, logs, payments, or capabilities that are not present in flow.nodes or blueprint. ${extra}`, JSON.stringify({ target_bot: target ? botSnapshot(target) : null, connected_bots_count: bots.length, dashboard_bots: bots.map(botSnapshot), user_text: text }), history); }

async function dashboard(env: Env, userId: string): Promise<BotView[]> {
  try { const rows = await env.DB.prepare('SELECT id, title, username, status, blueprint_json, settings_json, created_at, updated_at FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 10').bind(userId).all<BotRecord>(); return (rows.results ?? []).map((bot) => { const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {}); const flow = (settings.flow as BotFlow | undefined) ?? null; return { id: bot.id, title: bot.title, username: bot.username, status: bot.status, created_at: bot.created_at, updated_at: bot.updated_at, blueprint: safeParseJson<BotBlueprint | null>(bot.blueprint_json, null), flow, flowName: flow?.name ?? null, flowDescription: flow?.description ?? null }; }); } catch { return []; }
}

async function getBot(env: Env, id: string): Promise<BotRecord | null> { try { return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(id).first<BotRecord>()) ?? null; } catch { return null; } }
async function getPending(env: Env, userId: string): Promise<PendingAction | null> { const raw = await env.BOT_CACHE.get(pendingKey(userId)).catch(() => null); if (!raw) return null; const parsed = safeParseJson<Record<string, unknown> | null>(raw, null); if (!parsed) return null; const action = parsed.action === 'edit_bot' || parsed.action === 'publish_bot' || parsed.action === 'activate_bot' || parsed.action === 'pause_bot' ? parsed.action : 'edit_bot'; return { action, targetBotId: typeof parsed.targetBotId === 'string' ? parsed.targetBotId : null, originalRequest: String(parsed.originalRequest ?? parsed.text ?? ''), proposalText: String(parsed.proposalText ?? parsed.proposal ?? ''), createdAt: Number(parsed.createdAt ?? Date.now()), proposalMessageId: typeof parsed.proposalMessageId === 'number' ? parsed.proposalMessageId : undefined, proposalChatId: typeof parsed.proposalChatId === 'number' ? parsed.proposalChatId : undefined }; }

function toPlan(b: BotView): AgentDashboardBot { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flowName: b.flowName ?? b.flow?.name ?? null, flowDescription: b.flowDescription ?? b.flow?.description ?? null }; }
function compactFlow(flow: BotFlow | null | undefined): unknown { if (!flow) return null; return { name: flow.name, description: flow.description, start: flow.start, variables: flow.variables, nodes: Object.values(flow.nodes ?? {}).map((node) => ({ id: node.id, message: node.message, keyboard: node.keyboard ?? 'inline', buttons: (node.buttons ?? []).map((button) => ({ text: button.text, next: button.next })), saveInputAs: node.saveInputAs, next: node.next, notifyOwner: node.notifyOwner, end: node.end, ai: node.ai ? { enabled: node.ai.enabled, systemPrompt: node.ai.systemPrompt?.slice(0, 240) } : undefined })) }; }
function botSnapshot(b: BotView): unknown { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flow: compactFlow(b.flow), blueprint: b.blueprint ? { startScreen: b.blueprint.startScreen, botType: b.blueprint.botType, language: b.blueprint.language, screens: b.blueprint.screens?.map((screen) => ({ id: screen.id, title: screen.title, message: screen.message, buttons: screen.buttons?.map((button) => ({ text: button.text, action: button.action })) })) } : null }; }
async function aiProgressText(env: Env, pending: PendingAction, phase: ProgressPhase, details: unknown, history: ChatHistoryMessage[]): Promise<string> { const fallback = fallbackProgress(pending, phase); try { const text = await aiReply(env, 'Write one short live progress update for a Telegram bot-builder operation. It must sound natural, be in the user language, include exactly one relevant emoji/sticker-like icon at the start, and explain what is happening now. Do not claim completion unless the phase is finalizing. Maximum 140 characters.', JSON.stringify({ phase, pending_action: pending, details, recent_history: history.slice(-4) }), []); return text.trim().slice(0, 220) || fallback; } catch { return fallback; } }
function fallbackProgress(pending: PendingAction, phase: ProgressPhase): string { const fa = /[\u0600-\u06FF]/.test(`${pending.originalRequest} ${pending.proposalText}`); const t: Record<ProgressPhase, string> = { accepted: fa ? '✅ تأیید شد؛ شروع کردم.' : '✅ Confirmed. Starting now.', reading_dashboard: fa ? '🔎 دارم داشبورد و ربات‌های وصل‌شده رو بررسی می‌کنم.' : '🔎 Reading your dashboard and connected bots.', reading_bot: fa ? '🤖 دارم ربات هدف رو از دیتابیس می‌خونم.' : '🤖 Reading the target bot from the database.', reading_flow: fa ? '🧩 دارم flow، نودها و دکمه‌های واقعی رو بررسی می‌کنم.' : '🧩 Inspecting the real flow, nodes, and buttons.', planning_change: fa ? '🧠 دارم تغییر لازم رو با وضعیت فعلی ربات تطبیق می‌دم.' : '🧠 Matching the requested change with the current bot state.', generating_flow: fa ? '⚙️ دارم flow اجرایی جدید رو می‌سازم.' : '⚙️ Building the new executable flow.', checking_flow: fa ? '✅ دارم بررسی می‌کنم flow واقعاً تغییر کرده باشد.' : '✅ Checking that the flow actually changed.', generating_blueprint: fa ? '🎛 دارم blueprint ربات رو هماهنگ می‌کنم.' : '🎛 Updating the bot blueprint.', saving_db: fa ? '💾 دارم تغییر واقعی رو در دیتابیس ذخیره می‌کنم.' : '💾 Saving the real change to the database.', clearing_cache: fa ? '♻️ دارم کش ربات رو پاک می‌کنم.' : '♻️ Clearing the bot cache.', publishing: fa ? '🌐 دارم webhook و وضعیت انتشار رو به‌روزرسانی می‌کنم.' : '🌐 Updating webhook and publish status.', finalizing: fa ? '🏁 دارم نتیجه نهایی رو آماده می‌کنم.' : '🏁 Preparing the final result.', failed: fa ? '⚠️ عملیات کامل نشد؛ دارم علت رو آماده می‌کنم.' : '⚠️ The operation did not finish; preparing the reason.', rejecting: fa ? '🛑 رد شد؛ دارم درخواست معلق رو حذف می‌کنم.' : '🛑 Rejected. Removing the pending request.' }; return t[phase]; }
async function updateProgress(env: Env, key: string, chatId: number, callback: TelegramCallbackQuery | null, pending: PendingAction, phase: ProgressPhase, details: unknown, history: ChatHistoryMessage[]): Promise<void> { const text = await aiProgressText(env, pending, phase, details, history); await editOrSend(key, chatId, callback, pending, text); }
async function showBots(env: Env, key: string, chatId: number, userId: string): Promise<void> { const bots = await dashboard(env, userId); const reply = await aiReply(env, 'Summarize the user connected bots in their language. Use only the actual snapshots.', JSON.stringify({ bots: bots.map(botSnapshot) }), []); await send(key, chatId, reply); }
async function mainMenu(key: string, chatId: number): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text: 'AI Builder TEL', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'My Bots', callback_data: 'builder:mybots' }, { text: 'Help', callback_data: 'builder:help' }]] } }); }
async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> { const raw = await env.BOT_CACHE.get(key).catch(() => null); const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : []; return Array.isArray(parsed) ? parsed.filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-16) : []; }
async function saveHistory(env: Env, key: string, h: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> { const next = [...h, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16); await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: 7200 }).catch(() => undefined); }
function isRealAction(action: string): action is RealAction { return action === 'edit_bot' || action === 'publish_bot' || action === 'activate_bot' || action === 'pause_bot'; }
function pendingKey(userId: string): string { return `builder-pending-action:${userId}`; }
async function editOrSend(key: string, chatId: number, callback: TelegramCallbackQuery | null, pending: PendingAction | null, text: string): Promise<void> { const messageId = callback?.message?.message_id ?? pending?.proposalMessageId; const targetChatId = callback?.message?.chat.id ?? pending?.proposalChatId ?? chatId; if (messageId) await tg(key, 'editMessageText', { chat_id: targetChatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } }).catch(async () => send(key, chatId, text)); else await send(key, chatId, text); }
async function send(key: string, chatId: number, text: string): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text }); }
async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); return response.json() as Promise<T>; }
function extractText(data: ResponsesApiResult): string | null { if (data.output_text) return data.output_text; for (const item of data.output ?? []) { if (item.type !== 'message') continue; for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text; } return null; }
function extractJson(value: string): string { const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim(); const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}'); return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned; }

import { aiReply, defaultFlow, improveFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { decideBuilderAgentAction, type AgentDashboardBot } from './agent-decision-fixed';
import { handleExpandedFlowCallback, handleExpandedFlowMessage, handleExpandedPreCheckoutQuery } from './telegram-flow-runtime-fixed';
import { animatedTelegramAiReply, animatedTelegramSend, safeTelegramAiReply } from './telegram-chat-animation';
import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string }> {
  return tg(env.TELEGRAM_BOT_TOKEN, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query', 'my_chat_member', 'pre_checkout_query'],
    drop_pending_updates: true,
  });
}

type BotView = AgentDashboardBot & { flow?: BotFlow | null };
type RealAction = 'edit_bot' | 'publish_bot' | 'activate_bot' | 'pause_bot';
type PendingAction = { action: RealAction; targetBotId: string | null; originalRequest: string; proposalText: string; createdAt: number; proposalMessageId?: number; proposalChatId?: number };
type ActionResult = Record<string, unknown> & { ok: boolean; action: RealAction };
type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
type TtsVoice = { name: string; id: string };
type TtsSelection = { voiceName: string; voiceId: string; createdAt: number };

const CHAT_TTL = 7200;
const PENDING_TTL = 900;
const TTS_TTL = 900;
const USER_BOT_ALLOWED_UPDATES = ['message', 'callback_query', 'pre_checkout_query', 'my_chat_member'];
const TTS_VOICES: TtsVoice[] = [
  { name: 'Liam', id: 'TX3LPaxmHKxFdv7VOQHJ' },
  { name: 'Noah', id: '1SM7GgM6IMuvQlz2BwM3' },
  { name: 'Ava', id: 'tnSpp4vdxKPjI9w0GnoV' },
  { name: 'Nora', id: 'BIvP0GN1cAtSRTxNHnWS' },
  { name: 'Alex', id: 'GFGuOkimbpNkTEOVDkqX' },
  { name: 'Ella', id: 'NZiuR1C6kVMSWHG27sIM' },
  { name: 'Chloe', id: 'BZgkqPqms7Kj9ulSkVzn' },
  { name: 'Alexandra', id: 'kdmDKE6EkgrWrrykO9Qt' },
  { name: 'Laura', id: '7piC4m7q8WrpEAnMj5xC' },
  { name: 'Maxon', id: '0dPqNXnhg2bmxQv1WKDp' },
  { name: 'Jessica', id: 'cgSgspJ2msm6clMCkdW9' },
  { name: 'Austin', id: 'Bj9UqZbhQsanLzgalpEG' },
  { name: 'priyanka', id: 'BpjGufoPiobT79j2vtj4' },
  { name: 'horatius', id: 'qXpMhyvQqiRxWQs4qSSB' },
  { name: 'anika', id: 'Sm1seazb4gs7RSlUVw7c' },
  { name: 'brock', id: 'DGzg6RaUqxGRTHSBjfgF' },
  { name: 'Xavier', id: 'YOq2y2Up4RgXP2HyXjE5' },
  { name: 'Lucas', id: 'NNl6r8mD7vthiJatiJt1' },
];

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean; flow?: BotFlow }>(bot.settings_json, {});
  const key = await decryptUserToken(env, bot.encrypted_token);

  if (!settings.isBuilderBot) {
    if (settings.flow && update.pre_checkout_query) return handleExpandedPreCheckoutQuery(key, update.pre_checkout_query, flowRuntimeDeps);
    if (settings.flow && update.callback_query) return handleExpandedFlowCallback(env, key, bot, settings.flow, update.callback_query, flowRuntimeDeps);
    if (settings.flow && update.message) return handleExpandedFlowMessage(env, key, bot, settings.flow, update.message, flowRuntimeDeps);
    if (update.callback_query) await tg(key, 'answerCallbackQuery', { callback_query_id: update.callback_query.id }).catch(() => undefined);
    if (update.message) await send(key, update.message.chat.id, 'این ربات هنوز flow اجرایی ندارد. از AI Builder TEL تنظیمش کن.');
    return;
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
    await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
    await mainMenu(key, chatId);
    return;
  }

  if (text === 'End Chat' || text === '/cancel') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await env.BOT_CACHE.delete(historyKey).catch(() => undefined);
    await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
    await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
    const reply = await safeTelegramAiReply(() => aiReply(env, 'The user closed AI chat. Reply naturally in the user language.', text, []), 'چت هوش مصنوعی بسته شد.');
    await tg(key, 'sendMessage', { chat_id: chatId, text: reply, reply_markup: { remove_keyboard: true } });
    await mainMenu(key, chatId);
    return;
  }

  const tts = await getTtsSelection(env, userId);
  if (tts) return handleTtsText(env, key, chatId, userId, text, tts);

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
  const data = q.data ?? '';
  await tg(key, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);

  if (data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: CHAT_TTL }).catch(() => undefined);
    await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
    const bots = await dashboard(env, userId);
    await animatedTelegramAiReply(tg, key, chatId, () => aiReply(env, 'The user opened AI chat. Reply in the user language. Use only these real connected bots.', JSON.stringify({ bots: bots.map(botSnapshot) }), []), 'Chat with AI روشن شد. پیام بعدی‌ات را بفرست.', { keyboard: [[{ text: 'End Chat' }]], resize_keyboard: true, one_time_keyboard: false });
    return;
  }

  if (data === 'builder:tts') return showTtsVoices(key, chatId);

  if (data.startsWith('builder:tts:')) {
    const voiceName = data.slice('builder:tts:'.length);
    const voice = TTS_VOICES.find((item) => item.name === voiceName);
    if (!voice) return showTtsVoices(key, chatId);
    await env.BOT_CACHE.delete(`builder-ai-chat:${userId}`).catch(() => undefined);
    await env.BOT_CACHE.put(ttsKey(userId), JSON.stringify({ voiceName: voice.name, voiceId: voice.id, createdAt: Date.now() }), { expirationTtl: TTS_TTL }).catch(() => undefined);
    await tg(key, 'sendMessage', { chat_id: chatId, text: `Voice selected: ${voice.name}\nSend the text you want to convert to speech.\n\nSend /cancel to exit.` });
    return;
  }

  if (data === 'builder:confirm') {
    const pending = await getPending(env, userId);
    if (!pending) return editOrSend(key, chatId, q, null, 'درخواست معلقی برای تأیید وجود ندارد.');
    return executePending(env, key, chatId, userId, pending, q, 'Confirm');
  }

  if (data === 'builder:reject') {
    const pending = await getPending(env, userId);
    return rejectPending(env, key, chatId, userId, pending, q, 'Reject');
  }

  await mainMenu(key, chatId);
}

async function agent(env: Env, key: string, chatId: number, userId: string, text: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const bots = await dashboard(env, userId);
  const decision = await decideBuilderAgentAction(env, text, history, bots.map(toPlan));
  const target = decision.targetBotId ? bots.find((b) => b.id === decision.targetBotId) ?? null : bots[0] ?? null;

  if (isRealAction(decision.action)) {
    const result = await animatedTelegramAiReply(tg, key, chatId, () => aiReply(env, 'Create a short proposal in the user language. Explain exactly what will change. Ask for confirmation. Do not claim it is applied yet.', JSON.stringify({ action: decision.action, target_bot: target ? botSnapshot(target) : null, request: text }), history), 'درخواستت را گرفتم، اما نتوانستم پیشنهاد دقیق بسازم. لطفاً کمی واضح‌تر بگو چه تغییری می‌خواهی.', { inline_keyboard: [[{ text: 'Confirm', callback_data: 'builder:confirm' }, { text: 'Reject', callback_data: 'builder:reject' }]] });
    const pending: PendingAction = { action: decision.action, targetBotId: target?.id ?? null, originalRequest: text, proposalText: result.text, createdAt: Date.now(), proposalMessageId: result.sent.result?.message_id, proposalChatId: chatId };
    await env.BOT_CACHE.put(pendingKey(userId), JSON.stringify(pending), { expirationTtl: PENDING_TTL }).catch(() => undefined);
    await saveHistory(env, historyKey, history, text, result.text);
    return;
  }

  const result = await animatedTelegramAiReply(tg, key, chatId, () => aiReply(env, 'Reply in the user language. Use only the real dashboard/flow data provided. Do not invent menus or buttons. Never claim a real bot change was applied.', JSON.stringify({ request: text, bots: bots.map(botSnapshot) }), history), 'الان نتوانستم جواب هوش مصنوعی را بسازم. لطفاً دوباره امتحان کن.');
  await saveHistory(env, historyKey, history, text, result.text);
}

async function executePending(env: Env, key: string, chatId: number, userId: string, pending: PendingAction, callback: TelegramCallbackQuery | null, confirmationText: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const progress = async (value: string) => editOrSend(key, chatId, callback, pending, value);
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
    const finalText = await safeTelegramAiReply(() => aiReply(env, 'Reply in the user language. Do not claim success unless operation_result.ok is true. Keep it short.', JSON.stringify({ confirmationText, request: pending.originalRequest, operation_result: result, bot_after: afterTarget ? botSnapshot(afterTarget) : null }), history), result.ok ? 'انجام شد.' : 'تغییر کامل نشد.');
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
    'Return/produce a changed executable flow with valid nodes, buttons, next targets, keyboard, saveInputAs, notifyOwner, end, media, condition, url, webAppUrl, copyText, requestContact, requestLocation, and starsPayment fields.',
    `current_flow=${JSON.stringify(compactFlow(flowNow))}`,
    `request=${text}`,
    `history=${history.slice(-8).map((m) => `${m.role}: ${m.content}`).join('\n')}`,
  ].join('\n\n');
  await progress('⚙️ دارم تغییر را فقط روی settings.flow می‌سازم...');
  const flow = await improveFlow(env, flowNow, instruction);
  if (JSON.stringify(flowNow) === JSON.stringify(flow.flow)) return { ok: false, action: 'edit_bot', botId: full.id, error: 'flow_not_changed', flowSummary: flow.summary };
  const revision = `rev_${Date.now()}`;
  settings.flow = { ...flow.flow, revision };
  await progress('💾 دارم flow جدید را ذخیره و کش را پاک می‌کنم...');
  await env.DB.prepare('UPDATE bots SET settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(settings), full.id).run();
  await env.BOT_CACHE.delete(`flow-state:${full.id}:${userId}`).catch(() => undefined);
  const saved = await env.DB.prepare('SELECT settings_json FROM bots WHERE id = ?').bind(full.id).first<{ settings_json: string }>();
  const savedSettings = safeParseJson<Record<string, unknown>>(saved?.settings_json ?? '{}', {});
  const savedFlow = savedSettings.flow as BotFlow | undefined;
  if (!savedFlow || savedFlow.revision !== revision) return { ok: false, action: 'edit_bot', botId: full.id, error: 'flow_save_verify_failed' };
  return { ok: true, action: 'edit_bot', botId: full.id, flowChanged: true, flowSummary: flow.summary, revision, runtimeSource: 'settings.flow', blueprintTouched: false, runtimeStateReset: true };
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
    return { ok: true, action, botId: full.id };
  }
  const url = `${PUBLIC_BASE_URL}/bot/${full.id}/webhook`;
  const result = await tg<{ ok: boolean; description?: string }>(userKey, 'setWebhook', { url, allowed_updates: USER_BOT_ALLOWED_UPDATES, drop_pending_updates: true });
  if (!result.ok) return { ok: false, action, botId: full.id, error: result.description ?? 'telegram_set_webhook_failed' };
  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {});
  settings.webhookUrl = url;
  await env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), full.id).run();
  return { ok: true, action, botId: full.id, webhookUrl: url };
}

async function rejectPending(env: Env, key: string, chatId: number, userId: string, pending: PendingAction | null, callback: TelegramCallbackQuery | null, userText: string): Promise<void> {
  await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const reply = await safeTelegramAiReply(() => aiReply(env, 'The user rejected a pending change. Reply in user language. Make clear nothing was applied.', JSON.stringify({ userText, pending }), history), 'رد شد. چیزی اعمال نشد.');
  await editOrSend(key, chatId, callback, pending, reply);
  await saveHistory(env, historyKey, history, `REJECT:${pending?.originalRequest ?? ''}`, reply);
}

async function classifyPendingReply(env: Env, pending: PendingAction, history: ChatHistoryMessage[], userReply: string): Promise<'confirm' | 'reject' | 'other'> {
  if (!env.OPENAI_API_KEY) return 'other';
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, { method: 'POST', headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: OPENAI_MODEL, instructions: 'Classify reply to pending bot change. Return strict JSON: {"decision":"confirm"|"reject"|"other"}.', input: JSON.stringify({ pending, history: history.slice(-6), userReply }), max_output_tokens: 80 }) });
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
async function getTtsSelection(env: Env, userId: string): Promise<TtsSelection | null> { const raw = await env.BOT_CACHE.get(ttsKey(userId)).catch(() => null); return raw ? safeParseJson<TtsSelection | null>(raw, null) : null; }
async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> { const raw = await env.BOT_CACHE.get(key).catch(() => null); const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : []; return Array.isArray(parsed) ? parsed.filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-16) : []; }
async function saveHistory(env: Env, key: string, h: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> { const next = [...h, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16); await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: CHAT_TTL }).catch(() => undefined); }
async function mainMenu(key: string, chatId: number): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text: 'AI Builder TEL', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/builder` } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'Text to Speech', callback_data: 'builder:tts' }]] } }); }
async function editOrSend(key: string, chatId: number, callback: TelegramCallbackQuery | null, pending: PendingAction | null, text: string): Promise<void> { const messageId = callback?.message?.message_id ?? pending?.proposalMessageId; const targetChatId = callback?.message?.chat.id ?? pending?.proposalChatId ?? chatId; if (messageId) await tg(key, 'editMessageText', { chat_id: targetChatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } }).catch(async () => send(key, chatId, text)); else await send(key, chatId, text); }
async function send(key: string, chatId: number, text: string): Promise<void> { await animatedTelegramSend(tg, key, chatId, text); }
async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); return response.json() as Promise<T>; }
async function tgForm<T = { ok: boolean; description?: string }>(key: string, method: string, form: FormData): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', body: form }); return response.json() as Promise<T>; }
function isRealAction(action: string): action is RealAction { return action === 'edit_bot' || action === 'publish_bot' || action === 'activate_bot' || action === 'pause_bot'; }
function pendingKey(userId: string): string { return `builder-pending-action:${userId}`; }
function ttsKey(userId: string): string { return `builder-tts:${userId}`; }
function toPlan(b: BotView): AgentDashboardBot { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flowName: b.flowName ?? b.flow?.name ?? null, flowDescription: b.flowDescription ?? null }; }
function compactFlow(flow: BotFlow | null | undefined): unknown { if (!flow) return null; return { revision: flow.revision, name: flow.name, description: flow.description, start: flow.start, variables: flow.variables, nodes: Object.values(flow.nodes ?? {}).map((node) => ({ id: node.id, message: node.message, keyboard: node.keyboard ?? 'inline', buttons: (node.buttons ?? []).map((button) => ({ text: button.text, next: button.next, url: button.url, webAppUrl: button.webAppUrl, copyText: button.copyText, requestContact: button.requestContact, requestLocation: button.requestLocation, starsPayment: button.starsPayment })), saveInputAs: node.saveInputAs, next: node.next, notifyOwner: node.notifyOwner, end: node.end, media: node.media, condition: node.condition })) }; }
function botSnapshot(b: BotView): unknown { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flow: compactFlow(b.flow) }; }
function extractText(data: ResponsesApiResult | null): string | null { if (!data) return null; if (data.output_text) return data.output_text; for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text; return null; }
function extractJson(value: string): string { const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim(); const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}'); return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned; }
function renderTemplate(template: string, data: Record<string, string>): string { return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => data[key] ?? ''); }

async function showTtsVoices(key: string, chatId: number): Promise<void> {
  const rows = [] as Array<Array<{ text: string; callback_data: string }>>;
  for (let i = 0; i < TTS_VOICES.length; i += 2) rows.push(TTS_VOICES.slice(i, i + 2).map((voice) => ({ text: voice.name, callback_data: `builder:tts:${voice.name}` })));
  await tg(key, 'sendMessage', { chat_id: chatId, text: 'Text to Speech\nChoose a voice:', reply_markup: { inline_keyboard: rows } });
}

async function handleTtsText(env: Env, key: string, chatId: number, userId: string, text: string, selection: TtsSelection): Promise<void> {
  const apiKey = (env as Env & { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;
  if (!apiKey) {
    await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
    await send(key, chatId, 'Text to Speech is not configured. Add ELEVENLABS_API_KEY to Cloudflare secrets.');
    return mainMenu(key, chatId);
  }
  if (text.length > 2500) return send(key, chatId, 'Text is too long. Please send a shorter text.');
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'upload_voice' }).catch(() => undefined);
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selection.voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (!response.ok) throw new Error(`ElevenLabs error ${response.status}`);
    const audio = await response.arrayBuffer();
    const form = new FormData();
    form.append('chat_id', String(chatId));
    form.append('caption', `Voice: ${selection.voiceName}`);
    form.append('audio', new Blob([audio], { type: 'audio/mpeg' }), `${selection.voiceName}.mp3`);
    await tgForm(key, 'sendAudio', form);
    await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
    await mainMenu(key, chatId);
  } catch (error) {
    await send(key, chatId, `Could not create speech. ${(error instanceof Error ? error.message : String(error)).slice(0, 120)}`);
  }
}

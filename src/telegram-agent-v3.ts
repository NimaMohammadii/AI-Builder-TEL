import { aiReply, defaultFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { decideBuilderAgentAction, type AgentDashboardBot } from './agent-decision-fixed';
import { handleExpandedFlowCallback, handleExpandedFlowMessage, handleExpandedPreCheckoutQuery } from './telegram-flow-runtime-fixed';
import { animatedTelegramAiReply, animatedTelegramSend, safeTelegramAiReply } from './telegram-chat-animation';
import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';
import { buildAgentDsl, type AgentDsl } from './agent-dsl-builder';
import { handleAgentDslCallback, handleAgentDslMessage } from './agent-dsl-runtime';
import { handleBotAdminCallback, handleBotAdminMessage } from './telegram-bot-admin-panel';

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
type SavedLock = { locked?: boolean; mode?: 'open' | 'locked' | 'code' | 'loading'; expiresAt?: string | null };
type AdminSettingRow = { value_json: string };
type TelegramMessageResult = { ok: boolean; result?: { message_id?: number }; description?: string };
type RegionConfig = { code: string; label: string; language: string; timezone: string };
type RegionSettings = { startPromptEnabled: boolean; commandEnabled: boolean; defaultRegionCode: string | null };

const CHAT_TTL = 7200;
const PENDING_TTL = 900;
const MAIN_MENU_TTL = 7200;
const LOCKS_KEY = 'admin:section-locks';
const REGION_SETTINGS_KEY = 'admin:bot-region-settings';
const LOCKED_TEXT = 'اینجا قفله.';
const USER_BOT_ALLOWED_UPDATES = ['message', 'callback_query', 'pre_checkout_query', 'my_chat_member'];
const REGIONS: RegionConfig[] = [
  { code: 'IR', label: '🇮🇷 Iran', language: 'fa', timezone: 'Asia/Tehran' },
  { code: 'TR', label: '🇹🇷 Turkey', language: 'tr', timezone: 'Europe/Istanbul' },
  { code: 'DE', label: '🇩🇪 Germany', language: 'de', timezone: 'Europe/Berlin' },
  { code: 'AE', label: '🇦🇪 UAE', language: 'ar', timezone: 'Asia/Dubai' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia', language: 'ar', timezone: 'Asia/Riyadh' },
  { code: 'RU', label: '🇷🇺 Russia', language: 'ru', timezone: 'Europe/Moscow' },
  { code: 'IN', label: '🇮🇳 India', language: 'en', timezone: 'Asia/Kolkata' },
  { code: 'BR', label: '🇧🇷 Brazil', language: 'pt', timezone: 'America/Sao_Paulo' },
  { code: 'US', label: '🇺🇸 United States', language: 'en', timezone: 'America/New_York' },
  { code: 'OTHER', label: '🌍 Other', language: 'en', timezone: 'UTC' },
];
export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean; flow?: BotFlow; agentMode?: string; agentDsl?: { dsl?: AgentDsl; summary?: string; updatedAt?: string } }>(bot.settings_json, {});
  const key = await decryptUserToken(env, bot.encrypted_token);

  if (!settings.isBuilderBot) {
    if (settings.agentMode === 'dsl' && settings.agentDsl?.dsl) {
      if (update.callback_query) return handleAgentDslCallback(env, key, bot, settings.agentDsl.dsl, update.callback_query);
      if (update.message) return handleAgentDslMessage(env, key, bot, settings.agentDsl.dsl, update.message);
    }
    if (settings.flow && update.pre_checkout_query) return handleExpandedPreCheckoutQuery(key, update.pre_checkout_query, flowRuntimeDeps);
    if (settings.flow && update.callback_query) return handleExpandedFlowCallback(env, key, bot, settings.flow, update.callback_query, flowRuntimeDeps);
    if (settings.flow && update.message) return handleExpandedFlowMessage(env, key, bot, settings.flow, update.message, flowRuntimeDeps);
    if (update.callback_query) await tg(key, 'answerCallbackQuery', { callback_query_id: update.callback_query.id }).catch(() => undefined);
    if (update.message) await send(key, update.message.chat.id, 'این ربات هنوز منطق اجرایی ندارد. از AI Builder TEL تنظیمش کن.');
    return;
  }

  if (update.callback_query && await handleBotAdminCallback(env, key, update.callback_query, tg)) return;
  if (update.callback_query) return onCallback(env, key, bot.id, update.callback_query);
  if (update.message && await handleBotAdminMessage(env, key, update.message, tg)) return;
  if (update.message) return onMessage(env, key, bot.id, update.message);
}

const flowRuntimeDeps = {
  telegramApi: tg,
  sendText: send,
  runtimeAiReply: (env: Env, systemPrompt: string, text: string) => aiReply(env, systemPrompt, text),
  renderTemplate,
};

async function onMessage(env: Env, key: string, botId: string, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';
  const chatKey = `builder-ai-chat:${userId}`;
  const historyKey = `builder-ai-history:${userId}`;

  if (text === '/region') {
    const settings = await getRegionSettings(env);
    if (!settings.commandEnabled) return;
    return regionMenu(key, chatId, 'Change your region 🌍');
  }

  if (!text || text === '/start') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
    let region = await getUserRegion(env, botId, userId);
    if (!region) {
      const settings = await getRegionSettings(env);
      const defaultRegion = settings.defaultRegionCode ? regionByCode(settings.defaultRegionCode) : null;
      if (!settings.startPromptEnabled && defaultRegion) {
        await saveUserRegion(env, botId, userId, defaultRegion);
        region = defaultRegion;
      } else if (settings.startPromptEnabled) {
        return regionMenu(key, chatId, 'Choose your region 🌍');
      }
    }
    await mainMenu(env, key, chatId);
    return;
  }

  if (text === 'End' || text === 'End Chat' || text === '/cancel') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await env.BOT_CACHE.delete(historyKey).catch(() => undefined);
    await env.BOT_CACHE.delete(pendingKey(userId)).catch(() => undefined);
    const reply = await safeTelegramAiReply(() => aiReply(env, 'The user closed AI chat. Reply naturally in the user language.', text, []), 'چت هوش مصنوعی بسته شد.');
    await tg(key, 'sendMessage', { chat_id: chatId, text: reply, reply_markup: { remove_keyboard: true } });
    await mainMenu(env, key, chatId);
    return;
  }

  if (!(await env.BOT_CACHE.get(chatKey).catch(() => null))) return mainMenu(env, key, chatId);
  if (await isAiSectionLocked(env, 'ai-chat')) {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await send(key, chatId, LOCKED_TEXT);
    return mainMenu(env, key, chatId);
  }

  const pending = await getPending(env, userId);
  if (pending) {
    const history = await loadHistory(env, historyKey);
    const decision = await classifyPendingReply(env, pending, history, text);
    if (decision === 'confirm') return executePending(env, key, chatId, userId, pending, null, text);
    if (decision === 'reject') return rejectPending(env, key, chatId, userId, pending, null, text);
  }

  await agent(env, key, chatId, userId, text);
}

async function onCallback(env: Env, key: string, botId: string, q: TelegramCallbackQuery): Promise<void> {
  const chatId = q.message?.chat.id ?? q.from.id;
  const userId = String(q.from.id);
  const data = q.data ?? '';
  await tg(key, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);

  if (data.startsWith('region:')) {
    const region = regionByCode(data.slice('region:'.length));
    if (!region) return regionMenu(key, chatId, 'Choose your region 🌍');
    await saveUserRegion(env, botId, userId, region);
    await tg(key, 'sendMessage', { chat_id: chatId, text: `Region saved: ${region.label}\nLanguage: ${region.language.toUpperCase()}\nTimezone: ${region.timezone}` });
    await mainMenu(env, key, chatId);
    return;
  }

  if (data === 'builder:miniapp') { await lockedCallback(env, key, q, 'ai-miniapp'); return; }
  if (data === 'builder:chat' && await lockedCallback(env, key, q, 'ai-chat')) return;
  if (data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: CHAT_TTL }).catch(() => undefined);
    const bots = await dashboard(env, userId);
    await animatedTelegramAiReply(tg, key, chatId, () => aiReply(env, 'The user opened AI chat. Reply in the user language. Use only these real connected bots.', JSON.stringify({ bots: bots.map(botSnapshot) }), []), 'Chat with AI روشن شد. پیام بعدی‌ات را بفرست.', { keyboard: [[{ text: 'End' }]], resize_keyboard: true, one_time_keyboard: false });
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

  await mainMenu(env, key, chatId);
}

async function lockedCallback(env: Env, key: string, q: TelegramCallbackQuery, sectionId: string): Promise<boolean> {
  if (!(await isAiSectionLocked(env, sectionId))) return false;
  const chatId = q.message?.chat.id ?? q.from.id;
  await tg(key, 'answerCallbackQuery', { callback_query_id: q.id, text: LOCKED_TEXT, show_alert: true }).catch(() => undefined);
  await send(key, chatId, LOCKED_TEXT);
  return true;
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
    await progress('✅ تأیید شد؛ دارم منطق ربات را می‌سازم...');
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
  const currentDsl = (settings.agentDsl as { dsl?: AgentDsl } | undefined)?.dsl ?? null;
  const currentFlowFallback = compactFlow((settings.flow as BotFlow | undefined) ?? defaultFlow('Telegram bot'));
  await progress('⚙️ دارم منطق اجرایی ربات را می‌سازم...');
  const result = await buildAgentDsl(
    env,
    [
      `request=${text}`,
      `history=${history.slice(-8).map((m) => `${m.role}: ${m.content}`).join('\n')}`,
    ].join('\n\n'),
    {
      mode: currentDsl ? 'edit' : 'create',
      currentDsl,
      currentFlowFallback,
    },
  );
  settings.agentMode = 'dsl';
  settings.agentDsl = { dsl: result.dsl, summary: result.summary, updatedAt: new Date().toISOString() };
  delete settings.agentCode;
  await progress('💾 دارم منطق ربات را ذخیره می‌کنم...');
  await env.DB.prepare('UPDATE bots SET settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(settings), full.id).run();
  await env.BOT_CACHE.delete(`agent-dsl-state:${full.id}:${userId}`).catch(() => undefined);
  return { ok: true, action: 'edit_bot', botId: full.id, agentMode: 'dsl', dslChanged: true, summary: result.summary };
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

async function isAiSectionLocked(env: Env, sectionId: string): Promise<boolean> {
  const id = String(sectionId || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
  if (!id) return false;
  const raw = await readAdminSetting<Record<string, SavedLock>>(env, LOCKS_KEY).catch(() => null);
  const item = raw?.[id];
  if (!item) return false;
  if (item.expiresAt && Date.parse(item.expiresAt) <= Date.now()) return false;
  const mode = item.mode || (item.locked ? 'locked' : 'open');
  return mode !== 'open';
}

async function readAdminSetting<T>(env: Env, name: string): Promise<T | null> {
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (name TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(name).first<AdminSettingRow>();
    if (row?.value_json) return JSON.parse(row.value_json) as T;
  } catch (error) {
    console.warn('read ai lock setting failed', error);
  }
  return env.BOT_CACHE.get(name, 'json').catch(() => null) as Promise<T | null>;
}

async function getBot(env: Env, id: string): Promise<BotRecord | null> { try { return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(id).first<BotRecord>()) ?? null; } catch { return null; } }
async function getPending(env: Env, userId: string): Promise<PendingAction | null> { const raw = await env.BOT_CACHE.get(pendingKey(userId)).catch(() => null); const parsed = raw ? safeParseJson<PendingAction | null>(raw, null) : null; return parsed?.action ? parsed : null; }
async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> { const raw = await env.BOT_CACHE.get(key).catch(() => null); const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : []; return Array.isArray(parsed) ? parsed.filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-16) : []; }
async function saveHistory(env: Env, key: string, h: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> { const next = [...h, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16); await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: CHAT_TTL }).catch(() => undefined); }

async function mainMenu(env: Env, key: string, chatId: number): Promise<void> {
  const miniAppLocked = await isAiSectionLocked(env, 'ai-miniapp').catch(() => false);
  const firstRow = miniAppLocked ? [{ text: 'Open Mini App', callback_data: 'builder:miniapp' }] : [{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }];

  await deleteLastMainMenu(env, key, chatId);

  const sent = await tg<TelegramMessageResult>(key, 'sendMessage', {
    chat_id: chatId,
    text: 'AI Builder',
    reply_markup: {
      inline_keyboard: [
        firstRow,
        [{ text: 'Chat with AI', callback_data: 'builder:chat' }],
      ],
    },
  });

  const messageId = sent.result?.message_id;
  if (messageId) {
    await env.BOT_CACHE.put(mainMenuKey(chatId), String(messageId), { expirationTtl: MAIN_MENU_TTL }).catch(() => undefined);
  }
}

async function regionMenu(key: string, chatId: number, text: string): Promise<void> {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let i = 0; i < REGIONS.length; i += 2) rows.push(REGIONS.slice(i, i + 2).map((region) => ({ text: region.label, callback_data: `region:${region.code}` })));
  await tg(key, 'sendMessage', {
    chat_id: chatId,
    text: `${text}\n\nYou can change it anytime with /region.`,
    reply_markup: { inline_keyboard: rows },
  });
}

function regionByCode(code: string): RegionConfig | null {
  const cleaned = String(code || '').trim().toUpperCase();
  return REGIONS.find((region) => region.code === cleaned) ?? null;
}


async function getRegionSettings(env: Env): Promise<RegionSettings> {
  const fallback: RegionSettings = { startPromptEnabled: true, commandEnabled: true, defaultRegionCode: null };
  try {
    await ensureAdminSettings(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(REGION_SETTINGS_KEY).first<AdminSettingRow>();
    const parsed = safeParseJson<Partial<RegionSettings>>(row?.value_json || '{}', {});
    const defaultRegion = parsed.defaultRegionCode ? regionByCode(String(parsed.defaultRegionCode)) : null;
    return {
      startPromptEnabled: parsed.startPromptEnabled !== false,
      commandEnabled: parsed.commandEnabled !== false,
      defaultRegionCode: defaultRegion?.code ?? null,
    };
  } catch { return fallback; }
}

async function ensureAdminSettings(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run().catch(() => undefined);
}

async function getUserRegion(env: Env, botId: string, userId: string): Promise<RegionConfig | null> {
  try {
    const row = await env.DB.prepare('SELECT state_json FROM bot_users WHERE bot_id = ? AND telegram_user_id = ?').bind(botId, userId).first<{ state_json: string | null }>();
    const state = safeParseJson<{ region?: { code?: string } }>(row?.state_json || '{}', {});
    return state.region?.code ? regionByCode(state.region.code) : null;
  } catch { return null; }
}

async function saveUserRegion(env: Env, botId: string, userId: string, region: RegionConfig): Promise<void> {
  const row = await env.DB.prepare('SELECT state_json FROM bot_users WHERE bot_id = ? AND telegram_user_id = ?').bind(botId, userId).first<{ state_json: string | null }>().catch(() => null);
  const state = safeParseJson<Record<string, unknown>>(row?.state_json || '{}', {});
  state.region = { code: region.code, label: region.label, language: region.language, timezone: region.timezone, updatedAt: new Date().toISOString() };
  await env.DB.prepare(`INSERT INTO bot_users (bot_id, telegram_user_id, state_json, last_seen_at, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(bot_id, telegram_user_id) DO UPDATE SET state_json = excluded.state_json, last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`)
    .bind(botId, userId, JSON.stringify(state))
    .run();
  await env.BOT_CACHE.put(`user-region:${userId}`, JSON.stringify(state.region), { expirationTtl: 30 * 24 * 60 * 60 }).catch(() => undefined);
}

async function deleteLastMainMenu(env: Env, key: string, chatId: number): Promise<void> {
  const raw = await env.BOT_CACHE.get(mainMenuKey(chatId)).catch(() => null);
  const messageId = Number(raw);

  if (!Number.isFinite(messageId) || messageId <= 0) return;

  await tg(key, 'deleteMessage', {
    chat_id: chatId,
    message_id: messageId,
  }).catch(() => undefined);

  await env.BOT_CACHE.delete(mainMenuKey(chatId)).catch(() => undefined);
}

async function editOrSend(key: string, chatId: number, callback: TelegramCallbackQuery | null, pending: PendingAction | null, text: string): Promise<void> { const messageId = callback?.message?.message_id ?? pending?.proposalMessageId; const targetChatId = callback?.message?.chat.id ?? pending?.proposalChatId ?? chatId; if (messageId) await tg(key, 'editMessageText', { chat_id: targetChatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } }).catch(async () => send(key, chatId, text)); else await send(key, chatId, text); }
async function send(key: string, chatId: number, text: string): Promise<void> { await animatedTelegramSend(tg, key, chatId, text); }
async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); return response.json() as Promise<T>; }
async function tgForm<T = { ok: boolean; description?: string }>(key: string, method: string, form: FormData): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', body: form }); return response.json() as Promise<T>; }
function isRealAction(action: string): action is RealAction { return action === 'edit_bot' || action === 'publish_bot' || action === 'activate_bot' || action === 'pause_bot'; }
function pendingKey(userId: string): string { return `builder-pending-action:${userId}`; }
function mainMenuKey(chatId: number): string { return `builder-main-menu:${chatId}`; }
function toPlan(b: BotView): AgentDashboardBot { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flowName: b.flowName ?? b.flow?.name ?? null, flowDescription: b.flowDescription ?? null }; }
function compactFlow(flow: BotFlow | null | undefined): unknown { if (!flow) return null; return { revision: (flow as BotFlow & { revision?: string }).revision, name: flow.name, description: flow.description, start: flow.start, variables: flow.variables, nodes: Object.values(flow.nodes ?? {}).map((node) => ({ id: node.id, message: node.message, keyboard: node.keyboard ?? 'inline', buttons: (node.buttons ?? []).map((button) => ({ text: button.text, next: button.next, url: button.url, webAppUrl: button.webAppUrl, copyText: button.copyText, requestContact: button.requestContact, requestLocation: button.requestLocation, starsPayment: button.starsPayment })), saveInputAs: node.saveInputAs, next: node.next, notifyOwner: node.notifyOwner, end: node.end, media: node.media, condition: node.condition })) }; }
function botSnapshot(b: BotView): unknown { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flow: compactFlow(b.flow) }; }
function extractText(data: ResponsesApiResult | null): string | null { if (!data) return null; if (data.output_text) return data.output_text; for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text; return null; }
function extractJson(value: string): string { const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim(); const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}'); return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned; }
function renderTemplate(template: string, data: Record<string, string>): string { return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => data[key] ?? ''); }

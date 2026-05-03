import { aiReply, defaultBlueprint, defaultFlow, improveBlueprint, improveFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { decideBuilderAgentAction, type AgentDashboardBot } from './agent-decision';
import { processTelegramUpdate as runtimeProcessTelegramUpdate, setTelegramWebhook } from './telegram';
import type { BotBlueprint, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

type BotView = AgentDashboardBot & { flow?: BotFlow | null; blueprint?: BotBlueprint | null };

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
    await mainMenu(key, chatId);
    return;
  }
  if (text === 'End Chat' || text === '/cancel') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await env.BOT_CACHE.delete(historyKey).catch(() => undefined);
    await tg(key, 'sendMessage', { chat_id: chatId, text: fa(text) ? 'چت بسته شد.' : 'AI chat closed.', reply_markup: { remove_keyboard: true } });
    await mainMenu(key, chatId);
    return;
  }
  const active = await env.BOT_CACHE.get(chatKey).catch(() => null);
  if (!active) return mainMenu(key, chatId);
  await agent(env, key, chatId, userId, text);
}

async function onCallback(env: Env, key: string, q: TelegramCallbackQuery): Promise<void> {
  const chatId = q.message?.chat.id ?? q.from.id;
  const userId = String(q.from.id);
  await tg(key, 'answerCallbackQuery', { callback_query_id: q.id });
  if (q.data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: 7200 }).catch(() => undefined);
    const bots = await dashboard(env, userId);
    await tg(key, 'sendMessage', { chat_id: chatId, text: bots.length ? `AI chat is open. I can check your dashboard and ${bots.length} connected bot(s).` : 'AI chat is open. I can check your dashboard. No connected bots yet.', reply_markup: { keyboard: [[{ text: 'End Chat' }]], resize_keyboard: true, one_time_keyboard: false } });
    return;
  }
  if (q.data === 'builder:mybots') return showBots(env, key, chatId, userId);
  if (q.data === 'builder:help') return send(key, chatId, 'I can check your dashboard, read connected bots, and apply changes from chat.');
  await mainMenu(key, chatId);
}

async function agent(env: Env, key: string, chatId: number, userId: string, text: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const bots = await dashboard(env, userId);
  const decision = await decideBuilderAgentAction(env, text, history, bots.map(toPlan));
  const target = decision.targetBotId ? bots.find((b) => b.id === decision.targetBotId) ?? null : null;
  let reply = '';
  if (decision.action === 'edit_bot') reply = await edit(env, key, chatId, text, history, bots, target);
  else if (decision.action === 'publish_bot' || decision.action === 'activate_bot' || decision.action === 'pause_bot') reply = await state(env, text, history, bots, target, decision.action);
  else reply = await answer(env, text, history, bots, target);
  await saveHistory(env, historyKey, history, text, reply);
  await send(key, chatId, reply);
}

async function edit(env: Env, key: string, chatId: number, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null): Promise<string> {
  if (!target) return answer(env, text, history, bots, null, 'User wants work on a bot but dashboard has no connected bot. Tell them naturally to connect one in Mini App.');
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  const full = await getBot(env, target.id);
  if (!full) return fa(text) ? 'ربات را پیدا نکردم.' : 'I could not find that bot.';
  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {});
  const bpNow = safeParseJson<BotBlueprint>(full.blueprint_json, defaultBlueprint('Telegram bot'));
  const flowNow = (settings.flow as BotFlow | undefined) ?? defaultFlow('Telegram bot');
  const instruction = ['Apply the latest request to the selected Telegram bot using dashboard context and recent chat.', `selected=${sum(target)}`, `dashboard=${bots.map(sum).join(' | ') || 'empty'}`, `history=${history.slice(-10).map((m) => `${m.role}: ${m.content}`).join('\n')}`, `latest=${text}`].join('\n\n');
  const [bp, flow] = await Promise.all([improveBlueprint(env, bpNow, instruction), improveFlow(env, flowNow, instruction)]);
  settings.flow = flow.flow;
  await env.DB.prepare('UPDATE bots SET blueprint_json = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(JSON.stringify(bp.blueprint), JSON.stringify(settings), full.id).run();
  await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
  return compact(`${flow.summary}\n${bp.summary}`);
}

async function state(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, action: 'publish_bot' | 'activate_bot' | 'pause_bot'): Promise<string> {
  if (!target) return answer(env, text, history, bots, null, 'The planner chose an action but no target bot exists. Answer naturally from dashboard context.');
  const full = await getBot(env, target.id);
  if (!full) return fa(text) ? 'ربات را پیدا نکردم.' : 'I could not find that bot.';
  const userKey = await decryptUserToken(env, full.encrypted_token);
  if (action === 'pause_bot') {
    await tg(userKey, 'deleteWebhook', { drop_pending_updates: true }).catch(() => undefined);
    await env.DB.prepare("UPDATE bots SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(full.id).run();
    await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
    return fa(text) ? `${name(full)} متوقف شد.` : `${name(full)} paused.`;
  }
  const url = `${PUBLIC_BASE_URL}/bot/${full.id}/webhook`;
  const result = await tg<{ ok: boolean; description?: string }>(userKey, 'setWebhook', { url, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
  if (!result.ok) return result.description ?? (fa(text) ? 'فعال‌سازی ناموفق بود.' : 'Activation failed.');
  const settings = safeParseJson<Record<string, unknown>>(full.settings_json, {});
  settings.webhookUrl = url;
  await env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), full.id).run();
  await env.BOT_CACHE.delete(`bot:${full.id}`).catch(() => undefined);
  return fa(text) ? `${name(full)} فعال شد.` : `${name(full)} is active.`;
}

async function answer(env: Env, text: string, history: ChatHistoryMessage[], bots: BotView[], target: BotView | null, extra = ''): Promise<string> {
  const context = ['You are an AI agent for AI Builder TEL.', 'You can inspect the user dashboard data below before answering.', 'Do not use canned onboarding replies. Do not invent data.', 'If connected_bots_count > 0, the user has connected at least one bot.', 'Reply in the same language as the user. Be short and natural.', extra, `connected_bots_count=${bots.length}`, `target_bot=${target ? sum(target) : 'none'}`, `dashboard_bots=${bots.map(sum).join(' | ') || 'none'}`].join('\n');
  return aiReply(env, context, text, history);
}

async function dashboard(env: Env, userId: string): Promise<BotView[]> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, username, status, blueprint_json, settings_json, created_at, updated_at FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 10').bind(userId).all<BotRecord>();
    return (rows.results ?? []).map((bot) => {
      const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
      const flow = (settings.flow as BotFlow | undefined) ?? null;
      return { id: bot.id, title: bot.title, username: bot.username, status: bot.status, created_at: bot.created_at, updated_at: bot.updated_at, blueprint: safeParseJson<BotBlueprint | null>(bot.blueprint_json, null), flow, flowName: flow?.name ?? null, flowDescription: flow?.description ?? null };
    });
  } catch (e) { console.error('dashboard failed', e); return []; }
}

async function getBot(env: Env, id: string): Promise<BotRecord | null> { try { return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(id).first<BotRecord>()) ?? null; } catch { return null; } }
function toPlan(b: BotView): AgentDashboardBot { return { id: b.id, title: b.title, username: b.username, status: b.status, created_at: b.created_at, updated_at: b.updated_at, flowName: b.flowName ?? b.flow?.name ?? null, flowDescription: b.flowDescription ?? b.flow?.description ?? null }; }
function sum(b: BotView): string { return [b.title, b.username ? `@${b.username}` : null, `id=${b.id}`, `status=${b.status}`, b.flowName || b.flow?.name ? `flow=${b.flowName ?? b.flow?.name}` : null].filter(Boolean).join(', '); }
async function showBots(env: Env, key: string, chatId: number, userId: string): Promise<void> { const bots = await dashboard(env, userId); await send(key, chatId, bots.length ? bots.map((b, i) => `${i + 1}. ${b.title}\n${b.username ? '@' + b.username : b.id}\n${b.status}`).join('\n\n') : 'No connected bots yet.'); }
async function mainMenu(key: string, chatId: number): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text: 'AI Builder TEL', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'My Bots', callback_data: 'builder:mybots' }, { text: 'Help', callback_data: 'builder:help' }]] } }); }
async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> { const raw = await env.BOT_CACHE.get(key).catch(() => null); const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : []; return Array.isArray(parsed) ? parsed.filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-16) : []; }
async function saveHistory(env: Env, key: string, h: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> { const next = [...h, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16); await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: 7200 }).catch(() => undefined); }
function compact(x: string): string { return x.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 2).join('\n') || 'Done.'; }
function fa(x: string): boolean { return /[\u0600-\u06FF]/.test(x); }
function name(b: Pick<BotRecord, 'title' | 'username'>): string { return b.username ? `@${b.username}` : b.title; }
async function send(key: string, chatId: number, text: string): Promise<void> { await tg(key, 'sendMessage', { chat_id: chatId, text }); }
async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> { const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); return response.json() as Promise<T>; }

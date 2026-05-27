import type { BotFlow, BotFlowButton } from './ai';
import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramPreCheckoutQuery } from './types';

type State = { nodeId: string; data: Record<string, string> };
type Tg = <T = { ok: boolean; description?: string }>(token: string, method: string, payload: unknown) => Promise<T>;
type Deps = { telegramApi: Tg; sendText: (token: string, chatId: number, text: string) => Promise<void>; runtimeAiReply: (env: Env, systemPrompt: string, text: string) => Promise<string>; renderTemplate: (template: string, data: Record<string, string>) => string };
const EMPTY_FLOW_MESSAGE = 'این ربات هنوز منطق اجرایی ندارد. از AI Builder TEL دوباره بساز یا آپدیتش کن.';

export async function handleExpandedPreCheckoutQuery(token: string, query: TelegramPreCheckoutQuery, deps: Deps): Promise<void> {
  const ok = query.currency === 'XTR' && query.invoice_payload.startsWith('stars:');
  await deps.telegramApi(token, 'answerPreCheckoutQuery', { pre_checkout_query_id: query.id, ok, ...(ok ? {} : { error_message: 'Invalid Telegram Stars payment.' }) });
}

export async function handleExpandedFlowMessage(env: Env, token: string, bot: BotRecord, flow: BotFlow, message: TelegramMessage, deps: Deps): Promise<void> {
  repair(flow);
  const chatId = message.chat.id;
  if (isEmptyFlow(flow)) return deps.sendText(token, chatId, EMPTY_FLOW_MESSAGE);
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';

  if (message.successful_payment) return paid(env, token, bot, flow, message, deps);
  if (!text || text === '/start' || text === '/reset') {
    const state = { nodeId: flow.start, data: {} };
    await saveState(env, bot.id, userId, state);
    return sendNode(env, token, bot, flow, chatId, userId, state, deps);
  }

  const state = await getState(env, bot.id, userId, flow);
  const node = flow.nodes[state.nodeId] ?? flow.nodes[flow.start];
  if (!node) return deps.sendText(token, chatId, EMPTY_FLOW_MESSAGE);

  if (message.contact) state.data.contact = JSON.stringify(message.contact);
  if (message.location) state.data.location = JSON.stringify(message.location);

  const button = (node.buttons ?? []).find((b) => b.text === text && b.next && flow.nodes[b.next]);
  if (button?.next) {
    state.nodeId = button.next;
    await saveState(env, bot.id, userId, state);
    return sendNode(env, token, bot, flow, chatId, userId, state, deps);
  }

  if (node.ai?.enabled && !node.saveInputAs && !node.next) return deps.sendText(token, chatId, await deps.runtimeAiReply(env, node.ai.systemPrompt, text));
  if (node.saveInputAs) {
    if (message.contact) state.data[node.saveInputAs] = JSON.stringify(message.contact);
    else if (message.location) state.data[node.saveInputAs] = JSON.stringify(message.location);
    else state.data[node.saveInputAs] = text;
  }
  state.nodeId = condNext(flow, node, state.data) ?? node.next ?? (node.end ? flow.start : state.nodeId);
  await saveState(env, bot.id, userId, state);
  await sendNode(env, token, bot, flow, chatId, userId, state, deps);
}

export async function handleExpandedFlowCallback(env: Env, token: string, bot: BotRecord, flow: BotFlow, callback: TelegramCallbackQuery, deps: Deps): Promise<void> {
  repair(flow);
  const chatId = callback.message?.chat.id ?? callback.from.id;
  if (isEmptyFlow(flow)) {
    await deps.telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
    return deps.sendText(token, chatId, EMPTY_FLOW_MESSAGE);
  }
  const userId = String(callback.from.id);
  const data = callback.data ?? '';
  await deps.telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });

  if (data.startsWith('stars:')) {
    const button = findStars(flow, data);
    if (!button?.starsPayment) return deps.sendText(token, chatId, 'Payment is not configured correctly.');
    return deps.telegramApi(token, 'sendInvoice', { chat_id: chatId, title: button.starsPayment.title, description: button.starsPayment.description || button.starsPayment.title, payload: button.starsPayment.payload, currency: 'XTR', prices: [{ label: button.starsPayment.title, amount: button.starsPayment.amount }] });
  }

  const nextId = data.startsWith('flow:') ? data.slice(5) : flow.start;
  const state = await getState(env, bot.id, userId, flow);
  state.nodeId = flow.nodes[nextId] ? nextId : flow.start;
  await saveState(env, bot.id, userId, state);
  await sendNode(env, token, bot, flow, chatId, userId, state, deps);
}

async function paid(env: Env, token: string, bot: BotRecord, flow: BotFlow, message: TelegramMessage, deps: Deps): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const payment = message.successful_payment;
  if (!payment || payment.currency !== 'XTR' || !payment.invoice_payload.startsWith('stars:')) return deps.sendText(token, chatId, 'Payment was received but could not be verified.');
  const nextId = payment.invoice_payload.split(':')[1];
  const state = await getState(env, bot.id, userId, flow);
  state.data.last_payment = JSON.stringify(payment);
  state.nodeId = nextId && flow.nodes[nextId] ? nextId : flow.start;
  await saveState(env, bot.id, userId, state);
  await sendNode(env, token, bot, flow, chatId, userId, state, deps);
}

async function sendNode(env: Env, token: string, bot: BotRecord, flow: BotFlow, chatId: number, userId: string, state: State, deps: Deps): Promise<void> {
  repair(flow);
  if (isEmptyFlow(flow)) return deps.sendText(token, chatId, EMPTY_FLOW_MESSAGE);
  const node = flow.nodes[state.nodeId] ?? flow.nodes[flow.start];
  if (!node) return deps.sendText(token, chatId, EMPTY_FLOW_MESSAGE);
  if (node.media?.url) await sendMedia(token, chatId, node.media, deps);
  const buttons = (node.buttons ?? []).filter((b) => renderable(flow, b));
  await deps.telegramApi(token, 'sendMessage', { chat_id: chatId, text: deps.renderTemplate(node.message, state.data), reply_markup: markup(buttons) });
  if (node.notifyOwner && bot.owner_telegram_id) {
    const summary = Object.entries(state.data).map(([k, v]) => `${k}: ${v}`).join('\n') || 'No collected data.';
    await deps.sendText(token, Number(bot.owner_telegram_id), `New bot submission from ${userId}\n\n${summary}`);
  }
  const next = condNext(flow, node, state.data);
  if (next) await saveState(env, bot.id, userId, { ...state, nodeId: next });
  else if (node.end && !node.buttons?.length) await saveState(env, bot.id, userId, { nodeId: flow.start, data: {} });
}

function repair(flow: BotFlow): void {
  if (!Object.keys(flow.nodes ?? {}).length) return;
  if (!flow.start || !flow.nodes[flow.start]) flow.start = Object.keys(flow.nodes)[0] ?? 'start';
  for (const node of Object.values(flow.nodes ?? {})) {
    node.message = node.message || 'Done.';
    if (node.next && !flow.nodes[node.next]) delete node.next;
    if (Array.isArray(node.buttons)) {
      node.buttons = node.buttons.filter((b) => b.text && (b.next ? Boolean(flow.nodes[b.next]) : true));
      if (node.buttons.length) {
        node.end = false;
        const needsReply = node.buttons.some((b) => b.requestContact || b.requestLocation);
        node.keyboard = needsReply ? 'reply' : 'inline';
      }
    }
  }
}
function isEmptyFlow(flow: BotFlow): boolean { return !Object.keys(flow.nodes ?? {}).length || !flow.start || !flow.nodes[flow.start]; }
function markup(buttons: BotFlowButton[]): unknown {
  if (!buttons.length) return undefined;
  const reply = buttons.some((b) => b.requestContact || b.requestLocation);
  if (reply) return { keyboard: buttons.filter((b) => b.requestContact || b.requestLocation).map((b) => [{ text: b.text, request_contact: b.requestContact || undefined, request_location: b.requestLocation || undefined }]), resize_keyboard: true, one_time_keyboard: false };
  return { inline_keyboard: buttons.map((b) => [{ text: b.text, ...(b.starsPayment ? { callback_data: `stars:${b.starsPayment.payload}` } : {}), ...(b.url ? { url: b.url } : {}), ...(b.webAppUrl ? { web_app: { url: b.webAppUrl } } : {}), ...(b.copyText ? { copy_text: { text: b.copyText } } : {}), ...(!b.starsPayment && b.next ? { callback_data: `flow:${b.next}` } : {}) }]) };
}
function renderable(flow: BotFlow, b: BotFlowButton): boolean { return Boolean(b.text && (b.starsPayment || b.url || b.webAppUrl || b.copyText || b.requestContact || b.requestLocation || (b.next && flow.nodes[b.next]))); }
function findStars(flow: BotFlow, data: string): BotFlowButton | null { const payload = data.slice(6); for (const n of Object.values(flow.nodes)) for (const b of n.buttons ?? []) if (b.starsPayment?.payload === payload) return b; return null; }
async function sendMedia(token: string, chatId: number, media: NonNullable<BotFlow['nodes'][string]['media']>, deps: Deps): Promise<void> { const p = { chat_id: chatId, caption: media.caption }; if (media.type === 'photo') await deps.telegramApi(token, 'sendPhoto', { ...p, photo: media.url }); if (media.type === 'video') await deps.telegramApi(token, 'sendVideo', { ...p, video: media.url }); if (media.type === 'document') await deps.telegramApi(token, 'sendDocument', { ...p, document: media.url }); }
function condNext(flow: BotFlow, node: BotFlow['nodes'][string], data: Record<string, string>): string | null { const c = node.condition; if (!c) return null; const v = data[c.variable]; const ok = c.exists ? Boolean(v) : c.equals !== undefined ? v === c.equals : false; const next = ok ? c.next : c.elseNext; return next && flow.nodes[next] ? next : null; }
async function getState(env: Env, botId: string, userId: string, flow: BotFlow): Promise<State> { const raw = await env.BOT_CACHE.get(`flow-state:${botId}:${userId}`).catch(() => null); const p = raw ? parse<State>(raw, { nodeId: flow.start, data: {} }) : { nodeId: flow.start, data: {} }; return flow.nodes[p.nodeId] ? { nodeId: p.nodeId, data: p.data ?? {} } : { nodeId: flow.start, data: p.data ?? {} }; }
async function saveState(env: Env, botId: string, userId: string, state: State): Promise<void> { await env.BOT_CACHE.put(`flow-state:${botId}:${userId}`, JSON.stringify(state), { expirationTtl: 86400 }).catch(() => undefined); }
function parse<T>(raw: string, fallback: T): T { try { return JSON.parse(raw) as T; } catch { return fallback; } }

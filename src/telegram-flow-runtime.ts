import type { BotFlow, BotFlowButton } from './ai';
import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramPreCheckoutQuery } from './types';

type UserFlowState = { nodeId: string; data: Record<string, string> };

type TelegramApi = <T = { ok: boolean; description?: string }>(token: string, method: string, payload: unknown) => Promise<T>;

type RuntimeDeps = {
  telegramApi: TelegramApi;
  sendText: (token: string, chatId: number, text: string) => Promise<void>;
  runtimeAiReply: (env: Env, systemPrompt: string, text: string) => Promise<string>;
  renderTemplate: (template: string, data: Record<string, string>) => string;
};

export async function handleExpandedPreCheckoutQuery(token: string, query: TelegramPreCheckoutQuery, deps: RuntimeDeps): Promise<void> {
  const ok = query.currency === 'XTR' && query.invoice_payload.startsWith('stars:');
  await deps.telegramApi(token, 'answerPreCheckoutQuery', {
    pre_checkout_query_id: query.id,
    ok,
    ...(ok ? {} : { error_message: 'Invalid Telegram Stars payment.' }),
  });
}

export async function handleExpandedFlowMessage(env: Env, token: string, bot: BotRecord, flow: BotFlow, message: TelegramMessage, deps: RuntimeDeps): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';

  if (message.successful_payment) {
    await handleSuccessfulStarsPayment(env, token, bot, flow, message, deps);
    return;
  }

  if (!text || text === '/start' || text === '/reset') {
    const state = { nodeId: flow.start, data: {} };
    await saveFlowState(env, bot.id, userId, state);
    await sendExpandedFlowNode(env, token, bot, flow, chatId, userId, state, deps);
    return;
  }

  const state = await getFlowState(env, bot.id, userId, flow);
  const node = flow.nodes[state.nodeId] ?? flow.nodes[flow.start];
  if (!node) {
    await deps.sendText(token, chatId, 'This bot flow is not configured correctly.');
    return;
  }

  if (message.contact) state.data.contact = JSON.stringify(message.contact);
  if (message.location) state.data.location = JSON.stringify(message.location);

  const buttonMatch = (node.buttons ?? []).find((button) => button.text === text && button.next && flow.nodes[button.next]);
  if (buttonMatch?.next) {
    state.nodeId = buttonMatch.next;
    await saveFlowState(env, bot.id, userId, state);
    await sendExpandedFlowNode(env, token, bot, flow, chatId, userId, state, deps);
    return;
  }

  if (node.ai?.enabled && !node.saveInputAs && !node.next) {
    await deps.sendText(token, chatId, await deps.runtimeAiReply(env, node.ai.systemPrompt, text));
    return;
  }

  if (node.saveInputAs) {
    if (message.contact) state.data[node.saveInputAs] = JSON.stringify(message.contact);
    else if (message.location) state.data[node.saveInputAs] = JSON.stringify(message.location);
    else if (text) state.data[node.saveInputAs] = text;
  }

  state.nodeId = resolveConditionalNext(flow, node, state.data) ?? node.next ?? (node.end ? flow.start : state.nodeId);
  await saveFlowState(env, bot.id, userId, state);
  await sendExpandedFlowNode(env, token, bot, flow, chatId, userId, state, deps);
}

export async function handleExpandedFlowCallback(env: Env, token: string, bot: BotRecord, flow: BotFlow, callback: TelegramCallbackQuery, deps: RuntimeDeps): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const data = callback.data ?? '';
  await deps.telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });

  if (data.startsWith('stars:')) {
    const button = findStarsButton(flow, data);
    if (!button?.starsPayment) {
      await deps.sendText(token, chatId, 'Payment is not configured correctly.');
      return;
    }
    await sendStarsInvoice(token, chatId, button, deps);
    return;
  }

  const nextId = data.startsWith('flow:') ? data.slice('flow:'.length) : flow.start;
  const state = await getFlowState(env, bot.id, userId, flow);
  state.nodeId = flow.nodes[nextId] ? nextId : flow.start;
  await saveFlowState(env, bot.id, userId, state);
  await sendExpandedFlowNode(env, token, bot, flow, chatId, userId, state, deps);
}

async function handleSuccessfulStarsPayment(env: Env, token: string, bot: BotRecord, flow: BotFlow, message: TelegramMessage, deps: RuntimeDeps): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const payment = message.successful_payment;
  if (!payment || payment.currency !== 'XTR' || !payment.invoice_payload.startsWith('stars:')) {
    await deps.sendText(token, chatId, 'Payment was received but could not be verified.');
    return;
  }

  const nextId = payment.invoice_payload.split(':')[1];
  const state = await getFlowState(env, bot.id, userId, flow);
  state.data.last_payment = JSON.stringify(payment);
  state.nodeId = nextId && flow.nodes[nextId] ? nextId : flow.start;
  await saveFlowState(env, bot.id, userId, state);
  await sendExpandedFlowNode(env, token, bot, flow, chatId, userId, state, deps);
}

async function sendStarsInvoice(token: string, chatId: number, button: BotFlowButton, deps: RuntimeDeps): Promise<void> {
  const payment = button.starsPayment;
  if (!payment) return;
  await deps.telegramApi(token, 'sendInvoice', {
    chat_id: chatId,
    title: payment.title,
    description: payment.description || payment.title,
    payload: payment.payload,
    currency: 'XTR',
    prices: [{ label: payment.title, amount: payment.amount }],
  });
}

async function sendExpandedFlowNode(env: Env, token: string, bot: BotRecord, flow: BotFlow, chatId: number, userId: string, state: UserFlowState, deps: RuntimeDeps): Promise<void> {
  const node = flow.nodes[state.nodeId] ?? flow.nodes[flow.start];
  if (!node) {
    await deps.sendText(token, chatId, 'This bot flow is empty.');
    return;
  }

  await sendNodeMedia(token, chatId, node, deps);
  const buttons = (node.buttons ?? []).filter((button) => isRenderableButton(flow, button));
  const replyMarkup = buildFlowReplyMarkup(node.keyboard, buttons);

  await deps.telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: deps.renderTemplate(node.message, state.data),
    reply_markup: replyMarkup,
  });

  if (node.notifyOwner && bot.owner_telegram_id) {
    const summary = Object.entries(state.data).map(([key, value]) => `${key}: ${value}`).join('\n') || 'No collected data.';
    await deps.sendText(token, Number(bot.owner_telegram_id), `New bot submission from ${userId}\n\n${summary}`);
  }

  const conditionalNext = resolveConditionalNext(flow, node, state.data);
  if (conditionalNext) await saveFlowState(env, bot.id, userId, { ...state, nodeId: conditionalNext });
  else if (node.end) await saveFlowState(env, bot.id, userId, { nodeId: flow.start, data: {} });
}

function isRenderableButton(flow: BotFlow, button: BotFlowButton): boolean {
  return Boolean(button.text && (button.starsPayment || button.url || button.webAppUrl || button.copyText || button.requestContact || button.requestLocation || (button.next && flow.nodes[button.next])));
}

function buildFlowReplyMarkup(keyboard: 'inline' | 'reply' | undefined, buttons: BotFlowButton[]): unknown {
  if (!buttons.length) return keyboard === 'reply' ? { remove_keyboard: true } : undefined;

  if (keyboard === 'reply' || buttons.some((button) => button.requestContact || button.requestLocation)) {
    return {
      keyboard: buttons.filter((button) => !button.starsPayment && !button.url && !button.webAppUrl && !button.copyText).map((button) => [{
        text: button.text,
        request_contact: button.requestContact || undefined,
        request_location: button.requestLocation || undefined,
      }]),
      resize_keyboard: true,
      one_time_keyboard: false,
    };
  }

  return {
    inline_keyboard: buttons.map((button) => [{
      text: button.text,
      ...(button.starsPayment ? { callback_data: `stars:${button.starsPayment.payload}` } : {}),
      ...(button.url ? { url: button.url } : {}),
      ...(button.webAppUrl ? { web_app: { url: button.webAppUrl } } : {}),
      ...(button.copyText ? { copy_text: { text: button.copyText } } : {}),
      ...(!button.starsPayment && button.next ? { callback_data: `flow:${button.next}` } : {}),
    }]),
  };
}

function findStarsButton(flow: BotFlow, callbackData: string): BotFlowButton | null {
  const payload = callbackData.slice('stars:'.length);
  for (const node of Object.values(flow.nodes)) {
    for (const button of node.buttons ?? []) {
      if (button.starsPayment?.payload === payload) return button;
    }
  }
  return null;
}

async function sendNodeMedia(token: string, chatId: number, node: BotFlow['nodes'][string], deps: RuntimeDeps): Promise<void> {
  if (!node.media?.url) return;
  const payload = { chat_id: chatId, caption: node.media.caption };
  if (node.media.type === 'photo') await deps.telegramApi(token, 'sendPhoto', { ...payload, photo: node.media.url });
  if (node.media.type === 'video') await deps.telegramApi(token, 'sendVideo', { ...payload, video: node.media.url });
  if (node.media.type === 'document') await deps.telegramApi(token, 'sendDocument', { ...payload, document: node.media.url });
}

function resolveConditionalNext(flow: BotFlow, node: BotFlow['nodes'][string], data: Record<string, string>): string | null {
  const condition = node.condition;
  if (!condition) return null;
  const value = data[condition.variable];
  const matched = condition.exists ? Boolean(value) : condition.equals !== undefined ? value === condition.equals : false;
  const next = matched ? condition.next : condition.elseNext;
  return next && flow.nodes[next] ? next : null;
}

async function getFlowState(env: Env, botId: string, userId: string, flow: BotFlow): Promise<UserFlowState> {
  const raw = await env.BOT_CACHE.get(`flow-state:${botId}:${userId}`).catch(() => null);
  const parsed = raw ? safeParse<UserFlowState>(raw, { nodeId: flow.start, data: {} }) : { nodeId: flow.start, data: {} };
  return flow.nodes[parsed.nodeId] ? { nodeId: parsed.nodeId, data: parsed.data ?? {} } : { nodeId: flow.start, data: parsed.data ?? {} };
}

async function saveFlowState(env: Env, botId: string, userId: string, state: UserFlowState): Promise<void> {
  await env.BOT_CACHE.put(`flow-state:${botId}:${userId}`, JSON.stringify(state), { expirationTtl: 86400 }).catch(() => undefined);
}

function safeParse<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

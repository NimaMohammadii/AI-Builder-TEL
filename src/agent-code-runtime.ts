import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage } from './types';

type AgentHandlers = {
  onStart?: (ctx: AgentCodeContext) => Promise<void>;
  onMessage?: (ctx: AgentCodeContext) => Promise<void>;
  onCallback?: (ctx: AgentCodeContext) => Promise<void>;
};

type ReplyOptions = { buttons?: Array<Array<AgentButton>>; parse_mode?: string };
type AgentButton = { text: string; callback_data?: string; url?: string; web_app?: { url: string } };

type AgentCodeContext = {
  text?: string;
  data?: string;
  userId: string;
  chatId: number;
  message?: TelegramMessage;
  callback?: TelegramCallbackQuery;
  reply: (text: string, options?: ReplyOptions) => Promise<void>;
  answer: (text?: string) => Promise<void>;
  telegram: (method: string, payload: Record<string, unknown>) => Promise<unknown>;
  getState: () => Promise<Record<string, unknown>>;
  setState: (next: object) => Promise<void>;
  patchState: (next: object) => Promise<void>;
  button: (text: string, data: string) => AgentButton;
  urlButton: (text: string, url: string) => AgentButton;
  webAppButton: (text: string, url: string) => AgentButton;
};

export async function handleAgentCodeMessage(env: Env, token: string, bot: BotRecord, codeSource: string, message: TelegramMessage): Promise<void> {
  const userId = String(message.from?.id ?? message.chat.id);
  const ctx = await buildContext(env, token, bot, userId, message.chat.id, { message });
  try {
    const handlers = await compileAgentCode(codeSource);
    if ((message.text ?? '').trim() === '/start' && handlers.onStart) return handlers.onStart(ctx);
    if (handlers.onMessage) return handlers.onMessage(ctx);
  } catch (error) {
    await ctx.reply(`Agent code error: ${(error instanceof Error ? error.message : String(error)).slice(0, 120)}`);
  }
}

export async function handleAgentCodeCallback(env: Env, token: string, bot: BotRecord, codeSource: string, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const ctx = await buildContext(env, token, bot, userId, chatId, { callback });
  try {
    const handlers = await compileAgentCode(codeSource);
    if (handlers.onCallback) return handlers.onCallback(ctx);
    await ctx.answer();
  } catch (error) {
    await ctx.answer('Error').catch(() => undefined);
    await ctx.reply(`Agent code error: ${(error instanceof Error ? error.message : String(error)).slice(0, 120)}`);
  }
}

async function compileAgentCode(source: string): Promise<AgentHandlers> {
  const AsyncFunction = Object.getPrototypeOf(async function () { return undefined; }).constructor as new (...args: string[]) => () => Promise<AgentHandlers>;
  const fn = new AsyncFunction(source);
  return (await fn()) ?? {};
}

async function buildContext(
  env: Env,
  token: string,
  bot: BotRecord,
  userId: string,
  chatId: number,
  input: { message?: TelegramMessage; callback?: TelegramCallbackQuery },
): Promise<AgentCodeContext> {
  const stateKey = `agent-code-state:${bot.id}:${userId}`;
  const getState = async (): Promise<Record<string, unknown>> => {
    const raw = await env.BOT_CACHE.get(stateKey).catch(() => null);
    if (!raw) return {};
    try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
  };
  const setState = async (next: object): Promise<void> => { await env.BOT_CACHE.put(stateKey, JSON.stringify(next), { expirationTtl: 60 * 60 * 24 * 14 }).catch(() => undefined); };
  const patchState = async (next: object): Promise<void> => { const prev = await getState(); await setState({ ...prev, ...(next as Record<string, unknown>) }); };

  return {
    text: input.message?.text,
    data: input.callback?.data,
    userId,
    chatId,
    message: input.message,
    callback: input.callback,
    reply: async (text: string, options?: ReplyOptions) => {
      const payload: Record<string, unknown> = { chat_id: chatId, text };
      if (options?.parse_mode) payload.parse_mode = options.parse_mode;
      if (options?.buttons?.length) payload.reply_markup = { inline_keyboard: options.buttons };
      await tg(token, 'sendMessage', payload);
    },
    answer: async (text?: string) => {
      if (!input.callback?.id) return;
      await tg(token, 'answerCallbackQuery', { callback_query_id: input.callback.id, text });
    },
    telegram: async (method: string, payload: Record<string, unknown>) => tg(token, method, payload),
    getState,
    setState,
    patchState,
    button: (text: string, data: string) => ({ text, callback_data: data }),
    urlButton: (text: string, url: string) => ({ text, url }),
    webAppButton: (text: string, url: string) => ({ text, web_app: { url } }),
  };
}

async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}

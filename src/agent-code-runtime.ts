import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage } from './types';

type RunnerAction = {
  method: string;
  payload?: Record<string, unknown>;
};

type RunnerResponse = {
  ok?: boolean;
  state?: Record<string, unknown>;
  actions?: RunnerAction[];
  error?: string;
};

export async function handleAgentCodeMessage(env: Env, token: string, bot: BotRecord, codeSource: string, message: TelegramMessage): Promise<void> {
  const userId = String(message.from?.id ?? message.chat.id);
  const chatId = message.chat.id;
  const type = (message.text ?? '').trim() === '/start' ? 'start' : 'message';

  try {
    const result = await runAgentCode(env, bot, codeSource, {
      type,
      userId,
      chatId,
      text: message.text,
      message,
    });
    await applyRunnerResult(env, token, bot, userId, chatId, result);
  } catch (error) {
    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: `Agent runner error: ${(error instanceof Error ? error.message : String(error)).slice(0, 120)}`,
    });
  }
}

export async function handleAgentCodeCallback(env: Env, token: string, bot: BotRecord, codeSource: string, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);

  await tg(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);

  try {
    const result = await runAgentCode(env, bot, codeSource, {
      type: 'callback',
      userId,
      chatId,
      data: callback.data,
      callback,
    });
    await applyRunnerResult(env, token, bot, userId, chatId, result);
  } catch (error) {
    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: `Agent runner error: ${(error instanceof Error ? error.message : String(error)).slice(0, 120)}`,
    });
  }
}

async function runAgentCode(
  env: Env,
  bot: BotRecord,
  codeSource: string,
  input: {
    type: 'start' | 'message' | 'callback';
    userId: string;
    chatId: number;
    text?: string;
    data?: string;
    message?: TelegramMessage;
    callback?: TelegramCallbackQuery;
  },
): Promise<RunnerResponse> {
  const runnerUrl = (env as Env & { AGENT_RUNNER_URL?: string }).AGENT_RUNNER_URL;
  if (!runnerUrl) throw new Error('AGENT_RUNNER_URL is missing');

  const stateKey = `agent-code-state:${bot.id}:${input.userId}`;
  const raw = await env.BOT_CACHE.get(stateKey).catch(() => null);
  let state: Record<string, unknown> = {};
  if (raw) {
    try { state = JSON.parse(raw) as Record<string, unknown>; } catch { state = {}; }
  }

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const runnerSecret = (env as Env & { AGENT_RUNNER_SECRET?: string }).AGENT_RUNNER_SECRET;
  if (runnerSecret) headers.Authorization = `Bearer ${runnerSecret}`;

  const response = await fetch(runnerUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      bot: { id: bot.id, title: bot.title, username: bot.username },
      type: input.type,
      code: codeSource,
      state,
      ctx: {
        text: input.text,
        data: input.data,
        userId: input.userId,
        chatId: input.chatId,
        message: input.message,
        callback: input.callback,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`${response.status}${body ? ` ${body.slice(0, 120)}` : ''}`);
  }

  const result = (await response.json()) as RunnerResponse;
  if (!result?.ok) {
    throw new Error((result?.error ?? 'unknown error').slice(0, 120));
  }
  return result;
}

async function applyRunnerResult(
  env: Env,
  token: string,
  bot: BotRecord,
  userId: string,
  chatId: number,
  result: RunnerResponse,
): Promise<void> {
  const stateKey = `agent-code-state:${bot.id}:${userId}`;
  const nextState = result.state ?? {};
  await env.BOT_CACHE.put(stateKey, JSON.stringify(nextState), { expirationTtl: 60 * 60 * 24 * 14 }).catch(() => undefined);

  for (const action of result.actions ?? []) {
    const payload: Record<string, unknown> = { ...(action.payload ?? {}) };
    if (payload.chat_id == null) payload.chat_id = chatId;
    await tg(token, action.method, payload);
  }
}

async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}

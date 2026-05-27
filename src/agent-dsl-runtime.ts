import type { BotRecord, Env, TelegramCallbackQuery, TelegramMessage } from './types';
import type { AgentDsl, AgentDslButton, AgentDslStep } from './agent-dsl-builder';

type DslState = Record<string, unknown>;

export async function handleAgentDslMessage(env: Env, token: string, bot: BotRecord, dsl: AgentDsl, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';
  const stateKey = key(bot.id, userId);
  const state = text === '/start' ? {} : await readState(env, stateKey);
  const steps = text === '/start' || !text ? dsl.start : findMessageSteps(dsl, text, state);
  const nextState = await runSteps(env, token, chatId, stateKey, state, steps.length ? steps : dsl.fallback);
  await writeState(env, stateKey, nextState);
}

export async function handleAgentDslCallback(env: Env, token: string, bot: BotRecord, dsl: AgentDsl, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const stateKey = key(bot.id, userId);
  const state = await readState(env, stateKey);
  await tg(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
  const data = callback.data ?? '';
  const steps = findCallbackSteps(dsl, data, state);
  const nextState = await runSteps(env, token, chatId, stateKey, state, steps.length ? steps : dsl.fallback);
  await writeState(env, stateKey, nextState);
}

function findMessageSteps(dsl: AgentDsl, text: string, state: DslState): AgentDslStep[] {
  const stateName = String(state.__next ?? '');
  const byState = stateName ? dsl.messages.find((rule) => rule.match === `state:${stateName}`) : null;
  if (byState) return byState.steps;
  const exact = dsl.messages.find((rule) => rule.match === text);
  if (exact) return exact.steps;
  const lower = text.toLowerCase();
  const contains = dsl.messages.find((rule) => rule.match.startsWith('contains:') && lower.includes(rule.match.slice(9).toLowerCase()));
  if (contains) return contains.steps;
  return dsl.messages.find((rule) => rule.match === '*')?.steps ?? [];
}

function findCallbackSteps(dsl: AgentDsl, data: string, state: DslState): AgentDslStep[] {
  const stateName = String(state.__next ?? '');
  const byState = stateName ? dsl.callbacks.find((rule) => rule.match === `state:${stateName}`) : null;
  if (byState) return byState.steps;
  const exact = dsl.callbacks.find((rule) => rule.match === data);
  if (exact) return exact.steps;
  return dsl.callbacks.find((rule) => rule.match === '*')?.steps ?? [];
}

async function runSteps(env: Env, token: string, chatId: number, stateKey: string, current: DslState, steps: AgentDslStep[]): Promise<DslState> {
  let state: DslState = { ...current };
  for (const step of steps.slice(0, 40)) {
    if (step.clearState) state = {};
    if (step.set && typeof step.set === 'object') state = { ...step.set };
    if (step.patch && typeof step.patch === 'object') state = { ...state, ...step.patch };
    if (step.next) state.__next = step.next;
    else if (step.next === '') delete state.__next;
    if (step.reply) await tg(token, 'sendMessage', { chat_id: chatId, text: render(step.reply, state), reply_markup: markup(step.buttons) });
  }
  await writeState(env, stateKey, state);
  return state;
}

function markup(buttons?: AgentDslButton[][]): unknown {
  if (!buttons?.length) return undefined;
  return { inline_keyboard: buttons.map((row) => row.map((b) => ({ text: b.text, ...(b.url ? { url: b.url } : {}), ...(b.webAppUrl ? { web_app: { url: b.webAppUrl } } : {}), ...(!b.url && !b.webAppUrl ? { callback_data: b.action || b.text } : {}) }))) };
}

function render(text: string, state: DslState): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name: string) => String(state[name] ?? ''));
}

async function readState(env: Env, stateKey: string): Promise<DslState> {
  const raw = await env.BOT_CACHE.get(stateKey).catch(() => null);
  if (!raw) return {};
  try { return JSON.parse(raw) as DslState; } catch { return {}; }
}

async function writeState(env: Env, stateKey: string, state: DslState): Promise<void> {
  await env.BOT_CACHE.put(stateKey, JSON.stringify(state), { expirationTtl: 60 * 60 * 24 * 14 }).catch(() => undefined);
}

function key(botId: string, userId: string): string { return `agent-dsl-state:${botId}:${userId}`; }

async function tg<T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}

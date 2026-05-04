import type { BotBlueprint, Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL } from './utils';
import { applySafeFlowActions, applySmartFlowFallback, type SafeFlowAction } from './flow-fallback';

export type BotFlowButton = {
  text: string;
  next?: string;
  url?: string;
  webAppUrl?: string;
  copyText?: string;
  requestContact?: boolean;
  requestLocation?: boolean;
};

export type BotFlowMedia = {
  type: 'photo' | 'video' | 'document';
  url: string;
  caption?: string;
};

export type BotFlowCondition = {
  variable: string;
  equals?: string;
  exists?: boolean;
  next: string;
  elseNext?: string;
};

export type BotFlowNode = {
  id: string;
  message: string;
  saveInputAs?: string;
  next?: string;
  buttons?: BotFlowButton[];
  keyboard?: 'inline' | 'reply';
  ai?: { enabled: boolean; systemPrompt: string };
  notifyOwner?: boolean;
  end?: boolean;
  media?: BotFlowMedia;
  condition?: BotFlowCondition;
};

export type BotFlow = {
  version: 1;
  name: string;
  description: string;
  start: string;
  nodes: Record<string, BotFlowNode>;
  variables: string[];
};

export type ChatHistoryMessage = { role: 'user' | 'assistant'; content: string };

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  error?: { message?: string };
};

const CONCISE = 'Reply in the user language. Be concise and direct. No filler.';
const TEXT_TIMEOUT = 10_000;
const JSON_TIMEOUT = 8_000;

export function defaultBlueprint(prompt: string): BotBlueprint {
  return {
    version: 1,
    botType: 'custom',
    language: 'en',
    tone: 'premium',
    startScreen: 'home',
    screens: [
      { id: 'home', title: 'Home', message: `Welcome.\n\nPurpose: ${prompt.slice(0, 600)}`, buttons: [{ text: 'Start', action: { type: 'menu', target: 'about' } }, { text: 'About', action: { type: 'menu', target: 'about' } }] },
      { id: 'about', title: 'About', message: 'This bot is connected and ready. Use AI Builder TEL to edit its menus and flow.', buttons: [{ text: 'Back', action: { type: 'menu', target: 'home' } }] },
    ],
    aiSupport: { enabled: false, systemPrompt: '', handoffMessage: 'Message saved.' },
    safety: { blockedTopics: ['unsafe requests'], requireHumanFor: ['legal', 'medical', 'finance'] },
  };
}

export function defaultFlow(prompt: string): BotFlow {
  return {
    version: 1,
    name: 'Custom Bot',
    description: prompt.slice(0, 500),
    start: 'start',
    variables: [],
    nodes: {
      start: { id: 'start', message: `Welcome.\n\n${prompt.slice(0, 500)}`, buttons: [{ text: 'Start', next: 'finish' }] },
      finish: { id: 'finish', message: 'Done.', end: true },
    },
  };
}

export async function buildBlueprint(env: Env, userPrompt: string): Promise<BotBlueprint> {
  const json = await jsonReply(env, blueprintInstructions('Design a Telegram bot blueprint.'), userPrompt, 1600);
  if (!json) return defaultBlueprint(userPrompt);
  try { return normalizeBlueprint(JSON.parse(json) as Partial<BotBlueprint>, userPrompt); } catch { return defaultBlueprint(userPrompt); }
}

export async function buildFlow(env: Env, userPrompt: string): Promise<BotFlow> {
  const json = await jsonReply(env, flowInstructions('Create a Telegram bot flow.'), userPrompt, 1800);
  if (!json) return defaultFlow(userPrompt);
  try { return normalizeFlow(JSON.parse(json) as Partial<BotFlow>, userPrompt); } catch { return defaultFlow(userPrompt); }
}

export async function improveBlueprint(env: Env, currentBlueprint: BotBlueprint, instruction: string): Promise<{ blueprint: BotBlueprint; summary: string }> {
  const json = await jsonReply(env, blueprintInstructions('Apply the requested edit to the existing blueprint. Return JSON with summary and blueprint.'), JSON.stringify({ currentBlueprint, instruction }), 1800);
  if (!json) return { blueprint: currentBlueprint, summary: 'Blueprint unchanged.' };
  try {
    const parsed = JSON.parse(json) as { blueprint?: Partial<BotBlueprint>; summary?: string };
    return { blueprint: normalizeBlueprint(parsed.blueprint ?? currentBlueprint, instruction), summary: short(parsed.summary ?? 'Blueprint updated.', 180) };
  } catch {
    return { blueprint: currentBlueprint, summary: 'Blueprint unchanged.' };
  }
}

export async function improveFlow(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string }> {
  const actionResult = await generateActions(env, currentFlow, instruction);
  if (actionResult && changed(currentFlow, actionResult.flow)) return actionResult;

  const generated = await generateFlow(env, currentFlow, instruction);
  if (generated && changed(currentFlow, generated.flow)) return generated;

  return applySmartFlowFallback(currentFlow, instruction);
}

async function generateActions(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string } | null> {
  const json = await jsonReply(env, actionInstructions(), JSON.stringify({ currentFlow, instruction }), 1600);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as { actions?: SafeFlowAction[]; summary?: string };
    if (!Array.isArray(parsed.actions) || !parsed.actions.length) return null;
    const result = applySafeFlowActions(currentFlow, parsed.actions);
    return { flow: result.flow, summary: short(parsed.summary || result.summary, 180) };
  } catch {
    return null;
  }
}

async function generateFlow(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string } | null> {
  const json = await jsonReply(env, flowInstructions('Apply the requested edit to the existing flow. Return JSON with summary and flow.'), JSON.stringify({ currentFlow, instruction }), 1600);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as { flow?: Partial<BotFlow>; summary?: string };
    const flow = normalizeFlow(parsed.flow ?? currentFlow, instruction);
    return { flow, summary: short(parsed.summary ?? 'Flow updated.', 180) };
  } catch {
    return null;
  }
}

export async function plainAiReply(env: Env, message: string, history: ChatHistoryMessage[] = []): Promise<string> {
  return textReply(env, CONCISE, message, history);
}

export async function aiReply(env: Env, systemPrompt: string, message: string, history: ChatHistoryMessage[] = []): Promise<string> {
  return textReply(env, `${systemPrompt}\n\n${CONCISE}`, message, history);
}

async function textReply(env: Env, instructions: string, message: string, history: ChatHistoryMessage[]): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'AI is not configured yet.';
  const input = [...history.slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 900) })), { role: 'user' as const, content: message.slice(0, 3000) }];
  try {
    const res = await openaiFetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, input, instructions, max_output_tokens: 500, reasoning: { effort: 'low' } }),
    }, TEXT_TIMEOUT);
    const raw = await res.text();
    const data = safeJson<ResponsesApiResult>(raw);
    return short(extractText(data) || data?.error?.message || 'I could not generate a response right now.', 900);
  } catch {
    return 'I could not generate a response right now.';
  }
}

async function jsonReply(env: Env, instructions: string, input: string, maxTokens: number): Promise<string | null> {
  if (!env.OPENAI_API_KEY) return null;
  try {
    const res = await openaiFetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, instructions: `${instructions}\nReturn strict JSON only. No markdown.`, input, max_output_tokens: maxTokens, reasoning: { effort: 'low' } }),
    }, JSON_TIMEOUT);
    const raw = await res.text();
    const data = safeJson<ResponsesApiResult>(raw);
    return extractJson(extractText(data) || '');
  } catch {
    return null;
  }
}

function actionInstructions(): string {
  return 'Convert the user request into safe Telegram bot-flow actions. Do not write code. Allowed action types: add_button, upsert_node, ask_input, update_message, rename_button, remove_button, connect_node, set_keyboard, end_node, request_contact, request_location, open_url, open_web_app, copy_text, send_photo, send_video, send_document, notify_owner, set_condition, deep_link, payment_placeholder, inline_mode_note. Return JSON shape: {"summary":"short","actions":[...]}. Use add_button for normal buttons with target, buttonText, message, keyboard. Use ask_input with target, variable, prompt, nextMessage. Use request_contact/location for Telegram reply keyboard buttons. Use open_url/open_web_app/copy_text for inline buttons. Use send_photo/video/document with target, url, caption. Use notify_owner to notify owner after collecting data. Use set_condition with target, variable, equals/exists, next, elseNext. payment_placeholder and inline_mode_note only create safe placeholder nodes/messages, no real payment/provider setup. Keep actions minimal and executable.';
}

function blueprintInstructions(prefix: string): string {
  return `${prefix}\nShape: {"version":1,"botType":"custom","language":"fa|en|multi","tone":"friendly|formal|premium|bold","startScreen":"home","screens":[{"id":"home","title":"...","message":"...","buttons":[{"text":"...","action":{"type":"menu","target":"..."}}]}],"aiSupport":{"enabled":false,"systemPrompt":"","handoffMessage":""},"safety":{"blockedTopics":[],"requireHumanFor":[]}}`;
}

function flowInstructions(prefix: string): string {
  return `${prefix}\nShape: {"version":1,"name":"...","description":"...","start":"start","variables":[],"nodes":{"start":{"id":"start","message":"...","keyboard":"inline","buttons":[{"text":"...","next":"node_id","url":"https://...","webAppUrl":"https://...","copyText":"...","requestContact":true,"requestLocation":true}],"media":{"type":"photo|video|document","url":"https://...","caption":"..."},"condition":{"variable":"name","equals":"x","next":"node","elseNext":"other"}}}}. The live bot executes this flow. Use nodes, buttons, next, saveInputAs, notifyOwner, end, media, condition. Use keyboard reply for requestContact/requestLocation.`;
}

async function openaiFetch(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<Response>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`openai_timeout_${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([fetch(url, { ...init, signal: controller.signal }), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function extractText(data: ResponsesApiResult | null): string | null {
  if (!data) return null;
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue;
    for (const part of item.content ?? []) if (part.type === 'output_text' && part.text) return part.text;
  }
  return null;
}

function extractJson(value: string): string | null {
  const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : null;
}

function normalizeBlueprint(input: Partial<BotBlueprint>, prompt: string): BotBlueprint {
  const fallback = defaultBlueprint(prompt);
  const screens = Array.isArray(input.screens) && input.screens.length ? input.screens : fallback.screens;
  const startScreen = input.startScreen && screens.some((s) => s.id === input.startScreen) ? input.startScreen : screens[0]?.id ?? 'home';
  return { version: 1, botType: input.botType ?? fallback.botType, language: input.language ?? fallback.language, tone: input.tone ?? fallback.tone, startScreen, screens, aiSupport: input.aiSupport ?? fallback.aiSupport, safety: input.safety ?? fallback.safety };
}

function normalizeFlow(input: Partial<BotFlow>, prompt: string): BotFlow {
  const fallback = defaultFlow(prompt);
  const nodes = input.nodes && typeof input.nodes === 'object' ? input.nodes : fallback.nodes;
  const start = input.start && nodes[input.start] ? input.start : Object.keys(nodes)[0] ?? fallback.start;
  return { version: 1, name: input.name || fallback.name, description: input.description || fallback.description, start, nodes, variables: Array.isArray(input.variables) ? input.variables : [] };
}

function changed(before: BotFlow, after: BotFlow): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

function short(text: string, max: number): string {
  const clean = text.trim().replace(/\n{3,}/g, '\n\n');
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + '…';
}

function safeJson<T>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch { return null; }
}

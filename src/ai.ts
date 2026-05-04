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
  starsPayment?: BotFlowStarsPayment;
};

export type BotFlowStarsPayment = {
  title: string;
  description: string;
  amount: number;
  payload: string;
  successNext?: string;
};

export type BotFlowMedia = { type: 'photo' | 'video' | 'document'; url: string; caption?: string };
export type BotFlowCondition = { variable: string; equals?: string; exists?: boolean; next: string; elseNext?: string };

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
type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };

const CONCISE = 'Reply in the user language. Be concise and direct. No filler.';
const TEXT_TIMEOUT = 10_000;
const JSON_TIMEOUT = 10_000;

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
      start: { id: 'start', message: `Welcome.\n\n${prompt.slice(0, 500)}`, keyboard: 'inline', buttons: [{ text: 'Start', next: 'finish' }] },
      finish: { id: 'finish', message: 'Done.', keyboard: 'inline', end: true },
    },
  };
}

export async function buildBlueprint(env: Env, userPrompt: string): Promise<BotBlueprint> {
  const json = await jsonReply(env, blueprintInstructions('Design a Telegram bot blueprint.'), userPrompt, 1600);
  if (!json) return defaultBlueprint(userPrompt);
  try { return normalizeBlueprint(JSON.parse(json) as Partial<BotBlueprint>, userPrompt); } catch { return defaultBlueprint(userPrompt); }
}

export async function buildFlow(env: Env, userPrompt: string): Promise<BotFlow> {
  const json = await jsonReply(env, flowInstructions('Create a complete Telegram bot flow from the request.'), userPrompt, 2600);
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
  const complex = isComplexFlowInstruction(instruction);

  if (complex) {
    const generated = await generateFlow(env, currentFlow, instruction);
    if (generated && changed(currentFlow, generated.flow) && satisfiesRequestedShape(generated.flow, instruction)) return generated;

    const actionResult = await generateActions(env, currentFlow, instruction);
    if (actionResult && changed(currentFlow, actionResult.flow) && satisfiesRequestedShape(actionResult.flow, instruction)) return actionResult;

    return { flow: currentFlow, summary: 'Could not build the full requested multi-step flow safely. No change was saved.' };
  }

  const actionResult = await generateActions(env, currentFlow, instruction);
  if (actionResult && changed(currentFlow, actionResult.flow)) return actionResult;

  const generated = await generateFlow(env, currentFlow, instruction);
  if (generated && changed(currentFlow, generated.flow)) return generated;

  return applySmartFlowFallback(currentFlow, instruction);
}

async function generateActions(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string } | null> {
  const json = await jsonReply(env, actionInstructions(), JSON.stringify({ currentFlow, instruction }), 2200);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as { actions?: SafeFlowAction[]; summary?: string };
    if (!Array.isArray(parsed.actions) || !parsed.actions.length) return null;
    const result = applySafeFlowActions(currentFlow, parsed.actions);
    return { flow: result.flow, summary: short(parsed.summary || result.summary, 180) };
  } catch { return null; }
}

async function generateFlow(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string } | null> {
  const json = await jsonReply(env, flowInstructions('Apply the requested edit to the existing flow. Return JSON with summary and flow.'), JSON.stringify({ currentFlow, instruction }), 3000);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as { flow?: Partial<BotFlow>; summary?: string };
    const flow = normalizeFlow(parsed.flow ?? currentFlow, instruction);
    repairGeneratedFlow(flow);
    return { flow, summary: short(parsed.summary ?? 'Flow updated.', 180) };
  } catch { return null; }
}

export async function plainAiReply(env: Env, message: string, history: ChatHistoryMessage[] = []): Promise<string> { return textReply(env, CONCISE, message, history); }
export async function aiReply(env: Env, systemPrompt: string, message: string, history: ChatHistoryMessage[] = []): Promise<string> { return textReply(env, `${systemPrompt}\n\n${CONCISE}`, message, history); }

async function textReply(env: Env, instructions: string, message: string, history: ChatHistoryMessage[]): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'AI is not configured yet.';
  const input = [...history.slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 900) })), { role: 'user' as const, content: message.slice(0, 3000) }];
  try {
    const res = await openaiFetch(`${OPENAI_BASE_URL}/responses`, { method: 'POST', headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: OPENAI_MODEL, input, instructions, max_output_tokens: 500, reasoning: { effort: 'low' } }) }, TEXT_TIMEOUT);
    const data = safeJson<ResponsesApiResult>(await res.text());
    return short(extractText(data) || data?.error?.message || 'I could not generate a response right now.', 900);
  } catch { return 'I could not generate a response right now.'; }
}

async function jsonReply(env: Env, instructions: string, input: string, maxTokens: number): Promise<string | null> {
  if (!env.OPENAI_API_KEY) return null;
  try {
    const res = await openaiFetch(`${OPENAI_BASE_URL}/responses`, { method: 'POST', headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: OPENAI_MODEL, instructions: `${instructions}\nReturn strict JSON only. No markdown.`, input, max_output_tokens: maxTokens, reasoning: { effort: 'low' } }) }, JSON_TIMEOUT);
    const data = safeJson<ResponsesApiResult>(await res.text());
    return extractJson(extractText(data) || '');
  } catch { return null; }
}

function actionInstructions(): string {
  return [
    'Convert the user request into safe Telegram bot-flow actions. Do not write code.',
    'Allowed action types: add_button, upsert_node, ask_input, update_message, rename_button, remove_button, connect_node, set_keyboard, end_node, request_contact, request_location, open_url, open_web_app, copy_text, send_photo, send_video, send_document, notify_owner, set_condition, deep_link, telegram_stars_payment, inline_mode_note.',
    'Return JSON shape: {"summary":"short","actions":[...]}.',
    'Important: include ALL requested steps, nodes, messages, and buttons. For multi-step requests, create/upsert every node and every requested button. Do not return only one add_button unless the request really asks for one simple button.',
    'Use telegram_stars_payment for Telegram Stars/XTR payments with fields target, buttonText, title, description, amount, successMessage.',
  ].join('\n');
}

function blueprintInstructions(prefix: string): string {
  return `${prefix}\nShape: {"version":1,"botType":"custom","language":"fa|en|multi","tone":"friendly|formal|premium|bold","startScreen":"home","screens":[{"id":"home","title":"...","message":"...","buttons":[{"text":"...","action":{"type":"menu","target":"..."}}]}],"aiSupport":{"enabled":false,"systemPrompt":"","handoffMessage":""},"safety":{"blockedTopics":[],"requireHumanFor":[]}}`;
}

function flowInstructions(prefix: string): string {
  return [
    prefix,
    'The output must be a COMPLETE executable flow, not a partial patch.',
    'Preserve existing useful nodes unless the user asks to replace/reset them.',
    'For multi-step requests, create every required node, message, button, and next target.',
    'If the user says: start shows a menu, then pressing that menu shows text with three buttons, you must create: start -> menu_node, and menu_node must contain the requested message plus exactly/at least those three buttons with valid next targets.',
    'Never omit requested button counts. Never leave buttons without valid next/url/webAppUrl/copyText/starsPayment/requestContact/requestLocation.',
    'Shape: {"summary":"short","flow":{"version":1,"name":"...","description":"...","start":"start","variables":[],"nodes":{"start":{"id":"start","message":"...","keyboard":"inline","buttons":[{"text":"...","next":"node_id"}]}}}}.',
    'Each normal button must point to an existing node. Nodes with buttons must have end:false or omit end.',
  ].join('\n');
}

async function openaiFetch(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<Response>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error(`openai_timeout_${timeoutMs}ms`)); }, timeoutMs); });
  try { return await Promise.race([fetch(url, { ...init, signal: controller.signal }), timeout]); } finally { if (timer) clearTimeout(timer); }
}

function extractText(data: ResponsesApiResult | null): string | null {
  if (!data) return null;
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) for (const part of item.content ?? []) if (part.type === 'output_text' && part.text) return part.text;
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
  const flow = { version: 1 as const, name: input.name || fallback.name, description: input.description || fallback.description, start, nodes, variables: Array.isArray(input.variables) ? input.variables : [] };
  repairGeneratedFlow(flow);
  return flow;
}

function repairGeneratedFlow(flow: BotFlow): void {
  if (!flow.start || !flow.nodes[flow.start]) flow.start = Object.keys(flow.nodes)[0] ?? 'start';
  if (!flow.nodes[flow.start]) flow.nodes[flow.start] = { id: flow.start, message: 'Start', keyboard: 'inline', end: true };
  for (const [id, node] of Object.entries(flow.nodes)) {
    node.id = node.id || id;
    node.message = node.message || 'Done.';
    if (node.buttons?.length) {
      node.buttons = node.buttons.filter((button) => button.text && (button.next ? Boolean(flow.nodes[button.next]) : true));
      node.keyboard = node.buttons.some((button) => button.requestContact || button.requestLocation) ? 'reply' : 'inline';
      node.end = false;
    }
    if (node.next && !flow.nodes[node.next]) delete node.next;
  }
}

function isComplexFlowInstruction(text: string): boolean {
  const t = text.toLowerCase();
  const multiStepWords = ['وقتی', 'بعد', 'سپس', 'زیر', 'منو', 'سه', 'چند', 'دکمه‌ها', 'دکمه ها', 'زیر اون متن', 'when', 'then', 'after', 'under', 'menu', 'buttons'];
  const hasMultipleButtons = requestedButtonCount(t) >= 2;
  const hasFlowWords = multiStepWords.filter((word) => t.includes(word)).length >= 2;
  return hasMultipleButtons || hasFlowWords;
}

function satisfiesRequestedShape(flow: BotFlow, instruction: string): boolean {
  const expectedButtons = requestedButtonCount(instruction.toLowerCase());
  const nodes = Object.values(flow.nodes ?? {});
  if (!nodes.length || !flow.nodes[flow.start]) return false;
  if (expectedButtons > 0 && !nodes.some((node) => (node.buttons?.length ?? 0) >= expectedButtons)) return false;
  if (/(منو|menu)/i.test(instruction) && !nodes.some((node) => (node.buttons?.length ?? 0) > 0)) return false;
  if (/(متن|پیام|بگه|بنویسه|text|message|say)/i.test(instruction) && !nodes.some((node) => node.message && node.message !== 'Done.' && node.message.length > 2)) return false;
  return true;
}

function requestedButtonCount(text: string): number {
  if (/(سه\s*تا\s*دکمه|سه\s*دکمه|3\s*button|three\s*button)/i.test(text)) return 3;
  if (/(دو\s*تا\s*دکمه|دو\s*دکمه|2\s*button|two\s*button)/i.test(text)) return 2;
  const fa = text.match(/(\d+)\s*(?:تا\s*)?دکمه/);
  if (fa?.[1]) return Number(fa[1]) || 0;
  const en = text.match(/(\d+)\s*buttons?/i);
  if (en?.[1]) return Number(en[1]) || 0;
  return 0;
}

function changed(before: BotFlow, after: BotFlow): boolean { return JSON.stringify(before) !== JSON.stringify(after); }
function short(text: string, max: number): string { const clean = text.trim().replace(/\n{3,}/g, '\n\n'); return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + '…'; }
function safeJson<T>(text: string): T | null { try { return JSON.parse(text) as T; } catch { return null; } }

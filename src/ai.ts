import type { BotBlueprint, Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL } from './utils';

type FlowNode = {
  id: string;
  message: string;
  saveInputAs?: string;
  next?: string;
  buttons?: Array<{ text: string; next: string }>;
  keyboard?: 'inline' | 'reply';
  ai?: { enabled: boolean; systemPrompt: string };
  notifyOwner?: boolean;
  end?: boolean;
};

export type BotFlow = {
  version: 1;
  name: string;
  description: string;
  start: string;
  nodes: Record<string, FlowNode>;
  variables: string[];
};

export type ChatHistoryMessage = { role: 'user' | 'assistant'; content: string };

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  error?: { message?: string };
};

const CONCISE_CHAT_INSTRUCTIONS = 'Reply in the user language. Be very concise and direct. No extra intro, no filler, no long explanations. Use at most 3 short sentences unless the user explicitly asks for details.';

const blueprintSchemaHint = `Return only valid JSON matching this shape:
{
  "version": 1,
  "botType": "sales" | "support" | "vip" | "custom",
  "language": "fa" | "en" | "multi",
  "tone": "friendly" | "formal" | "premium" | "bold",
  "startScreen": "home",
  "screens": [{ "id": "home", "title": "...", "message": "...", "buttons": [{ "text": "...", "action": { "type": "support" } }] }],
  "aiSupport": { "enabled": true, "systemPrompt": "...", "handoffMessage": "..." },
  "safety": { "blockedTopics": ["unsafe requests"], "requireHumanFor": ["legal", "medical", "finance"] }
}`;

const flowSchemaHint = `Return only valid JSON matching this shape:
{
  "version": 1,
  "name": "Bot name",
  "description": "What this bot does",
  "start": "start",
  "variables": ["name", "phone"],
  "nodes": {
    "start": { "id": "start", "message": "Welcome message", "keyboard": "inline", "buttons": [{ "text": "Begin", "next": "ask_name" }] },
    "ask_name": { "id": "ask_name", "message": "What is your name?", "saveInputAs": "name", "next": "finish" },
    "finish": { "id": "finish", "message": "Thanks. We received your request.", "notifyOwner": true, "end": true }
  }
}
Use "keyboard": "reply" only when the user asks for Telegram reply keyboard / keyboard buttons. Reply keyboard button text is handled as user input and must match a button.text.`;

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
      start: {
        id: 'start',
        message: `Welcome.\n\n${prompt.slice(0, 500)}`,
        buttons: [{ text: 'Start', next: 'finish' }],
      },
      finish: {
        id: 'finish',
        message: 'Done.',
        end: true,
      },
    },
  };
}

export async function buildBlueprint(env: Env, userPrompt: string): Promise<BotBlueprint> {
  if (!env.OPENAI_API_KEY) return defaultBlueprint(userPrompt);
  const response = await chatJson(env, 0.35, [
    { role: 'system', content: 'Design a production-grade Telegram bot blueprint for a no-code builder. The AI capability is available; decide from the user request whether this specific user bot should include AI support or only normal menus/flows. Do not use fixed keyword rules. Keep it concise and safe. Use English unless the user asks for another language. ' + blueprintSchemaHint },
    { role: 'user', content: userPrompt },
  ]);
  if (!response) return defaultBlueprint(userPrompt);
  try { return normalizeBlueprint(JSON.parse(response) as BotBlueprint, userPrompt); } catch { return defaultBlueprint(userPrompt); }
}

export async function buildFlow(env: Env, userPrompt: string): Promise<BotFlow> {
  if (!env.OPENAI_API_KEY) return defaultFlow(userPrompt);
  const response = await chatJson(env, 0.25, [
    { role: 'system', content: 'Create a dynamic Telegram bot flow using only the controlled JSON flow format. The AI capability is available; decide from the user request whether this bot should use ai.enabled nodes or only normal buttons/questions. Do not use fixed keyword rules. Keep it concise and safe. Use English unless the user asks for another language. ' + flowSchemaHint },
    { role: 'user', content: userPrompt },
  ]);
  if (!response) return defaultFlow(userPrompt);
  try { return normalizeFlow(JSON.parse(response) as BotFlow, userPrompt); } catch { return defaultFlow(userPrompt); }
}

export async function improveBlueprint(env: Env, currentBlueprint: BotBlueprint, instruction: string): Promise<{ blueprint: BotBlueprint; summary: string }> {
  if (!env.OPENAI_API_KEY) return { blueprint: currentBlueprint, summary: 'AI is not configured yet.' };
  const response = await chatJson(env, 0.25, [
    { role: 'system', content: 'Apply the user request to the existing Telegram bot blueprint. Return only JSON with keys "summary" and "blueprint". Keep it safe. Summary must be one short sentence. Decide from the user request whether the user bot itself should use AI support; do not rely on fixed keyword rules. ' + blueprintSchemaHint },
    { role: 'user', content: JSON.stringify({ currentBlueprint, instruction }) },
  ]);
  if (!response) return { blueprint: currentBlueprint, summary: 'I could not apply the change.' };
  try {
    const parsed = JSON.parse(response) as { blueprint?: BotBlueprint; summary?: string };
    return { blueprint: normalizeBlueprint(parsed.blueprint ?? currentBlueprint, instruction), summary: shortenText(parsed.summary ?? 'Changes applied.', 180) };
  } catch { return { blueprint: currentBlueprint, summary: 'I could not apply the change.' }; }
}

export async function improveFlow(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string }> {
  if (!env.OPENAI_API_KEY) return { flow: currentFlow, summary: 'AI is not configured yet.' };

  const first = await generateFlowUpdate(env, currentFlow, instruction);
  if (!first) return { flow: currentFlow, summary: 'I could not apply the flow change.' };
  if (flowChanged(currentFlow, first.flow)) return first;

  const retryInstruction = `${instruction}\n\nThe live bot runs from settings.flow. Your previous output did not change the executable flow. Return a changed executable flow with real nodes, buttons, and valid next targets. If the user asks for keyboard buttons, set keyboard to reply on the node that should show the reply keyboard. Do not claim success unless the flow JSON is actually different.`;
  const second = await generateFlowUpdate(env, currentFlow, retryInstruction);
  if (second && flowChanged(currentFlow, second.flow)) return second;

  return { flow: currentFlow, summary: 'I could not save a real runtime change.' };
}

async function generateFlowUpdate(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string } | null> {
  const response = await chatJson(env, 0.25, [
    { role: 'system', content: 'Apply the user request to the existing Telegram bot flow. Return only JSON with keys "summary" and "flow". Use only the controlled JSON flow format. The live user bot executes this returned flow, so menus/buttons/questions/navigation must be represented inside flow.nodes. If the user asks for reply keyboard/keyboard buttons, put "keyboard":"reply" on the relevant node. Keep it safe. Summary must be one short sentence and must describe the real flow change. ' + flowSchemaHint },
    { role: 'user', content: JSON.stringify({ currentFlow, instruction }) },
  ]);
  if (!response) return null;
  try {
    const parsed = JSON.parse(response) as { flow?: BotFlow; summary?: string };
    return { flow: normalizeFlow(parsed.flow ?? currentFlow, instruction), summary: shortenText(parsed.summary ?? 'Flow updated.', 180) };
  } catch {
    return null;
  }
}

export async function plainAiReply(env: Env, message: string, history: ChatHistoryMessage[] = []): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'AI is not configured yet. Set OPENAI_API_KEY in Cloudflare Secrets.';
  const input = buildResponsesInput(history, message);
  if (shouldUseWebSearch(message)) {
    const webReply = await responsesWebReply(env, input, CONCISE_CHAT_INSTRUCTIONS);
    if (webReply) return shortenText(webReply, 900);
  }
  return shortenText(await responsesTextReply(env, input, CONCISE_CHAT_INSTRUCTIONS), 900);
}

export async function aiReply(env: Env, systemPrompt: string, message: string, history: ChatHistoryMessage[] = []): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'AI is not configured yet. Set OPENAI_API_KEY in Cloudflare Secrets.';
  const input = buildResponsesInput(history, message);
  const instructions = `${systemPrompt}\n\n${CONCISE_CHAT_INSTRUCTIONS}`;
  if (shouldUseWebSearch(message)) {
    const webReply = await responsesWebReply(env, input, instructions);
    if (webReply) return shortenText(webReply, 900);
  }
  return shortenText(await responsesTextReply(env, input, instructions), 900);
}

function buildResponsesInput(history: ChatHistoryMessage[], message: string): Array<{ role: 'user' | 'assistant'; content: string }> {
  const recent = history.slice(-12).map((item) => ({ role: item.role, content: item.content.slice(0, 900) }));
  return [...recent, { role: 'user', content: message.slice(0, 3000) }];
}

function shouldUseWebSearch(message: string): boolean {
  const english = /\b(search|web|internet|google|latest|today|current|now|news|price|pricing|weather|score|stock|crypto|release|update|version|2025|2026)\b/i;
  const persian = /(سرچ|جستجو|وب|اینترنت|گوگل|جدید|آخرین|امروز|الان|قیمت|تعرفه|خبر|اخبار|هوا|آب و هوا|بورس|ارز|کریپتو|نسخه|آپدیت)/i;
  return english.test(message) || persian.test(message);
}

async function responsesTextReply(env: Env, input: string | Array<{ role: 'user' | 'assistant'; content: string }>, instructions?: string): Promise<string> {
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, input, instructions, max_output_tokens: 500, reasoning: { effort: 'low' } }),
  });
  const text = await response.text();
  const data = safeJson<ResponsesApiResult>(text);
  if (!response.ok || !data) {
    console.warn('responses text reply failed', response.status, data?.error?.message ?? text.slice(0, 240));
    return data?.error?.message ? `AI error: ${data.error.message}` : 'I could not generate a response right now.';
  }
  const output = extractResponseText(data);
  return output ? output.slice(0, 900) : 'No response was generated.';
}

async function responsesWebReply(env: Env, input: string | Array<{ role: 'user' | 'assistant'; content: string }>, instructions?: string): Promise<string | null> {
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, input, instructions, max_output_tokens: 500, reasoning: { effort: 'low' }, tools: [{ type: 'web_search', search_context_size: 'low' }], tool_choice: 'auto' }),
  });
  const text = await response.text();
  const data = safeJson<ResponsesApiResult>(text);
  if (!response.ok || !data) { console.warn('responses web reply failed', response.status, data?.error?.message ?? text.slice(0, 240)); return null; }
  const output = extractResponseText(data);
  return output ? output.slice(0, 900) : null;
}

function shortenText(text: string, max: number): string {
  const clean = text.trim().replace(/\n{3,}/g, '\n\n');
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + '…';
}

function extractResponseText(data: ResponsesApiResult): string | null {
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  }
  return null;
}

function safeJson<T>(text: string): T | null { try { return JSON.parse(text) as T; } catch { return null; } }

async function chatJson(env: Env, _temperature: number, messages: Array<{ role: 'system' | 'user'; content: string }>): Promise<string | null> {
  const system = messages.find((message) => message.role === 'system')?.content ?? '';
  const user = messages.filter((message) => message.role === 'user').map((message) => message.content).join('\n\n');
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: `${system}\n\nReturn strict JSON only. Do not wrap it in markdown.`,
      input: user,
      max_output_tokens: 2200,
      reasoning: { effort: 'low' },
    }),
  });
  const text = await response.text();
  const data = safeJson<ResponsesApiResult>(text);
  if (!response.ok || !data) {
    console.warn('json generation failed', response.status, data?.error?.message ?? text.slice(0, 240));
    return null;
  }
  const output = extractResponseText(data);
  return output ? extractJsonObject(output) : null;
}

function extractJsonObject(value: string): string | null {
  const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) return cleaned;
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : null;
}

function flowChanged(before: BotFlow, after: BotFlow): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

function normalizeBlueprint(input: Partial<BotBlueprint>, prompt: string): BotBlueprint {
  const fallback = defaultBlueprint(prompt);
  const screens = Array.isArray(input.screens) && input.screens.length > 0 ? input.screens : fallback.screens;
  const hasStart = screens.some((screen) => screen.id === (input.startScreen ?? 'home'));
  return { version: 1, botType: input.botType ?? fallback.botType, language: input.language ?? fallback.language, tone: input.tone ?? fallback.tone, startScreen: hasStart ? input.startScreen ?? 'home' : screens[0]?.id ?? 'home', screens, aiSupport: input.aiSupport ?? fallback.aiSupport, safety: input.safety ?? fallback.safety };
}

function normalizeFlow(input: Partial<BotFlow>, prompt: string): BotFlow {
  const fallback = defaultFlow(prompt);
  const nodes = input.nodes && typeof input.nodes === 'object' ? input.nodes : fallback.nodes;
  const start = input.start && nodes[input.start] ? input.start : Object.keys(nodes)[0] ?? fallback.start;
  return { version: 1, name: input.name || fallback.name, description: input.description || fallback.description, start, nodes, variables: Array.isArray(input.variables) ? input.variables : [] };
}

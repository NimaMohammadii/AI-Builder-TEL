import type { BotBlueprint, Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL } from './utils';

type FlowNode = {
  id: string;
  message: string;
  saveInputAs?: string;
  next?: string;
  buttons?: Array<{ text: string; next: string }>;
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

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  error?: { message?: string };
};

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
    "start": { "id": "start", "message": "Welcome message", "buttons": [{ "text": "Begin", "next": "ask_name" }] },
    "ask_name": { "id": "ask_name", "message": "What is your name?", "saveInputAs": "name", "next": "finish" },
    "finish": { "id": "finish", "message": "Thanks. We received your request.", "notifyOwner": true, "end": true }
  }
}`;

export function defaultBlueprint(prompt: string): BotBlueprint {
  return {
    version: 1,
    botType: 'custom',
    language: 'en',
    tone: 'premium',
    startScreen: 'home',
    screens: [
      {
        id: 'home',
        title: 'Home',
        message: `Welcome. This bot is powered by AI.\n\nPurpose: ${prompt.slice(0, 600)}`,
        buttons: [
          { text: 'Start', action: { type: 'support' } },
          { text: 'About', action: { type: 'menu', target: 'about' } },
        ],
      },
      {
        id: 'about',
        title: 'About',
        message: 'This bot was built with AI Builder TEL and can be improved from the Mini App workspace.',
        buttons: [{ text: 'Back', action: { type: 'menu', target: 'home' } }],
      },
    ],
    aiSupport: {
      enabled: true,
      systemPrompt: 'You are a helpful Telegram business assistant. Be concise, safe, and practical.',
      handoffMessage: 'This needs a human review. Your message has been saved.',
    },
    safety: { blockedTopics: ['unsafe requests'], requireHumanFor: ['legal', 'medical', 'finance'] },
  };
}

export function defaultFlow(prompt: string): BotFlow {
  return {
    version: 1,
    name: 'Custom AI Bot',
    description: prompt.slice(0, 500),
    start: 'start',
    variables: [],
    nodes: {
      start: {
        id: 'start',
        message: `Welcome. This bot is ready.\n\n${prompt.slice(0, 500)}`,
        ai: { enabled: true, systemPrompt: `You are a helpful Telegram bot built for this purpose: ${prompt}` },
      },
    },
  };
}

export async function buildBlueprint(env: Env, userPrompt: string): Promise<BotBlueprint> {
  if (!env.OPENAI_API_KEY) return defaultBlueprint(userPrompt);
  const response = await chatJson(env, 0.35, [
    { role: 'system', content: 'Design a production-grade Telegram bot blueprint for a no-code builder. Keep it concise and safe. Use English unless the user asks for another language. ' + blueprintSchemaHint },
    { role: 'user', content: userPrompt },
  ]);
  if (!response) return defaultBlueprint(userPrompt);
  try { return normalizeBlueprint(JSON.parse(response) as BotBlueprint, userPrompt); } catch { return defaultBlueprint(userPrompt); }
}

export async function buildFlow(env: Env, userPrompt: string): Promise<BotFlow> {
  if (!env.OPENAI_API_KEY) return defaultFlow(userPrompt);
  const response = await chatJson(env, 0.25, [
    { role: 'system', content: 'Create a dynamic Telegram bot flow using only the controlled JSON flow format. Keep it concise and safe. Use English unless the user asks for another language. ' + flowSchemaHint },
    { role: 'user', content: userPrompt },
  ]);
  if (!response) return defaultFlow(userPrompt);
  try { return normalizeFlow(JSON.parse(response) as BotFlow, userPrompt); } catch { return defaultFlow(userPrompt); }
}

export async function improveBlueprint(env: Env, currentBlueprint: BotBlueprint, instruction: string): Promise<{ blueprint: BotBlueprint; summary: string }> {
  if (!env.OPENAI_API_KEY) return { blueprint: currentBlueprint, summary: 'AI is not configured yet.' };
  const response = await chatJson(env, 0.25, [
    { role: 'system', content: 'Apply the user request to the existing Telegram bot blueprint. Return only JSON with keys "summary" and "blueprint". Keep it safe. ' + blueprintSchemaHint },
    { role: 'user', content: JSON.stringify({ currentBlueprint, instruction }) },
  ]);
  if (!response) return { blueprint: currentBlueprint, summary: 'I could not apply the change. Please try again.' };
  try {
    const parsed = JSON.parse(response) as { blueprint?: BotBlueprint; summary?: string };
    return { blueprint: normalizeBlueprint(parsed.blueprint ?? currentBlueprint, instruction), summary: parsed.summary ?? 'Changes applied.' };
  } catch { return { blueprint: currentBlueprint, summary: 'I could not parse the AI change safely.' }; }
}

export async function improveFlow(env: Env, currentFlow: BotFlow, instruction: string): Promise<{ flow: BotFlow; summary: string }> {
  if (!env.OPENAI_API_KEY) return { flow: currentFlow, summary: 'AI is not configured yet.' };
  const response = await chatJson(env, 0.25, [
    { role: 'system', content: 'Apply the user request to the existing Telegram bot flow. Return only JSON with keys "summary" and "flow". Use only the controlled JSON flow format. Keep it safe. ' + flowSchemaHint },
    { role: 'user', content: JSON.stringify({ currentFlow, instruction }) },
  ]);
  if (!response) return { flow: currentFlow, summary: 'I could not apply the flow change.' };
  try {
    const parsed = JSON.parse(response) as { flow?: BotFlow; summary?: string };
    return { flow: normalizeFlow(parsed.flow ?? currentFlow, instruction), summary: parsed.summary ?? 'Flow changes applied.' };
  } catch { return { flow: currentFlow, summary: 'I could not parse the flow change safely.' }; }
}

export async function plainAiReply(env: Env, message: string): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'AI is not configured yet. Set OPENAI_API_KEY in Cloudflare Secrets.';
  if (shouldUseWebSearch(message)) {
    const webReply = await responsesWebReply(env, message);
    if (webReply) return webReply;
  }
  return responsesTextReply(env, message);
}

export async function aiReply(env: Env, systemPrompt: string, message: string): Promise<string> {
  if (!env.OPENAI_API_KEY) return 'AI is not configured yet. Set OPENAI_API_KEY in Cloudflare Secrets.';
  if (shouldUseWebSearch(message)) {
    const webReply = await responsesWebReply(env, message, systemPrompt);
    if (webReply) return webReply;
  }
  return responsesTextReply(env, message, systemPrompt);
}

function shouldUseWebSearch(message: string): boolean {
  const english = /\b(search|web|internet|google|latest|today|current|now|news|price|pricing|weather|score|stock|crypto|release|update|version|2025|2026)\b/i;
  const persian = /(سرچ|جستجو|وب|اینترنت|گوگل|جدید|آخرین|امروز|الان|قیمت|تعرفه|خبر|اخبار|هوا|آب و هوا|بورس|ارز|کریپتو|نسخه|آپدیت)/i;
  return english.test(message) || persian.test(message);
}

async function responsesTextReply(env: Env, message: string, instructions?: string): Promise<string> {
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: message,
      instructions,
      max_output_tokens: 1200,
      reasoning: { effort: 'low' },
    }),
  });
  const text = await response.text();
  const data = safeJson<ResponsesApiResult>(text);
  if (!response.ok || !data) {
    console.warn('responses text reply failed', response.status, data?.error?.message ?? text.slice(0, 240));
    return data?.error?.message ? `AI error: ${data.error.message}` : 'I could not generate a response right now. Please try again.';
  }
  const output = extractResponseText(data);
  return output ? output.slice(0, 3500) : 'No response was generated.';
}

async function responsesWebReply(env: Env, message: string, instructions?: string): Promise<string | null> {
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: message,
      instructions,
      max_output_tokens: 1200,
      reasoning: { effort: 'low' },
      tools: [{ type: 'web_search', search_context_size: 'low' }],
      tool_choice: 'auto',
    }),
  });
  const text = await response.text();
  const data = safeJson<ResponsesApiResult>(text);
  if (!response.ok || !data) { console.warn('responses web reply failed', response.status, data?.error?.message ?? text.slice(0, 240)); return null; }
  const output = extractResponseText(data);
  return output ? output.slice(0, 3500) : null;
}

function extractResponseText(data: ResponsesApiResult): string | null {
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  }
  return null;
}

function safeJson<T>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch { return null; }
}

async function chatJson(env: Env, temperature: number, messages: Array<{ role: 'system' | 'user'; content: string }>): Promise<string | null> {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, temperature, response_format: { type: 'json_object' }, messages }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? null;
}

function normalizeBlueprint(input: Partial<BotBlueprint>, prompt: string): BotBlueprint {
  const fallback = defaultBlueprint(prompt);
  const screens = Array.isArray(input.screens) && input.screens.length > 0 ? input.screens : fallback.screens;
  const hasStart = screens.some((screen) => screen.id === (input.startScreen ?? 'home'));
  return {
    version: 1,
    botType: input.botType ?? fallback.botType,
    language: input.language ?? fallback.language,
    tone: input.tone ?? fallback.tone,
    startScreen: hasStart ? input.startScreen ?? 'home' : screens[0]?.id ?? 'home',
    screens,
    aiSupport: input.aiSupport ?? fallback.aiSupport,
    safety: input.safety ?? fallback.safety,
  };
}

function normalizeFlow(input: Partial<BotFlow>, prompt: string): BotFlow {
  const fallback = defaultFlow(prompt);
  const nodes = input.nodes && typeof input.nodes === 'object' ? input.nodes : fallback.nodes;
  const start = input.start && nodes[input.start] ? input.start : Object.keys(nodes)[0] ?? fallback.start;
  return {
    version: 1,
    name: input.name || fallback.name,
    description: input.description || fallback.description,
    start,
    nodes,
    variables: Array.isArray(input.variables) ? input.variables : [],
  };
}

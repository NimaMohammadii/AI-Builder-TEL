import type { Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, safeParseJson } from './utils';

export type AgentDslButton = { text: string; action?: string; url?: string; webAppUrl?: string };
export type AgentDslStep = {
  reply?: string;
  buttons?: AgentDslButton[][];
  set?: Record<string, unknown>;
  patch?: Record<string, unknown>;
  clearState?: boolean;
  next?: string;
};
export type AgentDslRule = { match: string; steps: AgentDslStep[] };
export type AgentDsl = {
  version: 1;
  name: string;
  language?: string;
  start: AgentDslStep[];
  messages: AgentDslRule[];
  callbacks: AgentDslRule[];
  fallback: AgentDslStep[];
};

type ResponsesApiResult = { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
type BuildResult = { summary: string; dsl: AgentDsl };

export async function buildAgentDsl(env: Env, input: string): Promise<BuildResult> {
  if (!env.OPENAI_API_KEY) return { summary: 'Default DSL created.', dsl: defaultDsl() };
  const instructions = [
    'Return strict JSON only. No markdown.',
    'You are designing an executable Telegram bot DSL for Cloudflare Worker.',
    'Do NOT write JavaScript code. Do NOT output BotFlow nodes.',
    'Design the bot freely, but final output must be this JSON shape:',
    '{"summary":"short","dsl":{"version":1,"name":"...","language":"fa|en|multi","start":[steps],"messages":[rules],"callbacks":[rules],"fallback":[steps]}}',
    'Step shape: {"reply":"text","buttons":[[{"text":"...","action":"callback_data"}]],"set":{},"patch":{},"clearState":true,"next":"stateName"}.',
    'Button shape: {"text":"...","action":"..."} or {"text":"...","url":"https://..."} or {"text":"...","webAppUrl":"https://..."}.',
    'Rule shape: {"match":"exact text/callback OR *","steps":[...]}.',
    'Use callbacks for inline button action values.',
    'Use state with patch/set/next when multi-step behavior is needed.',
    'If user asks Persian, write Persian bot text.',
    'Keep the DSL complete and executable.',
  ].join('\n');
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, instructions, input, max_output_tokens: 3200 }),
    });
    const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
    const parsed = safeParseJson<Partial<BuildResult>>(extractJson(extractText(data) ?? ''), {});
    const summary = typeof parsed.summary === 'string' ? parsed.summary.slice(0, 280) : 'DSL bot created.';
    return { summary, dsl: normalizeDsl(parsed.dsl) };
  } catch {
    return { summary: 'Default DSL created.', dsl: defaultDsl() };
  }
}

function normalizeDsl(input: unknown): AgentDsl {
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<AgentDsl>;
  return {
    version: 1,
    name: typeof raw.name === 'string' ? raw.name.slice(0, 80) : 'Custom Bot',
    language: typeof raw.language === 'string' ? raw.language.slice(0, 20) : 'multi',
    start: cleanSteps(raw.start) || defaultDsl().start,
    messages: cleanRules(raw.messages),
    callbacks: cleanRules(raw.callbacks),
    fallback: cleanSteps(raw.fallback) || defaultDsl().fallback,
  };
}

function cleanRules(value: unknown): AgentDslRule[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 80).map((rule) => {
    const r = (rule && typeof rule === 'object' ? rule : {}) as Partial<AgentDslRule>;
    return { match: typeof r.match === 'string' ? r.match.slice(0, 120) : '*', steps: cleanSteps(r.steps) || [] };
  }).filter((rule) => rule.steps.length);
}

function cleanSteps(value: unknown): AgentDslStep[] | null {
  if (!Array.isArray(value)) return null;
  const steps = value.slice(0, 40).map((step) => {
    const s = (step && typeof step === 'object' ? step : {}) as AgentDslStep;
    const out: AgentDslStep = {};
    if (typeof s.reply === 'string') out.reply = s.reply.slice(0, 4000);
    if (Array.isArray(s.buttons)) out.buttons = s.buttons.slice(0, 10).map((row) => Array.isArray(row) ? row.slice(0, 5).map(cleanButton).filter(Boolean) as AgentDslButton[] : []).filter(Boolean);
    if (s.set && typeof s.set === 'object') out.set = s.set;
    if (s.patch && typeof s.patch === 'object') out.patch = s.patch;
    if (s.clearState === true) out.clearState = true;
    if (typeof s.next === 'string') out.next = s.next.slice(0, 80);
    return out;
  }).filter((s) => s.reply || s.buttons || s.set || s.patch || s.clearState || s.next);
  return steps.length ? steps : null;
}

function cleanButton(button: unknown): AgentDslButton | null {
  const b = (button && typeof button === 'object' ? button : {}) as AgentDslButton;
  if (typeof b.text !== 'string' || !b.text.trim()) return null;
  const out: AgentDslButton = { text: b.text.slice(0, 64) };
  if (typeof b.action === 'string') out.action = b.action.slice(0, 64);
  if (typeof b.url === 'string' && /^https?:\/\//i.test(b.url)) out.url = b.url.slice(0, 500);
  if (typeof b.webAppUrl === 'string' && /^https?:\/\//i.test(b.webAppUrl)) out.webAppUrl = b.webAppUrl.slice(0, 500);
  if (!out.action && !out.url && !out.webAppUrl) out.action = out.text;
  return out;
}

function defaultDsl(): AgentDsl {
  return {
    version: 1,
    name: 'Custom Bot',
    language: 'multi',
    start: [{ reply: 'سلام! ربات آماده است.', buttons: [[{ text: 'شروع', action: 'start' }]] }],
    messages: [],
    callbacks: [{ match: 'start', steps: [{ reply: 'پیام خودت را بفرست.' }] }],
    fallback: [{ reply: 'پیامت دریافت شد.' }],
  };
}

function extractText(data: ResponsesApiResult | null): string | null {
  if (!data) return null;
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  return null;
}
function extractJson(value: string): string { const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim(); const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}'); return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned; }

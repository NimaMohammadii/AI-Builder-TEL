import type { Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, safeParseJson } from './utils';

export type AgentDslButton = { text: string; action?: string; url?: string; webAppUrl?: string };
export type AgentDslPayment = { title: string; description?: string; amount: number; payload?: string; success?: AgentDslStep[]; fail?: AgentDslStep[] };
export type AgentDslStep = {
  reply?: string;
  buttons?: AgentDslButton[][];
  payment?: AgentDslPayment;
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

type ResponsesApiResult = { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
type BuildResult = { summary: string; dsl: AgentDsl };

export async function buildAgentDsl(env: Env, input: string): Promise<BuildResult> {
  if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing');
  const instructions = [
    'Return strict JSON only. No markdown.',
    'You are designing an executable Telegram bot DSL for Cloudflare Worker.',
    'Do NOT write JavaScript code. Do NOT output BotFlow nodes.',
    'Design the bot freely, but final output must be this JSON shape:',
    '{"summary":"short","dsl":{"version":1,"name":"...","language":"fa|en|multi","start":[steps],"messages":[rules],"callbacks":[rules],"fallback":[steps]}}',
    'Step shape: {"reply":"text","buttons":[[{"text":"...","action":"callback_data"}]],"payment":{"title":"...","description":"...","amount":10,"payload":"unique_id","success":[steps],"fail":[steps]},"set":{},"patch":{},"clearState":true,"next":"stateName"}.',
    'Button shape: {"text":"...","action":"..."} or {"text":"...","url":"https://..."} or {"text":"...","webAppUrl":"https://..."}.',
    'Rule shape: {"match":"exact text/callback OR *","steps":[...]}.',
    'Use callbacks for inline button action values.',
    'Use state with patch/set/next when multi-step behavior is needed.',
    'Telegram Stars payments: when the user asks for payment, purchase, VIP, paid access, paid download, paid service, or subscription, use a payment step. amount is the number of Telegram Stars, currency is always XTR internally and must not be added to the DSL. payload should be stable and unique, e.g. vip_10_stars. Put the post-payment reply in payment.success.',
    'For a pay button flow, make an inline button action like "pay_vip" and a callbacks rule match "pay_vip" whose steps include the payment object.',
    'If user asks Persian, write Persian bot text.',
    'Keep the DSL complete and executable.',
  ].join('\n');

  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, instructions, input, max_output_tokens: 3600 }),
  });
  const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI DSL error ${response.status}`);

  const text = extractText(data) ?? '';
  const parsed = safeParseJson<Partial<BuildResult>>(extractJson(text), {});
  if (!parsed.dsl || !isUsableRawDsl(parsed.dsl)) throw new Error('AI did not return a usable bot DSL');

  const summary = typeof parsed.summary === 'string' ? parsed.summary.slice(0, 280) : 'DSL bot updated.';
  return { summary, dsl: normalizeDsl(parsed.dsl) };
}

function isUsableRawDsl(input: unknown): boolean {
  const raw = input as Partial<AgentDsl> | null;
  return Boolean(raw && typeof raw === 'object' && Array.isArray(raw.start) && raw.start.length > 0 && (Array.isArray(raw.messages) || Array.isArray(raw.callbacks)));
}

function normalizeDsl(input: unknown): AgentDsl {
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<AgentDsl>;
  const start = cleanSteps(raw.start);
  if (!start?.length) throw new Error('DSL start steps are empty');
  return {
    version: 1,
    name: typeof raw.name === 'string' ? raw.name.slice(0, 80) : 'Custom Bot',
    language: typeof raw.language === 'string' ? raw.language.slice(0, 20) : 'multi',
    start,
    messages: cleanRules(raw.messages),
    callbacks: cleanRules(raw.callbacks),
    fallback: cleanSteps(raw.fallback) || [{ reply: 'پیامت دریافت شد.' }],
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
    if (Array.isArray(s.buttons)) out.buttons = s.buttons.slice(0, 10).map((row) => Array.isArray(row) ? row.slice(0, 5).map(cleanButton).filter(Boolean) as AgentDslButton[] : []).filter((row) => row.length);
    const payment = cleanPayment(s.payment);
    if (payment) out.payment = payment;
    if (s.set && typeof s.set === 'object') out.set = s.set;
    if (s.patch && typeof s.patch === 'object') out.patch = s.patch;
    if (s.clearState === true) out.clearState = true;
    if (typeof s.next === 'string') out.next = s.next.slice(0, 80);
    return out;
  }).filter((s) => s.reply || s.buttons || s.payment || s.set || s.patch || s.clearState || s.next);
  return steps.length ? steps : null;
}

function cleanPayment(payment: unknown): AgentDslPayment | null {
  const p = (payment && typeof payment === 'object' ? payment : {}) as AgentDslPayment;
  if (typeof p.title !== 'string' || !p.title.trim()) return null;
  const amount = Math.max(1, Math.min(250000, Math.floor(Number(p.amount) || 0)));
  if (!amount) return null;
  return {
    title: p.title.slice(0, 80),
    description: typeof p.description === 'string' ? p.description.slice(0, 250) : p.title.slice(0, 80),
    amount,
    payload: typeof p.payload === 'string' && p.payload.trim() ? safePayload(p.payload) : safePayload(p.title + '_' + amount),
    success: cleanSteps(p.success) || [{ reply: 'پرداخت با موفقیت انجام شد.' }],
    fail: cleanSteps(p.fail) || [{ reply: 'پرداخت تأیید نشد. لطفاً دوباره تلاش کن.' }],
  };
}

function safePayload(value: string): string {
  return String(value || 'stars_payment').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'stars_payment';
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

function extractText(data: ResponsesApiResult | null): string | null {
  if (!data) return null;
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  return data.error?.message ?? null;
}
function extractJson(value: string): string { const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim(); const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}'); return start >= 0 && end > start ? cleaned.slice(start, end + 1) : ''; }

import type { Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL, safeParseJson } from './utils';

type ResponsesApiResult = { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };

type AgentCodeBuildResult = { summary: string; code: string };

const DEFAULT_CODE = [
  'async function onStart(ctx) {',
  '  await ctx.reply("سلام");',
  '}',
  '',
  'async function onMessage(ctx) {',
  '  await ctx.reply("پیام شما: " + (ctx.text || ""));',
  '}',
  '',
  'async function onCallback(ctx) {',
  '  await ctx.answer();',
  '  await ctx.reply("clicked: " + (ctx.data || ""));',
  '}',
  '',
  'return { onStart, onMessage, onCallback };',
].join('\n');

export async function buildAgentCode(env: Env, input: string): Promise<AgentCodeBuildResult> {
  if (!env.OPENAI_API_KEY) return { summary: 'AI unavailable; default echo code created.', code: DEFAULT_CODE };
  const instructions = [
    'You are generating custom JavaScript logic for a Telegram bot runtime.',
    'Return strict JSON only: {"summary":"...","code":"..."}.',
    'code MUST be ONLY the async factory BODY (not wrapped in function).',
    'Create handlers onStart(ctx), onMessage(ctx), onCallback(ctx), then return { onStart, onMessage, onCallback };',
    'Never output BotFlow, nodes, or predefined action lists.',
    'Use only ctx helpers: text, data, userId, chatId, message, callback, reply, answer, telegram, getState, setState, patchState, button, urlButton, webAppButton.',
    'Keep code concise and runnable.',
  ].join('\n');

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, instructions, input, max_output_tokens: 1800 }),
    });
    const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
    const parsed = safeParseJson<Partial<AgentCodeBuildResult>>(extractJson(extractText(data) ?? ''), {});
    const summary = typeof parsed.summary === 'string' ? parsed.summary.slice(0, 280) : 'Custom bot code generated.';
    const code = typeof parsed.code === 'string' && parsed.code.includes('return') ? parsed.code : DEFAULT_CODE;
    return { summary, code };
  } catch {
    return { summary: 'AI failed; default echo code created.', code: DEFAULT_CODE };
  }
}

function extractText(data: ResponsesApiResult | null): string | null {
  if (!data) return null;
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  return null;
}

function extractJson(value: string): string {
  const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}

import { aiReply } from './ai';
import type { Env } from './types';
import { OPENAI_BASE_URL, OPENAI_MODEL } from './utils';

export type GroupAiProvider = 'gpt' | 'grok';

const GROUP_AI_PROVIDER_KEY = 'admin:group-ai-provider';
const GROK_MODEL = 'grok-4-1-fast-reasoning';
const XAI_BASE_URL = 'https://api.x.ai/v1';

type ResponsesApiResult = { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
type ChatCompletionResult = { choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>; error?: { message?: string } };

export async function getGroupAiProvider(env: Env): Promise<GroupAiProvider> {
  const value = await env.BOT_CACHE.get(GROUP_AI_PROVIDER_KEY).catch(() => null);
  return value === 'grok' ? 'grok' : 'gpt';
}

export async function setGroupAiProvider(env: Env, provider: unknown): Promise<{ ok: true; provider: GroupAiProvider }> {
  const normalized: GroupAiProvider = provider === 'grok' ? 'grok' : 'gpt';
  await env.BOT_CACHE.put(GROUP_AI_PROVIDER_KEY, normalized);
  return { ok: true, provider: normalized };
}

export async function groupAiProviderJson(env: Env): Promise<{ ok: true; provider: GroupAiProvider; model: string }> {
  const provider = await getGroupAiProvider(env);
  return { ok: true, provider, model: provider === 'grok' ? GROK_MODEL : OPENAI_MODEL };
}

export async function selectedGroupReply(env: Env, prompt: string): Promise<string> {
  const provider = await getGroupAiProvider(env);
  return provider === 'grok' ? grokGroupReply(env, prompt) : gptGroupReply(env, prompt);
}

async function gptGroupReply(env: Env, prompt: string): Promise<string> {
  const system = groupSystemPrompt();
  if (!env.OPENAI_API_KEY) return aiReply(env, system, prompt, []);
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, instructions: system, input: prompt.slice(0, 2500), tools: [{ type: 'web_search_preview' }], max_output_tokens: 450 }),
    });
    const data = (await response.json().catch(() => null)) as ResponsesApiResult | null;
    const text = extractResponsesText(data);
    if (text) return text.slice(0, 1200);
  } catch (error) {
    console.warn('group GPT reply failed', error);
  }
  return aiReply(env, system, prompt, []);
}

async function grokGroupReply(env: Env, prompt: string): Promise<string> {
  const system = groupSystemPrompt();
  if (!env.XAI_API_KEY) return 'Grok is selected, but XAI_API_KEY is not configured.';
  try {
    const response = await fetch(`${XAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.XAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt.slice(0, 2500) },
        ],
        max_tokens: 450,
      }),
    });
    const data = (await response.json().catch(() => null)) as ChatCompletionResult | null;
    const text = extractChatText(data);
    if (text) return text.slice(0, 1200);
    const message = data?.error?.message;
    if (message) return message.slice(0, 1200);
  } catch (error) {
    console.warn('group Grok reply failed', error);
  }
  return 'Grok reply failed. Please try again.';
}

function groupSystemPrompt(): string {
  return 'You are Vexa inside a Telegram group. Reply in the user language, be warm, friendly, helpful, and concise. Do not mention tools.';
}

function extractResponsesText(data: ResponsesApiResult | null): string | null {
  if (!data) return null;
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) for (const content of item.content ?? []) if (content.type === 'output_text' && content.text) return content.text;
  return data.error?.message ?? null;
}

function extractChatText(data: ChatCompletionResult | null): string | null {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => part.text || '').join('').trim() || null;
  return data?.error?.message ?? null;
}

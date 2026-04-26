import type { AppConfig } from '../types/env';
import type { RuntimeBotConfig, RuntimeButton } from './bot-runtime-config';
import { planRuntimeConfigFromInstruction } from './bot-runtime-config';

export async function planRuntimeConfigWithAgent(config: AppConfig, instruction: string): Promise<RuntimeBotConfig> {
  const fallback = planRuntimeConfigFromInstruction(instruction);
  try {
    const raw = await callPlanner(config, instruction);
    return parseRuntimeConfig(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

async function callPlanner(config: AppConfig, instruction: string): Promise<string> {
  if (config.provider === 'grok') return callGrok(config, instruction);
  return callOpenAI(config, instruction);
}

async function callOpenAI(config: AppConfig, instruction: string): Promise<string> {
  const prompt = makePrompt(instruction);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: 'Return only valid JSON.' }] },
        { role: 'user', content: [{ type: 'input_text', text: prompt }] }
      ],
      max_output_tokens: 1400
    })
  });
  const payload = await response.json() as unknown;
  if (!response.ok) throw new Error('planner_failed');
  return readOpenAIText(payload);
}

async function callGrok(config: AppConfig, instruction: string): Promise<string> {
  const baseUrl = (config.xAiBaseUrl || 'https://api.x.ai/v1').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.xAiApiKey}`
    },
    body: JSON.stringify({
      model: config.xAiModel,
      messages: [
        { role: 'system', content: 'Return only valid JSON.' },
        { role: 'user', content: makePrompt(instruction) }
      ],
      max_tokens: 1400
    })
  });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  if (!response.ok) throw new Error('planner_failed');
  return payload.choices?.[0]?.message?.content ?? '';
}

function makePrompt(instruction: string): string {
  return [
    'Build a Telegram runtime config from this owner request.',
    'Return JSON only: {"welcomeText":"...","buttons":[{"label":"...","command":"...","response":"..."}]}',
    'Use Persian unless the request says otherwise. Make responses specific to the request.',
    instruction
  ].join('\n');
}

function readOpenAIText(payload: unknown): string {
  const data = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text;
  const chunks: string[] = [];
  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

function parseRuntimeConfig(raw: string): RuntimeBotConfig | null {
  const text = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<RuntimeBotConfig>;
  const buttons = Array.isArray(parsed.buttons) ? parsed.buttons : [];
  const normalized = buttons.map((item) => {
    const button = item as RuntimeButton;
    return {
      label: String(button.label ?? '').trim().slice(0, 80),
      command: sanitizeCommand(String(button.command ?? 'menu')),
      response: String(button.response ?? '').trim().slice(0, 1500)
    };
  }).filter((button) => button.label && button.command && button.response).slice(0, 10);
  if (!normalized.length) return null;
  return {
    welcomeText: String(parsed.welcomeText ?? '').trim().slice(0, 1500) || 'به ربات خوش آمدید ✨',
    buttons: normalized
  };
}

function sanitizeCommand(value: string): string {
  return value.replace(/^\/+/, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32) || 'menu';
}

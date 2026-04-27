import type { AppConfig, Env } from '../types/env';
import { getDb } from '../db/client';
import type { RuntimeBotConfig } from './bot-runtime-config';

export interface BotRuntimeCodePlan {
  sourceCode: string;
  runtimeConfig: RuntimeBotConfig;
}

export async function planBotRuntimeCode(input: {
  config: AppConfig;
  instruction: string;
  currentConfig: RuntimeBotConfig | null;
}): Promise<BotRuntimeCodePlan> {
  const fallback = buildFallbackPlan(input.instruction, input.currentConfig);
  try {
    const raw = input.config.provider === 'grok'
      ? await callGrok(input.config, input.instruction, input.currentConfig)
      : await callOpenAI(input.config, input.instruction, input.currentConfig);
    return parsePlan(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function saveBotRuntimeCode(env: Env, input: {
  workspaceId: string;
  botId: string;
  instruction: string;
  plan: BotRuntimeCodePlan;
}): Promise<void> {
  const db = getDb(env);
  if (!db) return;
  await ensureBotRuntimeCodeTable(db);
  await db.prepare("UPDATE bot_runtime_code SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE bot_id = ?")
    .bind(input.botId)
    .run();
  await db.prepare("INSERT INTO bot_runtime_code (id, workspace_id, bot_id, instruction, source_code, runtime_config, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)")
    .bind(
      `brc_${crypto.randomUUID()}`,
      input.workspaceId,
      input.botId,
      input.instruction.slice(0, 4000),
      input.plan.sourceCode.slice(0, 24000),
      JSON.stringify(input.plan.runtimeConfig)
    )
    .run();
  await env.CHAT_MEMORY?.put(`bot_runtime_code:${input.botId}`, JSON.stringify(input.plan), { expirationTtl: 60 * 60 * 24 * 30 });
  await env.BOT_BUILDER_KV?.put(`bot_runtime_code:${input.botId}`, JSON.stringify(input.plan), { expirationTtl: 60 * 60 * 24 * 30 });
}

export async function loadBotRuntimeCode(env: Env, botId: string): Promise<BotRuntimeCodePlan | null> {
  const fromKv = await env.CHAT_MEMORY?.get(`bot_runtime_code:${botId}`) ?? await env.BOT_BUILDER_KV?.get(`bot_runtime_code:${botId}`);
  if (fromKv) {
    try { return JSON.parse(fromKv) as BotRuntimeCodePlan; } catch {}
  }
  const db = getDb(env);
  if (!db) return null;
  await ensureBotRuntimeCodeTable(db);
  const row = await db.prepare("SELECT source_code, runtime_config FROM bot_runtime_code WHERE bot_id = ? AND is_active = 1 ORDER BY updated_at DESC, created_at DESC LIMIT 1")
    .bind(botId)
    .first<{ source_code: string; runtime_config: string }>();
  if (!row) return null;
  try {
    return { sourceCode: row.source_code, runtimeConfig: JSON.parse(row.runtime_config) as RuntimeBotConfig };
  } catch {
    return null;
  }
}

async function callOpenAI(config: AppConfig, instruction: string, currentConfig: RuntimeBotConfig | null): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.openAiApiKey}` },
    body: JSON.stringify({
      model: config.openAiModel,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: 'Return only valid JSON. No markdown.' }] },
        { role: 'user', content: [{ type: 'input_text', text: makePrompt(instruction, currentConfig) }] }
      ],
      max_output_tokens: 3200
    })
  });
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (!response.ok) throw new Error('code_planner_failed');
  const text = readOpenAIText(payload).trim();
  if (!text) throw new Error('code_planner_empty');
  return text;
}

async function callGrok(config: AppConfig, instruction: string, currentConfig: RuntimeBotConfig | null): Promise<string> {
  const baseUrl = (config.xAiBaseUrl || 'https://api.x.ai/v1').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.xAiApiKey}` },
    body: JSON.stringify({
      model: config.xAiModel,
      messages: [
        { role: 'system', content: 'Return only valid JSON. No markdown.' },
        { role: 'user', content: makePrompt(instruction, currentConfig) }
      ],
      max_tokens: 3200
    })
  });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  if (!response.ok) throw new Error('code_planner_failed');
  return payload.choices?.[0]?.message?.content ?? '';
}

function makePrompt(instruction: string, currentConfig: RuntimeBotConfig | null): string {
  return [
    'You are an AI software agent that builds a dedicated Telegram bot program for one customer bot.',
    'Write a per-bot program and an executable runtimeConfig. Return JSON only.',
    'Schema: {"sourceCode":"TypeScript-like per-bot code string","runtimeConfig":{"welcomeText":"string","aiInstructions":"string","buttons":[{"label":"string","command":"english_slug","response":"string"}]}}',
    'sourceCode must look like a real dedicated bot module with handlers, flows, state names, and behavior.',
    'runtimeConfig is what the Worker executes safely. aiInstructions must cover free-text behavior and flows.',
    'If currentConfig exists, edit it. Do not rebuild from zero unless owner clearly asks reset/rebuild.',
    'Use Persian unless the owner asks otherwise.',
    'Current runtimeConfig:',
    JSON.stringify(currentConfig ?? { welcomeText: '', aiInstructions: '', buttons: [] }),
    'Owner request:',
    instruction
  ].join('\n');
}

function parsePlan(raw: string): BotRuntimeCodePlan | null {
  const text = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<BotRuntimeCodePlan>;
  const runtime = parsed.runtimeConfig;
  if (!runtime || !Array.isArray(runtime.buttons)) return null;
  const buttons = runtime.buttons.map((button) => ({
    label: String(button.label ?? '').trim().slice(0, 80),
    command: sanitizeCommand(String(button.command ?? 'menu')),
    response: String(button.response ?? '').trim().slice(0, 1800)
  })).filter((button) => button.label && button.command && button.response).slice(0, 24);
  const aiInstructions = String(runtime.aiInstructions ?? '').trim().slice(0, 7000);
  if (!buttons.length && !aiInstructions) return null;
  const runtimeConfig = {
    welcomeText: String(runtime.welcomeText ?? '').trim().slice(0, 1800) || 'سلام، خوش آمدید.',
    buttons: buttons.length ? buttons : [{ label: 'شروع', command: 'start', response: 'در خدمتم. درخواستت را بنویس.' }],
    aiInstructions
  };
  return {
    sourceCode: String(parsed.sourceCode ?? '').trim().slice(0, 24000) || buildSourceFromRuntime(runtimeConfig),
    runtimeConfig
  };
}

function buildFallbackPlan(instruction: string, currentConfig: RuntimeBotConfig | null): BotRuntimeCodePlan {
  const runtimeConfig: RuntimeBotConfig = currentConfig
    ? { ...currentConfig, aiInstructions: [currentConfig.aiInstructions ?? '', instruction].filter(Boolean).join('\n\n') }
    : { welcomeText: 'سلام، خوش آمدید.', buttons: [{ label: 'شروع', command: 'start', response: 'در خدمتم. درخواستت را بنویس.' }], aiInstructions: instruction };
  return { sourceCode: buildSourceFromRuntime(runtimeConfig), runtimeConfig };
}

function buildSourceFromRuntime(runtime: RuntimeBotConfig): string {
  return [
    'export const botProgram = {',
    `  welcomeText: ${JSON.stringify(runtime.welcomeText)},`,
    `  aiInstructions: ${JSON.stringify(runtime.aiInstructions ?? '')},`,
    `  buttons: ${JSON.stringify(runtime.buttons, null, 2)},`,
    '  async onMessage(ctx) {',
    '    // Runtime is executed safely by the Worker using runtimeConfig.',
    '    // Free text is answered by AI using aiInstructions.',
    '  }',
    '};'
  ].join('\n');
}

function readOpenAIText(payload: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }): string {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) return payload.output_text;
  const chunks: string[] = [];
  for (const item of payload.output ?? []) for (const content of item.content ?? []) if (typeof content.text === 'string') chunks.push(content.text);
  return chunks.join('\n');
}

function sanitizeCommand(value: string): string {
  return value.replace(/^\/+/, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32) || 'menu';
}

async function ensureBotRuntimeCodeTable(db: D1Database): Promise<void> {
  await db.prepare("CREATE TABLE IF NOT EXISTS bot_runtime_code (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, bot_id TEXT NOT NULL, instruction TEXT NOT NULL, source_code TEXT NOT NULL, runtime_config TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_bot_runtime_code_bot_id ON bot_runtime_code(bot_id)").run();
}

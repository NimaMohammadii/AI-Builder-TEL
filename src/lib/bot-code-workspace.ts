import type { AppConfig, Env } from '../types/env';
import { getDb } from '../db/client';
import type { RuntimeBotConfig } from './bot-runtime-config';
import { normalizeBotProgram, programFromRuntimeConfig, runtimeConfigFromProgram, type BotProgram } from './bot-program-runtime';

export interface BotRuntimeCodePlan {
  sourceCode: string;
  runtimeConfig: RuntimeBotConfig;
  program?: BotProgram;
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
    return parsePlan(raw, fallback.runtimeConfig) ?? fallback;
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
      JSON.stringify({ ...input.plan.runtimeConfig, program: input.plan.program })
    )
    .run();
  await env.CHAT_MEMORY?.put(`bot_runtime_code:${input.botId}`, JSON.stringify(input.plan), { expirationTtl: 60 * 60 * 24 * 30 });
  await env.BOT_BUILDER_KV?.put(`bot_runtime_code:${input.botId}`, JSON.stringify(input.plan), { expirationTtl: 60 * 60 * 24 * 30 });
}

export async function loadBotRuntimeCode(env: Env, botId: string): Promise<BotRuntimeCodePlan | null> {
  const dbPlan = await loadBotRuntimeCodeFromD1(env, botId);
  if (dbPlan) {
    await env.CHAT_MEMORY?.put(`bot_runtime_code:${botId}`, JSON.stringify(dbPlan), { expirationTtl: 60 * 60 * 24 * 30 });
    await env.BOT_BUILDER_KV?.put(`bot_runtime_code:${botId}`, JSON.stringify(dbPlan), { expirationTtl: 60 * 60 * 24 * 30 });
    return dbPlan;
  }
  const fromKv = await env.CHAT_MEMORY?.get(`bot_runtime_code:${botId}`) ?? await env.BOT_BUILDER_KV?.get(`bot_runtime_code:${botId}`);
  if (fromKv) {
    try { return JSON.parse(fromKv) as BotRuntimeCodePlan; } catch {}
  }
  return null;
}

export async function loadBotRuntimeCodeDebug(env: Env, botId: string): Promise<{ source: 'd1' | 'kv' | 'none'; plan: BotRuntimeCodePlan | null }> {
  const dbPlan = await loadBotRuntimeCodeFromD1(env, botId);
  if (dbPlan) return { source: 'd1', plan: dbPlan };
  const fromKv = await env.CHAT_MEMORY?.get(`bot_runtime_code:${botId}`) ?? await env.BOT_BUILDER_KV?.get(`bot_runtime_code:${botId}`);
  if (fromKv) {
    try { return { source: 'kv', plan: JSON.parse(fromKv) as BotRuntimeCodePlan }; } catch {}
  }
  return { source: 'none', plan: null };
}

async function loadBotRuntimeCodeFromD1(env: Env, botId: string): Promise<BotRuntimeCodePlan | null> {
  const db = getDb(env);
  if (!db) return null;
  await ensureBotRuntimeCodeTable(db);
  const row = await db.prepare("SELECT source_code, runtime_config FROM bot_runtime_code WHERE bot_id = ? AND is_active = 1 ORDER BY updated_at DESC, created_at DESC LIMIT 1")
    .bind(botId)
    .first<{ source_code: string; runtime_config: string }>();
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.runtime_config) as RuntimeBotConfig & { program?: BotProgram };
    const program = parsed.program ? normalizeBotProgram(parsed.program, parsed) : undefined;
    return { sourceCode: row.source_code, runtimeConfig: program ? runtimeConfigFromProgram(program) : parsed, program };
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
      max_output_tokens: 5200
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
      max_tokens: 5200
    })
  });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  if (!response.ok) throw new Error('code_planner_failed');
  return payload.choices?.[0]?.message?.content ?? '';
}

function makePrompt(instruction: string, currentConfig: RuntimeBotConfig | null): string {
  return [
    'You are an AI software agent that builds a real executable Telegram bot program for one customer bot.',
    'Return JSON only. Do not explain.',
    'Schema:',
    '{"sourceCode":"string","program":{"version":1,"welcomeText":"string","aiInstructions":"string","buttons":[{"label":"string","command":"english_slug","response":"string","flowId":"optional_flow_id"}],"flows":[{"id":"english_id","title":"string","triggerLabels":["button label"],"triggerCommands":["command"],"steps":[{"id":"english_id","kind":"ask|message|end","text":"string","field":"optional_field","next":"optional_step_id"}],"summaryText":"string with {field} or {summary}"}],"fallback":{"aiEnabled":true,"text":"string"}}}',
    'Rules:',
    '- Build flows for any multi-step task such as order, reservation, registration, support ticket, quiz, lead collection, shop checkout, menu creation, or forms.',
    '- Each button that starts a flow must have flowId matching a flow id.',
    '- Free-text behavior belongs in aiInstructions, but real deterministic tasks must be flows.',
    '- If current config exists, edit and extend it. Do not rebuild from zero unless owner clearly asks reset/rebuild.',
    '- Use Persian for user-facing text unless owner asks otherwise.',
    '- Do not include builder/admin features unless owner requested them for the customer bot.',
    'Current config:',
    JSON.stringify(currentConfig ?? { welcomeText: '', aiInstructions: '', buttons: [] }),
    'Owner request:',
    instruction
  ].join('\n');
}

function parsePlan(raw: string, fallbackConfig: RuntimeBotConfig): BotRuntimeCodePlan | null {
  const text = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  const parsed = JSON.parse(text.slice(start, end + 1)) as { sourceCode?: string; program?: unknown; runtimeConfig?: RuntimeBotConfig };
  const program = parsed.program
    ? normalizeBotProgram(parsed.program, fallbackConfig)
    : parsed.runtimeConfig
      ? programFromRuntimeConfig(parsed.runtimeConfig)
      : null;
  if (!program) return null;
  const runtimeConfig = runtimeConfigFromProgram(program);
  return {
    sourceCode: String(parsed.sourceCode ?? '').trim().slice(0, 24000) || buildSourceFromProgram(program),
    runtimeConfig,
    program
  };
}

function buildFallbackPlan(instruction: string, currentConfig: RuntimeBotConfig | null): BotRuntimeCodePlan {
  const runtimeConfig: RuntimeBotConfig = currentConfig
    ? { ...currentConfig, aiInstructions: [currentConfig.aiInstructions ?? '', instruction].filter(Boolean).join('\n\n') }
    : { welcomeText: 'سلام، خوش آمدید.', buttons: [{ label: 'شروع', command: 'start', response: 'در خدمتم. درخواستت را بنویس.' }], aiInstructions: instruction };
  const program = programFromRuntimeConfig(runtimeConfig);
  return { sourceCode: buildSourceFromProgram(program), runtimeConfig, program };
}

function buildSourceFromProgram(program: BotProgram): string {
  return [
    'export const botProgram = ',
    JSON.stringify(program, null, 2),
    ';'
  ].join('');
}

function readOpenAIText(payload: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }): string {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) return payload.output_text;
  const chunks: string[] = [];
  for (const item of payload.output ?? []) for (const content of item.content ?? []) if (typeof content.text === 'string') chunks.push(content.text);
  return chunks.join('\n');
}

async function ensureBotRuntimeCodeTable(db: D1Database): Promise<void> {
  await db.prepare("CREATE TABLE IF NOT EXISTS bot_runtime_code (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, bot_id TEXT NOT NULL, instruction TEXT NOT NULL, source_code TEXT NOT NULL, runtime_config TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_bot_runtime_code_bot_id ON bot_runtime_code(bot_id)").run();
}

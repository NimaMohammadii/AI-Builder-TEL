import type { AppConfig, Env } from '../types/env';
import { getDb } from '../db/client';

export interface RuntimeButton {
  label: string;
  command: string;
  response: string;
}

export interface RuntimeBotConfig {
  welcomeText: string;
  buttons: RuntimeButton[];
  aiInstructions?: string;
}

export async function saveRuntimeBotConfig(env: Env, input: { workspaceId: string; botId: string; instruction: string; config: RuntimeBotConfig }): Promise<void> {
  const db = getDb(env);
  if (!db) return;
  await ensureBuilderTables(db);
  await db.prepare("INSERT INTO bot_builder_actions (id, workspace_id, bot_id, instruction, action_config, status) VALUES (?, ?, ?, ?, ?, 'applied')")
    .bind(`bba_${crypto.randomUUID()}`, input.workspaceId, input.botId, input.instruction.slice(0, 4000), JSON.stringify(input.config))
    .run();
  await db.prepare("UPDATE menus SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE bot_id = ? AND menu_type = 'runtime_buttons'").bind(input.botId).run();
  await db.prepare("INSERT INTO menus (id, workspace_id, bot_id, name, menu_type, menu_config, is_active) VALUES (?, ?, ?, 'Runtime Button Menu', 'runtime_buttons', ?, 1)")
    .bind(`menu_${crypto.randomUUID()}`, input.workspaceId, input.botId, JSON.stringify(input.config))
    .run();
  for (const button of input.config.buttons) {
    await db.prepare("INSERT INTO commands (id, workspace_id, bot_id, name, command, description, command_type, command_config, is_enabled) VALUES (?, ?, ?, ?, ?, ?, 'runtime_response', ?, 1) ON CONFLICT(bot_id, command) DO UPDATE SET name = excluded.name, description = excluded.description, command_type = excluded.command_type, command_config = excluded.command_config, is_enabled = 1, updated_at = CURRENT_TIMESTAMP")
      .bind(`cmd_${crypto.randomUUID()}`, input.workspaceId, input.botId, button.label, sanitizeCommand(button.command), button.label, JSON.stringify({ label: button.label, response: button.response, source: 'no_code_builder' }))
      .run();
  }
}

export async function loadRuntimeBotConfig(env: Env, botId: string): Promise<RuntimeBotConfig | null> {
  const db = getDb(env);
  if (!db) return null;
  const row = await db.prepare("SELECT menu_config FROM menus WHERE bot_id = ? AND menu_type = 'runtime_buttons' AND is_active = 1 ORDER BY updated_at DESC, created_at DESC LIMIT 1").bind(botId).first<{ menu_config: string }>();
  if (row?.menu_config) {
    try { return JSON.parse(row.menu_config) as RuntimeBotConfig; } catch {}
  }
  return loadRuntimeBotConfigFromCommands(db, botId);
}

async function loadRuntimeBotConfigFromCommands(db: D1Database, botId: string): Promise<RuntimeBotConfig | null> {
  const result = await db.prepare("SELECT command, description, command_config FROM commands WHERE bot_id = ? AND is_enabled = 1 ORDER BY updated_at DESC, created_at DESC LIMIT 12").bind(botId).all<{ command: string; description?: string; command_config?: string }>();
  const rows = result.results ?? [];
  if (!rows.length) return null;
  const buttons = rows.map((row) => {
    try {
      const parsed = row.command_config ? JSON.parse(row.command_config) as { response?: string; label?: string } : {};
      return { label: parsed.label || row.description || `/${row.command}`, command: row.command, response: parsed.response || `Section ${row.description || row.command} is ready.` };
    } catch {
      return { label: row.description || `/${row.command}`, command: row.command, response: `Section ${row.description || row.command} is ready.` };
    }
  });
  return { welcomeText: ['Welcome', '', 'Choose an option:'].join('\n'), buttons, aiInstructions: 'Answer as the configured Telegram bot.' };
}

export async function loadRuntimeCommandResponse(env: Env, botId: string, text: string): Promise<string | null> {
  const db = getDb(env);
  if (!db) return null;
  const command = sanitizeCommand(text.replace(/^\//, '').split(/\s+/)[0] ?? '');
  if (!command) return null;
  const row = await db.prepare("SELECT command_config FROM commands WHERE bot_id = ? AND command = ? AND is_enabled = 1 LIMIT 1").bind(botId, command).first<{ command_config: string }>();
  if (!row?.command_config) return null;
  try { return (JSON.parse(row.command_config) as { response?: string }).response?.trim() || null; } catch { return null; }
}

export function buildRuntimeKeyboard(config: RuntimeBotConfig): Record<string, unknown> {
  return { keyboard: config.buttons.map((button) => [{ text: button.label }]), resize_keyboard: true, one_time_keyboard: false, input_field_placeholder: 'پیامت رو بنویس یا یک گزینه انتخاب کن...' };
}

export function planRuntimeConfigFromInstruction(instruction: string): RuntimeBotConfig {
  return { welcomeText: 'سلام، خوش آمدید.', buttons: [{ label: 'شروع', command: 'start', response: 'در خدمتم. درخواستت را بنویس.' }], aiInstructions: instruction };
}

export async function planRuntimeConfigWithAI(config: AppConfig, instruction: string, currentConfig?: RuntimeBotConfig | null): Promise<RuntimeBotConfig> {
  const fallback = mergeFallbackConfig(instruction, currentConfig);
  try {
    const raw = config.provider === 'grok' ? await callGrok(config, instruction, currentConfig) : await callOpenAI(config, instruction, currentConfig);
    return parseRuntimeConfig(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

async function callOpenAI(config: AppConfig, instruction: string, currentConfig?: RuntimeBotConfig | null): Promise<string> {
  const prompt = makePrompt(instruction, currentConfig);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.openAiApiKey}` },
    body: JSON.stringify({ model: config.openAiModel, input: [{ role: 'system', content: [{ type: 'input_text', text: 'Return only valid JSON.' }] }, { role: 'user', content: [{ type: 'input_text', text: prompt }] }], max_output_tokens: 2200 })
  });
  const payload = await response.json() as unknown;
  if (!response.ok) throw new Error('planner_failed');
  const text = readOpenAIText(payload);
  if (!text.trim()) throw new Error('empty_planner_output');
  return text;
}

async function callGrok(config: AppConfig, instruction: string, currentConfig?: RuntimeBotConfig | null): Promise<string> {
  const baseUrl = (config.xAiBaseUrl || 'https://api.x.ai/v1').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${config.xAiApiKey}` }, body: JSON.stringify({ model: config.xAiModel, messages: [{ role: 'system', content: 'Return only valid JSON.' }, { role: 'user', content: makePrompt(instruction, currentConfig) }], max_tokens: 2200 }) });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  if (!response.ok) throw new Error('planner_failed');
  return payload.choices?.[0]?.message?.content ?? '';
}

function makePrompt(instruction: string, currentConfig?: RuntimeBotConfig | null): string {
  return [
    'You are a real no-code Telegram bot builder.',
    'Convert the owner request into an executable runtime configuration, not an explanation.',
    'If there is an existing config, edit and extend it. Do not start from scratch unless the owner clearly asks for reset or rebuild from zero.',
    'The final bot must behave like the requested product. The aiInstructions field is the most important: write exact behavior rules so the runtime AI can answer users, collect data, guide flows, and act like the bot that was requested.',
    'Return full final JSON only with this schema:',
    '{"welcomeText":"string","aiInstructions":"string","buttons":[{"label":"string","command":"english_slug","response":"string"}]}',
    'Use Persian unless requested otherwise. Buttons are shortcuts; aiInstructions must cover everything the owner asked, including behavior for free-text messages.',
    'Current config:',
    JSON.stringify(currentConfig ?? { welcomeText: '', aiInstructions: '', buttons: [] }),
    'New owner request:',
    instruction
  ].join('\n');
}

function readOpenAIText(payload: unknown): string {
  const data = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text;
  const chunks: string[] = [];
  for (const item of data.output ?? []) for (const content of item.content ?? []) if (typeof content.text === 'string') chunks.push(content.text);
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
    return { label: String(button.label ?? '').trim().slice(0, 80), command: sanitizeCommand(String(button.command ?? 'menu')), response: String(button.response ?? '').trim().slice(0, 1800) };
  }).filter((button) => button.label && button.command && button.response).slice(0, 24);
  const aiInstructions = String(parsed.aiInstructions ?? '').trim().slice(0, 6000);
  if (!normalized.length && !aiInstructions) return null;
  return { welcomeText: String(parsed.welcomeText ?? '').trim().slice(0, 1800) || 'سلام، خوش آمدید.', buttons: normalized.length ? normalized : [{ label: 'شروع', command: 'start', response: 'در خدمتم. درخواستت را بنویس.' }], aiInstructions };
}

function mergeFallbackConfig(instruction: string, currentConfig?: RuntimeBotConfig | null): RuntimeBotConfig {
  if (!currentConfig) return planRuntimeConfigFromInstruction(instruction);
  return { ...currentConfig, aiInstructions: [currentConfig.aiInstructions ?? '', instruction].filter(Boolean).join('\n\n') };
}

function sanitizeCommand(value: string): string {
  return value.replace(/^\/+/, '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32) || 'menu';
}

async function ensureBuilderTables(db: D1Database): Promise<void> {
  await db.prepare("CREATE TABLE IF NOT EXISTS bot_builder_actions (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, bot_id TEXT NOT NULL, instruction TEXT NOT NULL, action_config TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
}

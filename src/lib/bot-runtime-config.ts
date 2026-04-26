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
}

export async function saveRuntimeBotConfig(env: Env, input: {
  workspaceId: string;
  botId: string;
  instruction: string;
  config: RuntimeBotConfig;
}): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  await ensureBuilderTables(db);

  const actionId = `bba_${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT INTO bot_builder_actions (id, workspace_id, bot_id, instruction, action_config, status)
    VALUES (?, ?, ?, ?, ?, 'applied')
  `).bind(actionId, input.workspaceId, input.botId, input.instruction.slice(0, 4000), JSON.stringify(input.config)).run();

  await db.prepare(`UPDATE menus SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE bot_id = ? AND menu_type = 'runtime_buttons'`).bind(input.botId).run();

  await db.prepare(`
    INSERT INTO menus (id, workspace_id, bot_id, name, menu_type, menu_config, is_active)
    VALUES (?, ?, ?, 'Runtime Button Menu', 'runtime_buttons', ?, 1)
  `).bind(`menu_${crypto.randomUUID()}`, input.workspaceId, input.botId, JSON.stringify(input.config)).run();

  for (const button of input.config.buttons) {
    await db.prepare(`
      INSERT INTO commands (id, workspace_id, bot_id, name, command, description, command_type, command_config, is_enabled)
      VALUES (?, ?, ?, ?, ?, ?, 'runtime_response', ?, 1)
      ON CONFLICT(bot_id, command) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        command_type = excluded.command_type,
        command_config = excluded.command_config,
        is_enabled = 1,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      `cmd_${crypto.randomUUID()}`,
      input.workspaceId,
      input.botId,
      button.label,
      sanitizeCommand(button.command),
      button.label,
      JSON.stringify({ label: button.label, response: button.response, source: 'no_code_builder' })
    ).run();
  }
}

export async function loadRuntimeBotConfig(env: Env, botId: string): Promise<RuntimeBotConfig | null> {
  const db = getDb(env);
  if (!db) return null;

  const row = await db.prepare(`
    SELECT menu_config FROM menus
    WHERE bot_id = ? AND menu_type = 'runtime_buttons' AND is_active = 1
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 1
  `).bind(botId).first<{ menu_config: string }>();

  if (row?.menu_config) {
    try {
      return JSON.parse(row.menu_config) as RuntimeBotConfig;
    } catch {
      // fall through to command fallback
    }
  }

  return loadRuntimeBotConfigFromCommands(db, botId);
}

async function loadRuntimeBotConfigFromCommands(db: D1Database, botId: string): Promise<RuntimeBotConfig | null> {
  const result = await db.prepare(`
    SELECT command, description, command_config FROM commands
    WHERE bot_id = ? AND is_enabled = 1
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 12
  `).bind(botId).all<{ command: string; description?: string; command_config?: string }>();

  const rows = result.results ?? [];
  if (!rows.length) return null;

  const buttons = rows.map((row) => {
    let response = `✅ بخش ${row.description || row.command} آماده است. درخواستت را بنویس.`;
    try {
      const parsed = row.command_config ? JSON.parse(row.command_config) as { response?: string; label?: string } : {};
      response = parsed.response?.trim() || response;
      return {
        label: parsed.label?.trim() || row.description || `/${row.command}`,
        command: row.command,
        response
      };
    } catch {
      return { label: row.description || `/${row.command}`, command: row.command, response };
    }
  });

  return {
    welcomeText: ['به ربات خوش آمدید ✨', '', 'از دکمه‌های زیر استفاده کن:', ...buttons.map((button) => `• ${button.label}`)].join('\n'),
    buttons
  };
}

export async function loadRuntimeCommandResponse(env: Env, botId: string, text: string): Promise<string | null> {
  const db = getDb(env);
  if (!db) return null;
  const command = sanitizeCommand(text.replace(/^\//, '').split(/\s+/)[0] ?? '');
  if (!command) return null;

  const row = await db.prepare(`
    SELECT command_config FROM commands
    WHERE bot_id = ? AND command = ? AND is_enabled = 1
    LIMIT 1
  `).bind(botId, command).first<{ command_config: string }>();

  if (!row?.command_config) return null;
  try {
    const parsed = JSON.parse(row.command_config) as { response?: string };
    return parsed.response?.trim() || null;
  } catch {
    return null;
  }
}

export function buildRuntimeKeyboard(config: RuntimeBotConfig): Record<string, unknown> {
  const rows = config.buttons.map((button) => [{ text: button.label }]);
  return {
    keyboard: rows,
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: 'یک گزینه را انتخاب کن...'
  };
}

export function planRuntimeConfigFromInstruction(instruction: string): RuntimeBotConfig {
  const buttons = inferButtons(instruction);
  return {
    welcomeText: buildWelcomeText(instruction, buttons),
    buttons
  };
}

export async function planRuntimeConfigWithAI(config: AppConfig, instruction: string): Promise<RuntimeBotConfig> {
  const fallback = planRuntimeConfigFromInstruction(instruction);
  const prompt = [
    'You are a Telegram bot builder agent. Convert the owner instruction into an executable Telegram bot runtime config.',
    'Return ONLY valid JSON. No markdown. No code fences.',
    'JSON schema: {"welcomeText":"string","buttons":[{"label":"string","command":"english_slug","response":"string"}]}',
    'Rules:',
    '- Build exactly what the owner asks for, not generic placeholders.',
    '- Use Persian text unless the owner asks otherwise.',
    '- Button labels can include emoji and Persian text.',
    '- command must be lowercase English letters, numbers, or underscore, max 32 chars.',
    '- response must be the real useful response that the final user sees when pressing that button.',
    '- Create 2 to 10 buttons depending on the request.',
    '- Do not mention implementation, code, database, or limitations.',
    '',
    'Owner instruction:',
    instruction
  ].join('\n');

  try {
    const text = config.provider === 'grok'
      ? await callGrokPlanner(config, prompt)
      : await callOpenAiPlanner(config, prompt);
    const parsed = parseRuntimePlannerJson(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

async function callOpenAiPlanner(config: AppConfig, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: 'Return compact JSON only.' }] },
        { role: 'user', content: [{ type: 'input_text', text: prompt }] }
      ],
      max_output_tokens: 900
    })
  });
  if (!response.ok) throw new Error('planner_openai_failed');
  const payload = await response.json() as { output_text?: string };
  return payload.output_text ?? '';
}

async function callGrokPlanner(config: AppConfig, prompt: string): Promise<string> {
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
        { role: 'system', content: 'Return compact JSON only.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 900
    })
  });
  if (!response.ok) throw new Error('planner_grok_failed');
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content ?? '';
}

function parseRuntimePlannerJson(text: string): RuntimeBotConfig | null {
  const clean = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  const parsed = JSON.parse(clean.slice(start, end + 1)) as Partial<RuntimeBotConfig>;
  const buttons = Array.isArray(parsed.buttons) ? parsed.buttons : [];
  const normalizedButtons = buttons
    .map((button) => ({
      label: String((button as RuntimeButton).label ?? '').trim().slice(0, 80),
      command: sanitizeCommand(String((button as RuntimeButton).command ?? 'menu')),
      response: String((button as RuntimeButton).response ?? '').trim().slice(0, 1200)
    }))
    .filter((button) => button.label && button.command && button.response)
    .slice(0, 10);

  if (!normalizedButtons.length) return null;
  return {
    welcomeText: String(parsed.welcomeText ?? '').trim().slice(0, 1200) || buildWelcomeText('', normalizedButtons),
    buttons: normalizedButtons
  };
}

function inferButtons(text: string): RuntimeButton[] {
  const explicit = extractQuotedLabels(text);
  const labels = explicit.length ? explicit : inferLabelsByIntent(text);
  return labels.slice(0, 10).map((label) => ({
    label,
    command: labelToCommand(label),
    response: buildButtonResponse(label, text)
  }));
}

function extractQuotedLabels(text: string): string[] {
  return [...text.matchAll(/["'«»“”](.*?)["'«»“”]/g)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value && value.length > 1));
}

function inferLabelsByIntent(text: string): string[] {
  const labels: string[] = [];
  if (/فروشگاه|محصول|کالا|shop|product/i.test(text)) labels.push('🛒 فروشگاه');
  if (/سبد|cart/i.test(text)) labels.push('🧾 سبد خرید');
  if (/قیمت|تعرفه|price/i.test(text)) labels.push('💳 قیمت‌ها');
  if (/پشتیبان|تماس|support|contact/i.test(text)) labels.push('☎️ پشتیبانی');
  if (/راهنما|help/i.test(text)) labels.push('ℹ️ راهنما');
  if (/دانلود|download/i.test(text)) labels.push('📥 دانلود');
  if (/اینستاگرام|instagram/i.test(text)) labels.push('📸 اینستاگرام');
  if (!labels.length) labels.push('🚀 شروع', 'ℹ️ راهنما', '☎️ پشتیبانی');
  return [...new Set(labels)];
}

function buildWelcomeText(instruction: string, buttons: RuntimeButton[]): string {
  const title = /فروشگاه|shop/i.test(instruction) ? 'به فروشگاه خوش آمدید ✨' : 'به ربات خوش آمدید ✨';
  return [title, '', 'از دکمه‌های زیر استفاده کن:', ...buttons.map((button) => `• ${button.label}`)].join('\n');
}

function buildButtonResponse(label: string, instruction: string): string {
  if (/فروشگاه|محصول|کالا|shop|product/i.test(label)) return '🛒 بخش فروشگاه آماده است. محصولات و گزینه‌های خرید اینجا نمایش داده می‌شوند.';
  if (/سبد|cart/i.test(label)) return '🧾 سبد خرید شما فعلاً خالی است. یک محصول انتخاب کن تا به سبد اضافه شود.';
  if (/قیمت|تعرفه|price/i.test(label)) return '💳 لیست قیمت‌ها اینجا نمایش داده می‌شود. برای جزئیات بیشتر پیام بده.';
  if (/پشتیبان|تماس|support|contact/i.test(label)) return '☎️ برای پشتیبانی پیام خودت را همینجا بنویس تا راهنمایی‌ات کنم.';
  if (/راهنما|help/i.test(label)) return 'ℹ️ از دکمه‌ها استفاده کن یا درخواستت را مستقیم بنویس.';
  return `✅ بخش ${label} آماده شد. درخواستت را بنویس تا انجامش بدهم.`;
}

function labelToCommand(label: string): string {
  const known: Array<[RegExp, string]> = [
    [/فروشگاه|محصول|کالا|shop|product/, 'products'],
    [/سبد|cart/, 'cart'],
    [/قیمت|تعرفه|price/, 'pricing'],
    [/پشتیبان|تماس|support|contact/, 'support'],
    [/راهنما|help/, 'help'],
    [/دانلود|download/, 'download'],
    [/اینستاگرام|instagram/, 'instagram'],
    [/شروع|start/, 'start']
  ];
  const found = known.find(([pattern]) => pattern.test(label.toLowerCase()))?.[1];
  return (found ?? sanitizeCommand(label)) || 'menu';
}

function sanitizeCommand(value: string): string {
  return value
    .replace(/^\/+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

async function ensureBuilderTables(db: D1Database): Promise<void> {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS bot_builder_actions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      bot_id TEXT NOT NULL,
      instruction TEXT NOT NULL,
      action_config TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

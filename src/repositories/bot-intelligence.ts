import type { Env } from '../types/env';
import { getDb } from '../db/client';

export interface BotStats {
  privateChats: number;
  groupChats: number;
  totalChats: number;
}

export type ProjectIntent = 'none' | 'bot_id' | 'bot_stats' | 'bot_menu' | 'project_memory';

export interface BotMemoryInput {
  workspaceId: string;
  botId?: string | null;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  sourceType?: string;
}

export interface BotMenuCommand {
  command: string;
  description: string;
}

export interface BotMenuResult {
  menuId: string;
  commands: BotMenuCommand[];
}

const DEFAULT_COMMANDS: BotMenuCommand[] = [
  { command: 'start', description: 'شروع و معرفی ربات' },
  { command: 'help', description: 'راهنمای استفاده از ربات' },
  { command: 'stats', description: 'نمایش آمار کاربران ربات' },
  { command: 'id', description: 'نمایش آیدی عددی ربات' }
];

export async function getBotStats(env: Env, botId: string): Promise<BotStats> {
  const db = getDb(env);
  if (!db) return { privateChats: 0, groupChats: 0, totalChats: 0 };

  const row = await db.prepare(`
    SELECT
      SUM(CASE WHEN chat_type = 'private' THEN 1 ELSE 0 END) AS private_chats,
      SUM(CASE WHEN chat_type != 'private' THEN 1 ELSE 0 END) AS group_chats,
      COUNT(*) AS total_chats
    FROM telegram_chats
    WHERE bot_id = ? AND is_active = 1
  `).bind(botId).first<{ private_chats?: number | null; group_chats?: number | null; total_chats?: number | null }>();

  return {
    privateChats: Number(row?.private_chats ?? 0),
    groupChats: Number(row?.group_chats ?? 0),
    totalChats: Number(row?.total_chats ?? 0)
  };
}

export async function saveBotMemory(env: Env, input: BotMemoryInput): Promise<string | null> {
  const db = getDb(env);
  if (!db || !input.workspaceId || !input.content.trim()) return null;

  const id = `ks_${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT INTO knowledge_sources (id, workspace_id, bot_id, source_type, title, content, metadata, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    id,
    input.workspaceId,
    input.botId ?? null,
    input.sourceType ?? 'bot_memory',
    input.title.slice(0, 180),
    input.content.slice(0, 8000),
    JSON.stringify(input.metadata ?? {})
  ).run();

  return id;
}

export async function saveActionLog(env: Env, input: {
  workspaceId: string;
  botId?: string | null;
  chatId?: string | null;
  actorId?: string | null;
  actionType: string;
  inputPayload?: unknown;
  outputPayload?: unknown;
  status: 'success' | 'failed' | 'skipped';
  errorMessage?: string;
}): Promise<void> {
  const db = getDb(env);
  if (!db || !input.workspaceId) return;

  await db.prepare(`
    INSERT INTO action_logs (id, workspace_id, bot_id, chat_id, actor_type, actor_id, action_type, input_payload, output_payload, status, error_message)
    VALUES (?, ?, ?, ?, 'telegram_user', ?, ?, ?, ?, ?, ?)
  `).bind(
    `act_${crypto.randomUUID()}`,
    input.workspaceId,
    input.botId ?? null,
    input.chatId ?? null,
    input.actorId ?? null,
    input.actionType,
    JSON.stringify(input.inputPayload ?? null),
    JSON.stringify(input.outputPayload ?? null),
    input.status,
    input.errorMessage ?? null
  ).run();
}

export async function createBotCommandMenu(env: Env, input: {
  workspaceId: string;
  botId: string;
  requestText: string;
}): Promise<BotMenuResult> {
  const db = getDb(env);
  const commands = extractRequestedCommands(input.requestText);
  const menuId = `menu_${crypto.randomUUID()}`;

  if (!db) return { menuId, commands };

  await db.prepare(`
    INSERT INTO menus (id, workspace_id, bot_id, name, menu_type, menu_config, is_active)
    VALUES (?, ?, ?, ?, 'bot_commands', ?, 1)
  `).bind(
    menuId,
    input.workspaceId,
    input.botId,
    'Telegram Bot Commands Menu',
    JSON.stringify({ commands, createdFrom: input.requestText.slice(0, 1000) })
  ).run();

  for (const item of commands) {
    await db.prepare(`
      INSERT INTO commands (id, workspace_id, bot_id, name, command, description, command_type, command_config, is_enabled)
      VALUES (?, ?, ?, ?, ?, ?, 'telegram_command', ?, 1)
      ON CONFLICT(bot_id, command) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        command_config = excluded.command_config,
        updated_at = CURRENT_TIMESTAMP,
        is_enabled = 1
    `).bind(
      `cmd_${crypto.randomUUID()}`,
      input.workspaceId,
      input.botId,
      item.description,
      item.command,
      item.description,
      JSON.stringify({ source: 'ai_assistant_menu_builder' })
    ).run();
  }

  return { menuId, commands };
}

export function buildProjectIntelligencePrompt(input: {
  basePrompt: string;
  provider: string;
  botUsername?: string;
  botTelegramId?: string;
  stats?: BotStats | null;
}): string {
  const statsText = input.stats
    ? `آمار فعلی قابل دسترس: ${input.stats.privateChats} چت خصوصی، ${input.stats.groupChats} گروه/کانال، مجموع ${input.stats.totalChats} چت.`
    : 'اگر آمار دقیق لازم بود، باید از ابزار داخلی ربات خوانده شود.';

  return [
    input.basePrompt,
    '',
    'نقش ویژه تو در این پروژه:',
    '- تو دستیار مدیریتی و سازنده ربات‌های تلگرام این پروژه هستی، نه فقط یک چت‌بات عمومی.',
    '- درباره قابلیت‌های خودت صریح و عملی جواب بده: مدیریت ربات، توضیح تنظیمات، ساخت متن دکمه/منو/کامند، تحلیل خطا، راهنمای deploy، و کمک به توسعه قابلیت‌های تلگرام.',
    '- اگر کاربر درباره ربات خودش پرسید، با توجه به کانتکست پروژه جواب بده؛ برای آمار، آیدی عددی، منو و دستورات، webhook قبل از مدل ابزارهای داخلی را اجرا می‌کند.',
    '- اگر کد، پرامپت، تنظیمات، منو یا دستور تولید کردی، آن خروجی باید قابل ذخیره‌سازی در حافظه پروژه باشد.',
    '- هیچ‌وقت ادعا نکن کاری واقعاً در Telegram یا دیتابیس انجام شده مگر webhook یا ابزار داخلی آن را انجام داده باشد.',
    '- پاسخ‌ها را فارسی، کوتاه، عملی و مناسب مالک ربات بنویس.',
    '',
    `Provider فعلی: ${input.provider}`,
    `ربات هدف: ${input.botUsername ? '@' + input.botUsername : 'نامشخص'}`,
    `آیدی عددی ربات هدف: ${input.botTelegramId ?? 'نامشخص'}`,
    statsText
  ].join('\n');
}

export function extractGeneratedCode(reply: string): string | null {
  const blocks = [...reply.matchAll(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g)].map((match) => match[1]?.trim()).filter(Boolean);
  if (blocks.length === 0) return null;
  return blocks.join('\n\n---\n\n').slice(0, 8000);
}

export function detectProjectIntent(text: string): ProjectIntent {
  const normalized = text.toLowerCase();
  if (/^\/id\b/i.test(normalized) || /(آیدی|ایدی|id).*(عددی|number|ربات|bot)/i.test(normalized)) return 'bot_id';
  if (/^\/stats\b/i.test(normalized) || /(چند|تعداد|آمار|کاربر|یوزر|users|stats).*(ربات|چت|chat|استفاده|کار)/i.test(normalized)) return 'bot_stats';
  if (/(منو|دکمه|کامند|command|menu|button).*(بساز|درست|اضافه|ثبت|ایجاد|create|make|add)/i.test(normalized)) return 'bot_menu';
  if (/(یادت\s*باشه|به\s*خاطر\s*بسپار|ذخیره\s*کن|سیو\s*کن|مموری|memory|remember)/i.test(normalized)) return 'project_memory';
  return 'none';
}

export function extractMemoryContent(text: string): string {
  return text
    .replace(/^(لطفا|لطفاً)\s*/i, '')
    .replace(/(یادت\s*باشه|به\s*خاطر\s*بسپار|ذخیره\s*کن|سیو\s*کن|مموری|memory|remember)[:：،\s]*/i, '')
    .trim() || text.trim();
}

export function formatBotStatsReply(botUsername: string, stats: BotStats): string {
  return [
    `آمار ربات @${botUsername}:`,
    `چت‌های خصوصی: ${stats.privateChats}`,
    `گروه‌ها/کانال‌ها: ${stats.groupChats}`,
    `مجموع چت‌های ثبت‌شده: ${stats.totalChats}`
  ].join('\n');
}

export function formatCommandMenuReply(commands: BotMenuCommand[], telegramOk: boolean, error?: string): string {
  const lines = commands.map((item) => `/${item.command} - ${item.description}`).join('\n');
  return telegramOk
    ? `منوی دستورات ساخته و روی تلگرام ثبت شد:\n${lines}`
    : `منو ذخیره شد ولی ثبت روی تلگرام خطا داد: ${error ?? 'unknown_error'}\n${lines}`;
}

function extractRequestedCommands(text: string): BotMenuCommand[] {
  const quoted = [...text.matchAll(/["'«»“”](.*?)["'«»“”]/g)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value && value.length >= 2));

  const slashCommands = [...text.matchAll(/\/([a-zA-Z][a-zA-Z0-9_]{1,31})(?:\s*[-:،]\s*([^\n،,]+))?/g)]
    .map((match) => ({ command: match[1], description: (match[2] || match[1]).trim() }));

  const inferredLabels = quoted.length ? quoted : inferPersianMenuLabels(text);
  const inferredCommands = inferredLabels.map((label) => ({
    command: toCommandName(label),
    description: label.slice(0, 80)
  }));

  const merged = [...slashCommands, ...inferredCommands, ...DEFAULT_COMMANDS];
  const seen = new Set<string>();
  const unique: BotMenuCommand[] = [];

  for (const item of merged) {
    const command = sanitizeCommand(item.command);
    if (!command || seen.has(command)) continue;
    seen.add(command);
    unique.push({ command, description: sanitizeDescription(item.description || command) });
    if (unique.length >= 20) break;
  }

  return unique;
}

function inferPersianMenuLabels(text: string): string[] {
  const labels: string[] = [];
  if (/محصول|کالا|فروشگاه|shop|product/i.test(text)) labels.push('محصولات');
  if (/قیمت|تعرفه|پلن|price|plan/i.test(text)) labels.push('قیمت‌ها');
  if (/پشتیبان|تماس|ارتباط|support|contact/i.test(text)) labels.push('پشتیبانی');
  if (/ثبت سفارش|سفارش|order/i.test(text)) labels.push('ثبت سفارش');
  if (/راهنما|help/i.test(text)) labels.push('راهنما');
  return labels.length ? labels : ['راهنما', 'پشتیبانی', 'آمار ربات'];
}

function toCommandName(label: string): string {
  const lower = label.toLowerCase();
  const known: Array<[RegExp, string]> = [
    [/محصول|کالا|product|shop/, 'products'],
    [/قیمت|تعرفه|پلن|price|plan/, 'pricing'],
    [/پشتیبان|تماس|ارتباط|support|contact/, 'support'],
    [/سفارش|order/, 'order'],
    [/آمار|stats/, 'stats'],
    [/راهنما|help/, 'help']
  ];
  const mapped = known.find(([pattern]) => pattern.test(lower))?.[1];
  if (mapped) return mapped;
  return lower.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32) || 'menu';
}

function sanitizeCommand(value: string): string {
  return value.replace(/^\//, '').toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '').slice(0, 32);
}

function sanitizeDescription(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 256) || 'دستور ربات';
}

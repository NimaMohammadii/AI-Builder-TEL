import type { AppConfig, Env } from '../types/env';
import { ensureDefaultAiProfile } from '../repositories/ai-profiles';
import { setBotCommands } from './telegram';

export interface ResetBuiltBotInput {
  env: Env;
  config: AppConfig;
  workspaceId: string;
  botId: string;
  botToken?: string;
}

export interface ResetBuiltBotResult {
  ok: boolean;
  details: string[];
}

export async function resetBuiltBot(input: ResetBuiltBotInput): Promise<ResetBuiltBotResult> {
  const db = input.env.DB;
  const details: string[] = [];
  if (!db) return { ok: false, details: ['D1 database در دسترس نیست.'] };

  await db.prepare(`DELETE FROM commands WHERE bot_id = ?`).bind(input.botId).run();
  details.push('همه کامندهای ساخته‌شده حذف شدند.');

  await db.prepare(`DELETE FROM menus WHERE bot_id = ?`).bind(input.botId).run();
  details.push('همه منوهای ساخته‌شده حذف شدند.');

  await db.prepare(`DELETE FROM rules WHERE bot_id = ?`).bind(input.botId).run();
  details.push('همه ruleهای مربوط به ربات حذف شدند.');

  await db.prepare(`DELETE FROM automations WHERE bot_id = ?`).bind(input.botId).run();
  details.push('همه automationهای مربوط به ربات حذف شدند.');

  await db.prepare(`DELETE FROM knowledge_sources WHERE bot_id = ? AND source_type IN ('no_code_builder', 'project_memory', 'bot_memory')`).bind(input.botId).run();
  details.push('حافظه‌ها و دستورهای ذخیره‌شده مربوط به ساخت حذف شدند.');

  await db.prepare(`DELETE FROM action_logs WHERE bot_id = ? AND action_type LIKE '%builder%'`).bind(input.botId).run();
  details.push('لاگ‌های builder حذف شدند.');

  await ensureBuilderTable(db);
  await db.prepare(`DELETE FROM bot_builder_actions WHERE bot_id = ?`).bind(input.botId).run();
  details.push('تاریخچه ساخت no-code حذف شد.');

  await ensureDefaultAiProfile(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    prompt: input.config.systemPrompt,
    model: input.config.openAiModel
  });
  await db.prepare(`UPDATE ai_profiles SET reply_mode = 'auto', updated_at = CURRENT_TIMESTAMP WHERE bot_id = ? AND is_default = 1`).bind(input.botId).run();
  details.push('پرامپت و رفتار AI به حالت پیش‌فرض برگشت.');

  if (input.botToken) {
    const commandConfig = { ...input.config, telegramBotToken: input.botToken };
    const telegram = await setBotCommands(commandConfig, []);
    details.push(telegram.ok ? 'کامندهای ثبت‌شده روی تلگرام هم پاک شدند.' : `پاک‌کردن کامندهای تلگرام خطا داد: ${telegram.description ?? 'unknown'}`);
  }

  return { ok: true, details };
}

async function ensureBuilderTable(db: D1Database): Promise<void> {
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

export function formatResetBuiltBotResult(result: ResetBuiltBotResult): string {
  return [
    result.ok ? '♻️ ربات از ریشه ریست شد' : '⚠️ ریست ربات کامل نشد',
    '',
    ...result.details.map((item) => `• ${item}`),
    '',
    'حالا می‌تونی دوباره از صفر دستور ساخت بدی.'
  ].join('\n');
}

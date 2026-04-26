import type { Env } from '../types/env';
import { getDb } from '../db/client';
import { findWorkspaceBotByWorkspaceId } from './telegram-bots';
import { getDefaultAiProfileByBotId } from './ai-profiles';

export interface ConnectPanelStatus {
  hasBot: boolean;
  botId?: string;
  botUsername?: string;
  botTelegramId?: string;
  botName?: string;
  tokenLast4?: string;
  aiEnabled: boolean;
  model?: string;
  prompt?: string;
}

export async function getConnectPanelStatus(env: Env, workspaceId: string): Promise<ConnectPanelStatus> {
  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId);
  if (!bot) return { hasBot: false, aiEnabled: false };

  const db = getDb(env);
  const row = db
    ? await db.prepare(`SELECT token_last4 FROM telegram_bots WHERE id = ? LIMIT 1`).bind(bot.id).first<{ token_last4?: string }>()
    : null;
  const profile = await getDefaultAiProfileByBotId(env, bot.id);
  const aiEnabled = profile?.reply_mode !== 'disabled';

  return {
    hasBot: true,
    botId: bot.id,
    botUsername: bot.bot_username,
    botTelegramId: bot.telegram_bot_id,
    botName: bot.bot_name,
    tokenLast4: row?.token_last4,
    aiEnabled,
    model: profile?.model,
    prompt: profile?.system_prompt
  };
}

export async function setAiEnabled(env: Env, workspaceId: string, enabled: boolean): Promise<boolean> {
  const db = getDb(env);
  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId);
  if (!db || !bot) return false;

  await db.prepare(`UPDATE ai_profiles SET reply_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE bot_id = ? AND is_default = 1`)
    .bind(enabled ? 'auto' : 'disabled', bot.id)
    .run();
  return true;
}

export async function deactivateWorkspaceBot(env: Env, workspaceId: string): Promise<boolean> {
  const db = getDb(env);
  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId);
  if (!db || !bot) return false;

  await db.prepare(`UPDATE telegram_bots SET is_active = 0, encrypted_token = '', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(bot.id)
    .run();
  return true;
}

export function formatConnectPanel(status: ConnectPanelStatus): string {
  if (!status.hasBot) {
    return [
      '🔌 Connect',
      '',
      'هنوز هیچ رباتی وصل نیست.',
      '',
      'برای اتصال، توکن رباتت رو با این فرمت بفرست:',
      '/connect <telegram_bot_token>'
    ].join('\n');
  }

  const prompt = status.prompt?.trim() ? status.prompt.trim().slice(0, 900) : 'پرامپت پیش‌فرض هنوز ثبت نشده.';
  return [
    '🔌 Connect Panel',
    '',
    `ربات وصل‌شده: @${status.botUsername}`,
    `نام: ${status.botName ?? 'نامشخص'}`,
    `آیدی عددی: ${status.botTelegramId}`,
    `توکن: ${status.tokenLast4 ? '••••' + status.tokenLast4 : 'ثبت شده'}`,
    `AI: ${status.aiEnabled ? 'فعال' : 'غیرفعال'}`,
    `مدل: ${status.model ?? 'نامشخص'}`,
    '',
    'پرامپت فعلی:',
    prompt
  ].join('\n');
}

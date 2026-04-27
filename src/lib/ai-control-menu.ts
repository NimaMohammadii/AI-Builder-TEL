import type { Env } from '../types/env';
import type { TelegramUiMarkup } from './telegram-ui';
import { getConnectPanelStatus, type ConnectPanelStatus } from '../repositories/connect-panel';
import { findWorkspaceBotByWorkspaceId } from '../repositories/telegram-bots';
import { ensureDefaultAiProfile } from '../repositories/ai-profiles';
import { getDb } from '../db/client';

export const AI_MENU_BUTTON_TEXT = '🤖 AI';

export function isAiMenuRequest(text: string): boolean {
  return text.trim() === AI_MENU_BUTTON_TEXT || text.trim() === '/ai';
}

export async function getAiPanelStatus(env: Env, workspaceId: string): Promise<ConnectPanelStatus> {
  return getConnectPanelStatus(env, workspaceId);
}

export function buildAiPanelText(status: ConnectPanelStatus): string {
  if (!status.hasBot) {
    return [
      '🤖 AI Panel',
      '',
      'هنوز رباتی وصل نشده.',
      'اول از بخش «کانکت» ربات کاربر رو وصل کن، بعد می‌تونی AI همون ربات رو مدیریت کنی.'
    ].join('\n');
  }

  const prompt = status.prompt?.trim() ? status.prompt.trim().slice(0, 2500) : 'پرامپتی ثبت نشده.';
  return [
    '🤖 AI Panel',
    '',
    `ربات: @${status.botUsername}`,
    `وضعیت AI: ${status.aiEnabled ? '✅ فعال' : '⛔️ غیرفعال'}`,
    `مدل: ${status.model ?? 'نامشخص'}`,
    '',
    'پرامپت فعلی AI این ربات:',
    '━━━━━━━━━━━━',
    prompt,
    '━━━━━━━━━━━━',
    '',
    'از دکمه‌های زیر برای مدیریت AI همین ربات استفاده کن.'
  ].join('\n');
}

export function buildAiPanelKeyboard(status: ConnectPanelStatus): TelegramUiMarkup {
  return {
    inline_keyboard: [
      [
        { text: status.aiEnabled ? '⛔️ غیرفعال کردن AI' : '✅ فعال کردن AI', callback_data: 'ai:toggle' },
        { text: '✍️ تغییر پرامپت', callback_data: 'ai:change_prompt' }
      ],
      [
        { text: '🔄 بروزرسانی وضعیت', callback_data: 'ai:refresh' }
      ]
    ]
  };
}

export async function updateWorkspaceBotPrompt(env: Env, input: {
  workspaceId: string;
  prompt: string;
  model: string;
}): Promise<boolean> {
  const bot = await findWorkspaceBotByWorkspaceId(env, input.workspaceId);
  if (!bot) return false;
  await ensureDefaultAiProfile(env, {
    workspaceId: input.workspaceId,
    botId: bot.id,
    prompt: input.prompt,
    model: input.model
  });
  const db = getDb(env);
  if (db) {
    await db.prepare("UPDATE ai_profiles SET reply_mode = COALESCE(reply_mode, 'auto'), updated_at = CURRENT_TIMESTAMP WHERE bot_id = ? AND is_default = 1")
      .bind(bot.id)
      .run();
  }
  return true;
}

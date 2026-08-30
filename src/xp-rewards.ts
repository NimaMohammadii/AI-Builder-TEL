import { addUserXp } from './levels';
import type { Env, TelegramChat } from './types';

const DEPOSIT_XP = 100;
const GROUP_REPLY_MILESTONE = 10;
const GROUP_REPLY_XP = 30;

type GroupOwnerRow = { added_by_user_id: string | null };
type GroupXpRow = { reply_count: number; rewarded_count: number };

export async function awardDepositXp(env: Env, userId: string, referenceType: string, referenceId: string): Promise<void> {
  const eventId = `deposit_${referenceType}_${referenceId}`;
  await addUserXp(env, userId, DEPOSIT_XP, 'deposit', { referenceType, referenceId }, eventId).catch((error) => console.warn('deposit XP reward skipped', error));
}

export async function awardGroupReplyXp(env: Env, chat: TelegramChat): Promise<void> {
  await ensureGroupXpTables(env);
  const chatId = String(chat.id);
  const owner = await env.DB.prepare("SELECT added_by_user_id FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?")
    .bind(chatId)
    .first<GroupOwnerRow>()
    .catch(() => null);
  const userId = cleanUserId(owner?.added_by_user_id || '');
  if (!userId) return;

  await env.DB.prepare(`INSERT INTO group_reply_xp (chat_id, user_id, reply_count, rewarded_count, updated_at)
    VALUES (?, ?, 0, 0, CURRENT_TIMESTAMP)
    ON CONFLICT(chat_id, user_id) DO NOTHING`)
    .bind(chatId, userId)
    .run();

  await env.DB.prepare(`UPDATE group_reply_xp
    SET reply_count = reply_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE chat_id = ? AND user_id = ?`)
    .bind(chatId, userId)
    .run();

  const row = await env.DB.prepare('SELECT reply_count, rewarded_count FROM group_reply_xp WHERE chat_id = ? AND user_id = ?')
    .bind(chatId, userId)
    .first<GroupXpRow>();
  const replyCount = Math.max(0, Math.floor(Number(row?.reply_count) || 0));
  const rewardedCount = Math.max(0, Math.floor(Number(row?.rewarded_count) || 0));
  const due = Math.floor(replyCount / GROUP_REPLY_MILESTONE) - rewardedCount;
  if (due < 1) return;

  await env.DB.prepare(`UPDATE group_reply_xp
    SET rewarded_count = rewarded_count + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE chat_id = ? AND user_id = ?`)
    .bind(due, chatId, userId)
    .run();

  await addUserXp(env, userId, due * GROUP_REPLY_XP, 'group-replies', {
    chatId,
    milestones: due,
    replyCount,
    every: GROUP_REPLY_MILESTONE,
  }).catch((error) => console.warn('group reply XP reward skipped', error));
}

async function ensureGroupXpTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS group_reply_xp (
    chat_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reply_count INTEGER NOT NULL DEFAULT 0,
    rewarded_count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, user_id)
  )`).run();
}

function cleanUserId(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
}

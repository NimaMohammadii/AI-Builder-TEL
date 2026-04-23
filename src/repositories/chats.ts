import type { Env } from '../types/env';
import { getDb } from '../db/client';

export async function upsertChat(env: Env, input: {
  workspaceId: string;
  botId?: string;
  telegramChatId: number;
  chatType: string;
  title?: string;
  username?: string;
}) {
  const db = getDb(env);
  const id = `chat_${input.telegramChatId}`;

  await db.prepare(`
    INSERT INTO telegram_chats (id, workspace_id, bot_id, telegram_chat_id, chat_type, title, username)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(bot_id, telegram_chat_id) DO UPDATE SET
      title = excluded.title,
      username = excluded.username,
      updated_at = CURRENT_TIMESTAMP
  `)
  .bind(
    id,
    input.workspaceId,
    input.botId ?? null,
    input.telegramChatId,
    input.chatType,
    input.title ?? null,
    input.username ?? null
  )
  .run();

  return { id };
}

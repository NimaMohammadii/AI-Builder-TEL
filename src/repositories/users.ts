import type { Env } from '../types/env';
import { getDb } from '../db/client';

export async function upsertTelegramUser(env: Env, input: {
  telegramUserId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}) {
  const db = getDb(env);
  const id = `tgusr_${input.telegramUserId}`;

  if (!db) {
    return { id };
  }

  await db
    .prepare(`
      INSERT INTO users (id, telegram_user_id, username, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        username = excluded.username,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      id,
      String(input.telegramUserId),
      input.username ?? null,
      input.firstName ?? null,
      input.lastName ?? null
    )
    .run();

  return { id };
}

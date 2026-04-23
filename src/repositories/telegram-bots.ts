import type { Env } from '../types/env';
import { getDb } from '../db/client';

export async function upsertManagedTelegramBot(env: Env, input: {
  workspaceId: string;
  telegramBotId: string;
  botUsername: string;
  botName?: string;
  encryptedToken: string;
}) {
  const db = getDb(env);
  const existing = await db
    .prepare(`SELECT id FROM telegram_bots WHERE telegram_bot_id = ? LIMIT 1`)
    .bind(input.telegramBotId)
    .first<{ id: string }>();

  if (existing?.id) {
    await db
      .prepare(`
        UPDATE telegram_bots
        SET workspace_id = ?, bot_username = ?, bot_name = ?, encrypted_token = ?, updated_at = CURRENT_TIMESTAMP, is_active = 1
        WHERE id = ?
      `)
      .bind(input.workspaceId, input.botUsername, input.botName ?? null, input.encryptedToken, existing.id)
      .run();

    return { id: existing.id };
  }

  const id = `bot_${crypto.randomUUID()}`;
  await db
    .prepare(`
      INSERT INTO telegram_bots (id, workspace_id, bot_type, telegram_bot_id, bot_username, bot_name, encrypted_token, token_last4, is_active)
      VALUES (?, ?, 'customer', ?, ?, ?, ?, ?, 1)
    `)
    .bind(
      id,
      input.workspaceId,
      input.telegramBotId,
      input.botUsername,
      input.botName ?? null,
      input.encryptedToken,
      input.encryptedToken.slice(-4)
    )
    .run();

  return { id };
}

export async function findWorkspaceBotByUsername(env: Env, botUsername: string) {
  const db = getDb(env);
  return db
    .prepare(`SELECT id, workspace_id, telegram_bot_id, bot_username, bot_name, encrypted_token FROM telegram_bots WHERE bot_username = ? AND is_active = 1 LIMIT 1`)
    .bind(botUsername)
    .first<{
      id: string;
      workspace_id: string;
      telegram_bot_id: string;
      bot_username: string;
      bot_name?: string;
      encrypted_token: string;
    }>();
}

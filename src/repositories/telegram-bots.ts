import type { Env } from '../types/env';
import { getDb } from '../db/client';

type ManagedBotRecord = {
  id: string;
  workspace_id: string;
  telegram_bot_id: string;
  bot_username: string;
  bot_name?: string;
  encrypted_token: string;
};

export async function upsertManagedTelegramBot(env: Env, input: {
  workspaceId: string;
  telegramBotId: string;
  botUsername: string;
  botName?: string;
  encryptedToken: string;
}) {
  const db = getDb(env);
  if (!db) return { id: `bot_${input.telegramBotId}` };

  const existing = await db.prepare(`SELECT id FROM telegram_bots WHERE telegram_bot_id = ? LIMIT 1`).bind(input.telegramBotId).first<{ id: string }>();

  if (existing?.id) {
    await db.prepare(`UPDATE telegram_bots SET workspace_id = ?, bot_username = ?, bot_name = ?, encrypted_token = ?, updated_at = CURRENT_TIMESTAMP, is_active = 1 WHERE id = ?`).bind(input.workspaceId, input.botUsername, input.botName ?? null, input.encryptedToken, existing.id).run();
    return { id: existing.id };
  }

  const id = `bot_${crypto.randomUUID()}`;
  await db.prepare(`INSERT INTO telegram_bots (id, workspace_id, bot_type, telegram_bot_id, bot_username, bot_name, encrypted_token, token_last4, is_active) VALUES (?, ?, 'customer', ?, ?, ?, ?, ?, 1)`).bind(id, input.workspaceId, input.telegramBotId, input.botUsername, input.botName ?? null, input.encryptedToken, input.encryptedToken.slice(-4)).run();
  return { id };
}

export async function findWorkspaceBotByUsername(env: Env, botUsername: string): Promise<ManagedBotRecord | null> {
  const db = getDb(env);
  if (!db) return null;
  return (await db.prepare(`SELECT id, workspace_id, telegram_bot_id, bot_username, bot_name, encrypted_token FROM telegram_bots WHERE bot_username = ? AND is_active = 1 LIMIT 1`).bind(botUsername.replace(/^@/, '').toLowerCase()).first<ManagedBotRecord>()) ?? null;
}

export async function findWorkspaceBotByWorkspaceId(env: Env, workspaceId: string, botUsername?: string): Promise<ManagedBotRecord | null> {
  const db = getDb(env);
  if (!db) return null;

  if (botUsername) {
    return (await db.prepare(`SELECT id, workspace_id, telegram_bot_id, bot_username, bot_name, encrypted_token FROM telegram_bots WHERE workspace_id = ? AND bot_username = ? AND is_active = 1 LIMIT 1`).bind(workspaceId, botUsername.replace(/^@/, '').toLowerCase()).first<ManagedBotRecord>()) ?? null;
  }

  return (await db.prepare(`SELECT id, workspace_id, telegram_bot_id, bot_username, bot_name, encrypted_token FROM telegram_bots WHERE workspace_id = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1`).bind(workspaceId).first<ManagedBotRecord>()) ?? null;
}

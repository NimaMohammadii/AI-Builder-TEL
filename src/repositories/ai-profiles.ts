import type { Env } from '../types/env';
import { getDb } from '../db/client';

export async function ensureDefaultAiProfile(env: Env, input: {
  workspaceId: string;
  botId: string;
  prompt: string;
  model: string;
}) {
  const db = getDb(env);
  const existing = await db
    .prepare(`SELECT id FROM ai_profiles WHERE bot_id = ? AND is_default = 1 LIMIT 1`)
    .bind(input.botId)
    .first<{ id: string }>();

  if (existing?.id) {
    await db
      .prepare(`
        UPDATE ai_profiles
        SET system_prompt = ?, model = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(input.prompt, input.model, existing.id)
      .run();

    return { id: existing.id };
  }

  const id = `aip_${crypto.randomUUID()}`;
  await db
    .prepare(`
      INSERT INTO ai_profiles (id, workspace_id, bot_id, name, model, system_prompt, is_default)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `)
    .bind(id, input.workspaceId, input.botId, 'Default Bot Profile', input.model, input.prompt)
    .run();

  return { id };
}

export async function getDefaultAiProfileByBotId(env: Env, botId: string) {
  const db = getDb(env);
  return db
    .prepare(`
      SELECT id, workspace_id, bot_id, model, system_prompt, tone, language, reply_mode
      FROM ai_profiles
      WHERE bot_id = ? AND is_default = 1
      LIMIT 1
    `)
    .bind(botId)
    .first<{
      id: string;
      workspace_id: string;
      bot_id: string;
      model: string;
      system_prompt: string;
      tone?: string;
      language?: string;
      reply_mode?: string;
    }>();
}

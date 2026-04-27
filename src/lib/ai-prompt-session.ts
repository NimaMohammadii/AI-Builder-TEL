import type { AppConfig, Env } from '../types/env';

const PREFIX = 'ai_prompt_session:';
const TTL_SECONDS = 60 * 15;
const memorySessions = new Map<number, number>();

export async function startAiPromptSession(config: AppConfig, chatId: number, env?: Env): Promise<void> {
  memorySessions.set(chatId, Date.now() + TTL_SECONDS * 1000);
  await config.chatMemory?.put(`${PREFIX}${chatId}`, JSON.stringify({ active: true, startedAt: Date.now() }), { expirationTtl: TTL_SECONDS });
  await setD1Session(env, chatId, true);
}

export async function endAiPromptSession(config: AppConfig, chatId: number, env?: Env): Promise<void> {
  memorySessions.delete(chatId);
  await config.chatMemory?.delete(`${PREFIX}${chatId}`);
  await setD1Session(env, chatId, false);
}

export async function isAiPromptSessionActive(config: AppConfig, chatId: number, env?: Env): Promise<boolean> {
  const memoryUntil = memorySessions.get(chatId) ?? 0;
  if (memoryUntil > Date.now()) return true;
  if (memoryUntil) memorySessions.delete(chatId);

  const value = await config.chatMemory?.get(`${PREFIX}${chatId}`);
  if (value) return true;
  return getD1Session(env, chatId);
}

async function ensureSessionTable(env?: Env): Promise<D1Database | null> {
  const db = env?.DB;
  if (!db) return null;
  await db.prepare("CREATE TABLE IF NOT EXISTS ai_prompt_sessions (chat_id INTEGER PRIMARY KEY, is_active INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  return db;
}

async function setD1Session(env: Env | undefined, chatId: number, active: boolean): Promise<void> {
  const db = await ensureSessionTable(env);
  if (!db) return;
  await db.prepare("INSERT INTO ai_prompt_sessions (chat_id, is_active, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(chat_id) DO UPDATE SET is_active = excluded.is_active, updated_at = CURRENT_TIMESTAMP")
    .bind(chatId, active ? 1 : 0)
    .run();
}

async function getD1Session(env: Env | undefined, chatId: number): Promise<boolean> {
  const db = await ensureSessionTable(env);
  if (!db) return false;
  const row = await db.prepare("SELECT is_active FROM ai_prompt_sessions WHERE chat_id = ? LIMIT 1")
    .bind(chatId)
    .first<{ is_active: number }>();
  return row?.is_active === 1;
}

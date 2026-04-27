import type { BotRecord, Env, RuntimeSession, TelegramUser } from '../types';

export async function ensureSchema(env: Env): Promise<void> {
  const statements = [
    "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, telegram_user_id TEXT NOT NULL UNIQUE, username TEXT, first_name TEXT, last_name TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS customer_bots (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, token TEXT NOT NULL, telegram_bot_id TEXT NOT NULL, username TEXT NOT NULL, ai_enabled INTEGER NOT NULL DEFAULT 1, ai_prompt TEXT NOT NULL DEFAULT '', program_json TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_bots_username ON customer_bots(username)",
    "CREATE TABLE IF NOT EXISTS runtime_sessions (bot_id TEXT NOT NULL, chat_id TEXT NOT NULL, flow_id TEXT NOT NULL, step_id TEXT NOT NULL, data_json TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (bot_id, chat_id))",
    "CREATE TABLE IF NOT EXISTS builder_sessions (chat_id TEXT PRIMARY KEY, mode TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
  ];
  for (const sql of statements) await env.DB.prepare(sql).run();
}

export async function upsertUser(env: Env, user: TelegramUser): Promise<string> {
  await ensureSchema(env);
  const existing = await env.DB.prepare('SELECT id FROM users WHERE telegram_user_id = ? LIMIT 1').bind(String(user.id)).first<{ id: string }>();
  if (existing?.id) {
    await env.DB.prepare('UPDATE users SET username = ?, first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(user.username ?? null, user.first_name ?? null, user.last_name ?? null, existing.id)
      .run();
    return existing.id;
  }
  const id = `usr_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO users (id, telegram_user_id, username, first_name, last_name) VALUES (?, ?, ?, ?, ?)')
    .bind(id, String(user.id), user.username ?? null, user.first_name ?? null, user.last_name ?? null)
    .run();
  return id;
}

export async function saveCustomerBot(env: Env, input: { ownerUserId: string; token: string; telegramBotId: string; username: string }): Promise<BotRecord> {
  await ensureSchema(env);
  const id = `bot_${crypto.randomUUID()}`;
  await env.DB.prepare('UPDATE customer_bots SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE owner_user_id = ?').bind(input.ownerUserId).run();
  await env.DB.prepare('INSERT INTO customer_bots (id, owner_user_id, token, telegram_bot_id, username, ai_prompt) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, input.ownerUserId, input.token, input.telegramBotId, input.username.toLowerCase(), 'مثل ربات ساخته‌شده پاسخ بده.')
    .run();
  return (await getBotById(env, id))!;
}

export async function getActiveBotForOwner(env: Env, ownerUserId: string): Promise<BotRecord | null> {
  await ensureSchema(env);
  return env.DB.prepare('SELECT * FROM customer_bots WHERE owner_user_id = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1').bind(ownerUserId).first<BotRecord>();
}

export async function getBotByUsername(env: Env, username: string): Promise<BotRecord | null> {
  await ensureSchema(env);
  return env.DB.prepare('SELECT * FROM customer_bots WHERE username = ? AND is_active = 1 LIMIT 1').bind(username.toLowerCase().replace(/^@/, '')).first<BotRecord>();
}

export async function getBotById(env: Env, botId: string): Promise<BotRecord | null> {
  await ensureSchema(env);
  return env.DB.prepare('SELECT * FROM customer_bots WHERE id = ? LIMIT 1').bind(botId).first<BotRecord>();
}

export async function updateBotProgram(env: Env, botId: string, programJson: string, aiPrompt: string): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare('UPDATE customer_bots SET program_json = ?, ai_prompt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(programJson, aiPrompt, botId)
    .run();
}

export async function setBotAiEnabled(env: Env, botId: string, enabled: boolean): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare('UPDATE customer_bots SET ai_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(enabled ? 1 : 0, botId).run();
}

export async function setBotAiPrompt(env: Env, botId: string, prompt: string): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare('UPDATE customer_bots SET ai_prompt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(prompt, botId).run();
}

export async function getSession(env: Env, botId: string, chatId: number): Promise<RuntimeSession | null> {
  await ensureSchema(env);
  return env.DB.prepare('SELECT * FROM runtime_sessions WHERE bot_id = ? AND chat_id = ? LIMIT 1').bind(botId, String(chatId)).first<RuntimeSession>();
}

export async function saveSession(env: Env, session: RuntimeSession): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare('INSERT INTO runtime_sessions (bot_id, chat_id, flow_id, step_id, data_json, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(bot_id, chat_id) DO UPDATE SET flow_id = excluded.flow_id, step_id = excluded.step_id, data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP')
    .bind(session.bot_id, session.chat_id, session.flow_id, session.step_id, session.data_json)
    .run();
}

export async function clearSession(env: Env, botId: string, chatId: number): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare('DELETE FROM runtime_sessions WHERE bot_id = ? AND chat_id = ?').bind(botId, String(chatId)).run();
}

export async function setBuilderMode(env: Env, chatId: number, mode: string): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare('INSERT INTO builder_sessions (chat_id, mode, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(chat_id) DO UPDATE SET mode = excluded.mode, updated_at = CURRENT_TIMESTAMP').bind(String(chatId), mode).run();
}

export async function getBuilderMode(env: Env, chatId: number): Promise<string | null> {
  await ensureSchema(env);
  const row = await env.DB.prepare('SELECT mode FROM builder_sessions WHERE chat_id = ? LIMIT 1').bind(String(chatId)).first<{ mode: string }>();
  return row?.mode ?? null;
}

export async function clearBuilderMode(env: Env, chatId: number): Promise<void> {
  await ensureSchema(env);
  await env.DB.prepare('DELETE FROM builder_sessions WHERE chat_id = ?').bind(String(chatId)).run();
}

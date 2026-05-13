import type { Env, TelegramChat } from './types';

type AdminSettingRow = { value_json: string };
type GroupAccessRow = { added_by_user_id: string | null; ai_disabled: number | null };

const DISABLED_USERS_KEY = 'admin:group-ai-disabled-users';

export async function ensureGroupAiAccessColumns(env: Env): Promise<void> {
  await env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN ai_disabled INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
}

export async function setGroupAiDisabled(env: Env, chatId: string, disabled: boolean): Promise<void> {
  await ensureGroupAiAccessColumns(env);
  await env.DB.prepare("UPDATE bot_groups SET ai_disabled = ?, last_seen_at = CURRENT_TIMESTAMP WHERE bot_id = 'main' AND chat_id = ?")
    .bind(disabled ? 1 : 0, String(chatId))
    .run();
}

export async function isGroupAiDisabled(env: Env, chat: TelegramChat): Promise<boolean> {
  await ensureGroupAiAccessColumns(env);
  const row = await env.DB.prepare("SELECT added_by_user_id, ai_disabled FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?")
    .bind(String(chat.id))
    .first<GroupAccessRow>();
  if (Number(row?.ai_disabled || 0) === 1) return true;
  const ownerId = String(row?.added_by_user_id || '');
  if (!ownerId) return false;
  return isUserGroupAiDisabled(env, ownerId);
}

export async function setUserGroupAiDisabled(env: Env, userId: string, disabled: boolean): Promise<Record<string, boolean>> {
  const id = cleanUserId(userId);
  const map = await readDisabledUsers(env);
  if (disabled) map[id] = true;
  else delete map[id];
  await writeSetting(env, DISABLED_USERS_KEY, map);
  return map;
}

export async function isUserGroupAiDisabled(env: Env, userId: string): Promise<boolean> {
  const id = cleanUserId(userId);
  const map = await readDisabledUsers(env);
  return Boolean(map[id]);
}

export async function listUserGroups(env: Env, userId: string): Promise<{ groups: Array<Record<string, unknown>>; groupAiDisabled: boolean }> {
  const id = cleanUserId(userId);
  await ensureGroupAiAccessColumns(env);
  const rows = await env.DB.prepare(`SELECT chat_id AS chatId, chat_type AS type, title, username, first_seen_at AS firstSeenAt, last_seen_at AS lastSeenAt, COALESCE(ton_spent_nano, 0) AS tonSpentNano, COALESCE(ai_disabled, 0) AS aiDisabled
    FROM bot_groups
    WHERE bot_id = 'main' AND added_by_user_id = ?
    ORDER BY datetime(last_seen_at) DESC
    LIMIT 100`)
    .bind(id)
    .all<{ chatId: string; type: string; title: string | null; username: string | null; firstSeenAt: string; lastSeenAt: string; tonSpentNano: number; aiDisabled: number }>();
  return {
    groupAiDisabled: await isUserGroupAiDisabled(env, id),
    groups: (rows.results || []).map((group) => ({ ...group, aiDisabled: Number(group.aiDisabled || 0) === 1, tonSpent: Number(group.tonSpentNano || 0) / 1_000_000_000 })),
  };
}

async function readDisabledUsers(env: Env): Promise<Record<string, boolean>> {
  const value = await readSetting<Record<string, boolean>>(env, DISABLED_USERS_KEY);
  return value && typeof value === 'object' ? value : {};
}

async function readSetting<T>(env: Env, name: string): Promise<T | null> {
  try {
    await ensureAdminSettingsTable(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(name).first<AdminSettingRow>();
    if (row?.value_json) return JSON.parse(row.value_json) as T;
  } catch (error) {
    console.warn('read group ai setting failed', error);
  }
  return env.BOT_CACHE.get(name, 'json').catch(() => null) as Promise<T | null>;
}

async function writeSetting(env: Env, name: string, value: unknown): Promise<void> {
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(name, JSON.stringify(value))
    .run();
}

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

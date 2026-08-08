import type { Env } from './types';
import { getUserLevel } from './levels';
import { ensureTonBalanceColumn, getUserControls } from './user-controls';

export type AppUserActivityPayload = {
  userId?: string;
  username?: string | null;
  firstName?: string | null;
  section?: string | null;
};

type AdminUserRow = {
  telegram_user_id: string;
  first_name: string | null;
  username: string | null;
  current_section: string | null;
  ton_balance_nano: number | null;
  last_seen_at: string | null;
  created_at: string | null;
  source: string | null;
  region_code?: string | null;
  language_code?: string | null;
  timezone?: string | null;
  return_count?: number | null;
};

type ClientResetState = { resetVersion: string; resetAllVersion: string };
type BulkDeleteResult = { ok: true; deleted: Record<string, number>; kvDeleted: number; resetAllVersion: string };

const CLIENT_RESET_PREFIX = 'miniapp-client-reset:';
const CLIENT_RESET_ALL_KEY = 'miniapp-client-reset:all';
const CLIENT_RESET_TTL_SECONDS = 180 * 24 * 60 * 60;

export async function trackAppUser(env: Env, payload: AppUserActivityPayload): Promise<{ ok: true; banned: boolean; tonBalanceNano: number; winChancePercent: number; resetVersion: string; resetAllVersion: string; level: Awaited<ReturnType<typeof getUserLevel>> } | { ok: false; error: string }> {
  const userId = String(payload.userId ?? '').trim();
  if (!userId) return { ok: false, error: 'Missing user id' };
  const username = cleanText(payload.username, 80);
  const firstName = cleanText(payload.firstName, 120);
  const section = cleanSection(payload.section);

  try {
    await ensureTonBalanceColumn(env);
    await env.DB.prepare('ALTER TABLE app_users ADD COLUMN return_count INTEGER NOT NULL DEFAULT 1').run().catch(() => undefined);
    const [controls, resetState, level] = await Promise.all([
      getUserControls(env, userId),
      getClientResetState(env, userId),
      getUserLevel(env, userId),
    ]);
    const tonBalanceNano = Math.max(0, Math.floor(Number(controls.tonBalanceNano ?? 0) || 0));
    await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, first_name, username, current_section, ton_balance_nano, last_seen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        first_name = excluded.first_name,
        username = excluded.username,
        current_section = excluded.current_section,
        return_count = CASE
          WHEN datetime(COALESCE(app_users.last_seen_at, app_users.created_at)) < datetime('now', '-30 minutes') THEN COALESCE(app_users.return_count, 1) + 1
          ELSE COALESCE(app_users.return_count, 1)
        END,
        last_seen_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(userId, firstName, username, section, tonBalanceNano)
      .run();
    return { ok: true, banned: controls.banned, tonBalanceNano, winChancePercent: controls.winChancePercent, ...resetState, level };
  } catch (error) {
    console.error('track app user failed', error);
    return { ok: false, error: 'Database is not ready. Run migrations.' };
  }
}

export async function adminUsersJson(env: Env): Promise<{ users: Array<Record<string, unknown>>; stats: Record<string, number> }> {
  await ensureTonBalanceColumn(env);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN region_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN language_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN timezone TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN return_count INTEGER NOT NULL DEFAULT 1').run().catch(() => undefined);
  const rows = await env.DB.prepare(`WITH ranked AS (
      SELECT telegram_user_id, first_name, username, current_section, ton_balance_nano, last_seen_at, created_at, 'game_bot' AS source, region_code, language_code, timezone, return_count,
        ROW_NUMBER() OVER (PARTITION BY telegram_user_id ORDER BY datetime(COALESCE(last_seen_at, created_at)) DESC) AS rn
      FROM app_users
    )
    SELECT telegram_user_id, first_name, username, current_section, ton_balance_nano, last_seen_at, created_at, source, region_code, language_code, timezone, return_count
    FROM ranked
    WHERE rn = 1
    ORDER BY datetime(COALESCE(last_seen_at, created_at)) DESC
    LIMIT 700`).all<AdminUserRow>();
  const now = Date.now();
  const users = await Promise.all((rows.results ?? []).map(async (row) => {
    const [controls, levelInfo] = await Promise.all([
      getUserControls(env, row.telegram_user_id).catch(() => null),
      getUserLevel(env, row.telegram_user_id).catch(() => null),
    ]);
    const lastSeenMs = row.last_seen_at ? Date.parse(row.last_seen_at) : 0;
    const online = lastSeenMs > 0 && now - lastSeenMs <= 90_000;
    const tonBalanceNano = Number(controls?.tonBalanceNano ?? row.ton_balance_nano ?? 0);
    return {
      id: row.telegram_user_id,
      username: row.username ? '@' + row.username.replace(/^@+/, '') : '—',
      firstName: row.first_name || '—',
      isActive: online,
      status: online ? 'Online' : 'Inactive',
      currentSection: row.current_section || 'unknown',
      tonBalanceNano,
      tonBalance: formatTon(tonBalanceNano),
      level: levelInfo?.level ?? 1,
      xp: levelInfo?.xp ?? 0,
      totalXp: levelInfo?.totalXp ?? 0,
      rankName: levelInfo?.rankName ?? 'Starter',
      lastSeenAt: row.last_seen_at,
      createdAt: row.created_at,
      source: row.source || 'unknown',
      sourceLabel: sourceLabel(row.source || 'unknown'),
      regionCode: regionKeyFromRow(row.region_code, row.language_code),
      regionLabel: regionLabel(regionKeyFromRow(row.region_code, row.language_code)),
      languageCode: row.language_code || '',
      timezone: row.timezone || '',
      returnCount: Math.max(1, Math.floor(Number(row.return_count) || 1)),
    };
  }));
  const online = users.filter((user) => user.isActive).length;
  const gameBot = users.filter((user) => user.source === 'game_bot').length;
  const userBot = users.filter((user) => user.source === 'user_bot').length;
  const totalTonBalanceNano = users.reduce((sum, user) => sum + Number(user.tonBalanceNano || 0), 0);
  return { users, stats: { total: users.length, online, inactive: users.length - online, gameBot, userBot, totalTonBalanceNano } };
}

export async function resetUserEverywhere(env: Env, userIdInput: unknown): Promise<{ ok: true; userId: string; deleted: Record<string, number>; kvDeleted: number; resetVersion: string }> {
  const userId = cleanUserId(userIdInput);
  const deleted: Record<string, number> = {};
  for (const [table, column] of userTableDeletes()) {
    deleted[table] = await safeDelete(env, table, column, userId);
  }
  const kvDeleted = await deleteUserKv(env, userId);
  const resetVersion = await markClientReset(env, userId);
  return { ok: true, userId, deleted, kvDeleted, resetVersion };
}

export async function resetAllUsersEverywhere(env: Env): Promise<BulkDeleteResult> {
  const deleted: Record<string, number> = {};
  for (const [table] of userTableDeletes()) {
    deleted[table] = await safeDeleteAll(env, table);
  }
  const kvDeleted = await deleteAllUserKv(env);
  const resetAllVersion = await markAllClientReset(env);
  return { ok: true, deleted, kvDeleted, resetAllVersion };
}

function userTableDeletes(): Array<[string, string]> {
  return [
    ['app_users', 'telegram_user_id'],
    ['user_controls', 'user_id'],
    ['ton_transactions', 'user_id'],
    ['ton_withdrawals', 'user_id'],
    ['stars_deposits', 'user_id'],
    ['user_levels', 'user_id'],
    ['xp_events', 'user_id'],
    ['daily_reward_claims', 'user_id'],
    ['daily_reward_events', 'user_id'],
    ['daily_rewards_claims', 'user_id'],
    ['daily_rewards_events', 'user_id'],
    ['predict_bets', 'user_id'],
    ['predict_entries', 'user_id'],
    ['crash_bets', 'user_id'],
    ['plinko_rounds', 'user_id'],
    ['mines_rounds', 'user_id'],
    ['dice_rounds', 'user_id'],
  ];
}

async function safeDelete(env: Env, table: string, column: string, userId: string): Promise<number> {
  try {
    const result = await env.DB.prepare(`DELETE FROM ${table} WHERE ${column} = ?`).bind(userId).run();
    return Number(result.meta?.changes || 0);
  } catch {
    return 0;
  }
}

async function safeDeleteAll(env: Env, table: string): Promise<number> {
  try {
    const result = await env.DB.prepare(`DELETE FROM ${table}`).run();
    return Number(result.meta?.changes || 0);
  } catch {
    return 0;
  }
}

async function deleteUserKv(env: Env, userId: string): Promise<number> {
  const keys = new Set<string>([
    `admin:user-controls:${userId}`,
    `vexaUserControls:${userId}`,
  ]);
  await collectKvByPrefix(env, `image-mode:`, keys, userId);
  let count = 0;
  for (const key of keys) {
    try { await env.BOT_CACHE.delete(key); count++; } catch {}
  }
  return count;
}

async function deleteAllUserKv(env: Env): Promise<number> {
  const prefixes = [
    'admin:user-controls:',
    'vexaUserControls:',
    'image-mode:',
  ];
  let count = 0;
  for (const prefix of prefixes) count += await deleteKvByPrefix(env, prefix);
  return count;
}

async function getClientResetState(env: Env, userId: string): Promise<ClientResetState> {
  const cleanId = cleanUserId(userId);
  const [resetVersion, resetAllVersion] = await Promise.all([
    env.BOT_CACHE.get(`${CLIENT_RESET_PREFIX}${cleanId}`).catch(() => ''),
    env.BOT_CACHE.get(CLIENT_RESET_ALL_KEY).catch(() => ''),
  ]);
  return { resetVersion: resetVersion || '', resetAllVersion: resetAllVersion || '' };
}

async function markClientReset(env: Env, userId: string): Promise<string> {
  const version = resetVersion();
  await env.BOT_CACHE.put(`${CLIENT_RESET_PREFIX}${userId}`, version, { expirationTtl: CLIENT_RESET_TTL_SECONDS }).catch(() => undefined);
  return version;
}

async function markAllClientReset(env: Env): Promise<string> {
  const version = resetVersion();
  await env.BOT_CACHE.put(CLIENT_RESET_ALL_KEY, version, { expirationTtl: CLIENT_RESET_TTL_SECONDS }).catch(() => undefined);
  return version;
}

function resetVersion(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function deleteKvByPrefix(env: Env, prefix: string): Promise<number> {
  let count = 0;
  try {
    let cursor: string | undefined;
    for (let i = 0; i < 20; i++) {
      const page = await env.BOT_CACHE.list({ prefix, cursor, limit: 1000 });
      for (const item of page.keys) {
        try { await env.BOT_CACHE.delete(item.name); count++; } catch {}
      }
      if (page.list_complete) break;
      cursor = page.cursor;
    }
  } catch {}
  return count;
}

async function collectKvByPrefix(env: Env, prefix: string, keys: Set<string>, userId: string): Promise<void> {
  try {
    let cursor: string | undefined;
    for (let i = 0; i < 6; i++) {
      const page = await env.BOT_CACHE.list({ prefix, cursor, limit: 1000 });
      for (const item of page.keys) if (item.name.includes(userId)) keys.add(item.name);
      if (page.list_complete) break;
      cursor = page.cursor;
    }
  } catch {}
}

function sourceLabel(source: string): string {
  if (source === 'game_bot') return 'Game Bot';
  if (source === 'user_bot') return 'User Bot';
  return source || 'Unknown';
}

function formatTon(nano: number): string {
  const value = Math.max(0, Math.floor(Number(nano) || 0)) / 1_000_000_000;
  return value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1') + ' TON';
}

function cleanText(value: unknown, max: number): string | null {
  const text = String(value ?? '').replace(/[<>]/g, '').trim();
  return text ? text.slice(0, max) : null;
}

function cleanSection(value: unknown): string {
  const text = String(value ?? 'home').replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 40);
  return text || 'home';
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function regionKeyFromRow(regionCode: unknown, languageCode: unknown): string {
  const region = String(regionCode || '').toUpperCase();
  if (region === 'IR' || region === 'TR' || region === 'RU') return region;
  const language = String(languageCode || '').trim().toLowerCase();
  if (language === 'fa') return 'IR';
  if (language === 'tr') return 'TR';
  if (language === 'ru') return 'RU';
  return 'EN';
}

function regionLabel(code: string): string {
  return ({ EN: 'English / Global', IR: 'Iran / Persian', TR: 'Türkiye / Turkish', RU: 'Russia / Russian' } as Record<string, string>)[code] || code || 'Unknown';
}

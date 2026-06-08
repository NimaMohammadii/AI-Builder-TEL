import type { Env } from './types';

export type UserLevel = {
  userId: string;
  level: number;
  xp: number;
  totalXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpLeft: number;
  rankName: string;
};

export async function getUserLevel(env: Env, userIdInput: unknown): Promise<UserLevel> {
  const userId = cleanUserId(userIdInput);
  await ensureLevelTables(env);
  const row = await env.DB.prepare('SELECT level, xp, total_xp FROM user_levels WHERE user_id = ?').bind(userId).first<{ level: number; xp: number; total_xp: number }>();
  if (!row) {
    await env.DB.prepare('INSERT OR IGNORE INTO user_levels (user_id, level, xp, total_xp, updated_at) VALUES (?, 1, 0, 0, CURRENT_TIMESTAMP)').bind(userId).run();
    return shapeLevel(userId, 1, 0, 0);
  }
  const storedTotalXp = Math.max(0, Math.floor(Number(row.total_xp) || 0));
  const impliedTotalXp = totalXpFromLevelProgress(row.level, row.xp);
  const totalXp = Math.max(storedTotalXp, impliedTotalXp);
  const derived = levelFromTotalXp(totalXp);
  if (totalXp !== storedTotalXp || derived.level !== Number(row.level || 1) || derived.xp !== Number(row.xp || 0)) {
    await env.DB.prepare('UPDATE user_levels SET level = ?, xp = ?, total_xp = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
      .bind(derived.level, derived.xp, totalXp, userId)
      .run();
  }
  return shapeLevel(userId, derived.level, derived.xp, totalXp);
}

export async function addUserXp(env: Env, userIdInput: unknown, amountInput: unknown, sourceInput: unknown, metadata: unknown = null, eventIdInput: unknown = null): Promise<{ profile: UserLevel; leveledUp: boolean; previousLevel: number }> {
  const userId = cleanUserId(userIdInput);
  const amount = Math.max(0, Math.min(5000, Math.floor(Number(amountInput) || 0)));
  const source = cleanSource(sourceInput);
  const eventId = cleanEventId(eventIdInput);
  await ensureLevelTables(env);
  const before = await getUserLevel(env, userId);
  if (amount < 1) return { profile: before, leveledUp: false, previousLevel: before.level };

  const insert = await env.DB.prepare(`INSERT OR IGNORE INTO xp_events (id, user_id, source, amount, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
    .bind(eventId || ('xp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24)), userId, source, amount, JSON.stringify(metadata ?? {}))
    .run();
  if (eventId && (insert.meta?.changes ?? 0) === 0) {
    const profile = await getUserLevel(env, userId);
    return { profile, leveledUp: false, previousLevel: profile.level };
  }

  await env.DB.prepare(`INSERT INTO user_levels (user_id, level, xp, total_xp, updated_at) VALUES (?, 1, 0, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET total_xp = user_levels.total_xp + excluded.total_xp, updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, amount)
    .run();

  const row = await env.DB.prepare('SELECT total_xp FROM user_levels WHERE user_id = ?').bind(userId).first<{ total_xp: number }>();
  const totalXp = Math.max(0, Math.floor(Number(row?.total_xp) || 0));
  const derived = levelFromTotalXp(totalXp);
  await env.DB.prepare('UPDATE user_levels SET level = ?, xp = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').bind(derived.level, derived.xp, userId).run();

  return { profile: shapeLevel(userId, derived.level, derived.xp, totalXp), leveledUp: derived.level > before.level, previousLevel: before.level };
}

export async function ensureLevelTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_levels (
    user_id TEXT PRIMARY KEY,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS xp_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    source TEXT NOT NULL,
    amount INTEGER NOT NULL,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON xp_events(user_id, created_at)').run();
}

export function nextLevelXp(levelInput: unknown): number {
  const level = Math.max(1, Math.floor(Number(levelInput) || 1));
  return Math.max(100, Math.floor(100 * Math.pow(level, 1.35)));
}


function totalXpFromLevelProgress(levelInput: unknown, xpInput: unknown): number {
  const level = Math.max(1, Math.min(999, Math.floor(Number(levelInput) || 1)));
  let total = 0;
  for (let current = 1; current < level; current += 1) total += nextLevelXp(current);
  const xp = Math.max(0, Math.floor(Number(xpInput) || 0));
  return total + xp;
}

function levelFromTotalXp(totalXpInput: unknown): { level: number; xp: number } {
  let remaining = Math.max(0, Math.floor(Number(totalXpInput) || 0));
  let level = 1;
  while (level < 999) {
    const next = nextLevelXp(level);
    if (remaining < next) break;
    remaining -= next;
    level += 1;
  }
  return { level, xp: remaining };
}

function shapeLevel(userId: string, level: number, xp: number, totalXp: number): UserLevel {
  const next = nextLevelXp(level);
  const safeXp = Math.max(0, Math.min(next, Math.floor(xp || 0)));
  const progressPercent = Math.max(0, Math.min(100, Math.floor((safeXp / next) * 100)));
  return {
    userId,
    level: Math.max(1, Math.floor(level || 1)),
    xp: safeXp,
    totalXp: Math.max(0, Math.floor(totalXp || 0)),
    nextLevelXp: next,
    progressPercent,
    xpLeft: Math.max(0, next - safeXp),
    rankName: rankName(level),
  };
}

function rankName(levelInput: unknown): string {
  const level = Math.max(1, Math.floor(Number(levelInput) || 1));
  if (level >= 60) return 'Titan';
  if (level >= 40) return 'Legend';
  if (level >= 25) return 'Master';
  if (level >= 16) return 'Elite';
  if (level >= 10) return 'Pro';
  if (level >= 5) return 'Explorer';
  return 'Rookie';
}

function cleanUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!userId) throw new Error('Missing user id');
  return userId;
}

function cleanSource(value: unknown): string {
  return String(value ?? 'manual').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 48) || 'manual';
}

function cleanEventId(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 96);
}
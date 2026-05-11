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
  return shapeLevel(userId, Number(row.level || 1), Number(row.xp || 0), Number(row.total_xp || 0));
}

export async function addUserXp(env: Env, userIdInput: unknown, amountInput: unknown, sourceInput: unknown, metadata: unknown = null): Promise<{ profile: UserLevel; leveledUp: boolean; previousLevel: number }> {
  const userId = cleanUserId(userIdInput);
  const amount = Math.max(0, Math.min(5000, Math.floor(Number(amountInput) || 0)));
  const source = cleanSource(sourceInput);
  await ensureLevelTables(env);
  const before = await getUserLevel(env, userId);
  if (amount < 1) return { profile: before, leveledUp: false, previousLevel: before.level };

  let level = before.level;
  let xp = before.xp + amount;
  let totalXp = before.totalXp + amount;
  while (xp >= nextLevelXp(level)) {
    xp -= nextLevelXp(level);
    level += 1;
  }

  await env.DB.prepare(`INSERT INTO xp_events (id, user_id, source, amount, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
    .bind('xp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24), userId, source, amount, JSON.stringify(metadata ?? {}))
    .run();
  await env.DB.prepare(`INSERT INTO user_levels (user_id, level, xp, total_xp, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET level = excluded.level, xp = excluded.xp, total_xp = excluded.total_xp, updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, level, xp, totalXp)
    .run();

  return { profile: shapeLevel(userId, level, xp, totalXp), leveledUp: level > before.level, previousLevel: before.level };
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
  if (level >= 50) return 'Legend';
  if (level >= 35) return 'Elite';
  if (level >= 20) return 'Pro';
  if (level >= 10) return 'Builder';
  if (level >= 5) return 'Explorer';
  return 'Starter';
}

function cleanUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!userId) throw new Error('Missing user id');
  return userId;
}

function cleanSource(value: unknown): string {
  return String(value ?? 'manual').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 48) || 'manual';
}

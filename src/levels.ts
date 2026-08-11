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

export type UserXpEventInput = {
  amount?: unknown;
  source?: unknown;
  metadata?: unknown;
  eventId?: unknown;
};

export async function getUserLevel(env: Env, userIdInput: unknown): Promise<UserLevel> {
  const userId = cleanUserId(userIdInput);
  const row = await env.DB.prepare('SELECT level, xp, total_xp FROM user_levels WHERE user_id = ?').bind(userId).first<{ level: number; xp: number; total_xp: number }>();
  if (!row) {
    await env.DB.prepare('INSERT OR IGNORE INTO user_levels (user_id, level, xp, total_xp, updated_at) VALUES (?, 1, 0, 0, CURRENT_TIMESTAMP)').bind(userId).run();
    return shapeLevel(userId, 1, 0, 0);
  }
  const totalXp = Math.max(0, Math.floor(Number(row.total_xp) || 0));
  if (totalXp > 0) {
    const derived = levelFromTotalXp(totalXp);
    if (derived.level !== Number(row.level || 1) || derived.xp !== Number(row.xp || 0)) {
      await env.DB.prepare('UPDATE user_levels SET level = ?, xp = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').bind(derived.level, derived.xp, userId).run();
    }
    return shapeLevel(userId, derived.level, derived.xp, totalXp);
  }
  return shapeLevel(userId, Number(row.level || 1), Number(row.xp || 0), totalXp);
}

export async function addUserXp(env: Env, userIdInput: unknown, amountInput: unknown, sourceInput: unknown, metadata: unknown = null, eventIdInput: unknown = null): Promise<{ profile: UserLevel; leveledUp: boolean; previousLevel: number }> {
  const result = await addUserXpBatch(env, userIdInput, [{ amount: amountInput, source: sourceInput, metadata, eventId: eventIdInput }]);
  return { profile: result.profile, leveledUp: result.leveledUp, previousLevel: result.previousLevel };
}

export async function addUserXpBatch(env: Env, userIdInput: unknown, inputEvents: UserXpEventInput[]): Promise<{ profile: UserLevel; leveledUp: boolean; previousLevel: number; processed: number; accepted: number }> {
  const userId = cleanUserId(userIdInput);
  const events = normalizeXpEvents(inputEvents).slice(0, 120);
  const before = await getUserLevel(env, userId);
  if (!events.length) return { profile: before, leveledUp: false, previousLevel: before.level, processed: 0, accepted: 0 };

  const explicitIds = Array.from(new Set(events.map((event) => event.eventId).filter(Boolean)));
  const existingIds = new Set<string>();
  if (explicitIds.length) {
    const placeholders = explicitIds.map(() => '?').join(',');
    const rows = await env.DB.prepare(`SELECT id FROM xp_events WHERE id IN (${placeholders})`).bind(...explicitIds).all<{ id: string }>();
    for (const row of rows.results ?? []) existingIds.add(String(row.id));
  }

  const seen = new Set<string>();
  const acceptedEvents = events.filter((event) => {
    if (!event.eventId) return true;
    if (existingIds.has(event.eventId) || seen.has(event.eventId)) return false;
    seen.add(event.eventId);
    return true;
  });
  if (!acceptedEvents.length) return { profile: before, leveledUp: false, previousLevel: before.level, processed: events.length, accepted: 0 };

  const values: string[] = [];
  const bindings: unknown[] = [];
  let totalAdded = 0;
  for (const event of acceptedEvents) {
    const eventId = event.eventId || ('xp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24));
    values.push('(?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');
    bindings.push(eventId, userId, event.source, event.amount, JSON.stringify(event.metadata ?? {}));
    totalAdded += event.amount;
  }

  await env.DB.prepare(`INSERT OR IGNORE INTO xp_events (id, user_id, source, amount, metadata_json, created_at) VALUES ${values.join(',')}`)
    .bind(...bindings)
    .run();

  await env.DB.prepare(`INSERT INTO user_levels (user_id, level, xp, total_xp, updated_at) VALUES (?, 1, 0, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET total_xp = user_levels.total_xp + excluded.total_xp, updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, totalAdded)
    .run();

  const row = await env.DB.prepare('SELECT total_xp FROM user_levels WHERE user_id = ?').bind(userId).first<{ total_xp: number }>();
  const totalXp = Math.max(0, Math.floor(Number(row?.total_xp) || 0));
  const derived = levelFromTotalXp(totalXp);
  await env.DB.prepare('UPDATE user_levels SET level = ?, xp = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').bind(derived.level, derived.xp, userId).run();
  const profile = shapeLevel(userId, derived.level, derived.xp, totalXp);
  return { profile, leveledUp: profile.level > before.level, previousLevel: before.level, processed: events.length, accepted: acceptedEvents.length };
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

function normalizeXpEvents(inputEvents: UserXpEventInput[]): Array<{ amount: number; source: string; metadata: unknown; eventId: string }> {
  const source = Array.isArray(inputEvents) ? inputEvents : [];
  return source.map((event) => ({
    amount: Math.max(0, Math.min(5000, Math.floor(Number(event?.amount) || 0))),
    source: cleanSource(event?.source),
    metadata: event?.metadata ?? null,
    eventId: cleanEventId(event?.eventId),
  })).filter((event) => event.amount > 0);
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

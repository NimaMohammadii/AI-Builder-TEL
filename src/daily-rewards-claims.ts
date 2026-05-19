import { addUserXp, getUserLevel } from './levels';
import { getDailyRewardsPublicPayload } from './daily-rewards-missions';
import type { Env } from './types';

export type DailyRewardClaim = {
  userId: string;
  missionId: string;
  day: number;
  weekStart: string;
  xp: number;
  claimedAt: string;
};

type ProgressMap = Map<string, number>;

export async function getDailyRewardsForUser(env: Env, userIdInput: unknown): Promise<Record<string, unknown>> {
  const userId = cleanUserId(userIdInput);
  await ensureDailyRewardClaimTables(env);
  const payload = await getDailyRewardsPublicPayload(env);
  const weekStart = currentWeekStart();
  const claimed = await listClaimedKeys(env, userId, weekStart);
  const progress = await listProgress(env, userId, weekStart);
  const profile = await getUserLevel(env, userId);
  return {
    ...payload,
    weekStart,
    claimed: Array.from(claimed),
    progress: Object.fromEntries(progress),
    claimable: claimableKeys(payload.days, progress, claimed),
    profile,
  };
}

export async function recordDailyRewardEvent(env: Env, input: { userId?: unknown; eventType?: unknown; section?: unknown; amount?: unknown }): Promise<void> {
  const userId = cleanUserId(input.userId);
  const eventType = cleanEventType(input.eventType);
  const section = cleanSection(input.section);
  const amount = Math.max(1, Math.floor(Number(input.amount) || 1));
  await ensureDailyRewardClaimTables(env);
  const weekStart = currentWeekStart();
  const day = currentMondayDay();
  const keys = progressKeysForEvent(eventType, section);
  for (const key of keys) {
    await incrementProgress(env, userId, weekStart, day, key, amount);
  }
}

export async function claimDailyRewardMission(env: Env, input: { userId?: unknown; missionId?: unknown; day?: unknown }): Promise<Record<string, unknown>> {
  const userId = cleanUserId(input.userId);
  const missionId = cleanMissionId(input.missionId);
  const day = clampDay(input.day);
  await ensureDailyRewardClaimTables(env);

  const payload = await getDailyRewardsPublicPayload(env);
  const dayConfig = payload.days.find((item) => Number(item.day) === day);
  const mission = dayConfig?.missions.find((item) => item.id === missionId);
  if (!mission) throw new Error('Mission is not active for this day');

  const weekStart = currentWeekStart();
  const progress = await listProgress(env, userId, weekStart);
  const key = claimKey(day, missionId);
  if (!isMissionComplete(mission, progress)) throw new Error('Mission is not completed yet');

  const existing = await env.DB.prepare('SELECT id FROM daily_reward_claims WHERE user_id = ? AND week_start = ? AND day = ? AND mission_id = ?')
    .bind(userId, weekStart, day, missionId)
    .first<{ id: string }>()
    .catch(() => null);
  if (existing?.id) {
    return {
      ok: true,
      alreadyClaimed: true,
      claimedKey: key,
      weekStart,
      xp: mission.xp,
      profile: await getUserLevel(env, userId),
    };
  }

  const xp = Math.max(1, Math.min(5000, Math.floor(Number(mission.xp) || 0)));
  const xpResult = await addUserXp(env, userId, xp, 'daily_reward', { missionId, day, weekStart, type: mission.type });
  const id = 'dr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 28);
  await env.DB.prepare(`INSERT INTO daily_reward_claims (id, user_id, week_start, day, mission_id, xp, claimed_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
    .bind(id, userId, weekStart, day, missionId, xp)
    .run();

  return {
    ok: true,
    alreadyClaimed: false,
    claimedKey: key,
    weekStart,
    xp,
    mission,
    profile: xpResult.profile,
    leveledUp: xpResult.leveledUp,
    previousLevel: xpResult.previousLevel,
  };
}

export async function ensureDailyRewardClaimTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS daily_reward_claims (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    week_start TEXT NOT NULL,
    day INTEGER NOT NULL,
    mission_id TEXT NOT NULL,
    xp INTEGER NOT NULL,
    claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start, day, mission_id)
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_daily_reward_claims_user_week ON daily_reward_claims(user_id, week_start)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS daily_reward_progress (
    user_id TEXT NOT NULL,
    week_start TEXT NOT NULL,
    day INTEGER NOT NULL,
    progress_key TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, week_start, day, progress_key)
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_daily_reward_progress_user_week ON daily_reward_progress(user_id, week_start)').run();
}

async function incrementProgress(env: Env, userId: string, weekStart: string, day: number, progressKey: string, amount: number): Promise<void> {
  await env.DB.prepare(`INSERT INTO daily_reward_progress (user_id, week_start, day, progress_key, value, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, week_start, day, progress_key) DO UPDATE SET value = value + excluded.value, updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, weekStart, day, progressKey, amount)
    .run();
}

async function listProgress(env: Env, userId: string, weekStart: string): Promise<ProgressMap> {
  const rows = await env.DB.prepare('SELECT day, progress_key, value FROM daily_reward_progress WHERE user_id = ? AND week_start = ?')
    .bind(userId, weekStart)
    .all<{ day: number; progress_key: string; value: number }>()
    .catch(() => ({ results: [] as { day: number; progress_key: string; value: number }[] }));
  const map = new Map<string, number>();
  for (const row of rows.results ?? []) map.set(`${clampDay(row.day)}:${row.progress_key}`, Math.max(0, Math.floor(Number(row.value) || 0)));
  return map;
}

async function listClaimedKeys(env: Env, userId: string, weekStart: string): Promise<Set<string>> {
  const rows = await env.DB.prepare('SELECT day, mission_id FROM daily_reward_claims WHERE user_id = ? AND week_start = ?')
    .bind(userId, weekStart)
    .all<{ day: number; mission_id: string }>()
    .catch(() => ({ results: [] as { day: number; mission_id: string }[] }));
  return new Set((rows.results ?? []).map((row) => claimKey(row.day, row.mission_id)));
}

function claimableKeys(days: Array<{ day: number; missions: Array<{ id: string; type: string }> }>, progress: ProgressMap, claimed: Set<string>): string[] {
  const out: string[] = [];
  for (const day of days) {
    for (const mission of day.missions) {
      const key = claimKey(day.day, mission.id);
      if (!claimed.has(key) && isMissionComplete(mission, progress)) out.push(key);
    }
  }
  return out;
}

function isMissionComplete(mission: { id: string; type: string }, progress: ProgressMap): boolean {
  const day = currentMondayDay();
  const target = targetForMission(mission.id);
  if (target.kind === 'blocked') return false;
  return (progress.get(`${day}:${target.key}`) || 0) >= target.amount;
}

function targetForMission(missionId: string): { key: string; amount: number; kind: 'ok' | 'blocked' } {
  const table: Record<string, { key: string; amount: number; kind: 'ok' | 'blocked' }> = {
    open_app: { key: 'open_app', amount: 1, kind: 'ok' },
    daily_streak: { key: 'open_app', amount: 1, kind: 'ok' },
    open_play_zone: { key: 'open_section:play', amount: 1, kind: 'ok' },
    open_market: { key: 'open_section:market', amount: 1, kind: 'ok' },
    check_top_players: { key: 'open_section:topplayers', amount: 1, kind: 'ok' },
    check_level_progress: { key: 'open_section:profile', amount: 1, kind: 'ok' },
  };
  return table[missionId] || { key: missionId, amount: 1, kind: 'blocked' };
}

function progressKeysForEvent(eventType: string, section: string): string[] {
  const keys: string[] = [];
  if (eventType === 'open_app') keys.push('open_app');
  if (eventType === 'open_section' && section) {
    keys.push(`open_section:${sectionAlias(section)}`);
  }
  return keys;
}

function sectionAlias(section: string): string {
  const value = cleanSection(section).toLowerCase();
  if (['play', 'playzone', 'play_zone', 'plinko', 'predict', 'mines'].includes(value)) return 'play';
  if (['market', 'nftmarket', 'nft_market'].includes(value)) return 'market';
  if (['topplayers', 'top_players', 'leaderboard', 'rank', 'ranking'].includes(value)) return 'topplayers';
  if (['profile', 'level', 'levels', 'home'].includes(value)) return 'profile';
  return value;
}

function claimKey(day: unknown, missionId: unknown): string {
  return `${clampDay(day)}:${cleanMissionId(missionId)}`;
}

function currentWeekStart(): string {
  const date = new Date();
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() === 0 ? 6 : utc.getUTCDay() - 1;
  utc.setUTCDate(utc.getUTCDate() - day);
  return utc.toISOString().slice(0, 10);
}

function currentMondayDay(): number {
  const day = new Date().getUTCDay();
  return day === 0 ? 6 : day - 1;
}

function cleanUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!userId) throw new Error('Missing user id');
  return userId;
}

function cleanMissionId(value: unknown): string {
  const missionId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!missionId) throw new Error('Missing mission id');
  return missionId;
}

function cleanEventType(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 64) || 'open_app';
}

function cleanSection(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 64);
}

function clampDay(value: unknown): number {
  const day = Math.floor(Number(value) || 0);
  return Math.max(0, Math.min(6, day));
}

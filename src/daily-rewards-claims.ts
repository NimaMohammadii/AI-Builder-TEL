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

export async function getDailyRewardsForUser(env: Env, userIdInput: unknown): Promise<Record<string, unknown>> {
  const userId = cleanUserId(userIdInput);
  await ensureDailyRewardClaimTables(env);
  const payload = await getDailyRewardsPublicPayload(env);
  const weekStart = currentWeekStart();
  const claimed = await listClaimedKeys(env, userId, weekStart);
  const profile = await getUserLevel(env, userId);
  return {
    ...payload,
    weekStart,
    claimed: Array.from(claimed),
    profile,
  };
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
  const key = claimKey(day, missionId);
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
}

async function listClaimedKeys(env: Env, userId: string, weekStart: string): Promise<Set<string>> {
  const rows = await env.DB.prepare('SELECT day, mission_id FROM daily_reward_claims WHERE user_id = ? AND week_start = ?')
    .bind(userId, weekStart)
    .all<{ day: number; mission_id: string }>()
    .catch(() => ({ results: [] as { day: number; mission_id: string }[] }));
  return new Set((rows.results ?? []).map((row) => claimKey(row.day, row.mission_id)));
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

function clampDay(value: unknown): number {
  const day = Math.floor(Number(value) || 0);
  return Math.max(0, Math.min(6, day));
}

import { addUserXp, getUserLevel } from './levels';
import { adjustUserTonBalance } from './user-controls';
import { getDailyRewardsPublicPayload } from './daily-rewards-missions';
import { ensureDailyRewardEffectTables, grantDailyRewardEffect, rewardForDay, WEEKLY_DAILY_REWARDS } from './daily-rewards-effects';
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
  const claimedDays = await listClaimedRewardDays(env, userId, weekStart);
  const progress = await listProgress(env, userId, weekStart);
  const profile = await getUserLevel(env, userId);
  const today = currentMondayDay();
  const trustedAccess = await hasTrustedDailyRewardsAccess(env, userId);
  const visitStartDay = trustedAccess ? 0 : await getOrCreateDailyRewardWeekStartDay(env, userId, weekStart, today);
  const missedDay = trustedAccess ? null : firstMissedDayFromStart(claimedDays, today, visitStartDay);
  const claimableRewards = trustedAccess
    ? WEEKLY_DAILY_REWARDS.filter((reward) => !claimedDays.has(Number(reward.day))).map((reward) => reward.id)
    : (missedDay === null && !claimedDays.has(today) ? [rewardForDay(today)?.id].filter(Boolean) : []);
  return {
    ...payload,
    rewards: WEEKLY_DAILY_REWARDS,
    weekStart,
    weekEndsAt: currentWeekEnd(),
    timezone: 'Europe/Berlin',
    today,
    trustedAccess,
    visitStartDay,
    claimed: Array.from(claimed),
    claimedDays: Array.from(claimedDays),
    missedDay,
    lockedUntilNextWeek: !trustedAccess && missedDay !== null,
    progress: Object.fromEntries(progress),
    claimable: claimableKeys(payload.days, progress, claimed),
    claimableRewards,
    profile,
  };
}

export async function recordDailyRewardEvent(env: Env, input: { userId?: unknown; eventType?: unknown; section?: unknown; side?: unknown; amount?: unknown; volumeNano?: unknown }): Promise<void> {
  const userId = cleanUserId(input.userId);
  const eventType = cleanEventType(input.eventType);
  const section = cleanSection(input.section);
  const side = cleanSide(input.side);
  const amount = Math.max(1, Math.floor(Number(input.amount) || 1));
  const volumeNano = Math.max(0, Math.floor(Number(input.volumeNano) || 0));
  await ensureDailyRewardClaimTables(env);
  const weekStart = currentWeekStart();
  const day = currentMondayDay();
  await getOrCreateDailyRewardWeekStartDay(env, userId, weekStart, day);
  const keys = progressKeysForEvent(eventType, section, side);
  for (const key of keys) await incrementProgress(env, userId, weekStart, day, key, amount);
  if (volumeNano > 0) await incrementProgress(env, userId, weekStart, day, 'bet_volume_nano', volumeNano);
}

export async function claimDailyRewardMission(env: Env, input: { userId?: unknown; missionId?: unknown; day?: unknown }): Promise<Record<string, unknown>> {
  const userId = cleanUserId(input.userId);
  const missionId = cleanMissionId(input.missionId);
  const day = clampDay(input.day);
  const today = currentMondayDay();
  if (day !== today) throw new Error('Only today missions can be claimed');
  await ensureDailyRewardClaimTables(env);

  const payload = await getDailyRewardsPublicPayload(env);
  const dayConfig = payload.days.find((item) => Number(item.day) === day);
  const mission = dayConfig?.missions.find((item) => item.id === missionId);
  if (!mission) throw new Error('Mission is not active for this day');

  const weekStart = currentWeekStart();
  await getOrCreateDailyRewardWeekStartDay(env, userId, weekStart, today);
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



export async function claimWeeklyDailyReward(env: Env, input: { userId?: unknown; rewardId?: unknown; day?: unknown }): Promise<Record<string, unknown>> {
  const userId = cleanUserId(input.userId);
  const rewardId = cleanMissionId(input.rewardId);
  const day = clampDay(input.day);
  const today = currentMondayDay();
  await ensureDailyRewardClaimTables(env);
  await ensureDailyRewardEffectTables(env);
  const trustedAccess = await hasTrustedDailyRewardsAccess(env, userId);
  if (!trustedAccess && day !== today) throw new Error('Only today reward can be claimed');

  const reward = rewardForDay(day);
  if (!reward || reward.id !== rewardId) throw new Error('Reward is not active for this day');
  const weekStart = currentWeekStart();
  const visitStartDay = trustedAccess ? 0 : await getOrCreateDailyRewardWeekStartDay(env, userId, weekStart, today);
  const claimedDays = await listClaimedRewardDays(env, userId, weekStart);
  const missedDay = firstMissedDayFromStart(claimedDays, today, visitStartDay);
  if (!trustedAccess && missedDay !== null) throw new Error('Wait until next week');
  if (!trustedAccess && day === 6 && !hasRequiredPreviousDaysClaimed(claimedDays, visitStartDay, 6)) throw new Error('Weekly vault requires all previous days from your first visit');

  const existing = await env.DB.prepare('SELECT id FROM daily_reward_claims WHERE user_id = ? AND week_start = ? AND day = ? AND mission_id = ?')
    .bind(userId, weekStart, day, rewardId)
    .first<{ id: string }>()
    .catch(() => null);
  if (existing?.id) {
    return { ok: true, alreadyClaimed: true, claimedKey: claimKey(day, rewardId), claimedDay: day, reward, weekStart, trustedAccess, visitStartDay, profile: await getUserLevel(env, userId) };
  }

  const id = 'dr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 28);
  await env.DB.prepare(`INSERT INTO daily_reward_claims (id, user_id, week_start, day, mission_id, xp, claimed_at) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`)
    .bind(id, userId, weekStart, day, rewardId)
    .run();

  let effect: Record<string, unknown> | null = null;
  let tonBalanceNano: number | null = null;
  if (reward.kind === 'ton') {
    const controls = await adjustUserTonBalance(env, userId, reward.amountNano || 0, { kind: 'adjustment', title: reward.title, referenceId: id, referenceType: 'daily_reward', metadata: { rewardId, day, weekStart, trustedAccess, visitStartDay } });
    tonBalanceNano = controls.tonBalanceNano;
  } else {
    effect = await grantDailyRewardEffect(env, { userId, weekStart, reward, claimId: id });
  }

  return {
    ok: true,
    alreadyClaimed: false,
    claimedKey: claimKey(day, rewardId),
    claimedDay: day,
    reward,
    effect,
    tonBalanceNano,
    weekStart,
    trustedAccess,
    visitStartDay,
    profile: await getUserLevel(env, userId),
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
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS daily_reward_user_weeks (
    user_id TEXT NOT NULL,
    week_start TEXT NOT NULL,
    start_day INTEGER NOT NULL,
    first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, week_start)
  )`).run();
  await ensureDailyRewardEffectTables(env);
}

async function getOrCreateDailyRewardWeekStartDay(env: Env, userId: string, weekStart: string, today: number): Promise<number> {
  const safeToday = clampDay(today);
  const existing = await env.DB.prepare('SELECT start_day FROM daily_reward_user_weeks WHERE user_id = ? AND week_start = ?')
    .bind(userId, weekStart)
    .first<{ start_day: number }>()
    .catch(() => null);
  if (existing && Number.isFinite(Number(existing.start_day))) return clampDay(existing.start_day);
  await env.DB.prepare(`INSERT OR IGNORE INTO daily_reward_user_weeks (user_id, week_start, start_day, first_seen_at, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(userId, weekStart, safeToday)
    .run()
    .catch(() => undefined);
  const row = await env.DB.prepare('SELECT start_day FROM daily_reward_user_weeks WHERE user_id = ? AND week_start = ?')
    .bind(userId, weekStart)
    .first<{ start_day: number }>()
    .catch(() => null);
  return Number.isFinite(Number(row?.start_day)) ? clampDay(row?.start_day) : safeToday;
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

async function listClaimedRewardDays(env: Env, userId: string, weekStart: string): Promise<Set<number>> {
  const rows = await env.DB.prepare('SELECT day, mission_id FROM daily_reward_claims WHERE user_id = ? AND week_start = ?')
    .bind(userId, weekStart)
    .all<{ day: number; mission_id: string }>()
    .catch(() => ({ results: [] as { day: number; mission_id: string }[] }));
  const rewardIds = new Set(WEEKLY_DAILY_REWARDS.map((reward) => reward.id));
  return new Set((rows.results ?? []).filter((row) => rewardIds.has(String(row.mission_id))).map((row) => clampDay(row.day)));
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
  const today = currentMondayDay();
  const todayConfig = days.find((item) => Number(item.day) === today);
  for (const mission of todayConfig?.missions ?? []) {
    const key = claimKey(today, mission.id);
    if (!claimed.has(key) && isMissionComplete(mission, progress)) out.push(key);
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
  const nano = 1_000_000_000;
  const table: Record<string, { key: string; amount: number; kind: 'ok' | 'blocked' }> = {
    open_app: { key: 'open_app', amount: 1, kind: 'ok' },
    daily_streak: { key: 'open_app', amount: 1, kind: 'ok' },
    open_play_zone: { key: 'open_section:play', amount: 1, kind: 'ok' },
    open_market: { key: 'open_section:market', amount: 1, kind: 'ok' },
    check_top_players: { key: 'open_section:topplayers', amount: 1, kind: 'ok' },
    check_level_progress: { key: 'open_section:profile', amount: 1, kind: 'ok' },
    play_predict_1: { key: 'play_predict_rounds', amount: 1, kind: 'ok' },
    play_predict_3: { key: 'play_predict_rounds', amount: 3, kind: 'ok' },
    play_predict_5: { key: 'play_predict_rounds', amount: 5, kind: 'ok' },
    play_predict_7: { key: 'play_predict_rounds', amount: 7, kind: 'ok' },
    win_predict_1: { key: 'win_predict_rounds', amount: 1, kind: 'ok' },
    win_predict_2: { key: 'win_predict_rounds', amount: 2, kind: 'ok' },
    win_predict_3: { key: 'win_predict_rounds', amount: 3, kind: 'ok' },
    place_bets_3: { key: 'place_bets', amount: 3, kind: 'ok' },
    place_bets_5: { key: 'place_bets', amount: 5, kind: 'ok' },
    place_bets_10: { key: 'place_bets', amount: 10, kind: 'ok' },
    use_up_down: { key: 'used_both_directions', amount: 1, kind: 'ok' },
    bet_10_ton: { key: 'bet_volume_nano', amount: 10 * nano, kind: 'ok' },
    bet_20_ton: { key: 'bet_volume_nano', amount: 20 * nano, kind: 'ok' },
    bet_30_ton: { key: 'bet_volume_nano', amount: 30 * nano, kind: 'ok' },
    win_any_game: { key: 'win_any_game', amount: 1, kind: 'ok' },
  };
  return table[missionId] || { key: missionId, amount: 1, kind: 'blocked' };
}

function progressKeysForEvent(eventType: string, section: string, side: string): string[] {
  const keys: string[] = [];
  if (eventType === 'open_app') keys.push('open_app');
  if (eventType === 'open_section' && section) keys.push(`open_section:${sectionAlias(section)}`);
  if (eventType === 'predict_bet') {
    keys.push('play_predict_rounds', 'place_bets');
    if (side === 'up') keys.push('used_side_up');
    if (side === 'down') keys.push('used_side_down');
    if (side) keys.push('used_both_directions');
  }
  if (eventType === 'predict_win') keys.push('win_predict_rounds', 'win_any_game');
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

function berlinDateParts(date = new Date()): { year: string; month: string; day: string; weekday: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);
  const out: { year: string; month: string; day: string; weekday: string } = { year: '', month: '', day: '', weekday: '' };
  for (const part of parts) if (part.type in out) out[part.type as keyof typeof out] = part.value;
  return out;
}

function currentWeekStart(): string {
  const parts = berlinDateParts();
  const utc = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  const day = currentMondayDay();
  utc.setUTCDate(utc.getUTCDate() - day);
  return utc.toISOString().slice(0, 10);
}

function currentMondayDay(): number {
  const weekday = berlinDateParts().weekday;
  const table: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return table[weekday] ?? 0;
}

function currentWeekEnd(): string {
  const start = new Date(currentWeekStart() + 'T00:00:00.000Z');
  start.setUTCDate(start.getUTCDate() + 7);
  return start.toISOString();
}

function firstMissedDayFromStart(claimedDays: Set<number>, today: number, startDay: number): number | null {
  const start = clampDay(startDay);
  for (let day = start; day < today; day += 1) if (!claimedDays.has(day)) return day;
  return null;
}

function hasRequiredPreviousDaysClaimed(claimedDays: Set<number>, startDay: number, day: number): boolean {
  const start = clampDay(startDay);
  for (let index = start; index < day; index += 1) if (!claimedDays.has(index)) return false;
  return true;
}

async function hasTrustedDailyRewardsAccess(env: Env, userId: string): Promise<boolean> {
  const id = String(userId || '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) return false;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_user_access_overrides (
    user_id TEXT PRIMARY KEY,
    trusted_access INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run().catch(() => undefined);
  const row = await env.DB.prepare('SELECT trusted_access FROM admin_user_access_overrides WHERE user_id = ?')
    .bind(id)
    .first<{ trusted_access: number | boolean | null }>()
    .catch(() => null);
  return row?.trusted_access === 1 || row?.trusted_access === true;
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

function cleanSide(value: unknown): string {
  const side = String(value ?? '').toLowerCase();
  return side === 'up' || side === 'down' ? side : '';
}

function clampDay(value: unknown): number {
  const day = Math.floor(Number(value) || 0);
  return Math.max(0, Math.min(6, day));
}

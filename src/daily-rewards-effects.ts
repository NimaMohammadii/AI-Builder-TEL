import type { Env } from './types';

export type WeeklyDailyReward = {
  id: string;
  day: number;
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  kind: 'ton' | 'loss_cashback' | 'risk_free' | 'free_slot' | 'double_win';
  amountNano?: number;
  percent?: number;
  durationHours?: number;
  maxBonusNano?: number;
  maxWins?: number;
  plays?: number;
};

export type DailyRewardEffectGrant = {
  effectType: string;
  expiresAt: string | null;
  remainingCount: number | null;
  remainingNano: number | null;
  percent: number | null;
  metadata: Record<string, unknown>;
};

const NANO = 1_000_000_000;

export const WEEKLY_DAILY_REWARDS: WeeklyDailyReward[] = [
  { id: 'day1-ton-starter', day: 0, title: 'TON Starter', shortTitle: '0.05 TON', description: 'Guaranteed starter TON for opening the week.', badge: '0.05 TON', kind: 'ton', amountNano: Math.round(0.05 * NANO) },
  { id: 'day2-loss-cashback', day: 1, title: 'Loss Cashback', shortTitle: '20% Cashback', description: '20% cashback on losses for 24 hours after claim.', badge: '20%', kind: 'loss_cashback', percent: 20, durationHours: 24 },
  { id: 'day3-ton-boost', day: 2, title: 'TON Boost', shortTitle: '0.30 TON', description: 'Guaranteed stronger TON reward for day 3.', badge: '0.30 TON', kind: 'ton', amountNano: Math.round(0.3 * NANO) },
  { id: 'day4-risk-free-x3', day: 3, title: 'Risk Free x3', shortTitle: 'Risk-Free x3', description: 'The next 3 losing plays are refunded by the reward system.', badge: 'x3', kind: 'risk_free', plays: 3 },
  { id: 'day5-free-slots', day: 4, title: 'Free Slots', shortTitle: '2 Free Slots', description: 'Two free Slot plays. Winning plays keep the payout; losing Slot plays can be refunded.', badge: 'x2', kind: 'free_slot', plays: 2 },
  { id: 'day6-double-win', day: 5, title: 'Double Win Day', shortTitle: '2x Wins', description: 'Win rewards are doubled for 24 hours, capped at 1 TON bonus and the first 5 wins.', badge: '2x', kind: 'double_win', durationHours: 24, maxBonusNano: NANO, maxWins: 5 },
  { id: 'day7-weekly-mega-ton', day: 6, title: 'Weekly Mega TON', shortTitle: '2 TON Vault', description: 'Guaranteed 2 TON vault for users who claimed all previous 6 days.', badge: '2 TON', kind: 'ton', amountNano: 2 * NANO },
];

export async function ensureDailyRewardEffectTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS daily_reward_effects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    week_start TEXT NOT NULL,
    reward_id TEXT NOT NULL,
    claim_id TEXT,
    effect_type TEXT NOT NULL,
    percent INTEGER,
    remaining_count INTEGER,
    remaining_nano INTEGER,
    expires_at TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_daily_reward_effects_user_active ON daily_reward_effects(user_id, effect_type, expires_at)').run();
}

export function rewardById(id: string): WeeklyDailyReward | undefined {
  return WEEKLY_DAILY_REWARDS.find((reward) => reward.id === id);
}

export function rewardForDay(day: number): WeeklyDailyReward | undefined {
  return WEEKLY_DAILY_REWARDS.find((reward) => reward.day === day);
}

export async function grantDailyRewardEffect(env: Env, input: { userId: string; weekStart: string; reward: WeeklyDailyReward; claimId: string }): Promise<DailyRewardEffectGrant | null> {
  const reward = input.reward;
  if (reward.kind === 'ton') return null;
  await ensureDailyRewardEffectTables(env);
  const expiresAt = reward.durationHours ? sqlTimestamp(Date.now() + reward.durationHours * 60 * 60 * 1000) : null;
  const remainingCount = reward.kind === 'risk_free' || reward.kind === 'free_slot' ? reward.plays ?? 0 : reward.kind === 'double_win' ? reward.maxWins ?? 0 : null;
  const remainingNano = reward.kind === 'double_win' ? reward.maxBonusNano ?? 0 : null;
  const percent = reward.kind === 'loss_cashback' ? reward.percent ?? 0 : null;
  const metadata = reward.kind === 'free_slot' ? { games: ['slot'] } : reward.kind === 'risk_free' ? { games: ['all'] } : reward.kind === 'double_win' ? { maxBonusTon: (reward.maxBonusNano ?? 0) / NANO } : {};
  const id = 'dre_' + crypto.randomUUID().replace(/-/g, '').slice(0, 27);
  await env.DB.prepare(`INSERT INTO daily_reward_effects (id, user_id, week_start, reward_id, claim_id, effect_type, percent, remaining_count, remaining_nano, expires_at, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, input.userId, input.weekStart, reward.id, input.claimId, reward.kind, percent, remainingCount, remainingNano, expiresAt, JSON.stringify(metadata)).run();
  return { effectType: reward.kind, expiresAt, remainingCount, remainingNano, percent, metadata };
}

export async function applyDailyRewardGameDeltaBonuses(env: Env, userId: string, deltaNano: number): Promise<{ totalDeltaNano: number; bonusNano: number; applied: Array<{ effectType: string; bonusNano: number }> }> {
  const baseDelta = Math.floor(Number(deltaNano) || 0);
  if (!baseDelta) return { totalDeltaNano: 0, bonusNano: 0, applied: [] };
  await ensureDailyRewardEffectTables(env).catch(() => undefined);
  const applied: Array<{ effectType: string; bonusNano: number }> = [];
  let bonusNano = 0;
  if (baseDelta < 0) {
    const loss = Math.abs(baseDelta);
    const riskFree = await firstUsableEffect(env, userId, ['risk_free', 'free_slot']);
    if (riskFree) {
      bonusNano += loss;
      applied.push({ effectType: riskFree.effect_type, bonusNano: loss });
      await consumeEffect(env, riskFree.id, 1, 0);
    } else {
      const cashback = await firstUsableEffect(env, userId, ['loss_cashback']);
      const percent = Math.max(0, Math.min(100, Math.floor(Number(cashback?.percent) || 0)));
      if (cashback && percent > 0) {
        const refund = Math.floor(loss * percent / 100);
        if (refund > 0) {
          bonusNano += refund;
          applied.push({ effectType: cashback.effect_type, bonusNano: refund });
        }
      }
    }
  } else {
    const doubleWin = await firstUsableEffect(env, userId, ['double_win']);
    if (doubleWin) {
      const remainingNano = Math.max(0, Math.floor(Number(doubleWin.remaining_nano) || 0));
      const bonus = Math.min(baseDelta, remainingNano);
      if (bonus > 0) {
        bonusNano += bonus;
        applied.push({ effectType: doubleWin.effect_type, bonusNano: bonus });
        await consumeEffect(env, doubleWin.id, 1, bonus);
      }
    }
  }
  return { totalDeltaNano: baseDelta + bonusNano, bonusNano, applied };
}

type EffectRow = { id: string; effect_type: string; percent: number | null; remaining_count: number | null; remaining_nano: number | null };

async function firstUsableEffect(env: Env, userId: string, types: string[]): Promise<EffectRow | null> {
  if (!types.length) return null;
  const placeholders = types.map(() => '?').join(',');
  const row = await env.DB.prepare(`SELECT id, effect_type, percent, remaining_count, remaining_nano FROM daily_reward_effects
    WHERE user_id = ? AND effect_type IN (${placeholders})
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      AND (remaining_count IS NULL OR remaining_count > 0)
      AND (remaining_nano IS NULL OR remaining_nano > 0)
    ORDER BY created_at ASC LIMIT 1`).bind(userId, ...types).first<EffectRow>().catch(() => null);
  return row || null;
}

async function consumeEffect(env: Env, id: string, countDelta: number, nanoDelta: number): Promise<void> {
  await env.DB.prepare(`UPDATE daily_reward_effects SET
    remaining_count = CASE WHEN remaining_count IS NULL THEN NULL ELSE MAX(0, remaining_count - ?) END,
    remaining_nano = CASE WHEN remaining_nano IS NULL THEN NULL ELSE MAX(0, remaining_nano - ?) END,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`).bind(Math.max(0, countDelta), Math.max(0, nanoDelta), id).run().catch(() => undefined);
}

function sqlTimestamp(value: number): string {
  return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
}

import type { Env } from './types';
import { adjustUserTonBalance } from './user-controls';

const REFERRAL_REWARD_NANO = 100_000_000; // 0.1 TON
const DEFAULT_REFERRAL_MIN_DEPOSIT_NANO = 1_000_000_000; // 1 TON

type ReferralRow = {
  invited_user_id: string;
  referrer_user_id: string;
  status: string;
  reward_nano: number;
  deposit_reference_type: string | null;
  deposit_reference_id: string | null;
  rewarded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReferralDashboard = {
  userId: string;
  rewardNano: number;
  invitedCount: number;
  rewardedCount: number;
  pendingCount: number;
  earnedNano: number;
  referrals: Array<{
    invitedUserId: string;
    status: string;
    rewardNano: number;
    createdAt: string;
    rewardedAt: string | null;
  }>;
};

export async function registerReferral(env: Env, invitedUserIdInput: unknown, referrerUserIdInput: unknown): Promise<{ ok: true; registered: boolean }> {
  const invitedUserId = cleanUserId(invitedUserIdInput);
  const referrerUserId = cleanUserId(referrerUserIdInput);
  if (invitedUserId === referrerUserId) return { ok: true, registered: false };
  await ensureReferralTable(env);
  const existing = await env.DB.prepare('SELECT invited_user_id FROM referrals WHERE invited_user_id = ? LIMIT 1')
    .bind(invitedUserId)
    .first<{ invited_user_id: string }>();
  if (existing) return { ok: true, registered: false };
  await env.DB.prepare(`INSERT INTO referrals (invited_user_id, referrer_user_id, status, reward_nano, created_at, updated_at)
    VALUES (?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(invitedUserId, referrerUserId, REFERRAL_REWARD_NANO)
    .run();
  return { ok: true, registered: true };
}

export async function getReferralDashboard(env: Env, userIdInput: unknown): Promise<ReferralDashboard> {
  const userId = cleanUserId(userIdInput);
  await ensureReferralTable(env);
  const rows = await env.DB.prepare('SELECT * FROM referrals WHERE referrer_user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100')
    .bind(userId)
    .all<ReferralRow>();
  const referrals = (rows.results ?? []).map((row) => ({
    invitedUserId: maskUserId(row.invited_user_id),
    status: row.status,
    rewardNano: Number(row.reward_nano || REFERRAL_REWARD_NANO),
    createdAt: row.created_at,
    rewardedAt: row.rewarded_at,
  }));
  const rewardedCount = referrals.filter((item) => item.status === 'rewarded').length;
  const earnedNano = referrals.filter((item) => item.status === 'rewarded').reduce((sum, item) => sum + item.rewardNano, 0);
  return {
    userId,
    rewardNano: REFERRAL_REWARD_NANO,
    invitedCount: referrals.length,
    rewardedCount,
    pendingCount: referrals.filter((item) => item.status !== 'rewarded').length,
    earnedNano,
    referrals,
  };
}

export async function applyReferralDepositReward(env: Env, invitedUserIdInput: unknown, depositReferenceType: string, depositReferenceId: string, depositAmountNanoInput: unknown): Promise<void> {
  const invitedUserId = cleanUserId(invitedUserIdInput);
  const referenceType = cleanText(depositReferenceType, 60) || 'deposit';
  const referenceId = cleanText(depositReferenceId, 120) || '';
  const depositAmountNano = Math.floor(Number(depositAmountNanoInput) || 0);
  if (!referenceId || depositAmountNano < referralMinDepositNano(env)) return;
  await ensureReferralTable(env);
  const row = await env.DB.prepare(`SELECT * FROM referrals WHERE invited_user_id = ? AND status = 'pending' LIMIT 1`)
    .bind(invitedUserId)
    .first<ReferralRow>();
  if (!row) return;
  const result = await env.DB.prepare(`UPDATE referrals
    SET status = 'rewarded', deposit_reference_type = ?, deposit_reference_id = ?, rewarded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE invited_user_id = ? AND status = 'pending'`)
    .bind(referenceType, referenceId, invitedUserId)
    .run();
  if ((result.meta?.changes || 0) <= 0) return;
  await adjustUserTonBalance(env, row.referrer_user_id, Number(row.reward_nano || REFERRAL_REWARD_NANO), {
    kind: 'referral',
    title: 'Referral reward',
    description: 'Friend made a qualifying first deposit',
    referenceId,
    referenceType,
    status: 'completed',
    metadata: { invitedUserId: maskUserId(invitedUserId), rewardNano: Number(row.reward_nano || REFERRAL_REWARD_NANO), depositAmountNano },
  });
}

async function ensureReferralTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS referrals (
    invited_user_id TEXT PRIMARY KEY,
    referrer_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reward_nano INTEGER NOT NULL DEFAULT 100000000,
    deposit_reference_type TEXT,
    deposit_reference_id TEXT,
    rewarded_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)').run();
}

function referralMinDepositNano(env: Env): number {
  const raw = Number((env as unknown as Record<string, unknown>).REFERRAL_MIN_DEPOSIT_NANO || DEFAULT_REFERRAL_MIN_DEPOSIT_NANO);
  return Number.isSafeInteger(raw) && raw > 0 ? raw : DEFAULT_REFERRAL_MIN_DEPOSIT_NANO;
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function cleanText(value: unknown, max: number): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, max);
}

function maskUserId(value: string): string {
  if (value.length <= 6) return value;
  return value.slice(0, 3) + '***' + value.slice(-2);
}

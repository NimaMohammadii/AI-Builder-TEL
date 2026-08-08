import type { Env } from './types';

const NANO = 1_000_000_000;
const SETTINGS_KEY = 'admin:finance-limits';

export type FinanceLimits = {
  minDepositNano: number;
  maxDepositNano: number;
  minWithdrawNano: number;
  maxWithdrawNano: number;
};

export const DEFAULT_FINANCE_LIMITS: FinanceLimits = {
  minDepositNano: 1 * NANO,
  maxDepositNano: 1000 * NANO,
  minWithdrawNano: 10 * NANO,
  maxWithdrawNano: 100 * NANO,
};

export async function getFinanceLimits(env: Env): Promise<FinanceLimits> {
  await ensureAdminSettings(env);
  const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(SETTINGS_KEY).first<{ value_json: string }>().catch(() => null);
  const parsed = safeJson(row?.value_json);
  return normalizeLimits(parsed);
}

export async function setFinanceLimits(env: Env, patch: Partial<Record<keyof FinanceLimits, unknown>>): Promise<FinanceLimits> {
  const current = await getFinanceLimits(env);
  const next = normalizeLimits({ ...current, ...patch });
  if (next.minDepositNano > next.maxDepositNano) throw new Error('Minimum deposit cannot be greater than maximum deposit');
  if (next.minWithdrawNano > next.maxWithdrawNano) throw new Error('Minimum withdrawal cannot be greater than maximum withdrawal');
  await ensureAdminSettings(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(SETTINGS_KEY, JSON.stringify(next))
    .run();
  return next;
}

export async function getFinanceStats(env: Env): Promise<Record<string, Record<string, number>>> {
  const [todayDeposits, weeklyDeposits, todayWithdrawals, weeklyWithdrawals, todayUsers, weeklyUsers] = await Promise.all([
    aggregate(env, "kind = 'deposit' AND amount_nano > 0 AND date(created_at) = date('now')"),
    aggregate(env, "kind = 'deposit' AND amount_nano > 0 AND datetime(created_at) >= datetime('now','-7 days')"),
    aggregate(env, "kind = 'withdraw' AND amount_nano < 0 AND date(created_at) = date('now')"),
    aggregate(env, "kind = 'withdraw' AND amount_nano < 0 AND datetime(created_at) >= datetime('now','-7 days')"),
    activeUsers(env, "date(COALESCE(last_seen_at, updated_at, created_at)) = date('now')"),
    activeUsers(env, "datetime(COALESCE(last_seen_at, updated_at, created_at)) >= datetime('now','-7 days')"),
  ]);
  return {
    today: { onlineUsers: todayUsers, depositNano: todayDeposits.amountNano, depositUsers: todayDeposits.users, withdrawNano: todayWithdrawals.amountNano, withdrawUsers: todayWithdrawals.users },
    weekly: { onlineUsers: weeklyUsers, depositNano: weeklyDeposits.amountNano, depositUsers: weeklyDeposits.users, withdrawNano: weeklyWithdrawals.amountNano, withdrawUsers: weeklyWithdrawals.users },
  };
}

async function aggregate(env: Env, where: string): Promise<{ amountNano: number; users: number }> {
  try {
    const row = await env.DB.prepare(`SELECT COALESCE(SUM(ABS(amount_nano)), 0) AS amountNano, COUNT(DISTINCT user_id) AS users FROM ton_transactions WHERE ${where}`).first<{ amountNano: number | string; users: number | string }>();
    return { amountNano: Number(row?.amountNano || 0), users: Number(row?.users || 0) };
  } catch { return { amountNano: 0, users: 0 }; }
}

async function activeUsers(env: Env, where: string): Promise<number> {
  try {
    const row = await env.DB.prepare(`SELECT COUNT(DISTINCT telegram_user_id) AS count FROM app_users WHERE ${where}`).first<{ count: number | string }>();
    return Number(row?.count || 0);
  } catch { return 0; }
}

async function ensureAdminSettings(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (name TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
}

function normalizeLimits(value: Record<string, unknown> | null): FinanceLimits {
  return {
    minDepositNano: cleanNano(value?.minDepositNano, DEFAULT_FINANCE_LIMITS.minDepositNano),
    maxDepositNano: cleanNano(value?.maxDepositNano, DEFAULT_FINANCE_LIMITS.maxDepositNano),
    minWithdrawNano: cleanNano(value?.minWithdrawNano, DEFAULT_FINANCE_LIMITS.minWithdrawNano),
    maxWithdrawNano: cleanNano(value?.maxWithdrawNano, DEFAULT_FINANCE_LIMITS.maxWithdrawNano),
  };
}

function cleanNano(value: unknown, fallback: number): number {
  const n = Math.floor(Number(value));
  return Number.isSafeInteger(n) && n >= 0 ? n : fallback;
}

function safeJson(value: unknown): Record<string, unknown> | null { try { const parsed = JSON.parse(String(value || '{}')); return parsed && typeof parsed === 'object' ? parsed : null; } catch { return null; } }
export function tonToNano(value: unknown): number { const n = Number(String(value ?? '').replace(',', '.')); if (!Number.isFinite(n) || n < 0) throw new Error('Invalid TON amount'); return Math.trunc(n * NANO); }
export function formatTonAmount(nano: unknown): string { return (Math.max(0, Math.floor(Number(nano) || 0)) / NANO).toLocaleString('en-US', { maximumFractionDigits: 6 }); }

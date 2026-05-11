import type { Env } from './types';
import { adjustUserTonBalance, getUserControls } from './user-controls';

const TON_NANO = 1_000_000_000;
const MIN_WITHDRAW_NANO = 1_000_000; // 0.001 TON

type WithdrawRow = {
  id: string;
  user_id: string;
  wallet_address: string;
  amount_nano: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TonWithdrawal = {
  id: string;
  userId: string;
  walletAddress: string;
  amountNano: number;
  amountTon: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export async function createTonWithdrawal(env: Env, userIdInput: unknown, amountTonInput: unknown, walletInput: unknown): Promise<TonWithdrawal> {
  const userId = cleanUserId(userIdInput);
  const wallet = cleanWallet(walletInput);
  const amountNano = tonToNano(amountTonInput);
  if (amountNano < MIN_WITHDRAW_NANO) throw new Error('Minimum withdrawal is 0.001 TON');

  const controls = await getUserControls(env, userId);
  if (controls.tonBalanceNano < amountNano) throw new Error('Not enough TON balance');

  await ensureTonWithdrawalsTable(env);
  const id = 'wd_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);

  await adjustUserTonBalance(env, userId, -amountNano);
  await env.DB.prepare(`INSERT INTO ton_withdrawals (id, user_id, wallet_address, amount_nano, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(id, userId, wallet, amountNano)
    .run();

  const row = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE id = ?').bind(id).first<WithdrawRow>();
  return rowToWithdrawal(row ?? {
    id,
    user_id: userId,
    wallet_address: wallet,
    amount_nano: amountNano,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function listUserTonWithdrawals(env: Env, userIdInput: unknown): Promise<{ withdrawals: TonWithdrawal[] }> {
  await ensureTonWithdrawalsTable(env);
  const userId = cleanUserId(userIdInput);
  const rows = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 30')
    .bind(userId)
    .all<WithdrawRow>();
  return { withdrawals: (rows.results ?? []).map(rowToWithdrawal) };
}

async function ensureTonWithdrawalsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ton_withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    amount_nano INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_withdrawals_user ON ton_withdrawals(user_id, created_at)').run();
}

function rowToWithdrawal(row: WithdrawRow): TonWithdrawal {
  return {
    id: row.id,
    userId: row.user_id,
    walletAddress: row.wallet_address,
    amountNano: Number(row.amount_nano || 0),
    amountTon: Number(row.amount_nano || 0) / TON_NANO,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function tonToNano(value: unknown): number {
  const raw = String(value ?? '').replace(',', '.').trim();
  if (!raw) throw new Error('Enter withdrawal amount');
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) throw new Error('Enter a valid TON amount');
  const nano = Math.floor(n * TON_NANO);
  if (!Number.isSafeInteger(nano) || nano < 1) throw new Error('Enter a valid TON amount');
  if (nano > 10_000_000 * TON_NANO) throw new Error('Withdrawal amount is too large');
  return nano;
}

function cleanWallet(value: unknown): string {
  const wallet = String(value ?? '').trim().slice(0, 120);
  if (!wallet) throw new Error('Enter your TON wallet address');
  if (!/^[A-Za-z0-9_\-:]{24,120}$/.test(wallet)) throw new Error('Enter a valid TON wallet address');
  return wallet;
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

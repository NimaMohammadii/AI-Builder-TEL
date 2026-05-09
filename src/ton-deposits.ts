import type { Env } from './types';
import { adjustUserTonBalance } from './user-controls';

const TONCENTER_BASE = 'https://toncenter.com/api/v2';
const DEFAULT_MIN_TON = 0.1;

type DepositRow = {
  id: string;
  user_id: string;
  amount_ton: string;
  amount_nano: string;
  ton_balance_nano: number;
  status: string;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
};

type ToncenterTransaction = {
  transaction_id?: { hash?: string };
  in_msg?: {
    destination?: string;
    source?: string;
    value?: string;
    message?: string;
  };
};

type ToncenterResponse = {
  ok?: boolean;
  result?: ToncenterTransaction[];
  error?: string;
};

export type TonDeposit = {
  id: string;
  userId: string;
  amountTon: string;
  amountNano: string;
  tonBalanceNano: number;
  status: string;
  txHash: string | null;
  payUrl: string;
  wallet: string;
  createdAt: string;
  updatedAt: string;
};

export async function createTonDeposit(env: Env, userId: string, amountTonInput: unknown): Promise<TonDeposit> {
  const wallet = treasuryWallet(env);
  const user = cleanUserId(userId);
  const amountTon = normalizeAmountTon(amountTonInput);
  const minTon = minDepositTon(env);
  if (Number(amountTon) < minTon) throw new Error(`Minimum deposit is ${minTon} TON`);
  const amountNano = tonToNanoString(amountTon);
  const tonBalanceNano = safeNanoNumber(amountNano);
  const depositId = 'dep_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await ensureTonDepositsTable(env);
  await env.DB.prepare(`INSERT INTO ton_deposits (id, user_id, amount_ton, amount_nano, ton_balance_nano, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(depositId, user, amountTon, amountNano, tonBalanceNano)
    .run();
  return rowToDeposit({ id: depositId, user_id: user, amount_ton: amountTon, amount_nano: amountNano, ton_balance_nano: tonBalanceNano, status: 'pending', tx_hash: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, wallet);
}

export async function getTonDeposit(env: Env, depositId: string): Promise<TonDeposit | null> {
  await ensureTonDepositsTable(env);
  const row = await env.DB.prepare('SELECT * FROM ton_deposits WHERE id = ?').bind(cleanDepositId(depositId)).first<DepositRow>();
  return row ? rowToDeposit(row, treasuryWallet(env)) : null;
}

export async function verifyTonDeposit(env: Env, depositId: string): Promise<TonDeposit> {
  const id = cleanDepositId(depositId);
  await ensureTonDepositsTable(env);
  const row = await env.DB.prepare('SELECT * FROM ton_deposits WHERE id = ?').bind(id).first<DepositRow>();
  if (!row) throw new Error('Deposit not found');
  if (row.status === 'completed') return rowToDeposit(row, treasuryWallet(env));
  const wallet = treasuryWallet(env);
  const tx = await findMatchingTransaction(env, wallet, row);
  if (!tx) return rowToDeposit(row, wallet);
  const txHash = tx.transaction_id?.hash || '';
  if (!txHash) throw new Error('Transaction hash missing');
  const used = await env.DB.prepare('SELECT id FROM ton_deposits WHERE tx_hash = ? LIMIT 1').bind(txHash).first<{ id: string }>();
  if (used && used.id !== row.id) throw new Error('Transaction already used');
  await env.DB.prepare(`UPDATE ton_deposits SET status = 'completed', tx_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'completed'`)
    .bind(txHash, id)
    .run();
  await adjustUserTonBalance(env, row.user_id, row.ton_balance_nano);
  const completed = await env.DB.prepare('SELECT * FROM ton_deposits WHERE id = ?').bind(id).first<DepositRow>();
  return rowToDeposit(completed ?? { ...row, status: 'completed', tx_hash: txHash }, wallet);
}

export async function listUserTonDeposits(env: Env, userId: string): Promise<{ deposits: TonDeposit[] }> {
  await ensureTonDepositsTable(env);
  const wallet = treasuryWallet(env);
  const rows = await env.DB.prepare('SELECT * FROM ton_deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').bind(cleanUserId(userId)).all<DepositRow>();
  return { deposits: (rows.results ?? []).map((row) => rowToDeposit(row, wallet)) };
}

async function findMatchingTransaction(env: Env, wallet: string, row: DepositRow): Promise<ToncenterTransaction | null> {
  const key = envValue(env, 'TONCENTER_API_KEY');
  if (!key) throw new Error('TON API key is not configured');
  const url = `${TONCENTER_BASE}/getTransactions?address=${encodeURIComponent(wallet)}&limit=30`;
  const res = await fetch(url, { headers: { 'X-API-Key': key } });
  const json = await res.json() as ToncenterResponse;
  if (!json.ok || !Array.isArray(json.result)) throw new Error(json.error || 'Could not read TON transactions');
  const expected = BigInt(row.amount_nano);
  for (const tx of json.result) {
    const msg = tx.in_msg;
    if (!msg) continue;
    const comment = String(msg.message || '').trim();
    if (comment !== row.id) continue;
    const value = BigInt(String(msg.value || '0'));
    if (value < expected) continue;
    return tx;
  }
  return null;
}

function rowToDeposit(row: DepositRow, wallet: string): TonDeposit {
  return {
    id: row.id,
    userId: row.user_id,
    amountTon: row.amount_ton,
    amountNano: row.amount_nano,
    tonBalanceNano: row.ton_balance_nano,
    status: row.status,
    txHash: row.tx_hash,
    payUrl: tonPayUrl(wallet, row.amount_nano, row.id),
    wallet,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function tonPayUrl(wallet: string, amountNano: string, comment: string): string {
  return `ton://transfer/${encodeURIComponent(wallet)}?amount=${encodeURIComponent(amountNano)}&text=${encodeURIComponent(comment)}`;
}

async function ensureTonDepositsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ton_deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_ton TEXT NOT NULL,
    amount_nano TEXT NOT NULL,
    ton_balance_nano INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    tx_hash TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('ALTER TABLE ton_deposits ADD COLUMN ton_balance_nano INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_deposits_user ON ton_deposits(user_id, created_at)').run();
}

function treasuryWallet(env: Env): string {
  const wallet = envValue(env, 'TON_TREASURY_WALLET');
  if (!wallet) throw new Error('TON treasury wallet is not configured');
  return wallet;
}

function minDepositTon(env: Env): number {
  const value = Number(envValue(env, 'TON_MIN_DEPOSIT') || DEFAULT_MIN_TON);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MIN_TON;
}

function envValue(env: Env, name: string): string {
  return String((env as unknown as Record<string, unknown>)[name] || '').trim();
}

function normalizeAmountTon(value: unknown): string {
  const num = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(num) || num <= 0) throw new Error('Enter a valid TON amount');
  return String(Math.floor(num * 1_000_000_000) / 1_000_000_000);
}

function tonToNanoString(amountTon: string): string {
  const [whole, fractionRaw = ''] = amountTon.split('.');
  const fraction = (fractionRaw + '000000000').slice(0, 9);
  return (BigInt(whole || '0') * 1000000000n + BigInt(fraction || '0')).toString();
}

function safeNanoNumber(value: string): number {
  const numberValue = Number(value);
  if (!Number.isSafeInteger(numberValue) || numberValue < 1) throw new Error('TON amount is too large');
  return numberValue;
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function cleanDepositId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing deposit id');
  return id;
}

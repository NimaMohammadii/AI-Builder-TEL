import { Address, comment } from '@ton/ton';
import type { Env } from './types';
import { assertUserNotBanned } from './user-controls';
import { getFinanceLimits, formatTonAmount } from './admin-finance-controls';
import { awardDepositXp } from './xp-rewards';
import { recordTonTransaction } from './ton-transactions';

const TONCENTER_BASE = 'https://toncenter.com/api/v3';
const DEFAULT_MIN_TON = 1;

type DepositRow = {
  id: string;
  user_id: string;
  amount_ton: string;
  amount_nano: string;
  ton_balance_nano: number;
  status: string;
  tx_hash: string | null;
  wallet_address: string | null;
  credited_at: string | null;
  created_at: string;
  updated_at: string;
};

type ToncenterMessage = {
  source?: string | null;
  destination?: string | null;
  value?: string;
  created_at?: string | number | null;
  in_msg_tx_hash?: string | null;
  message_content?: { hash?: string | null } | null;
};

type ToncenterMessagesResponse = {
  messages?: ToncenterMessage[];
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
  senderWallet: string | null;
  payload: string;
  createdAt: string;
  updatedAt: string;
};

export async function createTonDeposit(env: Env, userId: string, amountTonInput: unknown, walletAddressInput: unknown): Promise<TonDeposit> {
  const wallet = treasuryWallet(env);
  const user = cleanUserId(userId);
  const senderWallet = canonicalTonAddress(walletAddressInput, 'Invalid connected wallet');
  const amountTon = normalizeAmountTon(amountTonInput);
  await assertUserNotBanned(env, user);
  const limits = await getFinanceLimits(env);
  const amountNanoValue = safeNanoNumber(tonToNanoString(amountTon));
  const minNano = limits.minDepositNano || Math.trunc(minDepositTon(env) * 1_000_000_000);
  if (amountNanoValue < minNano) throw new Error(`Minimum deposit is ${formatTonAmount(minNano)} GRAM`);
  if (limits.maxDepositNano && amountNanoValue > limits.maxDepositNano) throw new Error(`Maximum deposit is ${formatTonAmount(limits.maxDepositNano)} GRAM`);
  const amountNano = tonToNanoString(amountTon);
  const tonBalanceNano = amountNanoValue;
  const depositId = 'dep_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await ensureTonDepositsTable(env);
  await env.DB.prepare(`INSERT INTO ton_deposits (id, user_id, amount_ton, amount_nano, ton_balance_nano, status, wallet_address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(depositId, user, amountTon, amountNano, tonBalanceNano, senderWallet)
    .run();
  return rowToDeposit({
    id: depositId,
    user_id: user,
    amount_ton: amountTon,
    amount_nano: amountNano,
    ton_balance_nano: tonBalanceNano,
    status: 'pending',
    tx_hash: null,
    wallet_address: senderWallet,
    credited_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, wallet);
}

export async function getTonDeposit(env: Env, userId: string, depositId: string): Promise<TonDeposit | null> {
  await ensureTonDepositsTable(env);
  const user = cleanUserId(userId);
  const row = await env.DB.prepare('SELECT * FROM ton_deposits WHERE id = ? AND user_id = ?')
    .bind(cleanDepositId(depositId), user)
    .first<DepositRow>();
  return row ? rowToDeposit(row, treasuryWallet(env)) : null;
}

export async function verifyTonDeposit(env: Env, userId: string, depositId: string): Promise<TonDeposit> {
  const id = cleanDepositId(depositId);
  const user = cleanUserId(userId);
  await ensureTonDepositsTable(env);
  const row = await env.DB.prepare('SELECT * FROM ton_deposits WHERE id = ? AND user_id = ?').bind(id, user).first<DepositRow>();
  if (!row) throw new Error('Deposit not found');
  const wallet = treasuryWallet(env);
  if (row.status === 'completed') return rowToDeposit(row, wallet);
  const tx = await findMatchingTransaction(env, wallet, row);
  if (!tx) return rowToDeposit(row, wallet);
  const txHash = String(tx.in_msg_tx_hash || '').trim();
  if (!txHash) throw new Error('Transaction hash missing');
  const used = await env.DB.prepare('SELECT id FROM ton_deposits WHERE tx_hash = ? LIMIT 1').bind(txHash).first<{ id: string }>();
  if (used && used.id !== row.id) throw new Error('Transaction already used');

  const settlement = await settleTonDeposit(env, row, txHash);
  const completed = await env.DB.prepare('SELECT * FROM ton_deposits WHERE id = ? AND user_id = ?').bind(id, user).first<DepositRow>();
  const finalRow = completed ?? { ...row, status: settlement.applied ? 'completed' : row.status, tx_hash: settlement.applied ? txHash : row.tx_hash };

  if (settlement.applied) {
    await recordTonTransaction(env, row.user_id, row.ton_balance_nano, settlement.balanceAfterNano, {
      kind: 'deposit',
      title: 'GRAM wallet deposit',
      description: `${row.amount_ton} GRAM wallet payment`,
      referenceId: row.id,
      referenceType: 'ton_deposit',
      status: 'completed',
      metadata: { txHash, senderWallet: row.wallet_address },
    }).catch((error) => console.warn('GRAM deposit ledger record failed', error));
    await awardDepositXp(env, row.user_id, 'ton_deposit', row.id);
  }

  return rowToDeposit(finalRow, wallet);
}

export async function listUserTonDeposits(env: Env, userId: string): Promise<{ deposits: TonDeposit[] }> {
  await ensureTonDepositsTable(env);
  const wallet = treasuryWallet(env);
  const rows = await env.DB.prepare('SELECT * FROM ton_deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').bind(cleanUserId(userId)).all<DepositRow>();
  return { deposits: (rows.results ?? []).map((row) => rowToDeposit(row, wallet)) };
}

async function settleTonDeposit(env: Env, row: DepositRow, txHash: string): Promise<{ applied: boolean; balanceAfterNano: number }> {
  const claim = 'credit_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  const results = await env.DB.batch([
    env.DB.prepare(`UPDATE ton_deposits
      SET status = 'completed', tx_hash = ?, credited_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND status != 'completed' AND credited_at IS NULL`)
      .bind(txHash, claim, row.id, row.user_id),
    env.DB.prepare(`INSERT INTO app_users (telegram_user_id, current_section, ton_balance_nano, last_seen_at, updated_at)
      SELECT ?, 'home', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      WHERE EXISTS (SELECT 1 FROM ton_deposits WHERE id = ? AND user_id = ? AND credited_at = ?)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        ton_balance_nano = max(0, app_users.ton_balance_nano + excluded.ton_balance_nano),
        updated_at = CURRENT_TIMESTAMP`)
      .bind(row.user_id, row.ton_balance_nano, row.id, row.user_id, claim),
    env.DB.prepare(`UPDATE ton_deposits
      SET credited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND credited_at = ?`)
      .bind(row.id, row.user_id, claim),
  ]);
  const applied = Number(results[0]?.meta?.changes || 0) > 0;
  const balance = await env.DB.prepare('SELECT ton_balance_nano FROM app_users WHERE telegram_user_id = ?')
    .bind(row.user_id)
    .first<{ ton_balance_nano: number }>();
  return { applied, balanceAfterNano: Math.max(0, Math.floor(Number(balance?.ton_balance_nano) || 0)) };
}

async function findMatchingTransaction(env: Env, wallet: string, row: DepositRow): Promise<ToncenterMessage | null> {
  const key = envValue(env, 'TONCENTER_API_KEY');
  if (!key) throw new Error('TON API key is not configured');
  const sender = row.wallet_address ? canonicalTonAddress(row.wallet_address, 'Invalid connected wallet') : '';
  if (!sender) throw new Error('Connected wallet is missing for this deposit');
  const destination = canonicalTonAddress(wallet, 'Invalid treasury wallet');
  const createdAt = Date.parse(row.created_at || '');
  const startUtime = Number.isFinite(createdAt) ? Math.max(0, Math.floor(createdAt / 1000) - 120) : Math.max(0, Math.floor(Date.now() / 1000) - 86400);
  const bodyHash = comment(row.id).hash().toString('base64');
  const params = new URLSearchParams({
    source: sender,
    destination,
    body_hash: bodyHash,
    start_utime: String(startUtime),
    limit: '20',
    sort: 'desc',
  });
  const res = await fetch(`${TONCENTER_BASE}/messages?${params.toString()}`, { headers: { 'X-API-Key': key } });
  const json = await res.json().catch(() => ({})) as ToncenterMessagesResponse;
  if (!res.ok || !Array.isArray(json.messages)) throw new Error(json.error || 'Could not read GRAM transactions');
  const expected = BigInt(row.amount_nano);
  for (const message of json.messages) {
    if (String(message.value || '') !== expected.toString()) continue;
    if (canonicalTonAddress(message.source, 'Invalid transaction source') !== sender) continue;
    if (canonicalTonAddress(message.destination, 'Invalid transaction destination') !== destination) continue;
    if (!String(message.in_msg_tx_hash || '').trim()) continue;
    return message;
  }
  return null;
}

function rowToDeposit(row: DepositRow, wallet: string): TonDeposit {
  const payload = comment(row.id).toBoc().toString('base64');
  return {
    id: row.id,
    userId: row.user_id,
    amountTon: row.amount_ton,
    amountNano: row.amount_nano,
    tonBalanceNano: row.ton_balance_nano,
    status: row.status,
    txHash: row.tx_hash,
    payUrl: `ton://transfer/${wallet}?amount=${encodeURIComponent(row.amount_nano)}&text=${encodeURIComponent(row.id)}`,
    wallet,
    senderWallet: row.wallet_address,
    payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureTonDepositsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ton_deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_ton TEXT NOT NULL,
    amount_nano TEXT NOT NULL,
    ton_balance_nano INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    tx_hash TEXT,
    wallet_address TEXT,
    credited_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('ALTER TABLE ton_deposits ADD COLUMN wallet_address TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE ton_deposits ADD COLUMN credited_at TEXT').run().catch(() => undefined);
  await env.DB.prepare(`UPDATE ton_deposits
    SET credited_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
    WHERE status = 'completed' AND credited_at IS NULL`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_deposits_user ON ton_deposits(user_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_deposits_status ON ton_deposits(status)').run();
  await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_ton_deposits_tx_hash ON ton_deposits(tx_hash) WHERE tx_hash IS NOT NULL').run();
}

function treasuryWallet(env: Env): string {
  const value = envValue(env, 'TON_TREASURY_WALLET');
  if (!value) throw new Error('GRAM treasury wallet is not configured');
  try {
    return Address.parse(value).toString({ bounceable: false, testOnly: false, urlSafe: true });
  } catch {
    throw new Error('GRAM treasury wallet is invalid');
  }
}

function canonicalTonAddress(value: unknown, errorMessage: string): string {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(errorMessage);
  try {
    return Address.parse(text).toRawString().toLowerCase();
  } catch {
    throw new Error(errorMessage);
  }
}

function minDepositTon(env: Env): number {
  const value = Number(envValue(env, 'TON_MIN_DEPOSIT') || DEFAULT_MIN_TON);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MIN_TON;
}

function normalizeAmountTon(value: unknown): string {
  const n = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) throw new Error('Enter a valid GRAM amount');
  return n.toFixed(9).replace(/0+$/, '').replace(/\.$/, '');
}

function tonToNanoString(amountTon: string): string {
  const parts = amountTon.split('.');
  const whole = parts[0] || '0';
  const frac = ((parts[1] || '') + '000000000').slice(0, 9);
  return (BigInt(whole) * 1000000000n + BigInt(frac)).toString();
}

function safeNanoNumber(value: string): number {
  const n = Number(value);
  if (!Number.isSafeInteger(n)) throw new Error('Amount is too large');
  return n;
}

function cleanUserId(value: unknown): string {
  const text = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!text) throw new Error('Telegram user not found');
  return text;
}

function cleanDepositId(value: unknown): string {
  const text = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!text) throw new Error('Invalid deposit id');
  return text;
}

function envValue(env: Env, key: string): string {
  return String((env as unknown as Record<string, unknown>)[key] || '').trim();
}

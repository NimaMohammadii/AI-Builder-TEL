import type { TonClient } from '@ton/ton';
import type { Env } from './types';
import { adjustUserTonBalance, getUserControls } from './user-controls';

const TON_NANO = 1_000_000_000;
const MIN_WITHDRAW_NANO = 10 * TON_NANO;
const MAX_WITHDRAW_NANO = 100 * TON_NANO;
const DAILY_WITHDRAW_LIMIT_NANO = 100 * TON_NANO;
const DEFAULT_TON_WITHDRAW_WALLET_ADDRESS = 'UQBM3omem7qMV3hoELAxiFEBRlldbRfRoHGKHobgdq0yUxvs';
const TONCENTER_BASE = 'https://toncenter.com/api/v2';

type WithdrawRow = {
  id: string;
  user_id: string;
  wallet_address: string;
  amount_nano: number;
  status: string;
  tx_hash?: string | null;
  error_message?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
  rejected_at?: string | null;
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
  txHash: string | null;
  errorMessage: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createTonWithdrawal(env: Env, userIdInput: unknown, amountTonInput: unknown, walletInput: unknown): Promise<TonWithdrawal> {
  const userId = cleanUserId(userIdInput);
  const wallet = cleanWallet(walletInput);
  const amountNano = tonToNano(amountTonInput);
  if (amountNano < MIN_WITHDRAW_NANO) throw new Error('Minimum withdrawal is 10 TON');
  if (amountNano > MAX_WITHDRAW_NANO) throw new Error('Maximum withdrawal is 100 TON');

  const controls = await getUserControls(env, userId);
  if (controls.tonBalanceNano < amountNano) throw new Error('Not enough TON balance');

  await ensureTonWithdrawalsTable(env);
  await enforceDailyWithdrawalLimit(env, userId, amountNano);
  const id = 'wd_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);

  await env.DB.prepare(`INSERT INTO ton_withdrawals (id, user_id, wallet_address, amount_nano, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(id, userId, wallet, amountNano)
    .run();

  await adjustUserTonBalance(env, userId, -amountNano, {
    kind: 'withdraw',
    title: 'TON withdrawal',
    description: 'Withdrawal request to ' + shortWallet(wallet),
    referenceId: id,
    referenceType: 'ton_withdrawal',
    status: 'pending',
    metadata: { walletAddress: wallet },
  });

  const row = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE id = ?').bind(id).first<WithdrawRow>();
  return rowToWithdrawal(row ?? fallbackRow(id, userId, wallet, amountNano, 'pending'));
}

export async function listUserTonWithdrawals(env: Env, userIdInput: unknown): Promise<{ withdrawals: TonWithdrawal[] }> {
  await ensureTonWithdrawalsTable(env);
  const userId = cleanUserId(userIdInput);
  const rows = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 30')
    .bind(userId)
    .all<WithdrawRow>();
  return { withdrawals: (rows.results ?? []).map(rowToWithdrawal) };
}

export async function listAdminTonWithdrawals(env: Env, statusInput: unknown = 'pending'): Promise<{ withdrawals: TonWithdrawal[] }> {
  await ensureTonWithdrawalsTable(env);
  const status = String(statusInput || 'pending').toLowerCase();
  const where = status === 'all' ? '' : 'WHERE status = ?';
  const sql = `SELECT * FROM ton_withdrawals ${where} ORDER BY datetime(created_at) DESC LIMIT 100`;
  const rows = where ? await env.DB.prepare(sql).bind(status).all<WithdrawRow>() : await env.DB.prepare(sql).all<WithdrawRow>();
  return { withdrawals: (rows.results ?? []).map(rowToWithdrawal) };
}

export async function approveTonWithdrawal(env: Env, withdrawalIdInput: unknown): Promise<TonWithdrawal> {
  await ensureTonWithdrawalsTable(env);
  const id = cleanWithdrawalId(withdrawalIdInput);
  const row = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE id = ?').bind(id).first<WithdrawRow>();
  if (!row) throw new Error('Withdrawal not found');
  if (row.status === 'paid') return rowToWithdrawal(row);
  if (!['pending', 'failed'].includes(row.status)) throw new Error('Withdrawal cannot be approved from status ' + row.status);

  const locked = await env.DB.prepare(`UPDATE ton_withdrawals SET status = 'processing', error_message = NULL, approved_at = COALESCE(approved_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('pending', 'failed')`)
    .bind(id)
    .run();
  if ((locked.meta?.changes ?? 0) !== 1) throw new Error('Withdrawal is already being processed');

  try {
    const payout = await callWithdrawalPayout(env, row);
    await env.DB.prepare(`UPDATE ton_withdrawals SET status = 'paid', tx_hash = ?, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(payout.txHash, id)
      .run();
    await markWithdrawalTransaction(env, id, 'approved', 'TON withdrawal approved', 'Approved to ' + shortWallet(row.wallet_address), { walletAddress: row.wallet_address, txHash: payout.txHash, sourceStatus: 'paid' });
  } catch (error) {
    const message = cleanError(error);
    await env.DB.prepare(`UPDATE ton_withdrawals SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(message, id)
      .run();
    await markWithdrawalTransaction(env, id, 'failed', 'TON withdrawal', 'Withdrawal payout failed: ' + message, { walletAddress: row.wallet_address, errorMessage: message }).catch(() => undefined);
    throw new Error(message);
  }

  const paid = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE id = ?').bind(id).first<WithdrawRow>();
  return rowToWithdrawal(paid ?? { ...row, status: 'paid' });
}

export async function rejectTonWithdrawal(env: Env, withdrawalIdInput: unknown, reasonInput: unknown = ''): Promise<TonWithdrawal> {
  await ensureTonWithdrawalsTable(env);
  const id = cleanWithdrawalId(withdrawalIdInput);
  const row = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE id = ?').bind(id).first<WithdrawRow>();
  if (!row) throw new Error('Withdrawal not found');
  if (row.status === 'paid') throw new Error('Paid withdrawal cannot be rejected');
  if (row.status === 'rejected') return rowToWithdrawal(row);
  if (row.status === 'processing') throw new Error('Processing withdrawal cannot be rejected');

  const rejected = await env.DB.prepare(`UPDATE ton_withdrawals SET status = 'rejected', error_message = ?, rejected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('pending', 'failed')`)
    .bind(cleanText(reasonInput, 180) || 'Rejected by admin', id)
    .run();
  if ((rejected.meta?.changes ?? 0) !== 1) throw new Error('Withdrawal cannot be rejected');

  await adjustUserTonBalance(env, row.user_id, Math.abs(Number(row.amount_nano || 0)), {
    kind: 'withdraw',
    title: 'Withdrawal refunded',
    description: 'Rejected withdrawal refunded',
    referenceId: id,
    referenceType: 'ton_withdrawal',
    status: 'rejected',
    metadata: { walletAddress: row.wallet_address },
  });

  const updated = await env.DB.prepare('SELECT * FROM ton_withdrawals WHERE id = ?').bind(id).first<WithdrawRow>();
  return rowToWithdrawal(updated ?? { ...row, status: 'rejected' });
}


async function markWithdrawalTransaction(env: Env, withdrawalId: string, status: string, title: string, description: string, metadata: Record<string, unknown>): Promise<void> {
  await env.DB.prepare(`UPDATE ton_transactions
    SET status = ?, title = ?, description = ?, metadata_json = ?
    WHERE reference_type = 'ton_withdrawal' AND reference_id = ? AND kind = 'withdraw'`)
    .bind(status, title, description, JSON.stringify(metadata).slice(0, 2000), withdrawalId)
    .run()
    .catch(() => undefined);
}

async function enforceDailyWithdrawalLimit(env: Env, userId: string, amountNano: number): Promise<void> {
  const row = await env.DB.prepare(`SELECT COALESCE(SUM(amount_nano), 0) AS totalNano
    FROM ton_withdrawals
    WHERE user_id = ?
      AND status != 'rejected'
      AND date(created_at) = date('now')`)
    .bind(userId)
    .first<{ totalNano: number | string | null }>();
  const usedTodayNano = Number(row?.totalNano || 0);
  if (usedTodayNano + amountNano > DAILY_WITHDRAW_LIMIT_NANO) {
    const remainingNano = Math.max(0, DAILY_WITHDRAW_LIMIT_NANO - usedTodayNano);
    throw new Error(`Daily withdrawal limit is 100 TON. Remaining today: ${formatTonAmount(remainingNano)} TON`);
  }
}

function formatTonAmount(nano: number): string {
  const amount = nano / TON_NANO;
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

async function callWithdrawalPayout(env: Env, row: WithdrawRow): Promise<{ txHash: string }> {
  return sendWithdrawalFromConfiguredWallet(env, row);
}

async function sendWithdrawalFromConfiguredWallet(env: Env, row: WithdrawRow): Promise<{ txHash: string }> {
  const mnemonic = withdrawalMnemonic(env);
  const configuredAddress = envValue(env, 'TON_WITHDRAW_WALLET_ADDRESS') || DEFAULT_TON_WITHDRAW_WALLET_ADDRESS;

  const { mnemonicToPrivateKey, internal, SendMode, TonClient } = await loadTonSdk();
  const client = new TonClient({
    endpoint: `${TONCENTER_BASE}/jsonRPC`,
    apiKey: envValue(env, 'TONCENTER_API_KEY') || undefined,
  });
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const wallet = await createWithdrawalWalletForAddress(configuredAddress, keyPair.publicKey);

  const openedWallet = client.open(wallet);
  const seqno = await openedWallet.getSeqno();
  const amountNano = Math.floor(Number(row.amount_nano || 0));
  if (!Number.isSafeInteger(amountNano) || amountNano <= 0) throw new Error('Invalid withdrawal amount');

  await openedWallet.sendTransfer({
    secretKey: keyPair.secretKey,
    seqno,
    sendMode: SendMode.PAY_GAS_SEPARATELY,
    messages: [
      internal({
        to: row.wallet_address,
        value: BigInt(amountNano),
        body: 'Vexa withdrawal ' + row.id,
        bounce: false,
      }),
    ],
  });

  const nextSeqno = await waitForWalletSeqno(openedWallet, seqno);
  const txHash = await findLatestWalletTxHash(client, wallet.address.toString(), row.id);
  return { txHash: txHash || `ton-withdraw:${row.id}:seqno:${nextSeqno}` };
}

type TonWalletContract = {
  address: { toString(options?: { bounceable?: boolean }): string };
};

async function createWithdrawalWalletForAddress(configuredAddress: string, publicKey: unknown): Promise<TonWalletContract> {
  const tonSdk = await loadTonSdk();
  const candidates = [
    createWalletCandidate(tonSdk.WalletContractV5R1, 'v5r1', publicKey),
    createWalletCandidate(tonSdk.WalletContractV4, 'v4r2', publicKey),
    createWalletCandidate(tonSdk.WalletContractV3R2, 'v3r2', publicKey),
    createWalletCandidate(tonSdk.WalletContractV3R1, 'v3r1', publicKey),
    createWalletCandidate(tonSdk.WalletContractV2R2, 'v2r2', publicKey),
    createWalletCandidate(tonSdk.WalletContractV2R1, 'v2r1', publicKey),
  ].filter((candidate): candidate is { version: string; wallet: TonWalletContract } => Boolean(candidate));

  for (const candidate of candidates) {
    if (await walletMatchesAddress(configuredAddress, candidate.wallet)) return candidate.wallet;
  }

  const derivedAddresses = candidates.map((candidate) => `${candidate.version}: ${candidate.wallet.address.toString({ bounceable: false })}`).join('; ');
  throw new Error(`TON_WITHDRAW_WALLET_ADDRESS does not match TON_WITHDRAW_MNEMONIC wallet. Derived wallets: ${derivedAddresses}`);
}

function createWalletCandidate(contract: unknown, version: string, publicKey: unknown): { version: string; wallet: TonWalletContract } | null {
  if (!contract || typeof (contract as { create?: unknown }).create !== 'function') return null;
  const wallet = (contract as { create(options: { workchain: number; publicKey: unknown }): TonWalletContract }).create({ workchain: 0, publicKey });
  return { version, wallet };
}

async function walletMatchesAddress(configuredAddress: string, wallet: TonWalletContract): Promise<boolean> {
  return (await sameTonAddress(configuredAddress, wallet.address.toString())) || (await sameTonAddress(configuredAddress, wallet.address.toString({ bounceable: false })));
}

async function waitForWalletSeqno(openedWallet: { getSeqno(): Promise<number> }, previousSeqno: number): Promise<number> {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    await delay(2500);
    const seqno = await openedWallet.getSeqno();
    if (seqno > previousSeqno) return seqno;
  }
  throw new Error('TON withdrawal was sent but not confirmed by wallet seqno');
}

async function findLatestWalletTxHash(client: TonClient, walletAddress: string, withdrawalId: string): Promise<string | null> {
  try {
    const txs = await client.getTransactions(walletAddress, { limit: 10 });
    const tagged = txs.find((tx) => String(tx.inMessage?.body || tx.description || '').includes(withdrawalId));
    const tx = tagged || txs[0];
    return tx?.hash()?.toString('hex') || null;
  } catch {
    return null;
  }
}

async function ensureTonWithdrawalsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ton_withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    amount_nano INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    tx_hash TEXT,
    error_message TEXT,
    approved_at TEXT,
    paid_at TEXT,
    rejected_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('ALTER TABLE ton_withdrawals ADD COLUMN tx_hash TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE ton_withdrawals ADD COLUMN error_message TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE ton_withdrawals ADD COLUMN approved_at TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE ton_withdrawals ADD COLUMN paid_at TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE ton_withdrawals ADD COLUMN rejected_at TEXT').run().catch(() => undefined);
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_withdrawals_user ON ton_withdrawals(user_id, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_withdrawals_status ON ton_withdrawals(status, created_at)').run();
  await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_ton_withdrawals_tx_hash ON ton_withdrawals(tx_hash) WHERE tx_hash IS NOT NULL').run();
}

function rowToWithdrawal(row: WithdrawRow): TonWithdrawal {
  return {
    id: row.id,
    userId: row.user_id,
    walletAddress: row.wallet_address,
    amountNano: Number(row.amount_nano || 0),
    amountTon: Number(row.amount_nano || 0) / TON_NANO,
    status: row.status,
    txHash: row.tx_hash || null,
    errorMessage: row.error_message || null,
    approvedAt: row.approved_at || null,
    paidAt: row.paid_at || null,
    rejectedAt: row.rejected_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fallbackRow(id: string, userId: string, wallet: string, amountNano: number, status: string): WithdrawRow {
  return { id, user_id: userId, wallet_address: wallet, amount_nano: amountNano, status, tx_hash: null, error_message: null, approved_at: null, paid_at: null, rejected_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
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

function shortWallet(wallet: string): string {
  return wallet.length > 14 ? wallet.slice(0, 6) + '...' + wallet.slice(-6) : wallet;
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function cleanWithdrawalId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Invalid withdrawal id');
  return id;
}

function cleanText(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max);
}

function cleanError(error: unknown): string {
  return error instanceof Error ? cleanText(error.message, 240) || 'Withdrawal payout failed' : 'Withdrawal payout failed';
}

function envValue(env: Env, key: string): string {
  return String((env as unknown as Record<string, unknown>)[key] || '').trim();
}

function withdrawalMnemonic(env: Env): string[] {
  const value = envValue(env, 'TON_WITHDRAW_MNEMONIC');
  if (!value) throw new Error('TON_WITHDRAW_MNEMONIC is not configured');
  const words = value.replace(/[\n,]+/g, ' ').split(/\s+/).map((word) => word.trim()).filter(Boolean);
  if (words.length !== 24) throw new Error('TON_WITHDRAW_MNEMONIC must contain 24 words');
  return words;
}

async function sameTonAddress(left: string, right: string): Promise<boolean> {
  try {
    const { Address } = await loadTonSdk();
    return Address.parse(left).equals(Address.parse(right));
  } catch {
    return left.trim().toLowerCase() === right.trim().toLowerCase();
  }
}


async function loadTonSdk(): Promise<{
  mnemonicToPrivateKey: typeof import('@ton/crypto').mnemonicToPrivateKey;
  Address: typeof import('@ton/ton').Address;
  internal: typeof import('@ton/ton').internal;
  SendMode: typeof import('@ton/ton').SendMode;
  TonClient: typeof import('@ton/ton').TonClient;
  WalletContractV5R1?: unknown;
  WalletContractV4: typeof import('@ton/ton').WalletContractV4;
  WalletContractV3R2?: unknown;
  WalletContractV3R1?: unknown;
  WalletContractV2R2?: unknown;
  WalletContractV2R1?: unknown;
}> {
  ensureWindowCompatForTonSdk();
  const [cryptoSdk, tonSdk] = await Promise.all([import('@ton/crypto'), import('@ton/ton')]);
  return {
    mnemonicToPrivateKey: cryptoSdk.mnemonicToPrivateKey,
    Address: tonSdk.Address,
    internal: tonSdk.internal,
    SendMode: tonSdk.SendMode,
    TonClient: tonSdk.TonClient,
    WalletContractV5R1: (tonSdk as unknown as { WalletContractV5R1?: unknown }).WalletContractV5R1,
    WalletContractV4: tonSdk.WalletContractV4,
    WalletContractV3R2: (tonSdk as unknown as { WalletContractV3R2?: unknown }).WalletContractV3R2,
    WalletContractV3R1: (tonSdk as unknown as { WalletContractV3R1?: unknown }).WalletContractV3R1,
    WalletContractV2R2: (tonSdk as unknown as { WalletContractV2R2?: unknown }).WalletContractV2R2,
    WalletContractV2R1: (tonSdk as unknown as { WalletContractV2R1?: unknown }).WalletContractV2R1,
  };
}

function ensureWindowCompatForTonSdk(): void {
  if (typeof globalThis.window === 'undefined') {
    Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

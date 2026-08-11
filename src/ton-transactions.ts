import type { Env } from './types';

export type TonTransactionKind = 'deposit' | 'withdraw' | 'game' | 'group_usage' | 'admin' | 'adjustment' | 'predict';

export type TonTransactionMeta = {
  kind?: TonTransactionKind;
  title?: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  roundId?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  source?: string;
  voice?: string;
  output?: string;
};

export type TonTransactionWrite = {
  amountNano: number;
  balanceAfterNano: number;
  meta?: TonTransactionMeta;
};

type TonTransactionRow = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  description: string | null;
  amount_nano: number;
  balance_after_nano: number;
  status: string;
  reference_id: string | null;
  reference_type: string | null;
  metadata_json: string | null;
  created_at: string;
};

type TonDepositSourceRow = {
  id: string;
  user_id: string;
  amount_ton: string;
  ton_balance_nano: number;
  status: string;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
};

type StarsDepositSourceRow = {
  id: string;
  user_id: string;
  stars_amount: number;
  amount_nano: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type WithdrawalSourceRow = {
  id: string;
  user_id: string;
  wallet_address: string;
  amount_nano: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TonTransaction = {
  id: string;
  userId: string;
  kind: string;
  title: string;
  description: string | null;
  amountNano: number;
  balanceAfterNano: number;
  status: string;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export async function ensureTonTransactionsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ton_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount_nano INTEGER NOT NULL,
    balance_after_nano INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    reference_id TEXT,
    reference_type TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_transactions_user_created ON ton_transactions(user_id, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ton_transactions_reference ON ton_transactions(reference_type, reference_id)').run();
}

export async function recordTonTransaction(env: Env, userId: string, amountNano: number, balanceAfterNano: number, meta: TonTransactionMeta = {}): Promise<TonTransaction> {
  const transactions = await recordTonTransactions(env, userId, [{ amountNano, balanceAfterNano, meta }]);
  return transactions[0] ?? emptyTransaction(userId, balanceAfterNano, meta);
}

export async function recordTonTransactions(env: Env, userId: string, writes: TonTransactionWrite[]): Promise<TonTransaction[]> {
  const rows = (Array.isArray(writes) ? writes : [])
    .map((write) => buildTransactionRow(userId, write.amountNano, write.balanceAfterNano, write.meta || {}))
    .filter((row): row is TonTransactionRow => Boolean(row));
  if (!rows.length) return [];
  try {
    await insertTonTransactionRows(env, rows);
  } catch (error) {
    if (!isMissingTonTransactionsTable(error)) throw error;
    await ensureTonTransactionsTable(env);
    await insertTonTransactionRows(env, rows);
  }
  return rows.map(rowToTransaction);
}

async function insertTonTransactionRows(env: Env, rows: TonTransactionRow[]): Promise<void> {
  const CHUNK_SIZE = 40;
  for (let offset = 0; offset < rows.length; offset += CHUNK_SIZE) {
    const chunk = rows.slice(offset, offset + CHUNK_SIZE);
    const values = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
    const bindings: unknown[] = [];
    for (const row of chunk) {
      bindings.push(row.id, row.user_id, row.kind, row.title, row.description, row.amount_nano, row.balance_after_nano, row.status, row.reference_id, row.reference_type, row.metadata_json, row.created_at);
    }
    await env.DB.prepare(`INSERT INTO ton_transactions (id, user_id, kind, title, description, amount_nano, balance_after_nano, status, reference_id, reference_type, metadata_json, created_at) VALUES ${values}`)
      .bind(...bindings)
      .run();
  }
}

function buildTransactionRow(userId: string, amountNano: number, balanceAfterNano: number, meta: TonTransactionMeta): TonTransactionRow | null {
  const value = Math.floor(Number(amountNano) || 0);
  if (!value) return null;
  const kind = cleanKind(meta.kind);
  const title = cleanText(meta.title || titleForKind(kind, value), 90);
  const description = cleanNullable(meta.description, 180);
  const status = cleanText(meta.status || 'completed', 40);
  const referenceId = cleanNullable(meta.referenceId || meta.roundId, 120);
  const referenceType = cleanNullable(meta.referenceType || kind, 60);
  const metadataJson = meta.metadata ? JSON.stringify(meta.metadata).slice(0, 2000) : null;
  return {
    id: 'txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22),
    user_id: userId,
    kind,
    title,
    description,
    amount_nano: value,
    balance_after_nano: Math.max(0, Math.floor(Number(balanceAfterNano) || 0)),
    status,
    reference_id: referenceId,
    reference_type: referenceType,
    metadata_json: metadataJson,
    created_at: new Date().toISOString(),
  };
}

function isMissingTonTransactionsTable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || '');
  return /no such table:\s*ton_transactions/i.test(message);
}

export async function listUserTonTransactions(env: Env, userId: string, limit = 50): Promise<{ transactions: TonTransaction[] }> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 50)));
  let rows;
  try {
    rows = await env.DB.prepare(`SELECT * FROM ton_transactions WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?`)
      .bind(cleanUserId(userId), safeLimit)
      .all<TonTransactionRow>();
  } catch (error) {
    if (!isMissingTonTransactionsTable(error)) throw error;
    await ensureTonTransactionsTable(env);
    rows = await env.DB.prepare(`SELECT * FROM ton_transactions WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?`)
      .bind(cleanUserId(userId), safeLimit)
      .all<TonTransactionRow>();
  }
  return { transactions: (rows.results ?? []).map(rowToTransaction) };
}

export async function listUserTonWalletTransactions(env: Env, userId: string, limit = 100): Promise<{ transactions: TonTransaction[] }> {
  const safeUserId = cleanUserId(userId);
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 100)));
  let ledgerRows: TonTransactionRow[];
  try {
    ledgerRows = await env.DB.prepare(`SELECT * FROM ton_transactions WHERE user_id = ? AND kind IN ('deposit', 'withdraw') ORDER BY datetime(created_at) DESC LIMIT ?`)
      .bind(safeUserId, safeLimit)
      .all<TonTransactionRow>()
      .then((rows) => rows.results ?? []);
  } catch (error) {
    if (!isMissingTonTransactionsTable(error)) throw error;
    await ensureTonTransactionsTable(env);
    ledgerRows = await env.DB.prepare(`SELECT * FROM ton_transactions WHERE user_id = ? AND kind IN ('deposit', 'withdraw') ORDER BY datetime(created_at) DESC LIMIT ?`)
      .bind(safeUserId, safeLimit)
      .all<TonTransactionRow>()
      .then((rows) => rows.results ?? []);
  }
  const [tonDepositRows, starDepositRows, withdrawalRows] = await Promise.all([
    readWalletSourceRows<TonDepositSourceRow>(env, `SELECT id, user_id, amount_ton, ton_balance_nano, status, tx_hash, created_at, updated_at FROM ton_deposits WHERE user_id = ? AND status = 'completed' ORDER BY datetime(created_at) DESC LIMIT ?`, safeUserId, safeLimit),
    readWalletSourceRows<StarsDepositSourceRow>(env, `SELECT id, user_id, stars_amount, amount_nano, status, created_at, updated_at FROM stars_deposits WHERE user_id = ? AND status = 'completed' ORDER BY datetime(created_at) DESC LIMIT ?`, safeUserId, safeLimit),
    readWalletSourceRows<WithdrawalSourceRow>(env, `SELECT id, user_id, wallet_address, amount_nano, status, created_at, updated_at FROM ton_withdrawals WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?`, safeUserId, safeLimit),
  ]);

  const bySource = new Map<string, TonTransaction>();
  for (const row of ledgerRows) {
    const item = rowToTransaction(row);
    const sourceKey = sourceKeyFor(item.referenceType, item.referenceId);
    if (sourceKey) bySource.set(sourceKey, item);
  }

  const merged = ledgerRows.map(rowToTransaction);
  for (const row of tonDepositRows) pushSourceTransaction(merged, bySource, tonDepositToTransaction(row));
  for (const row of starDepositRows) pushSourceTransaction(merged, bySource, starsDepositToTransaction(row));
  for (const row of withdrawalRows) pushSourceTransaction(merged, bySource, withdrawalToTransaction(row), { refreshExisting: true });

  merged.sort((a, b) => transactionTime(b) - transactionTime(a) || b.id.localeCompare(a.id));
  return { transactions: merged.slice(0, safeLimit) };
}

async function readWalletSourceRows<T>(env: Env, sql: string, userId: string, limit: number): Promise<T[]> {
  return env.DB.prepare(sql).bind(userId, limit).all<T>().then((rows) => rows.results ?? []).catch(() => []);
}

function pushSourceTransaction(items: TonTransaction[], bySource: Map<string, TonTransaction>, item: TonTransaction, options: { refreshExisting?: boolean } = {}): void {
  const key = sourceKeyFor(item.referenceType, item.referenceId);
  const existing = key ? bySource.get(key) : undefined;
  if (existing) {
    if (options.refreshExisting) refreshSourceTransaction(existing, item);
    return;
  }
  if (key) bySource.set(key, item);
  items.push(item);
}

function refreshSourceTransaction(existing: TonTransaction, source: TonTransaction): void {
  existing.status = source.status;
  existing.title = source.title;
  existing.description = source.description;
  existing.metadata = { ...(existing.metadata || {}), ...(source.metadata || {}) };
}

function sourceKeyFor(referenceType: string | null | undefined, referenceId: string | null | undefined): string {
  return referenceType && referenceId ? `${referenceType}:${referenceId}` : '';
}

function tonDepositToTransaction(row: TonDepositSourceRow): TonTransaction {
  const amountNano = Number(row.ton_balance_nano || 0);
  return sourceTransaction(row.id, row.user_id, 'deposit', 'TON wallet deposit', `${row.amount_ton} TON wallet payment`, amountNano, row.status, 'ton_deposit', row.id, row.created_at, { txHash: row.tx_hash });
}

function starsDepositToTransaction(row: StarsDepositSourceRow): TonTransaction {
  const amountNano = Number(row.amount_nano || 0);
  return sourceTransaction(row.id, row.user_id, 'deposit', 'Stars purchase', `${Number(row.stars_amount || 0)} Stars converted to TON balance`, amountNano, row.status, 'stars_deposit', row.id, row.created_at, { starsAmount: row.stars_amount });
}

function withdrawalToTransaction(row: WithdrawalSourceRow): TonTransaction {
  const amountNano = -Math.abs(Number(row.amount_nano || 0));
  return sourceTransaction(row.id, row.user_id, 'withdraw', withdrawalTitle(row.status), 'Withdrawal request to ' + shortWallet(String(row.wallet_address || '')), amountNano, row.status, 'ton_withdrawal', row.id, row.created_at, { walletAddress: row.wallet_address, sourceStatus: row.status });
}

function withdrawalTitle(status: string): string {
  return withdrawalHistoryStatus(status) === 'approved' ? 'TON withdrawal approved' : 'TON withdrawal';
}

function withdrawalHistoryStatus(status: string): string {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'paid' ? 'approved' : normalized;
}

function sourceTransaction(id: string, userId: string, kind: TonTransactionKind, title: string, description: string, amountNano: number, status: string, referenceType: string, referenceId: string, createdAt: string, metadata: Record<string, unknown>): TonTransaction {
  return { id, userId, kind, title, description, amountNano, balanceAfterNano: 0, status, referenceId, referenceType, metadata, createdAt };
}

function transactionTime(item: TonTransaction): number {
  const value = Date.parse(item.createdAt || '');
  return Number.isFinite(value) ? value : 0;
}

function shortWallet(wallet: string): string {
  return wallet.length > 14 ? wallet.slice(0, 6) + '...' + wallet.slice(-6) : wallet;
}

function rowToTransaction(row: TonTransactionRow): TonTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    amountNano: Number(row.amount_nano || 0),
    balanceAfterNano: Number(row.balance_after_nano || 0),
    status: row.status,
    referenceId: row.reference_id,
    referenceType: row.reference_type,
    metadata: parseJson(row.metadata_json),
    createdAt: row.created_at,
  };
}

function emptyTransaction(userId: string, balanceAfterNano: number, meta: TonTransactionMeta): TonTransaction {
  return {
    id: '',
    userId,
    kind: cleanKind(meta.kind),
    title: cleanText(meta.title || 'No balance change', 90),
    description: cleanNullable(meta.description, 180),
    amountNano: 0,
    balanceAfterNano: Math.max(0, Math.floor(Number(balanceAfterNano) || 0)),
    status: cleanText(meta.status || 'skipped', 40),
    referenceId: cleanNullable(meta.referenceId || meta.roundId, 120),
    referenceType: cleanNullable(meta.referenceType, 60),
    metadata: meta.metadata || {},
    createdAt: new Date().toISOString(),
  };
}

function titleForKind(kind: string, amountNano: number): string {
  if (kind === 'deposit') return 'TON deposit';
  if (kind === 'withdraw') return 'TON withdrawal';
  if (kind === 'game') return amountNano >= 0 ? 'Game reward' : 'Game bet';
  if (kind === 'group_usage') return 'Group usage';
  if (kind === 'admin') return 'Admin balance update';
  if (kind === 'predict') return amountNano >= 0 ? 'Prediction payout' : 'Prediction stake';
  return amountNano >= 0 ? 'Balance credit' : 'Balance debit';
}

function cleanKind(value: unknown): TonTransactionKind {
  const raw = String(value || 'adjustment').replace(/[^a-z_]/g, '').slice(0, 40) as TonTransactionKind;
  return ['deposit', 'withdraw', 'game', 'group_usage', 'admin', 'adjustment', 'predict'].includes(raw) ? raw : 'adjustment';
}

function cleanText(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max) || 'Transaction';
}

function cleanNullable(value: unknown, max: number): string | null {
  const text = String(value ?? '').trim().slice(0, max);
  return text || null;
}

function parseJson(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cleanUserId(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
}

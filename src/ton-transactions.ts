import type { Env } from './types';
import { publishLiveActivity } from './live-activity';

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
  const transactions = rows.map(rowToTransaction);
  await publishTransactionActivity(env, transactions).catch((error) => console.warn('live activity publish failed', error));
  return transactions;
}

async function publishTransactionActivity(env: Env, transactions: TonTransaction[]): Promise<void> {
  if (!transactions.length) return;
  for (const item of transactions) {
    if (item.kind !== 'deposit' || item.amountNano <= 0 || item.status !== 'completed') continue;
    await publishLiveActivity(env, {
      kind: 'deposit',
      userId: item.userId,
      amountNano: item.amountNano,
      key: item.referenceId || item.id,
      createdAt: item.createdAt,
    });
  }
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

export async function listUserTonTransactions(
  env: Env,
  userId: string,
  limit = 50,
  kinds: TonTransactionKind[] = [],
): Promise<{ transactions: TonTransaction[] }> {
  const safeUserId = cleanUserId(userId);
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 50)));
  const safeKinds = Array.from(new Set((Array.isArray(kinds) ? kinds : []).map(cleanKind)));
  await ensureTonTransactionsTable(env);
  if (safeKinds.includes('deposit') || safeKinds.includes('withdraw')) {
    await migrateLegacyWalletTransactions(env, safeUserId);
  }

  const placeholders = safeKinds.map(() => '?').join(',');
  const sql = safeKinds.length
    ? `SELECT * FROM ton_transactions WHERE user_id = ? AND kind IN (${placeholders}) ORDER BY datetime(created_at) DESC, id DESC LIMIT ?`
    : `SELECT * FROM ton_transactions WHERE user_id = ? ORDER BY datetime(created_at) DESC, id DESC LIMIT ?`;
  const bindings: unknown[] = safeKinds.length ? [safeUserId, ...safeKinds, safeLimit] : [safeUserId, safeLimit];
  const rows = await env.DB.prepare(sql).bind(...bindings).all<TonTransactionRow>();
  return { transactions: (rows.results ?? []).map(rowToTransaction) };
}

// One-way compatibility migration for records created before wallet operations wrote
// directly to ton_transactions. History is always returned from ton_transactions;
// source state tables are never merged into the response.
async function migrateLegacyWalletTransactions(env: Env, userId: string): Promise<void> {
  const tables = await env.DB.prepare(`SELECT name FROM sqlite_master
    WHERE type = 'table' AND name IN ('ton_deposits','stars_deposits','ton_withdrawals')`)
    .all<{ name: string }>();
  const existing = new Set((tables.results ?? []).map((row) => String(row.name || '')));
  const statements: D1PreparedStatement[] = [];

  if (existing.has('ton_deposits')) {
    statements.push(
      env.DB.prepare(`INSERT INTO ton_transactions
        (id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at)
        SELECT ('legacy_tondep:' || d.id), d.user_id, 'deposit', 'GRAM wallet deposit',
          (d.amount_ton || ' GRAM wallet payment'), d.ton_balance_nano, 0,
          CASE WHEN d.status = 'completed' THEN 'completed' ELSE d.status END,
          d.id, 'ton_deposit', NULL, d.created_at
        FROM ton_deposits d
        WHERE d.user_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM ton_transactions t
            WHERE t.user_id = d.user_id AND t.reference_type = 'ton_deposit' AND t.reference_id = d.id AND t.kind = 'deposit'
          )`).bind(userId),
      env.DB.prepare(`UPDATE ton_transactions
        SET status = COALESCE((SELECT CASE WHEN d.status = 'completed' THEN 'completed' ELSE d.status END
          FROM ton_deposits d WHERE d.id = ton_transactions.reference_id AND d.user_id = ton_transactions.user_id), status)
        WHERE user_id = ? AND kind = 'deposit' AND reference_type = 'ton_deposit'
          AND EXISTS (SELECT 1 FROM ton_deposits d WHERE d.id = ton_transactions.reference_id AND d.user_id = ton_transactions.user_id)`).bind(userId),
    );
  }

  if (existing.has('stars_deposits')) {
    statements.push(
      env.DB.prepare(`INSERT INTO ton_transactions
        (id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at)
        SELECT ('legacy_starsdep:' || d.id), d.user_id, 'deposit', 'Stars purchase',
          (d.stars_amount || ' Stars converted to Gram balance'), d.amount_nano, 0,
          CASE WHEN d.status = 'completed' THEN 'completed' ELSE d.status END,
          d.id, 'stars_deposit', NULL, d.created_at
        FROM stars_deposits d
        WHERE d.user_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM ton_transactions t
            WHERE t.user_id = d.user_id AND t.reference_type = 'stars_deposit' AND t.reference_id = d.id AND t.kind = 'deposit'
          )`).bind(userId),
      env.DB.prepare(`UPDATE ton_transactions
        SET status = COALESCE((SELECT CASE WHEN d.status = 'completed' THEN 'completed' ELSE d.status END
          FROM stars_deposits d WHERE d.id = ton_transactions.reference_id AND d.user_id = ton_transactions.user_id), status)
        WHERE user_id = ? AND kind = 'deposit' AND reference_type = 'stars_deposit'
          AND EXISTS (SELECT 1 FROM stars_deposits d WHERE d.id = ton_transactions.reference_id AND d.user_id = ton_transactions.user_id)`).bind(userId),
    );
  }

  if (existing.has('ton_withdrawals')) {
    statements.push(
      env.DB.prepare(`INSERT INTO ton_transactions
        (id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at)
        SELECT ('legacy_withdraw:' || w.id), w.user_id, 'withdraw', 'Gram withdrawal',
          ('Withdrawal request to ' || w.wallet_address), -ABS(w.amount_nano), 0,
          CASE WHEN w.status = 'paid' THEN 'completed' ELSE w.status END,
          w.id, 'ton_withdrawal', NULL, w.created_at
        FROM ton_withdrawals w
        WHERE w.user_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM ton_transactions t
            WHERE t.user_id = w.user_id AND t.reference_type = 'ton_withdrawal' AND t.reference_id = w.id
              AND t.kind = 'withdraw' AND t.amount_nano < 0
          )`).bind(userId),
      env.DB.prepare(`UPDATE ton_transactions
        SET status = COALESCE((SELECT CASE WHEN w.status = 'paid' THEN 'completed' ELSE w.status END
          FROM ton_withdrawals w WHERE w.id = ton_transactions.reference_id AND w.user_id = ton_transactions.user_id), status)
        WHERE user_id = ? AND kind = 'withdraw' AND amount_nano < 0 AND reference_type = 'ton_withdrawal'
          AND EXISTS (SELECT 1 FROM ton_withdrawals w WHERE w.id = ton_transactions.reference_id AND w.user_id = ton_transactions.user_id)`).bind(userId),
    );
  }

  if (statements.length) await env.DB.batch(statements);
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
  if (kind === 'deposit') return 'GRAM deposit';
  if (kind === 'withdraw') return 'GRAM withdrawal';
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
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

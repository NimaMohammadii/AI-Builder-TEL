import type { Env } from './types';

export type TonTransactionKind = 'deposit' | 'withdraw' | 'game' | 'group_usage' | 'admin' | 'adjustment' | 'market' | 'market_refund' | 'predict';

export type TonTransactionMeta = {
  kind?: TonTransactionKind;
  title?: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  status?: string;
  metadata?: Record<string, unknown>;
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
  const value = Math.floor(Number(amountNano) || 0);
  if (!value) return emptyTransaction(userId, balanceAfterNano, meta);
  await ensureTonTransactionsTable(env);
  const kind = cleanKind(meta.kind);
  const title = cleanText(meta.title || titleForKind(kind, value), 90);
  const description = cleanNullable(meta.description, 180);
  const status = cleanText(meta.status || 'completed', 40);
  const referenceId = cleanNullable(meta.referenceId, 120);
  const referenceType = cleanNullable(meta.referenceType || kind, 60);
  const metadataJson = meta.metadata ? JSON.stringify(meta.metadata).slice(0, 2000) : null;
  const id = 'txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22);
  await env.DB.prepare(`INSERT INTO ton_transactions (id, user_id, kind, title, description, amount_nano, balance_after_nano, status, reference_id, reference_type, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
    .bind(id, userId, kind, title, description, value, Math.max(0, Math.floor(Number(balanceAfterNano) || 0)), status, referenceId, referenceType, metadataJson)
    .run();
  const row = await env.DB.prepare('SELECT * FROM ton_transactions WHERE id = ?').bind(id).first<TonTransactionRow>();
  return rowToTransaction(row ?? {
    id,
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
  });
}

export async function listUserTonTransactions(env: Env, userId: string, limit = 50): Promise<{ transactions: TonTransaction[] }> {
  await ensureTonTransactionsTable(env);
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 50)));
  const rows = await env.DB.prepare(`SELECT * FROM ton_transactions WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?`)
    .bind(userId, safeLimit)
    .all<TonTransactionRow>();
  return { transactions: (rows.results ?? []).map(rowToTransaction) };
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
    referenceId: cleanNullable(meta.referenceId, 120),
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
  if (kind === 'market') return 'NFT purchase';
  if (kind === 'market_refund') return 'NFT purchase refund';
  if (kind === 'predict') return amountNano >= 0 ? 'Prediction payout' : 'Prediction stake';
  return amountNano >= 0 ? 'Balance credit' : 'Balance debit';
}

function cleanKind(value: unknown): TonTransactionKind {
  const raw = String(value || 'adjustment').replace(/[^a-z_]/g, '').slice(0, 40) as TonTransactionKind;
  return ['deposit', 'withdraw', 'game', 'group_usage', 'admin', 'adjustment', 'market', 'market_refund', 'predict'].includes(raw) ? raw : 'adjustment';
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
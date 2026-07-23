import type { Env, TelegramPreCheckoutQuery, TelegramSuccessfulPayment } from './types';
import { adjustUserTonBalance, assertUserNotBanned } from './user-controls';
import { getFinanceLimits, formatTonAmount } from './admin-finance-controls';
import { awardDepositXp } from './xp-rewards';
import { gameBotToken } from './utils';

const DEFAULT_STAR_TO_NANO = 5_890_080; // Fragment 0.0061355 TON minus 4% commission.
const MIN_STARS_DEPOSIT = 2;

type StarDepositRow = {
  id: string;
  user_id: string;
  stars_amount: number;
  amount_nano: number;
  status: string;
  telegram_payment_charge_id: string | null;
  provider_payment_charge_id: string | null;
  created_at: string;
  updated_at: string;
};

type TelegramInvoiceLinkResponse = {
  ok: boolean;
  result?: string;
  description?: string;
};

export type StarDeposit = {
  id: string;
  userId: string;
  starsAmount: number;
  amountNano: number;
  status: string;
  invoiceLink: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createStarsDeposit(env: Env, userId: string, starsInput: unknown): Promise<StarDeposit> {
  const user = cleanUserId(userId);
  const stars = cleanStarsAmount(starsInput);
  await assertUserNotBanned(env, user);
  const amountNano = starsToNano(env, stars);
  const limits = await getFinanceLimits(env);
  if (amountNano < limits.minDepositNano) throw new Error(`Minimum deposit is ${formatTonAmount(limits.minDepositNano)} TON`);
  if (limits.maxDepositNano && amountNano > limits.maxDepositNano) throw new Error(`Maximum deposit is ${formatTonAmount(limits.maxDepositNano)} TON`);
  const id = 'stars_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await ensureStarsDepositsTable(env);
  await env.DB.prepare(`INSERT INTO stars_deposits (id, user_id, stars_amount, amount_nano, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(id, user, stars, amountNano)
    .run();
  const invoiceLink = await createInvoiceLink(env, id, stars, amountNano);
  const row = await env.DB.prepare('SELECT * FROM stars_deposits WHERE id = ?').bind(id).first<StarDepositRow>();
  return rowToDeposit(row ?? { id, user_id: user, stars_amount: stars, amount_nano: amountNano, status: 'pending', telegram_payment_charge_id: null, provider_payment_charge_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, invoiceLink);
}

export async function listUserStarsDeposits(env: Env, userId: string): Promise<{ deposits: StarDeposit[] }> {
  await ensureStarsDepositsTable(env);
  const rows = await env.DB.prepare('SELECT * FROM stars_deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 30')
    .bind(cleanUserId(userId))
    .all<StarDepositRow>();
  return { deposits: (rows.results ?? []).map((row) => rowToDeposit(row, null)) };
}

export async function handleStarsPreCheckout(env: Env, query: TelegramPreCheckoutQuery): Promise<void> {
  const payload = String(query.invoice_payload || '').trim();
  const amount = Math.floor(Number(query.total_amount));
  const ok = /^stars_[0-9a-f]{20}$/.test(payload) && query.currency === 'XTR' && Number.isSafeInteger(amount) && amount >= MIN_STARS_DEPOSIT && amount <= 100000;
  await telegram(gameBotToken(env), 'answerPreCheckoutQuery', {
    pre_checkout_query_id: query.id,
    ok,
    error_message: ok ? undefined : 'Payment request is no longer valid.',
  });
}

export async function handleStarsSuccessfulPayment(env: Env, userIdInput: unknown, payment: TelegramSuccessfulPayment): Promise<void> {
  if (payment.currency !== 'XTR') return;
  const id = cleanDepositId(payment.invoice_payload);
  const userId = cleanUserId(userIdInput);
  await ensureStarsDepositsTable(env);
  const row = await env.DB.prepare('SELECT * FROM stars_deposits WHERE id = ?').bind(id).first<StarDepositRow>();
  if (!row || row.status === 'completed') return;
  if (row.user_id !== userId) return;
  if (Number(payment.total_amount) !== Number(row.stars_amount)) return;
  if (payment.telegram_payment_charge_id) {
    const used = await env.DB.prepare('SELECT id FROM stars_deposits WHERE telegram_payment_charge_id = ? LIMIT 1')
      .bind(payment.telegram_payment_charge_id)
      .first<{ id: string }>();
    if (used && used.id !== row.id) return;
  }
  await env.DB.prepare(`UPDATE stars_deposits SET status = 'completed', telegram_payment_charge_id = ?, provider_payment_charge_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'completed'`)
    .bind(payment.telegram_payment_charge_id ?? null, payment.provider_payment_charge_id ?? null, id)
    .run();
  await adjustUserTonBalance(env, row.user_id, row.amount_nano, {
    kind: 'deposit',
    title: 'Stars purchase',
    description: `${row.stars_amount} Stars converted to TON balance`,
    referenceId: row.id,
    referenceType: 'stars_deposit',
    status: 'completed',
    metadata: { starsAmount: row.stars_amount, telegramPaymentChargeId: payment.telegram_payment_charge_id ?? null },
  });
  await awardDepositXp(env, row.user_id, 'stars_deposit', row.id);
}

async function createInvoiceLink(env: Env, id: string, stars: number, amountNano: number): Promise<string> {
  const token = gameBotToken(env);
  if (!token || token.length < 20) throw new Error('Could not create Stars invoice');
  const tonText = formatTon(amountNano);
  const response = await telegram<TelegramInvoiceLinkResponse>(token, 'createInvoiceLink', {
    title: 'Vexa TON Balance',
    description: `${stars} Stars → ${tonText}`,
    payload: id,
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: `${tonText}`, amount: stars }],
  });
  if (!response.ok || !response.result) throw new Error('Could not create Stars invoice');
  return response.result;
}

async function ensureStarsDepositsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS stars_deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    stars_amount INTEGER NOT NULL,
    amount_nano INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    telegram_payment_charge_id TEXT UNIQUE,
    provider_payment_charge_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_stars_deposits_user ON stars_deposits(user_id, created_at)').run();
}

function rowToDeposit(row: StarDepositRow, invoiceLink: string | null): StarDeposit {
  return {
    id: row.id,
    userId: row.user_id,
    starsAmount: row.stars_amount,
    amountNano: row.amount_nano,
    status: row.status,
    invoiceLink,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function starsToNano(env: Env, stars: number): number {
  const rate = Number(envValue(env, 'STARS_TO_NANOTON') || DEFAULT_STAR_TO_NANO);
  const safeRate = Number.isSafeInteger(rate) && rate > 0 ? rate : DEFAULT_STAR_TO_NANO;
  const result = stars * safeRate;
  if (!Number.isSafeInteger(result) || result < 1) throw new Error('Stars amount is too large');
  return result;
}

function formatTon(nano: number): string {
  const raw = Math.max(0, Math.floor(Number(nano) || 0));
  const whole = Math.floor(raw / 1_000_000_000);
  const frac = String(raw % 1_000_000_000).padStart(9, '0').replace(/0+$/, '');
  return (frac ? `${whole}.${frac}` : String(whole)) + ' TON';
}

function cleanStarsAmount(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isSafeInteger(n) || n < MIN_STARS_DEPOSIT) throw new Error(`Minimum deposit is ${MIN_STARS_DEPOSIT} Stars`);
  if (n > 100000) throw new Error('Stars amount is too large');
  return n;
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

async function telegram<T>(token: string, method: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await response.json() as T;
}

function envValue(env: Env, key: string): string {
  return String((env as unknown as Record<string, unknown>)[key] || '').trim();
}

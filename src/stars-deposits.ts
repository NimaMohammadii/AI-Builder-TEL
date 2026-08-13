import type { Env, TelegramPreCheckoutQuery, TelegramSuccessfulPayment } from './types';
import { adjustUserTonBalance, assertUserNotBanned } from './user-controls';
import { getFinanceLimits, formatTonAmount } from './admin-finance-controls';
import { awardDepositXp } from './xp-rewards';
import { gameBotToken } from './utils';

const MIN_STARS_DEPOSIT = 2;
const TELEGRAM_STAR_REWARD_USD = 0.013;
const TELEGRAM_WITHDRAW_RATE_X1000 = 1300;
const GRAM_USD_TICKER_URLS = [
  'https://data-api.binance.vision/api/v3/ticker/price?symbol=GRAMUSDT',
  'https://api.binance.com/api/v3/ticker/price?symbol=GRAMUSDT',
] as const;
const GRAM_USD_COINPAPRIKA_URL = 'https://api.coinpaprika.com/v1/tickers/toncoin-the-open-network';
const RATE_CACHE_MS = 60_000;
const RATE_STALE_MS = 5 * 60_000;

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

type BinanceTickerResponse = {
  price?: string;
};

type CoinPaprikaTickerResponse = {
  id?: string;
  symbol?: string;
  quotes?: {
    USD?: {
      price?: number;
    };
  };
};

export type StarsGramRate = {
  telegramWithdrawRateX1000: number;
  gramUsd: number;
  gramPerStar: number;
  updatedAt: string;
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

let starsGramRateCache: { value: StarsGramRate; expiresAt: number } | null = null;
let starsGramRatePromise: Promise<StarsGramRate> | null = null;

export async function createStarsDeposit(env: Env, userId: string, starsInput: unknown): Promise<StarDeposit> {
  const user = cleanUserId(userId);
  const stars = cleanStarsAmount(starsInput);
  await assertUserNotBanned(env, user);
  const rate = await getStarsGramRate();
  const amountNano = starsToNano(stars, rate);
  const limits = await getFinanceLimits(env);
  if (amountNano < limits.minDepositNano) throw new Error(`Minimum deposit is ${formatTonAmount(limits.minDepositNano)} Gram`);
  if (limits.maxDepositNano && amountNano > limits.maxDepositNano) throw new Error(`Maximum deposit is ${formatTonAmount(limits.maxDepositNano)} Gram`);
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

export async function listUserStarsDeposits(env: Env, userId: string): Promise<{ deposits: StarDeposit[]; rate: StarsGramRate }> {
  const rate = await getStarsGramRate();
  try {
    const user = cleanUserId(userId);
    await ensureStarsDepositsTable(env);
    const rows = await env.DB.prepare('SELECT * FROM stars_deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 30')
      .bind(user)
      .all<StarDepositRow>();
    return { deposits: (rows.results ?? []).map((row) => rowToDeposit(row, null)), rate };
  } catch {
    return { deposits: [], rate };
  }
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
    description: `${row.stars_amount} Stars converted to Gram balance`,
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
  const gramText = formatGram(amountNano);
  const response = await telegram<TelegramInvoiceLinkResponse>(token, 'createInvoiceLink', {
    title: 'Vexa Gram Balance',
    description: `${stars} Stars → ${gramText}`,
    payload: id,
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: `${gramText}`, amount: stars }],
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

async function getStarsGramRate(): Promise<StarsGramRate> {
  const now = Date.now();
  if (starsGramRateCache && starsGramRateCache.expiresAt > now) return starsGramRateCache.value;
  if (starsGramRatePromise) return starsGramRatePromise;
  starsGramRatePromise = fetchStarsGramRate().then((value) => {
    starsGramRateCache = { value, expiresAt: Date.now() + RATE_CACHE_MS };
    return value;
  }).catch((error) => {
    const cachedAt = starsGramRateCache ? Date.parse(starsGramRateCache.value.updatedAt) : NaN;
    if (starsGramRateCache && Number.isFinite(cachedAt) && Date.now() - cachedAt <= RATE_STALE_MS) {
      return starsGramRateCache.value;
    }
    throw error;
  }).finally(() => {
    starsGramRatePromise = null;
  });
  return starsGramRatePromise;
}

async function fetchStarsGramRate(): Promise<StarsGramRate> {
  let gramUsd = 0;
  for (const url of GRAM_USD_TICKER_URLS) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        cf: { cacheTtl: 1, cacheEverything: false },
      } as RequestInit);
      if (!response.ok) continue;
      const ticker = await response.json() as BinanceTickerResponse;
      const value = Number(ticker && ticker.price);
      if (Number.isFinite(value) && value > 0) {
        gramUsd = value;
        break;
      }
    } catch {
      // Try the next official Binance market-data endpoint.
    }
  }
  if (!gramUsd) {
    try {
      const response = await fetch(GRAM_USD_COINPAPRIKA_URL, {
        headers: { accept: 'application/json' },
        cf: { cacheTtl: 60, cacheEverything: true },
      } as RequestInit);
      if (response.ok) {
        const ticker = await response.json() as CoinPaprikaTickerResponse;
        const value = Number(ticker?.quotes?.USD?.price);
        const symbol = String(ticker?.symbol || '').toUpperCase();
        if (ticker?.id === 'toncoin-the-open-network' && (symbol === 'GRAM' || symbol === 'TON') && Number.isFinite(value) && value > 0) {
          gramUsd = value;
        }
      }
    } catch {
      // The normal unavailable error below is returned only when every source failed.
    }
  }
  if (!gramUsd) throw new Error('Gram price feed is unavailable');
  const gramPerStar = TELEGRAM_STAR_REWARD_USD / gramUsd;
  if (!Number.isFinite(gramPerStar) || gramPerStar <= 0) throw new Error('Stars to Gram rate is unavailable');
  return {
    telegramWithdrawRateX1000: TELEGRAM_WITHDRAW_RATE_X1000,
    gramUsd,
    gramPerStar,
    updatedAt: new Date().toISOString(),
  };
}

function starsToNano(stars: number, rate: StarsGramRate): number {
  const result = Math.floor(stars * rate.gramPerStar * 1_000_000_000);
  if (!Number.isSafeInteger(result) || result < 1) throw new Error('Stars amount is too large');
  return result;
}

function formatGram(nano: number): string {
  const raw = Math.max(0, Math.floor(Number(nano) || 0));
  const whole = Math.floor(raw / 1_000_000_000);
  const frac = String(raw % 1_000_000_000).padStart(9, '0').replace(/0+$/, '');
  return (frac ? `${whole}.${frac}` : String(whole)) + ' Gram';
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

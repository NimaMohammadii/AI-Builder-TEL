import type { Env, TelegramPreCheckoutQuery, TelegramSuccessfulPayment } from './types';
import { assertUserNotBanned } from './user-controls';
import { getFinanceLimits, formatTonAmount } from './admin-finance-controls';
import { awardDepositXp } from './xp-rewards';
import { gameBotToken } from './utils';
import { ensureTonTransactionsTable } from './ton-transactions';
import { publishLiveActivity } from './live-activity';

const MIN_STARS_DEPOSIT = 2;
const TELEGRAM_STAR_REWARD_USD = 0.013;
const TELEGRAM_WITHDRAW_RATE_X1000 = 1300;
const GRAM_USD_TICKER_URLS = [
  'https://data-api.binance.vision/api/v3/ticker/price?symbol=GRAMUSDT',
  'https://api.binance.com/api/v3/ticker/price?symbol=GRAMUSDT',
] as const;
const GRAM_USD_COINPAPRIKA_URL = 'https://api.coinpaprika.com/v1/tickers/toncoin-the-open-network';
const GRAM_USD_GATE_URL = 'https://api.gateio.ws/api/v4/spot/tickers?currency_pair=GRAM_USDT';
const RATE_CACHE_MS = 60_000;
const RATE_STALE_MS = 5 * 60_000;
const GRAM_PRICE_REQUEST_TIMEOUT_MS = 4_000;

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

type GateTickerResponse = Array<{
  currency_pair?: string;
  last?: string;
}>;

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
  const transactionId = `finance_starsdep:${id}`;
  const metadataJson = JSON.stringify({ starsAmount: stars, displayCurrency: 'Gram' });

  await Promise.all([ensureStarsDepositsTable(env), ensureTonTransactionsTable(env)]);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO stars_deposits (id, user_id, stars_amount, amount_nano, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
      .bind(id, user, stars, amountNano),
    env.DB.prepare(`INSERT INTO ton_transactions
      (id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at)
      VALUES (?,?,'deposit','Stars purchase',?,?,COALESCE((SELECT ton_balance_nano FROM app_users WHERE telegram_user_id=?),0),'pending',?,'stars_deposit',?,CURRENT_TIMESTAMP)`)
      .bind(transactionId, user, `${stars} Stars converted to Gram balance`, amountNano, user, id, metadataJson),
  ]);

  let invoiceLink: string;
  try {
    invoiceLink = await createInvoiceLink(env, id, stars, amountNano);
  } catch (error) {
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM ton_transactions WHERE user_id=? AND kind='deposit' AND reference_type='stars_deposit' AND reference_id=? AND status='pending'`).bind(user, id),
      env.DB.prepare(`DELETE FROM stars_deposits WHERE id=? AND user_id=? AND status='pending'`).bind(id, user),
    ]);
    throw error;
  }

  const row = await env.DB.prepare('SELECT * FROM stars_deposits WHERE id = ? AND user_id = ?').bind(id, user).first<StarDepositRow>();
  if (!row) throw new Error('Stars deposit creation failed');
  return rowToDeposit(row, invoiceLink);
}

export async function listUserStarsDeposits(env: Env, userId: string): Promise<{ deposits: StarDeposit[]; rate: StarsGramRate }> {
  const rate = await getStarsGramRate();
  const user = cleanUserId(userId);
  await ensureStarsDepositsTable(env);
  const rows = await env.DB.prepare('SELECT * FROM stars_deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 30')
    .bind(user)
    .all<StarDepositRow>();
  return { deposits: (rows.results ?? []).map((row) => rowToDeposit(row, null)), rate };
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
  const telegramChargeId = String(payment.telegram_payment_charge_id || '').trim() || null;
  const providerChargeId = String(payment.provider_payment_charge_id || '').trim() || null;
  await Promise.all([ensureStarsDepositsTable(env), ensureTonTransactionsTable(env)]);

  const row = await env.DB.prepare('SELECT * FROM stars_deposits WHERE id = ?').bind(id).first<StarDepositRow>();
  if (!row || row.status === 'completed') return;
  if (row.user_id !== userId) return;
  if (Number(payment.total_amount) !== Number(row.stars_amount)) return;

  if (telegramChargeId) {
    const used = await env.DB.prepare('SELECT id FROM stars_deposits WHERE telegram_payment_charge_id = ? LIMIT 1')
      .bind(telegramChargeId)
      .first<{ id: string }>();
    if (used && used.id !== row.id) return;
  }
  if (row.telegram_payment_charge_id && telegramChargeId && row.telegram_payment_charge_id !== telegramChargeId) return;
  if (row.provider_payment_charge_id && providerChargeId && row.provider_payment_charge_id !== providerChargeId) return;

  const transactionId = `finance_starsdep:${id}`;
  const metadataJson = JSON.stringify({ starsAmount: row.stars_amount, telegramPaymentChargeId: telegramChargeId, providerPaymentChargeId: providerChargeId, displayCurrency: 'Gram' });
  const results = await env.DB.batch([
    env.DB.prepare(`INSERT INTO app_users (telegram_user_id, current_section, ton_balance_nano, last_seen_at, updated_at)
      VALUES (?, 'home', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO NOTHING`).bind(userId),
    env.DB.prepare(`UPDATE stars_deposits
      SET status='crediting', telegram_payment_charge_id=COALESCE(telegram_payment_charge_id, ?),
          provider_payment_charge_id=COALESCE(provider_payment_charge_id, ?), updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND user_id=? AND status IN ('pending','crediting')`)
      .bind(telegramChargeId, providerChargeId, id, userId),
    env.DB.prepare(`INSERT INTO ton_transactions
      (id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at)
      SELECT ?,d.user_id,'deposit','Stars purchase',(d.stars_amount || ' Stars converted to Gram balance'),d.amount_nano,
        COALESCE((SELECT ton_balance_nano FROM app_users WHERE telegram_user_id=d.user_id),0),'pending',d.id,'stars_deposit',?,d.created_at
      FROM stars_deposits d
      WHERE d.id=? AND d.user_id=?
        AND NOT EXISTS (SELECT 1 FROM ton_transactions t WHERE t.user_id=d.user_id AND t.reference_type='stars_deposit' AND t.reference_id=d.id AND t.kind='deposit')`)
      .bind(transactionId, metadataJson, id, userId),
    env.DB.prepare(`UPDATE app_users
      SET ton_balance_nano=ton_balance_nano+?, updated_at=CURRENT_TIMESTAMP
      WHERE telegram_user_id=?
        AND EXISTS (SELECT 1 FROM stars_deposits WHERE id=? AND user_id=? AND status='crediting')
        AND EXISTS (SELECT 1 FROM ton_transactions WHERE user_id=? AND kind='deposit' AND reference_type='stars_deposit' AND reference_id=? AND status!='completed')`)
      .bind(row.amount_nano, userId, id, userId, userId, id),
    env.DB.prepare(`UPDATE ton_transactions
      SET status='completed', amount_nano=?, balance_after_nano=COALESCE((SELECT ton_balance_nano FROM app_users WHERE telegram_user_id=?),balance_after_nano),
          title='Stars purchase', description=?, metadata_json=?
      WHERE user_id=? AND kind='deposit' AND reference_type='stars_deposit' AND reference_id=?
        AND EXISTS (SELECT 1 FROM stars_deposits WHERE id=? AND user_id=? AND status='crediting')`)
      .bind(row.amount_nano, userId, `${row.stars_amount} Stars converted to Gram balance`, metadataJson, userId, id, id, userId),
    env.DB.prepare(`UPDATE stars_deposits
      SET status='completed', telegram_payment_charge_id=COALESCE(telegram_payment_charge_id, ?),
          provider_payment_charge_id=COALESCE(provider_payment_charge_id, ?), updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND user_id=? AND status='crediting'`)
      .bind(telegramChargeId, providerChargeId, id, userId),
  ]);

  const applied = Number(results[1]?.meta?.changes || 0) > 0;
  if (!applied) return;
  await publishLiveActivity(env, {
    kind: 'deposit',
    userId: row.user_id,
    amountNano: row.amount_nano,
    key: row.id,
    createdAt: new Date().toISOString(),
  }).catch((error) => console.warn('Stars deposit live activity failed', error));
  await awardDepositXp(env, row.user_id, 'stars_deposit', row.id)
    .catch((error) => console.warn('Stars deposit XP award failed', error));
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

export async function getStarsGramRate(): Promise<StarsGramRate> {
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

type GramPriceAttempt = {
  source: string;
  price: number;
  error: string;
};

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GRAM_PRICE_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function validGramUsd(value: unknown): number {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

async function fetchBinanceGramUsd(url: string, source: string): Promise<GramPriceAttempt> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: { accept: 'application/json', 'user-agent': 'VexaGames/1.0' },
      cf: { cacheTtl: 1, cacheEverything: false },
    } as RequestInit);
    if (!response.ok) return { source, price: 0, error: `HTTP ${response.status}` };
    const ticker = await response.json() as BinanceTickerResponse;
    const price = validGramUsd(ticker?.price);
    return { source, price, error: price ? '' : 'invalid price' };
  } catch (error) {
    return { source, price: 0, error: error instanceof Error ? error.message : 'request failed' };
  }
}

async function fetchCoinPaprikaGramUsd(): Promise<GramPriceAttempt> {
  const source = 'coinpaprika';
  try {
    const response = await fetchWithTimeout(GRAM_USD_COINPAPRIKA_URL, {
      headers: { accept: 'application/json', 'user-agent': 'VexaGames/1.0' },
      cf: { cacheTtl: 60, cacheEverything: true },
    } as RequestInit);
    if (!response.ok) return { source, price: 0, error: `HTTP ${response.status}` };
    const ticker = await response.json() as CoinPaprikaTickerResponse;
    const symbol = String(ticker?.symbol || '').toUpperCase();
    if (ticker?.id !== 'toncoin-the-open-network' || (symbol !== 'GRAM' && symbol !== 'TON')) {
      return { source, price: 0, error: 'wrong asset' };
    }
    const price = validGramUsd(ticker?.quotes?.USD?.price);
    return { source, price, error: price ? '' : 'invalid price' };
  } catch (error) {
    return { source, price: 0, error: error instanceof Error ? error.message : 'request failed' };
  }
}

async function fetchGateGramUsd(): Promise<GramPriceAttempt> {
  const source = 'gate';
  try {
    const response = await fetchWithTimeout(GRAM_USD_GATE_URL, {
      headers: { accept: 'application/json', 'user-agent': 'VexaGames/1.0' },
      cf: { cacheTtl: 5, cacheEverything: true },
    } as RequestInit);
    if (!response.ok) return { source, price: 0, error: `HTTP ${response.status}` };
    const tickers = await response.json() as GateTickerResponse;
    const ticker = Array.isArray(tickers) ? tickers[0] : null;
    if (ticker?.currency_pair !== 'GRAM_USDT') return { source, price: 0, error: 'wrong asset' };
    const price = validGramUsd(ticker.last);
    return { source, price, error: price ? '' : 'invalid price' };
  } catch (error) {
    return { source, price: 0, error: error instanceof Error ? error.message : 'request failed' };
  }
}

async function fetchStarsGramRate(): Promise<StarsGramRate> {
  const attempts = await Promise.all([
    fetchGateGramUsd(),
    fetchCoinPaprikaGramUsd(),
    ...GRAM_USD_TICKER_URLS.map((url, index) => fetchBinanceGramUsd(url, index === 0 ? 'binance-data' : 'binance-api')),
  ]);
  const gramUsd = attempts.find((attempt) => attempt.price > 0)?.price || 0;
  if (!gramUsd) {
    const details = attempts.map((attempt) => `${attempt.source}: ${attempt.error || 'unavailable'}`).join(', ');
    throw new Error(`Gram price feed is unavailable (${details})`);
  }
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

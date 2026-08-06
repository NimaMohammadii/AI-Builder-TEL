import type { Env, TelegramPreCheckoutQuery, TelegramSuccessfulPayment } from './types';
import { gameBotToken } from './utils';

const FREE_SPIN_MS = 24 * 60 * 60 * 1000;
const PAID_SPIN_STARS = 18;
const PAYMENT_PREFIX = 'swpay_';
const REQUEST_PREFIX = 'swreq_';

const PRIZES = [
  { code: 'gram_9', label: '9 Gram', gramMilli: 9000, extraSpins: 0 },
  { code: 'no_prize_1', label: 'No Prize', gramMilli: 0, extraSpins: 0 },
  { code: 'gram_4', label: '4 Gram', gramMilli: 4000, extraSpins: 0 },
  { code: 'spin_again', label: 'Spin Again', gramMilli: 0, extraSpins: 1 },
  { code: 'gram_0_5', label: '0.5 Gram', gramMilli: 500, extraSpins: 0 },
  { code: 'no_prize_2', label: 'No Prize', gramMilli: 0, extraSpins: 0 },
] as const;

type AccountRow = {
  user_id: string;
  gram_milli: number;
  paid_spins: number;
  last_free_spin_at: string | null;
};

type PaymentRow = {
  id: string;
  user_id: string;
  stars_amount: number;
  status: string;
  telegram_payment_charge_id: string | null;
};

type SpinRow = {
  id: string;
  user_id: string;
  mode: string;
  prize_index: number;
  prize_code: string;
  gram_milli: number;
  created_at: string;
};

type TelegramInvoiceResponse = { ok: boolean; result?: string; description?: string };

export async function getSpecialWheelState(env: Env, userIdInput: unknown) {
  const userId = cleanUserId(userIdInput);
  await ensureTables(env);
  await ensureAccount(env, userId);
  const account = await getAccount(env, userId);
  const lastFree = account?.last_free_spin_at ? Date.parse(account.last_free_spin_at) : 0;
  const nextFreeAtMs = lastFree > 0 ? lastFree + FREE_SPIN_MS : 0;
  const now = Date.now();
  return {
    freeAvailable: !lastFree || now >= nextFreeAtMs,
    nextFreeAt: nextFreeAtMs > now ? new Date(nextFreeAtMs).toISOString() : null,
    paidSpins: Math.max(0, Number(account?.paid_spins || 0)),
    gramBalance: formatGram(Number(account?.gram_milli || 0)),
    gramMilli: Math.max(0, Number(account?.gram_milli || 0)),
    priceStars: PAID_SPIN_STARS,
  };
}

export async function createSpecialWheelInvoiceResponse(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await verifiedUserId(request, env);
    await ensureTables(env);
    await ensureAccount(env, userId);
    const id = PAYMENT_PREFIX + randomHex(20);
    await env.DB.prepare(`INSERT INTO special_wheel_payments
      (id, user_id, stars_amount, status, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
      .bind(id, userId, PAID_SPIN_STARS)
      .run();
    const invoiceLink = await createInvoiceLink(env, id);
    return json({ ok: true, invoiceLink, priceStars: PAID_SPIN_STARS });
  } catch (error) {
    return json({ ok: false, error: errorMessage(error) }, 400);
  }
}

export async function specialWheelSpinResponse(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await verifiedUserId(request, env);
    const body = await request.clone().json().catch(() => ({})) as Record<string, unknown>;
    const requestId = cleanRequestId(body.requestId);
    await ensureTables(env);
    await ensureAccount(env, userId);

    const existing = await env.DB.prepare('SELECT * FROM special_wheel_spins WHERE id = ? AND user_id = ?')
      .bind(requestId, userId)
      .first<SpinRow>();
    if (existing && existing.prize_index >= 0) return json({ ok: true, ...spinPayload(existing), state: await getSpecialWheelState(env, userId) });

    await env.DB.prepare(`INSERT OR IGNORE INTO special_wheel_spins
      (id, user_id, mode, prize_index, prize_code, gram_milli, created_at)
      VALUES (?, ?, 'pending', -1, 'pending', 0, CURRENT_TIMESTAMP)`)
      .bind(requestId, userId)
      .run();

    const claimed = await claimEntitlement(env, userId);
    if (!claimed) {
      await env.DB.prepare("DELETE FROM special_wheel_spins WHERE id = ? AND user_id = ? AND prize_index = -1").bind(requestId, userId).run();
      return json({ ok: false, error: 'payment_required', state: await getSpecialWheelState(env, userId) }, 402);
    }

    const prizeIndex = secureRandomIndex(PRIZES.length);
    const prize = PRIZES[prizeIndex];
    await env.DB.batch([
      env.DB.prepare(`UPDATE special_wheel_spins SET mode = ?, prize_index = ?, prize_code = ?, gram_milli = ?
        WHERE id = ? AND user_id = ? AND prize_index = -1`)
        .bind(claimed, prizeIndex, prize.code, prize.gramMilli, requestId, userId),
      env.DB.prepare(`UPDATE special_wheel_accounts
        SET gram_milli = gram_milli + ?, paid_spins = paid_spins + ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`)
        .bind(prize.gramMilli, prize.extraSpins, userId),
    ]);

    const row = await env.DB.prepare('SELECT * FROM special_wheel_spins WHERE id = ? AND user_id = ?')
      .bind(requestId, userId)
      .first<SpinRow>();
    if (!row || row.prize_index < 0) throw new Error('Spin could not be completed');
    return json({ ok: true, ...spinPayload(row), state: await getSpecialWheelState(env, userId) });
  } catch (error) {
    return json({ ok: false, error: errorMessage(error) }, 400);
  }
}

export async function handleSpecialWheelPreCheckout(env: Env, query: TelegramPreCheckoutQuery): Promise<boolean> {
  const payload = String(query.invoice_payload || '').trim();
  if (!payload.startsWith(PAYMENT_PREFIX)) return false;
  await ensureTables(env);
  const row = await env.DB.prepare('SELECT * FROM special_wheel_payments WHERE id = ?').bind(payload).first<PaymentRow>();
  const buyerId = cleanUserId((query as unknown as { from?: { id?: unknown } }).from?.id);
  const valid = Boolean(
    row && row.status === 'pending' && row.user_id === buyerId && query.currency === 'XTR' &&
    Number(query.total_amount) === PAID_SPIN_STARS && Number(row.stars_amount) === PAID_SPIN_STARS,
  );
  await telegram(gameBotToken(env), 'answerPreCheckoutQuery', {
    pre_checkout_query_id: query.id,
    ok: valid,
    error_message: valid ? undefined : 'This wheel payment is no longer valid.',
  });
  return true;
}

export async function handleSpecialWheelSuccessfulPayment(
  env: Env,
  userIdInput: unknown,
  payment: TelegramSuccessfulPayment,
): Promise<boolean> {
  const payload = String(payment.invoice_payload || '').trim();
  if (!payload.startsWith(PAYMENT_PREFIX)) return false;
  if (payment.currency !== 'XTR' || Number(payment.total_amount) !== PAID_SPIN_STARS) return true;
  const userId = cleanUserId(userIdInput);
  await ensureTables(env);
  await ensureAccount(env, userId);
  const row = await env.DB.prepare('SELECT * FROM special_wheel_payments WHERE id = ?').bind(payload).first<PaymentRow>();
  if (!row || row.user_id !== userId || Number(row.stars_amount) !== PAID_SPIN_STARS) return true;
  if (row.status === 'completed') return true;

  const chargeId = String(payment.telegram_payment_charge_id || '').trim();
  if (!chargeId) return true;
  const used = await env.DB.prepare('SELECT id FROM special_wheel_payments WHERE telegram_payment_charge_id = ? LIMIT 1')
    .bind(chargeId)
    .first<{ id: string }>();
  if (used && used.id !== payload) return true;

  const updated = await env.DB.prepare(`UPDATE special_wheel_payments
    SET status = 'completed', telegram_payment_charge_id = ?, provider_payment_charge_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND status = 'pending'`)
    .bind(chargeId, payment.provider_payment_charge_id ?? null, payload, userId)
    .run();
  if (Number(updated.meta.changes || 0) > 0) {
    await env.DB.prepare('UPDATE special_wheel_accounts SET paid_spins = paid_spins + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
      .bind(userId)
      .run();
  }
  return true;
}

async function claimEntitlement(env: Env, userId: string): Promise<'free' | 'paid' | null> {
  const cutoff = new Date(Date.now() - FREE_SPIN_MS).toISOString();
  const free = await env.DB.prepare(`UPDATE special_wheel_accounts
    SET last_free_spin_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND (last_free_spin_at IS NULL OR last_free_spin_at <= ?)`)
    .bind(userId, cutoff)
    .run();
  if (Number(free.meta.changes || 0) > 0) return 'free';
  const paid = await env.DB.prepare(`UPDATE special_wheel_accounts
    SET paid_spins = paid_spins - 1, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND paid_spins > 0`)
    .bind(userId)
    .run();
  return Number(paid.meta.changes || 0) > 0 ? 'paid' : null;
}

async function verifiedUserId(request: Request, env: Env): Promise<string> {
  const body = await request.clone().json().catch(() => ({})) as Record<string, unknown>;
  const initData = String(body.initData || '').trim();
  if (!initData) throw new Error('Open the Mini App inside Telegram');
  return validateTelegramInitData(initData, gameBotToken(env));
}

async function validateTelegramInitData(initData: string, token: string): Promise<string> {
  if (!token) throw new Error('Bot token is not configured');
  const params = new URLSearchParams(initData);
  const receivedHash = String(params.get('hash') || '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(receivedHash)) throw new Error('Invalid Telegram session');
  params.delete('hash');
  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || Math.abs(Date.now() / 1000 - authDate) > 86400) throw new Error('Telegram session expired');
  const checkString = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n');
  const encoder = new TextEncoder();
  const webAppKey = await crypto.subtle.importKey('raw', encoder.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const secret = await crypto.subtle.sign('HMAC', webAppKey, encoder.encode(token));
  const secretKey = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(checkString));
  const expected = Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (!timingSafeEqual(expected, receivedHash)) throw new Error('Invalid Telegram session');
  const user = JSON.parse(String(params.get('user') || '{}')) as { id?: unknown };
  return cleanUserId(user.id);
}

async function createInvoiceLink(env: Env, id: string): Promise<string> {
  const response = await telegram<TelegramInvoiceResponse>(gameBotToken(env), 'createInvoiceLink', {
    title: 'Vexa Wheel Spin',
    description: 'One paid spin on the Vexa reward wheel',
    payload: id,
    currency: 'XTR',
    prices: [{ label: 'Wheel spin', amount: PAID_SPIN_STARS }],
  });
  if (!response.ok || !response.result) throw new Error(response.description || 'Could not create Stars invoice');
  return response.result;
}

async function ensureTables(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS special_wheel_accounts (
      user_id TEXT PRIMARY KEY,
      gram_milli INTEGER NOT NULL DEFAULT 0,
      paid_spins INTEGER NOT NULL DEFAULT 0,
      last_free_spin_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS special_wheel_payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stars_amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      telegram_payment_charge_id TEXT UNIQUE,
      provider_payment_charge_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS special_wheel_spins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      prize_index INTEGER NOT NULL,
      prize_code TEXT NOT NULL,
      gram_milli INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_special_wheel_payments_user ON special_wheel_payments(user_id, created_at)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_special_wheel_spins_user ON special_wheel_spins(user_id, created_at)'),
  ]);
}

async function ensureAccount(env: Env, userId: string): Promise<void> {
  await env.DB.prepare('INSERT OR IGNORE INTO special_wheel_accounts (user_id) VALUES (?)').bind(userId).run();
}

async function getAccount(env: Env, userId: string): Promise<AccountRow | null> {
  return await env.DB.prepare('SELECT * FROM special_wheel_accounts WHERE user_id = ?').bind(userId).first<AccountRow>();
}

function spinPayload(row: SpinRow) {
  const prize = PRIZES[row.prize_index];
  return {
    spinId: row.id,
    mode: row.mode,
    prizeIndex: row.prize_index,
    prizeCode: row.prize_code,
    prizeLabel: prize?.label || row.prize_code,
    gramWon: formatGram(row.gram_milli),
  };
}

function secureRandomIndex(length: number): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % length;
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, length);
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9]/g, '').slice(0, 24);
  if (!id) throw new Error('Missing Telegram user');
  return id;
}

function cleanRequestId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 64);
  if (!id.startsWith(REQUEST_PREFIX) || id.length < REQUEST_PREFIX.length + 12) throw new Error('Invalid spin request');
  return id;
}

function formatGram(milli: number): string {
  const safe = Math.max(0, Math.floor(Number(milli) || 0));
  const whole = Math.floor(safe / 1000);
  const fraction = String(safe % 1000).padStart(3, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Request failed';
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store, no-cache, must-revalidate' } });
}

async function telegram<T>(token: string, method: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await response.json() as T;
}

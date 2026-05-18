import app from './index';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const PREDICT_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const PREDICT_MARKETS = ['bitcoin', 'ton'] as const;
const ROUND_MS = 5 * 60 * 1000;
const LOCK_MS = 15 * 1000;
const PLATFORM_FEE_BPS = 500;
const NANO = 1_000_000_000;
type PredictMarket = typeof PREDICT_MARKETS[number];
type PredictSide = 'up' | 'down';
type RoundStatus = 'open' | 'locked' | 'settled';
type RoundResult = 'up' | 'down' | 'draw' | null;
type RoundRow = { id: string; market: string; starts_at: string; ends_at: string; start_price: number; end_price: number | null; status: string; result: string | null; settled_at: string | null; created_at: string };
type BetRow = { id: string; round_id: string; market: string; user_id: string; side: string; stake_nano: number; ton_usd_snapshot: number; stake_usd_snapshot: number; status: string; payout_nano: number; created_at: string };

app.get('/app/api/predict-markets', async (c) => c.json(await getPredictMarkets(c.env), 200, { 'cache-control': CACHE_NONE }));
app.get('/app/api/predict-round', async (c) => {
  try {
    const market = normalizePredictMarket(String(c.req.query('market') || 'bitcoin'));
    const round = await getOrCreateCurrentRound(c.env, market);
    await settleDueRounds(c.env, market);
    return c.json(await publicRoundJson(c.env, round, String(c.req.query('userId') || '')), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load prediction round' }, 400, { 'cache-control': CACHE_NONE });
  }
});
app.post('/app/api/predict-bet', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const market = normalizePredictMarket(String(body.market || 'bitcoin'));
    const side = normalizeSide(body.side);
    const userId = cleanUserId(body.userId);
    const stakeNano = tonToNano(body.stakeTon);
    const tonUsd = cleanPrice(body.tonUsdSnapshot || await fetchPrice('ton'));
    if (stakeNano <= 0) throw new Error('Enter a valid TON amount');
    await settleDueRounds(c.env, market);
    const round = await getOrCreateCurrentRound(c.env, market);
    if (Date.now() >= Date.parse(round.ends_at) - LOCK_MS) throw new Error('This round is locked. Wait for the next round.');
    const betId = 'pbet_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22);
    await debitUserTonBalanceIfEnough(c.env, userId, stakeNano, { kind: 'predict', title: 'Prediction stake', referenceId: betId, referenceType: 'predict_bet', metadata: { market, side, roundId: round.id } });
    await ensurePredictTables(c.env);
    await c.env.DB.prepare(`INSERT INTO predict_bets (id, round_id, market, user_id, side, stake_nano, ton_usd_snapshot, stake_usd_snapshot, status, payout_nano, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, CURRENT_TIMESTAMP)`)
      .bind(betId, round.id, market, userId, side, stakeNano, tonUsd, nanoToTon(stakeNano) * tonUsd)
      .run();
    return c.json({ ok: true, bet: await getBet(c.env, betId), round: await publicRoundJson(c.env, round, userId), userControls: await getUserControls(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not place prediction' }, 400, { 'cache-control': CACHE_NONE });
  }
});
app.post('/app/api/predict-settle', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const market = normalizePredictMarket(String(body.market || 'bitcoin'));
    const settled = await settleDueRounds(c.env, market, true);
    return c.json({ ok: true, settled }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not settle predictions' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/admin/api/predict-markets', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await getPredictMarkets(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.get('/app/api/predict-market-image/:market', async (c) => {
  try {
    const market = normalizePredictMarket(c.req.param('market').replace(/\.png$/i, ''));
    return getPredictImageResponse(c.env, predictImageKey(market));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.post('/admin/api/predict-market-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const form = await c.req.formData();
    const market = normalizePredictMarket(String(form.get('market') || ''));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400, { 'cache-control': CACHE_NONE });
    if (!PREDICT_IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400, { 'cache-control': CACHE_NONE });
    if (file.size > 3_000_000) return c.json({ error: 'Image must be under 3MB.' }, 400, { 'cache-control': CACHE_NONE });
    const version = String(Date.now());
    await c.env.ASSETS.put(predictImageKey(market), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json(await getPredictMarkets(c.env), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload predict image' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function getPredictMarkets(env: Env): Promise<{ markets: Record<PredictMarket, { imageUrl: string }> }> {
  const entries = await Promise.all(PREDICT_MARKETS.map(async (market) => {
    const head = await env.ASSETS.head(predictImageKey(market)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return [market, { imageUrl: head ? `/app/api/predict-market-image/${market}.png?v=${version}` : '' }] as const;
  }));
  return { markets: Object.fromEntries(entries) as Record<PredictMarket, { imageUrl: string }> };
}
async function publicRoundJson(env: Env, round: RoundRow, userId: string) {
  await ensurePredictTables(env);
  const pools = await poolJson(env, round.id);
  const userBets = userId ? await userBetsJson(env, round.id, cleanUserIdOptional(userId)) : [];
  const now = Date.now();
  const ends = Date.parse(round.ends_at);
  return { ok: true, round: { id: round.id, market: round.market, startsAt: round.starts_at, endsAt: round.ends_at, startPrice: Number(round.start_price), endPrice: round.end_price == null ? null : Number(round.end_price), status: now >= ends - LOCK_MS && round.status === 'open' ? 'locked' : round.status, result: round.result, remainingMs: Math.max(0, ends - now), lockRemainingMs: Math.max(0, ends - LOCK_MS - now), pools, userBets } };
}
async function ensurePredictTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_rounds (
    id TEXT PRIMARY KEY,
    market TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    start_price REAL NOT NULL,
    end_price REAL,
    status TEXT NOT NULL DEFAULT 'open',
    result TEXT,
    settled_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_rounds_market_end ON predict_rounds(market, ends_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_bets (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    market TEXT NOT NULL,
    user_id TEXT NOT NULL,
    side TEXT NOT NULL,
    stake_nano INTEGER NOT NULL,
    ton_usd_snapshot REAL NOT NULL DEFAULT 0,
    stake_usd_snapshot REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    payout_nano INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_round ON predict_bets(round_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_user_round ON predict_bets(user_id, round_id)').run();
}
async function getOrCreateCurrentRound(env: Env, market: PredictMarket): Promise<RoundRow> {
  await ensurePredictTables(env);
  const now = Date.now();
  const existing = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND datetime(starts_at) <= datetime('now') AND datetime(ends_at) > datetime('now') ORDER BY datetime(starts_at) DESC LIMIT 1`).bind(market).first<RoundRow>();
  if (existing) return existing;
  const startMs = Math.floor(now / ROUND_MS) * ROUND_MS;
  const startsAt = new Date(startMs).toISOString();
  const endsAt = new Date(startMs + ROUND_MS).toISOString();
  const id = `pr_${market}_${startMs}`;
  const startPrice = await fetchPrice(market);
  await env.DB.prepare(`INSERT OR IGNORE INTO predict_rounds (id, market, starts_at, ends_at, start_price, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`).bind(id, market, startsAt, endsAt, startPrice).run();
  const row = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(id).first<RoundRow>();
  if (!row) throw new Error('Could not create prediction round');
  return row;
}
async function settleDueRounds(env: Env, market: PredictMarket, force = false): Promise<number> {
  await ensurePredictTables(env);
  const rows = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND status != 'settled' AND (datetime(ends_at) <= datetime('now') OR ? = 1) ORDER BY datetime(ends_at) ASC LIMIT 10`).bind(market, force ? 1 : 0).all<RoundRow>();
  let settled = 0;
  for (const round of rows.results || []) {
    if (!force && Date.parse(round.ends_at) > Date.now()) continue;
    await settleRound(env, round);
    settled += 1;
  }
  return settled;
}
async function settleRound(env: Env, round: RoundRow): Promise<void> {
  const fresh = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(round.id).first<RoundRow>();
  if (!fresh || fresh.status === 'settled') return;
  const endPrice = await fetchPrice(normalizePredictMarket(fresh.market));
  const result: Exclude<RoundResult, null> = endPrice > Number(fresh.start_price) ? 'up' : endPrice < Number(fresh.start_price) ? 'down' : 'draw';
  await env.DB.prepare(`UPDATE predict_rounds SET status = 'settled', end_price = ?, result = ?, settled_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'settled'`).bind(endPrice, result, fresh.id).run();
  const bets = await env.DB.prepare('SELECT * FROM predict_bets WHERE round_id = ? AND status = \'active\'').bind(fresh.id).all<BetRow>();
  const active = bets.results || [];
  if (!active.length) return;
  const upPool = active.filter((b) => b.side === 'up').reduce((s, b) => s + Number(b.stake_nano || 0), 0);
  const downPool = active.filter((b) => b.side === 'down').reduce((s, b) => s + Number(b.stake_nano || 0), 0);
  const winnerPool = result === 'up' ? upPool : result === 'down' ? downPool : 0;
  const loserPool = result === 'up' ? downPool : result === 'down' ? upPool : 0;
  const fee = Math.floor(loserPool * PLATFORM_FEE_BPS / 10000);
  const distributable = Math.max(0, loserPool - fee);
  for (const bet of active) {
    const stake = Number(bet.stake_nano || 0);
    const isWinner = result !== 'draw' && bet.side === result && winnerPool > 0 && loserPool > 0;
    const shouldRefund = result === 'draw' || winnerPool <= 0 || loserPool <= 0;
    if (shouldRefund) {
      await payBet(env, bet, stake, 'refunded');
    } else if (isWinner) {
      const payout = stake + Math.floor(stake / winnerPool * distributable);
      await payBet(env, bet, payout, 'won');
    } else {
      await env.DB.prepare(`UPDATE predict_bets SET status = 'lost', payout_nano = 0 WHERE id = ? AND status = 'active'`).bind(bet.id).run();
    }
  }
}
async function payBet(env: Env, bet: BetRow, payoutNano: number, status: 'won' | 'refunded'): Promise<void> {
  const result = await env.DB.prepare(`UPDATE predict_bets SET status = ?, payout_nano = ? WHERE id = ? AND status = 'active'`).bind(status, payoutNano, bet.id).run();
  if ((result.meta?.changes || 0) <= 0) return;
  await adjustUserTonBalance(env, bet.user_id, payoutNano, { kind: 'predict', title: status === 'won' ? 'Prediction payout' : 'Prediction refund', referenceId: bet.id, referenceType: 'predict_bet', metadata: { roundId: bet.round_id, market: bet.market, side: bet.side, status } });
}
async function poolJson(env: Env, roundId: string) {
  const rows = await env.DB.prepare(`SELECT side, SUM(stake_nano) AS stakeNano, COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status = 'active' GROUP BY side`).bind(roundId).all<{ side: string; stakeNano: number; count: number }>();
  const base = { up: { stakeNano: 0, stakeTon: 0, count: 0 }, down: { stakeNano: 0, stakeTon: 0, count: 0 } };
  for (const row of rows.results || []) {
    if (row.side === 'up' || row.side === 'down') base[row.side] = { stakeNano: Number(row.stakeNano || 0), stakeTon: nanoToTon(Number(row.stakeNano || 0)), count: Number(row.count || 0) };
  }
  return base;
}
async function userBetsJson(env: Env, roundId: string, userId: string) {
  if (!userId) return [];
  const rows = await env.DB.prepare('SELECT * FROM predict_bets WHERE round_id = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 20').bind(roundId, userId).all<BetRow>();
  return (rows.results || []).map((b) => ({ id: b.id, side: b.side, stakeNano: Number(b.stake_nano || 0), stakeTon: nanoToTon(Number(b.stake_nano || 0)), status: b.status, payoutNano: Number(b.payout_nano || 0), payoutTon: nanoToTon(Number(b.payout_nano || 0)), createdAt: b.created_at }));
}
async function getBet(env: Env, id: string) {
  const b = await env.DB.prepare('SELECT * FROM predict_bets WHERE id = ?').bind(id).first<BetRow>();
  if (!b) return null;
  return { id: b.id, roundId: b.round_id, market: b.market, userId: b.user_id, side: b.side, stakeNano: Number(b.stake_nano || 0), stakeTon: nanoToTon(Number(b.stake_nano || 0)), status: b.status, payoutNano: Number(b.payout_nano || 0), payoutTon: nanoToTon(Number(b.payout_nano || 0)), createdAt: b.created_at };
}
async function fetchPrice(market: PredictMarket): Promise<number> {
  const symbol = market === 'ton' ? 'TONUSDT' : 'BTCUSDT';
  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, { cf: { cacheTtl: 1, cacheEverything: false } as RequestInit['cf'] });
  if (!res.ok) throw new Error('Price feed is unavailable');
  const data = await res.json() as { price?: string };
  return cleanPrice(data.price);
}
async function getPredictImageResponse(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', CACHE_LONG);
  if (!headers.get('content-type')) headers.set('content-type', object.customMetadata?.contentType || 'image/png');
  return new Response(object.body, { headers });
}
function predictImageKey(market: PredictMarket): string { return `predict/${market}/question-image`; }
function normalizePredictMarket(value: string): PredictMarket {
  const market = value.trim().toLowerCase();
  if (market === 'bitcoin' || market === 'btc') return 'bitcoin';
  if (market === 'ton') return 'ton';
  throw new Error('Invalid predict market');
}
function normalizeSide(value: unknown): PredictSide { const side = String(value || '').toLowerCase(); if (side === 'up' || side === 'down') return side; throw new Error('Choose Up or Down'); }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.max(1, Math.floor(n * NANO)); }
function nanoToTon(value: number): number { return Math.floor(Number(value) || 0) / NANO; }
function cleanPrice(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid price'); return n; }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Missing user id'); return id; }
function cleanUserIdOptional(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

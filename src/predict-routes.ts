import app from './index';
import './prediction-events';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';
import { gameBotToken, validateTelegramInitData } from './utils';
import { isMiniAppAdmin } from './section-access';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const CACHE_PREDICT_IMAGE_MANIFEST = 'public, max-age=300, stale-while-revalidate=86400';
const PREDICT_MARKETS = ['bitcoin', 'gold', 'oil'] as const;
const TRADE_MARKETS = ['bitcoin', 'gold', 'oil'] as const;
const ASTER_FUTURES_REST_BASE = 'https://fapi.asterdex.com';
const ASTER_FUTURES_WS_HTTP_BASE = 'https://fstream.asterdex.com';
const ROUND_MS = 5 * 60 * 1000;
const OIL_ROUND_MS = 72 * 60 * 60 * 1000;
const LOCK_MS = 15 * 1000;
const PLATFORM_FEE_BPS = 500;
const NANO = 1_000_000_000;
type PredictMarket = typeof PREDICT_MARKETS[number];
type TradeMarket = typeof TRADE_MARKETS[number];
type PredictSide = 'up' | 'down';
type RoundResult = 'up' | 'down' | 'draw' | null;
type RoundRow = { id: string; market: string; starts_at: string; ends_at: string; start_price: number; end_price: number | null; status: string; result: string | null; settled_at: string | null; created_at: string };
type BetRow = { id: string; round_id: string; market: string; user_id: string; side: string; stake_nano: number; ton_usd_snapshot: number; stake_usd_snapshot: number; status: string; payout_nano: number; created_at: string };
type MarketSnapshot = { price: number; history: number[] };

app.post('/app/api/predict-access', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const userId = await validateTelegramInitData(body.initData, gameBotToken(c.env));
    return c.json({ ok: true, admin: isMiniAppAdmin(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch {
    return c.json({ ok: false, admin: false }, 401, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/predict-markets', async (c) => c.json(await getPredictMarkets(c.env), 200, { 'cache-control': CACHE_PREDICT_IMAGE_MANIFEST }));

app.get('/app/api/predict-round', async (c) => {
  try {
    const market = normalizeTradeMarket(String(c.req.query('market') || 'bitcoin'));
    const userId = await authenticatePredictAdmin(c.env, c.req.query('userId'), c.req.header('x-telegram-init-data'));
    const snapshot = await fetchMarketSnapshot(market);
    const round = await getOrCreateCurrentRound(c.env, market, snapshot.price);
    await settleDueRounds(c.env, market);
    return c.json({ ...(await publicRoundJson(c.env, round, userId, snapshot.price)), history: snapshot.history }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load prediction round' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/predict-stream', async (c) => {
  let upstream: WebSocket | null = null;
  let downstream: WebSocket | null = null;
  try {
    if (String(c.req.header('Upgrade') || '').toLowerCase() !== 'websocket') {
      return c.json({ error: 'Expected websocket' }, 426, { 'cache-control': CACHE_NONE });
    }
    const market = normalizeTradeMarket(String(c.req.query('market') || 'bitcoin'));
    await authenticatePredictAdmin(c.env, c.req.query('userId'), c.req.query('initData'));

    const upstreamResponse = await fetch(marketStreamUrl(market), { headers: { Upgrade: 'websocket' } });
    upstream = (upstreamResponse as Response & { webSocket?: WebSocket | null }).webSocket || null;
    if (!upstream) {
      return c.json({ error: `Aster live price WebSocket rejected: HTTP ${upstreamResponse.status}` }, 502, { 'cache-control': CACHE_NONE });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    downstream = server;
    const acceptSocket = (socket: WebSocket) => (socket as WebSocket & { accept: (options?: { allowHalfOpen?: boolean }) => void }).accept({ allowHalfOpen: true });
    acceptSocket(upstream);
    acceptSocket(server);

    let active = true;
    const closePair = (code: number, reason: string) => {
      if (!active) return;
      active = false;
      try { upstream?.close(code, reason); } catch {}
      try { server.close(code, reason); } catch {}
    };

    upstream.addEventListener('message', async (message) => {
      if (!active) return;
      try {
        const text = await readWebSocketText(message.data);
        if (!text || !active) return;
        const data = JSON.parse(text) as { p?: unknown };
        const price = cleanPrice(data.p);
        if (server.readyState === 1) server.send(JSON.stringify({ p: price }));
      } catch {}
    });
    upstream.addEventListener('error', () => closePair(1011, 'Aster live price feed unavailable'));
    upstream.addEventListener('close', () => closePair(1012, 'Aster live price feed closed'));
    server.addEventListener('error', () => closePair(1011, 'Predict stream failed'));
    server.addEventListener('close', () => closePair(1000, 'Predict stream closed'));

    return new Response(null, { status: 101, webSocket: client });
  } catch (error) {
    try { upstream?.close(1011, 'Predict stream failed'); } catch {}
    try { downstream?.close(1011, 'Predict stream failed'); } catch {}
    return c.json({ error: error instanceof Error ? error.message : 'Could not open live price feed' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/app/api/predict-bet', async (c) => {
  let betId = '';
  let userId = '';
  let stakeNano = 0;
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const market = normalizeTradeMarket(String(body.market || 'bitcoin'));
    const side = normalizeSide(body.side);
    userId = await authenticatePredictAdmin(c.env, body.userId, body.initData);
    stakeNano = tonToNano(body.stakeTon);
    const tonUsd = cleanOptionalPrice(body.tonUsdSnapshot);
    if (stakeNano <= 0) throw new Error('Enter a valid GRAM amount');
    await settleDueRounds(c.env, market);
    const round = await getOrCreateCurrentRound(c.env, market);
    const roundId = cleanDbText(round.id, 'Prediction round is not ready');
    if (Date.now() >= Date.parse(round.ends_at) - LOCK_MS) throw new Error('This round is locked. Wait for the next round.');
    await ensurePredictTables(c.env);

    let existing = await c.env.DB.prepare("SELECT * FROM predict_bets WHERE round_id = ? AND user_id = ? AND status != 'failed' ORDER BY datetime(created_at) DESC LIMIT 1")
      .bind(roundId, userId)
      .first<BetRow>();

    if (existing) {
      if (existing.status !== 'pending') throw new Error('You already placed a prediction in this round. Wait for the next round.');
      if (existing.market !== market || existing.side !== side || Number(existing.stake_nano || 0) !== stakeNano) {
        throw new Error('A previous prediction is still processing. Retry the same prediction.');
      }
      betId = cleanDbText(existing.id, 'Prediction bet is not ready');
    } else {
      betId = 'pbet_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22);
      const inserted = await c.env.DB.prepare(`INSERT INTO predict_bets (id, round_id, market, user_id, side, stake_nano, ton_usd_snapshot, stake_usd_snapshot, status, payout_nano, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, CURRENT_TIMESTAMP
        WHERE NOT EXISTS (SELECT 1 FROM predict_bets WHERE round_id = ? AND user_id = ? AND status != 'failed')`)
        .bind(betId, roundId, market, userId, side, stakeNano, tonUsd, nanoToTon(stakeNano) * tonUsd, roundId, userId)
        .run();
      if ((inserted.meta?.changes || 0) <= 0) {
        existing = await c.env.DB.prepare("SELECT * FROM predict_bets WHERE round_id = ? AND user_id = ? AND status != 'failed' ORDER BY datetime(created_at) DESC LIMIT 1")
          .bind(roundId, userId)
          .first<BetRow>();
        if (!existing || existing.status !== 'pending' || existing.market !== market || existing.side !== side || Number(existing.stake_nano || 0) !== stakeNano) {
          throw new Error('You already placed a prediction in this round. Wait for the next round.');
        }
        betId = cleanDbText(existing.id, 'Prediction bet is not ready');
      }
    }

    await debitUserTonBalanceIfEnough(c.env, userId, stakeNano, { kind: 'predict', title: 'Prediction stake', referenceId: betId, referenceType: 'predict_bet', metadata: { market, side, roundId } });
    const active = await c.env.DB.prepare("UPDATE predict_bets SET status = 'active' WHERE id = ? AND status = 'pending'").bind(betId).run();
    if ((active.meta?.changes || 0) <= 0) {
      const fresh = await c.env.DB.prepare('SELECT * FROM predict_bets WHERE id = ?').bind(betId).first<BetRow>();
      if (!fresh || fresh.status !== 'active') {
        await adjustUserTonBalance(c.env, userId, stakeNano, { kind: 'predict', title: 'Prediction stake rollback', referenceId: betId, referenceType: 'predict_bet', metadata: { market, side, roundId, status: 'rollback' } });
        throw new Error('Could not activate prediction');
      }
    }
    return c.json({ ok: true, bet: await getBet(c.env, betId), round: await publicRoundJson(c.env, round, userId), userControls: await getUserControls(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    if (betId) await c.env.DB.prepare("UPDATE predict_bets SET status = 'failed' WHERE id = ? AND status = 'pending'").bind(betId).run().catch(() => undefined);
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not place prediction' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/predict-market-image/:market', async (c) => {
  try {
    const market = normalizePredictMarket(c.req.param('market').replace(/\.png$/i, ''));
    return getPredictImageResponse(c.env, predictImageKey(market));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
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

async function publicRoundJson(env: Env, round: RoundRow, userId: string, livePrice = 0) {
  await ensurePredictTables(env);
  const cleanedUserId = cleanUserIdOptional(userId);
  const roundId = cleanDbText(round.id, 'Prediction round is not ready');
  const pools = await poolJson(env, roundId);
  const userBets = cleanedUserId ? await userBetsJson(env, roundId, cleanedUserId) : [];
  const recentUserBets = cleanedUserId ? await recentUserBetsJson(env, String(round.market || ''), cleanedUserId) : [];
  const userControls = cleanedUserId ? await getUserControls(env, cleanedUserId) : null;
  const now = Date.now();
  const ends = Date.parse(String(round.ends_at || ''));
  return { ok: true, userControls, round: { id: roundId, market: String(round.market || ''), startsAt: String(round.starts_at || ''), endsAt: String(round.ends_at || ''), startPrice: Number(round.start_price || 0), livePrice: Number(livePrice) > 0 ? Number(livePrice) : null, endPrice: round.end_price == null ? null : Number(round.end_price), status: now >= ends - LOCK_MS && round.status === 'open' ? 'locked' : String(round.status || 'open'), result: round.result || null, remainingMs: Math.max(0, ends - now), lockRemainingMs: Math.max(0, ends - LOCK_MS - now), pools, userBets, recentUserBets } };
}
async function ensurePredictTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_rounds (id TEXT PRIMARY KEY, market TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, start_price REAL NOT NULL, end_price REAL, status TEXT NOT NULL DEFAULT 'open', result TEXT, settled_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_rounds_market_end ON predict_rounds(market, ends_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_bets (id TEXT PRIMARY KEY, round_id TEXT NOT NULL, market TEXT NOT NULL, user_id TEXT NOT NULL, side TEXT NOT NULL, stake_nano INTEGER NOT NULL, ton_usd_snapshot REAL NOT NULL DEFAULT 0, stake_usd_snapshot REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', payout_nano INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_round ON predict_bets(round_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_user_round ON predict_bets(user_id, round_id)').run();
}
async function getOrCreateCurrentRound(env: Env, market: TradeMarket, latestPrice = 0): Promise<RoundRow> {
  await ensurePredictTables(env);
  const now = Date.now();
  const existing = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND datetime(starts_at) <= datetime('now') AND datetime(ends_at) > datetime('now') ORDER BY datetime(starts_at) DESC LIMIT 1`).bind(market).first<RoundRow>();
  if (existing) {
    if (Number(existing.start_price) > 0) return existing;
    const repairedPrice = Number(latestPrice) > 0 ? Number(latestPrice) : await fetchPrice(market);
    await env.DB.prepare('UPDATE predict_rounds SET start_price = ? WHERE id = ?').bind(repairedPrice, existing.id).run();
    const repaired = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(existing.id).first<RoundRow>();
    if (!repaired) throw new Error('Could not repair prediction round');
    return repaired;
  }
  const roundMs = roundMsForMarket(market);
  const startMs = Math.floor(now / roundMs) * roundMs;
  const startsAt = new Date(startMs).toISOString();
  const endsAt = new Date(startMs + roundMs).toISOString();
  const id = `pr_${market}_${startMs}`;
  const startPrice = Number(latestPrice) > 0 ? Number(latestPrice) : await fetchPrice(market);
  await env.DB.prepare(`INSERT OR IGNORE INTO predict_rounds (id, market, starts_at, ends_at, start_price, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`).bind(id, market, startsAt, endsAt, startPrice).run();
  const row = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(id).first<RoundRow>();
  if (!row) throw new Error('Could not create prediction round');
  return row;
}
async function settleDueRounds(env: Env, market: TradeMarket, force = false): Promise<number> {
  await ensurePredictTables(env);
  const rows = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND (status != 'settled' OR id IN (SELECT round_id FROM predict_bets WHERE status IN ('active', 'settling_payment'))) AND (datetime(ends_at) <= datetime('now') OR ? = 1) ORDER BY datetime(ends_at) ASC LIMIT 10`).bind(market, force ? 1 : 0).all<RoundRow>();
  let settled = 0;
  for (const round of rows.results || []) {
    if (!force && Date.parse(round.ends_at) > Date.now()) continue;
    await settleRound(env, round);
    settled += 1;
  }
  return settled;
}
async function settleRound(env: Env, round: RoundRow): Promise<void> {
  const fresh = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(cleanDbText(round.id, 'Prediction round is not ready')).first<RoundRow>();
  if (!fresh) return;
  const freshId = cleanDbText(fresh.id, 'Prediction round is not ready');
  const activeCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status IN ('active', 'settling_payment')").bind(freshId).first<{ count: number }>();
  if (fresh.status === 'settled' && Number(activeCount?.count || 0) <= 0) return;
  const endPrice = fresh.end_price == null ? await fetchPrice(normalizeTradeMarket(fresh.market)) : Number(fresh.end_price);
  const result: RoundResult = endPrice > Number(fresh.start_price) ? 'up' : endPrice < Number(fresh.start_price) ? 'down' : 'draw';
  const lock = await env.DB.prepare(`UPDATE predict_rounds SET status = 'settling', end_price = ?, result = ? WHERE id = ? AND status != 'settled'`).bind(endPrice, result, freshId).run();
  if (fresh.status !== 'settled' && (lock.meta?.changes || 0) <= 0) return;
  const all = (await env.DB.prepare('SELECT * FROM predict_bets WHERE round_id = ?').bind(freshId).all<BetRow>()).results || [];
  const eligible = all.filter((b) => b.status !== 'failed' && b.status !== 'pending');
  const active = eligible.filter((b) => b.status === 'active' || b.status === 'settling_payment');
  const upPool = eligible.filter((b) => b.side === 'up').reduce((s, b) => s + Number(b.stake_nano || 0), 0);
  const downPool = eligible.filter((b) => b.side === 'down').reduce((s, b) => s + Number(b.stake_nano || 0), 0);
  const winnerPool = result === 'up' ? upPool : result === 'down' ? downPool : 0;
  const loserPool = result === 'up' ? downPool : result === 'down' ? upPool : 0;
  const fee = Math.floor(loserPool * PLATFORM_FEE_BPS / 10000);
  const distributable = Math.max(0, loserPool - fee);
  for (const bet of active) {
    const stake = Number(bet.stake_nano || 0);
    const isWinner = result !== 'draw' && bet.side === result && winnerPool > 0 && loserPool > 0;
    const shouldRefund = result === 'draw' || winnerPool <= 0 || loserPool <= 0;
    if (shouldRefund) await payBet(env, bet, stake, 'refunded');
    else if (isWinner) await payBet(env, bet, stake + Math.floor(stake / winnerPool * distributable), 'won');
    else await env.DB.prepare(`UPDATE predict_bets SET status = 'lost', payout_nano = 0 WHERE id = ? AND status = 'active'`).bind(cleanDbText(bet.id, 'Prediction bet is not ready')).run();
  }
  const remaining = await env.DB.prepare("SELECT COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status IN ('active', 'settling_payment')").bind(freshId).first<{ count: number }>();
  if (Number(remaining?.count || 0) <= 0) await env.DB.prepare(`UPDATE predict_rounds SET status = 'settled', end_price = ?, result = ?, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP) WHERE id = ?`).bind(endPrice, result, freshId).run();
}
async function payBet(env: Env, bet: BetRow, payoutNano: number, status: 'won' | 'refunded'): Promise<void> {
  const betId = cleanDbText(bet.id, 'Prediction bet is not ready');
  const lock = bet.status === 'settling_payment' ? { meta: { changes: 1 } } : await env.DB.prepare(`UPDATE predict_bets SET status = 'settling_payment', payout_nano = ? WHERE id = ? AND status = 'active'`).bind(payoutNano, betId).run();
  if ((lock.meta?.changes || 0) <= 0) return;
  if (payoutNano > 0) await adjustUserTonBalance(env, cleanUserId(bet.user_id), payoutNano, { kind: 'predict', title: status === 'won' ? 'Prediction payout' : 'Prediction refund', referenceId: betId, referenceType: 'predict_bet', metadata: { roundId: cleanDbText(bet.round_id, 'Prediction round is not ready'), market: String(bet.market || ''), side: String(bet.side || ''), status } });
  await env.DB.prepare(`UPDATE predict_bets SET status = ?, payout_nano = ? WHERE id = ? AND status = 'settling_payment'`).bind(status, payoutNano, betId).run();
}
async function poolJson(env: Env, roundId: string) {
  const rows = await env.DB.prepare(`SELECT side, SUM(stake_nano) AS stakeNano, COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status = 'active' GROUP BY side`).bind(cleanDbText(roundId, 'Prediction round is not ready')).all<{ side: string; stakeNano: number; count: number }>();
  const base = { up: { stakeNano: 0, stakeTon: 0, count: 0 }, down: { stakeNano: 0, stakeTon: 0, count: 0 } };
  for (const row of rows.results || []) if (row.side === 'up' || row.side === 'down') base[row.side] = { stakeNano: Number(row.stakeNano || 0), stakeTon: nanoToTon(Number(row.stakeNano || 0)), count: Number(row.count || 0) };
  return base;
}
function betJson(b: BetRow) { return { id: String(b.id || ''), roundId: String(b.round_id || ''), market: String(b.market || ''), side: String(b.side || ''), stakeNano: Number(b.stake_nano || 0), stakeTon: nanoToTon(Number(b.stake_nano || 0)), status: String(b.status || ''), payoutNano: Number(b.payout_nano || 0), payoutTon: nanoToTon(Number(b.payout_nano || 0)), createdAt: String(b.created_at || '') }; }
async function userBetsJson(env: Env, roundId: string, userId: string) { return ((await env.DB.prepare('SELECT * FROM predict_bets WHERE round_id = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 20').bind(cleanDbText(roundId, 'Prediction round is not ready'), userId).all<BetRow>()).results || []).map(betJson); }
async function recentUserBetsJson(env: Env, market: string, userId: string) { return ((await env.DB.prepare('SELECT * FROM predict_bets WHERE market = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 20').bind(cleanDbText(market, 'Prediction market is not ready'), userId).all<BetRow>()).results || []).map(betJson); }
async function getBet(env: Env, id: string) {
  const b = await env.DB.prepare('SELECT * FROM predict_bets WHERE id = ?').bind(cleanDbText(id, 'Prediction bet is not ready')).first<BetRow>();
  return b ? betJson(b) : null;
}
function marketSymbol(market: TradeMarket): string {
  return market === 'gold' ? 'XAUUSDT' : market === 'oil' ? 'CLUSDT' : 'BTCUSDT';
}
function marketStreamUrl(market: TradeMarket): string {
  return `${ASTER_FUTURES_WS_HTTP_BASE}/ws/${marketSymbol(market).toLowerCase()}@markPrice@1s`;
}
async function readWebSocketText(value: unknown): Promise<string> {
  if (typeof value === 'string') return value;
  if (value instanceof ArrayBuffer) return new TextDecoder().decode(value);
  if (ArrayBuffer.isView(value)) return new TextDecoder().decode(value as ArrayBufferView);
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value.text();
  return '';
}
async function fetchMarketSnapshot(market: TradeMarket): Promise<MarketSnapshot> {
  const symbol = marketSymbol(market);
  const res = await fetch(`${ASTER_FUTURES_REST_BASE}/fapi/v1/markPriceKlines?symbol=${symbol}&interval=1m&limit=23`, { cf: { cacheTtl: 1, cacheEverything: false } } as RequestInit);
  if (!res.ok) throw new Error(`Aster mark price snapshot failed: HTTP ${res.status}`);
  const rows = await res.json() as unknown;
  if (!Array.isArray(rows)) throw new Error('Invalid Aster mark price snapshot');
  const history = rows.map((row) => Array.isArray(row) ? Number(row[4]) : 0).filter((price) => Number.isFinite(price) && price > 0).slice(-23);
  if (!history.length) throw new Error('Aster mark price snapshot is empty');
  return { price: history[history.length - 1], history };
}
async function fetchPrice(market: TradeMarket): Promise<number> {
  const symbol = marketSymbol(market);
  const res = await fetch(`${ASTER_FUTURES_REST_BASE}/fapi/v1/premiumIndex?symbol=${symbol}`, { cf: { cacheTtl: 1, cacheEverything: false } } as RequestInit);
  if (!res.ok) throw new Error(`Aster mark price request failed: HTTP ${res.status}`);
  const data = await res.json() as { markPrice?: string };
  return cleanPrice(data.markPrice);
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
  if (market === 'gold' || market === 'paxg') return 'gold';
  if (market === 'oil' || market === 'cl' || market === 'clusdt') return 'oil';
  throw new Error('Invalid predict market');
}
function normalizeTradeMarket(value: string): TradeMarket {
  const market = value.trim().toLowerCase();
  if (market === 'bitcoin' || market === 'btc') return 'bitcoin';
  if (market === 'gold' || market === 'paxg') return 'gold';
  if (market === 'oil' || market === 'cl' || market === 'clusdt') return 'oil';
  throw new Error('Invalid predict market');
}
function roundMsForMarket(market: TradeMarket): number { return market === 'oil' ? OIL_ROUND_MS : ROUND_MS; }
function normalizeSide(value: unknown): PredictSide { const side = String(value || '').toLowerCase(); if (side === 'up' || side === 'down') return side; throw new Error('Choose Up or Down'); }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.max(1, Math.floor(n * NANO)); }
function nanoToTon(value: number): number { return Math.floor(Number(value) || 0) / NANO; }
function cleanPrice(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid price'); return n; }
function cleanOptionalPrice(value: unknown): number { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : 0; }
function cleanDbText(value: unknown, message: string): string { const text = String(value ?? '').trim(); if (!text) throw new Error(message); return text; }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Missing user id'); return id; }
function cleanUserIdOptional(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); }
async function authenticateUser(env: Env, claimedInput: unknown, initDataInput: unknown): Promise<string> { const claimed = cleanUserId(claimedInput); const verified = await validateTelegramInitData(initDataInput, gameBotToken(env)); if (verified !== claimed) throw new Error('Telegram user mismatch'); return verified; }
async function authenticatePredictAdmin(env: Env, claimedInput: unknown, initDataInput: unknown): Promise<string> { const userId = await authenticateUser(env, claimedInput, initDataInput); if (!isMiniAppAdmin(env, userId)) throw new Error('Predict is only available to administrators'); return userId; }

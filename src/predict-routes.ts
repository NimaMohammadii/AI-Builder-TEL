import app from './index';
import './prediction-events';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';
import { gameBotToken, validateTelegramInitData } from './utils';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const CACHE_PREDICT_IMAGE_MANIFEST = 'public, max-age=300, stale-while-revalidate=86400';
const PREDICT_MARKETS = ['bitcoin', 'gold', 'oil'] as const;
const TRADE_MARKETS = ['bitcoin', 'gold', 'oil'] as const;
const ASTER_FUTURES_REST_BASE = 'https://fapi.asterdex.com';
const ROUND_MS = 5 * 60 * 1000;
const MONTH_BET_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const LOCK_MS = 15 * 1000;
const PLATFORM_FEE_BPS = 500;
const NANO = 1_000_000_000;
const PREDICT_OPS_CONTROL_KEY = 'admin:predict-ops-control:v1';
const PREDICT_OPS_FEED_PREFIX = 'admin:predict-ops-feed:v1:';
const PREDICT_OPS_INCIDENTS_KEY = 'admin:predict-ops-incidents:v1';
const PREDICT_OPS_INCIDENT_LIMIT = 24;
const DEFAULT_PREDICT_MAINTENANCE = 'Predictions are temporarily unavailable. Please try again shortly.';
type PredictMarket = typeof PREDICT_MARKETS[number];
type TradeMarket = typeof TRADE_MARKETS[number];
type PredictSide = 'up' | 'down';
type RoundResult = 'up' | 'down' | 'draw' | null;
type RoundRow = { id: string; market: string; starts_at: string; ends_at: string; start_price: number; end_price: number | null; status: string; result: string | null; settled_at: string | null; created_at: string };
type BetRow = { id: string; round_id: string; market: string; user_id: string; side: string; stake_nano: number; ton_usd_snapshot: number; stake_usd_snapshot: number; status: string; payout_nano: number; created_at: string };
type MarketSnapshot = { price: number; history: number[] };
type PredictOpsControl = { emergencyPaused: boolean; maintenanceMessage: string; pausedMarkets: Record<TradeMarket, boolean>; updatedAt: string | null };
type PredictOpsFeed = { lastPrice: number | null; lastSuccessAt: string | null; circuitOpen: boolean; circuitReason: string | null; circuitOpenedAt: string | null; lastError: string | null; lastErrorAt: string | null };
export type PredictOpsMarket = TradeMarket;
export type PredictOpsIncident = { id: string; at: string; type: string; market: TradeMarket | null; message: string };
export type PredictOpsRoundView = { id: string; market: TradeMarket; startsAt: string; endsAt: string; startPrice: number; endPrice: number | null; status: string; result: string | null; settledAt: string | null; createdAt: string; due: boolean; totalBets: number; totalStakeNano: number; counts: Record<string, number> };
export type PredictOpsMarketStatus = { market: TradeMarket; manualPaused: boolean; circuitOpen: boolean; circuitReason: string | null; lastPrice: number | null; lastSuccessAt: string | null; lastError: string | null; lastErrorAt: string | null; latestRound: PredictOpsRoundView | null; lastSettledAt: string | null; dueSettlementCount: number };
export type PredictOpsDashboard = { emergencyPaused: boolean; maintenanceMessage: string; updatedAt: string | null; markets: PredictOpsMarketStatus[] };

app.get('/app/api/predict-markets', async (c) => c.json(await getPredictMarkets(c.env), 200, { 'cache-control': CACHE_PREDICT_IMAGE_MANIFEST }));

app.get('/app/api/predict-round', async (c) => {
  let market: TradeMarket | null = null;
  try {
    market = normalizeTradeMarket(String(c.req.query('market') || 'bitcoin'));
    const userId = await authenticateUser(c.env, c.req.query('userId'), c.req.header('x-telegram-init-data'));
    const snapshot = await fetchMarketSnapshot(market);
    await notePredictFeedSuccess(c.env, market, snapshot.price).catch(() => undefined);
    const round = await getOrCreateCurrentRound(c.env, market, snapshot.price);
    await settleDueRounds(c.env, market);
    return c.json({ ...(await publicRoundJson(c.env, round, userId, snapshot.price)), history: snapshot.history }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    if (market && isPredictPriceFeedError(error)) await notePredictFeedFailure(c.env, market, messageOf(error)).catch(() => undefined);
    return c.json({ error: error instanceof Error ? error.message : 'Could not load prediction round' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/app/api/predict-bet', async (c) => {
  let betId = '';
  let userId = '';
  let stakeNano = 0;
  let market: TradeMarket | null = null;
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    market = normalizeTradeMarket(String(body.market || 'bitcoin'));
    const side = normalizeSide(body.side);
    userId = await authenticateUser(c.env, body.userId, body.initData);
    stakeNano = tonToNano(body.stakeTon);
    const tonUsd = cleanOptionalPrice(body.tonUsdSnapshot);
    if (stakeNano <= 0) throw new Error('Enter a valid GRAM amount');
    await assertPredictBettingAvailable(c.env, market, userId);
    await settleDueRounds(c.env, market);
    const round = await getOrCreateCurrentRound(c.env, market);
    const roundId = cleanDbText(round.id, 'Prediction round is not ready');
    if (Date.now() >= betLockAtMs(round)) throw new Error('This prediction is closed. Wait for the next round.');
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
      const controls = await getUserControls(c.env, userId);
      if (Number(controls.tonBalanceNano || 0) < stakeNano) throw new Error('Insufficient balance');
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
    if (market && isPredictPriceFeedError(error)) await notePredictFeedFailure(c.env, market, messageOf(error)).catch(() => undefined);
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
  const lockAt = betLockAtMs(round);
  return { ok: true, userControls, round: { id: roundId, market: String(round.market || ''), startsAt: String(round.starts_at || ''), endsAt: String(round.ends_at || ''), startPrice: Number(round.start_price || 0), livePrice: Number(livePrice) > 0 ? Number(livePrice) : null, endPrice: round.end_price == null ? null : Number(round.end_price), status: now >= lockAt && round.status === 'open' ? 'locked' : String(round.status || 'open'), result: round.result || null, remainingMs: Math.max(0, ends - now), lockRemainingMs: Math.max(0, lockAt - now), pools, userBets, recentUserBets } };
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
  if (market === 'bitcoin') {
    let existing = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND datetime(starts_at) <= datetime('now') AND datetime(ends_at) > datetime('now') ORDER BY datetime(starts_at) DESC LIMIT 1`).bind(market).first<RoundRow>();
    if (existing) {
      if (Number(existing.start_price) > 0) return existing;
      const repairedPrice = Number(latestPrice) > 0 ? Number(latestPrice) : await fetchPrice(market);
      await env.DB.prepare('UPDATE predict_rounds SET start_price = ? WHERE id = ?').bind(repairedPrice, existing.id).run();
      const repaired = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(existing.id).first<RoundRow>();
      if (!repaired) throw new Error('Could not repair prediction round');
      return repaired;
    }
    const startMs = Math.floor(now / ROUND_MS) * ROUND_MS;
    const startsAt = new Date(startMs).toISOString();
    const endsAt = new Date(startMs + ROUND_MS).toISOString();
    const id = `pr_${market}_${startMs}`;
    const startPrice = Number(latestPrice) > 0 ? Number(latestPrice) : await fetchPrice(market);
    await env.DB.prepare(`INSERT OR IGNORE INTO predict_rounds (id, market, starts_at, ends_at, start_price, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`).bind(id, market, startsAt, endsAt, startPrice).run();
    const row = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(id).first<RoundRow>();
    if (!row) throw new Error('Could not create prediction round');
    return row;
  }

  const window = calendarMonthWindow(now);
  const startsAt = new Date(window.startMs).toISOString();
  const endsAt = new Date(window.endMs).toISOString();
  let existing = await env.DB.prepare('SELECT * FROM predict_rounds WHERE market = ? AND starts_at = ? AND ends_at = ? LIMIT 1').bind(market, startsAt, endsAt).first<RoundRow>();
  if (existing) {
    if (Number(existing.start_price) > 0) return existing;
    const repairedPrice = await fetchMonthlyBoundaryPrice(market, window.startMs, 'start');
    await env.DB.prepare('UPDATE predict_rounds SET start_price = ? WHERE id = ?').bind(repairedPrice, existing.id).run();
    const repaired = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(existing.id).first<RoundRow>();
    if (!repaired) throw new Error('Could not repair monthly prediction round');
    return repaired;
  }

  const legacy = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND datetime(starts_at) <= datetime('now') AND datetime(ends_at) > datetime('now') ORDER BY datetime(starts_at) DESC LIMIT 1`).bind(market).first<RoundRow>();
  if (legacy) {
    const betCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status != 'failed'").bind(legacy.id).first<{ count: number }>();
    if (Number(betCount?.count || 0) <= 0) await env.DB.prepare('DELETE FROM predict_rounds WHERE id = ?').bind(legacy.id).run();
  }

  const id = `pr_${market}_${window.startMs}`;
  const startPrice = await fetchMonthlyBoundaryPrice(market, window.startMs, 'start');
  await env.DB.prepare(`INSERT OR IGNORE INTO predict_rounds (id, market, starts_at, ends_at, start_price, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`).bind(id, market, startsAt, endsAt, startPrice).run();
  existing = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(id).first<RoundRow>();
  if (!existing) throw new Error('Could not create monthly prediction round');
  return existing;
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
  const market = normalizeTradeMarket(fresh.market);
  const endPrice = fresh.end_price == null ? (market === 'bitcoin' ? await fetchPrice(market) : await fetchMonthlyBoundaryPrice(market, Date.parse(fresh.ends_at), 'end')) : Number(fresh.end_price);
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
async function userBetsJson(env: Env, roundId: string, userId: string) { return ((await env.DB.prepare('SELECT * FROM predict_bets WHERE round_id = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 25').bind(cleanDbText(roundId, 'Prediction round is not ready'), userId).all<BetRow>()).results || []).map(betJson); }
async function recentUserBetsJson(env: Env, market: string, userId: string) { return ((await env.DB.prepare('SELECT * FROM predict_bets WHERE market = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 25').bind(cleanDbText(market, 'Prediction market is not ready'), userId).all<BetRow>()).results || []).map(betJson); }
async function getBet(env: Env, id: string) {
  const b = await env.DB.prepare('SELECT * FROM predict_bets WHERE id = ?').bind(cleanDbText(id, 'Prediction bet is not ready')).first<BetRow>();
  return b ? betJson(b) : null;
}
function marketSymbol(market: TradeMarket): string {
  return market === 'gold' ? 'XAUUSDT' : market === 'oil' ? 'CLUSDT' : 'BTCUSDT';
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
async function fetchMonthlyBoundaryPrice(market: TradeMarket, boundaryMs: number, boundary: 'start' | 'end'): Promise<number> {
  const symbol = marketSymbol(market);
  const timeQuery = boundary === 'start' ? `startTime=${Math.floor(boundaryMs)}` : `endTime=${Math.floor(boundaryMs - 1)}`;
  const res = await fetch(`${ASTER_FUTURES_REST_BASE}/fapi/v1/markPriceKlines?symbol=${symbol}&interval=1m&${timeQuery}&limit=1`, { cf: { cacheTtl: 60, cacheEverything: false } } as RequestInit);
  if (!res.ok) throw new Error(`Aster monthly boundary price failed: HTTP ${res.status}`);
  const rows = await res.json() as unknown;
  if (!Array.isArray(rows) || !rows.length || !Array.isArray(rows[0])) throw new Error('Monthly boundary price is unavailable');
  const row = rows[0] as unknown[];
  return cleanPrice(boundary === 'start' ? row[1] : row[4]);
}

export async function getPredictOpsDashboard(env: Env): Promise<PredictOpsDashboard> {
  const control = await readPredictOpsControl(env);
  const markets = await Promise.all(TRADE_MARKETS.map((market) => getPredictOpsMarketStatus(env, market, control)));
  return { emergencyPaused: control.emergencyPaused, maintenanceMessage: control.maintenanceMessage, updatedAt: control.updatedAt, markets };
}

export async function listPredictOpsRounds(env: Env, marketInput: unknown, limit = 8): Promise<PredictOpsRoundView[]> {
  const market = normalizeTradeMarket(String(marketInput || ''));
  const cleanLimit = Math.max(1, Math.min(12, Math.floor(Number(limit) || 8)));
  const rows = await env.DB.prepare('SELECT * FROM predict_rounds WHERE market = ? ORDER BY datetime(starts_at) DESC LIMIT ?').bind(market, cleanLimit).all<RoundRow>().catch(() => ({ results: [] as RoundRow[] }));
  return Promise.all((rows.results || []).map((row) => predictOpsRoundView(env, row)));
}

export async function getPredictOpsRound(env: Env, roundIdInput: unknown): Promise<PredictOpsRoundView | null> {
  const roundId = cleanPredictRoundId(roundIdInput);
  const row = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(roundId).first<RoundRow>().catch(() => null);
  return row ? predictOpsRoundView(env, row) : null;
}

export async function listPredictOpsDueRounds(env: Env): Promise<PredictOpsRoundView[]> {
  const rows = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE datetime(ends_at) <= datetime('now') AND (status != 'settled' OR id IN (SELECT round_id FROM predict_bets WHERE status IN ('active', 'settling_payment'))) ORDER BY datetime(ends_at) ASC LIMIT 12`).all<RoundRow>().catch(() => ({ results: [] as RoundRow[] }));
  return Promise.all((rows.results || []).map((row) => predictOpsRoundView(env, row)));
}

export async function retryPredictSettlement(env: Env, roundIdInput: unknown): Promise<PredictOpsRoundView> {
  const roundId = cleanPredictRoundId(roundIdInput);
  const row = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(roundId).first<RoundRow>();
  if (!row) throw new Error('Prediction round not found.');
  if (Date.parse(String(row.ends_at || '')) > Date.now()) throw new Error('This round has not ended yet.');
  try {
    await settleRound(env, row);
    const updated = await getPredictOpsRound(env, roundId);
    if (!updated) throw new Error('Prediction round not found after settlement retry.');
    await appendPredictOpsIncident(env, 'settlement_retry_ok', updated.market, `Settlement retry completed for ${roundId}.`).catch(() => undefined);
    return updated;
  } catch (error) {
    const market = normalizeTradeMarket(row.market);
    if (isPredictPriceFeedError(error)) await notePredictFeedFailure(env, market, messageOf(error)).catch(() => undefined);
    await appendPredictOpsIncident(env, 'settlement_retry_failed', market, `Settlement retry failed for ${roundId}: ${messageOf(error)}`).catch(() => undefined);
    throw error;
  }
}

export async function setPredictOpsEmergencyPaused(env: Env, paused: boolean): Promise<PredictOpsControl> {
  const current = await readPredictOpsControl(env);
  if (current.emergencyPaused === paused) return current;
  const next = { ...current, emergencyPaused: paused, updatedAt: new Date().toISOString() };
  await writePredictOpsControl(env, next);
  await appendPredictOpsIncident(env, paused ? 'emergency_pause' : 'emergency_resume', null, paused ? 'All market predictions paused.' : 'Emergency pause cleared.').catch(() => undefined);
  return next;
}

export async function setPredictOpsMarketPaused(env: Env, marketInput: unknown, paused: boolean): Promise<PredictOpsControl> {
  const market = normalizeTradeMarket(String(marketInput || ''));
  const current = await readPredictOpsControl(env);
  if (current.pausedMarkets[market] === paused) return current;
  const next = { ...current, pausedMarkets: { ...current.pausedMarkets, [market]: paused }, updatedAt: new Date().toISOString() };
  await writePredictOpsControl(env, next);
  await appendPredictOpsIncident(env, paused ? 'market_pause' : 'market_resume', market, paused ? `${market} predictions paused.` : `${market} predictions resumed.`).catch(() => undefined);
  return next;
}

export async function setPredictOpsMaintenanceMessage(env: Env, messageInput: unknown): Promise<PredictOpsControl> {
  const message = String(messageInput ?? '').replace(/\s+/g, ' ').trim().slice(0, 180);
  const current = await readPredictOpsControl(env);
  if (current.maintenanceMessage === message) return current;
  const next = { ...current, maintenanceMessage: message, updatedAt: new Date().toISOString() };
  await writePredictOpsControl(env, next);
  await appendPredictOpsIncident(env, message ? 'maintenance_message_set' : 'maintenance_message_cleared', null, message ? 'Predict maintenance message updated.' : 'Predict maintenance message cleared.').catch(() => undefined);
  return next;
}

export async function getPredictOpsIncidents(env: Env): Promise<PredictOpsIncident[]> {
  const raw = await env.BOT_CACHE.get(PREDICT_OPS_INCIDENTS_KEY).catch(() => null);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item): PredictOpsIncident[] => {
      if (!item || typeof item !== 'object') return [];
      const value = item as Partial<PredictOpsIncident>;
      const market = value.market == null ? null : normalizePredictOpsMarketOrNull(value.market);
      if (!value.id || !value.at || !value.type || typeof value.message !== 'string') return [];
      return [{ id: String(value.id), at: String(value.at), type: String(value.type), market, message: value.message.slice(0, 240) }];
    }).slice(0, PREDICT_OPS_INCIDENT_LIMIT);
  } catch { return []; }
}

async function getPredictOpsMarketStatus(env: Env, market: TradeMarket, control: PredictOpsControl): Promise<PredictOpsMarketStatus> {
  const feed = await readPredictOpsFeed(env, market);
  const latestRow = await env.DB.prepare('SELECT * FROM predict_rounds WHERE market = ? ORDER BY datetime(starts_at) DESC LIMIT 1').bind(market).first<RoundRow>().catch(() => null);
  const latestRound = latestRow ? await predictOpsRoundView(env, latestRow) : null;
  const lastSettled = await env.DB.prepare("SELECT settled_at FROM predict_rounds WHERE market = ? AND status = 'settled' AND settled_at IS NOT NULL ORDER BY datetime(settled_at) DESC LIMIT 1").bind(market).first<{ settled_at: string }>().catch(() => null);
  const due = await env.DB.prepare(`SELECT COUNT(*) AS count FROM predict_rounds WHERE market = ? AND datetime(ends_at) <= datetime('now') AND (status != 'settled' OR id IN (SELECT round_id FROM predict_bets WHERE status IN ('active', 'settling_payment')))`).bind(market).first<{ count: number }>().catch(() => null);
  return {
    market,
    manualPaused: control.pausedMarkets[market],
    circuitOpen: feed.circuitOpen,
    circuitReason: feed.circuitReason,
    lastPrice: feed.lastPrice,
    lastSuccessAt: feed.lastSuccessAt,
    lastError: feed.lastError,
    lastErrorAt: feed.lastErrorAt,
    latestRound,
    lastSettledAt: lastSettled?.settled_at || null,
    dueSettlementCount: Number(due?.count || 0),
  };
}

async function predictOpsRoundView(env: Env, row: RoundRow): Promise<PredictOpsRoundView> {
  const market = normalizeTradeMarket(row.market);
  const stats = await env.DB.prepare('SELECT status, COUNT(*) AS count, COALESCE(SUM(stake_nano), 0) AS stakeNano FROM predict_bets WHERE round_id = ? GROUP BY status').bind(row.id).all<{ status: string; count: number; stakeNano: number }>().catch(() => ({ results: [] as Array<{ status: string; count: number; stakeNano: number }> }));
  const counts: Record<string, number> = {};
  let totalBets = 0;
  let totalStakeNano = 0;
  for (const stat of stats.results || []) {
    const status = String(stat.status || 'unknown');
    const count = Number(stat.count || 0);
    counts[status] = count;
    totalBets += count;
    totalStakeNano += Number(stat.stakeNano || 0);
  }
  return {
    id: String(row.id || ''),
    market,
    startsAt: String(row.starts_at || ''),
    endsAt: String(row.ends_at || ''),
    startPrice: Number(row.start_price || 0),
    endPrice: row.end_price == null ? null : Number(row.end_price),
    status: String(row.status || ''),
    result: row.result == null ? null : String(row.result),
    settledAt: row.settled_at == null ? null : String(row.settled_at),
    createdAt: String(row.created_at || ''),
    due: Number.isFinite(Date.parse(String(row.ends_at || ''))) && Date.parse(String(row.ends_at || '')) <= Date.now() && (String(row.status || '') !== 'settled' || Number(counts.active || 0) + Number(counts.settling_payment || 0) > 0),
    totalBets,
    totalStakeNano,
    counts,
  };
}

async function assertPredictBettingAvailable(env: Env, market: TradeMarket, userId: string): Promise<void> {
  const [control, feed, userControls] = await Promise.all([readPredictOpsControl(env), readPredictOpsFeed(env, market), getUserControls(env, userId)]);
  if (userControls.blockedSections.includes(`predict-${market}`)) throw new Error('Your access to this market is currently paused. If you have any questions, please contact an admin — we’re happy to help.');
  if (control.emergencyPaused) throw new Error(control.maintenanceMessage || DEFAULT_PREDICT_MAINTENANCE);
  if (control.pausedMarkets[market]) throw new Error(control.maintenanceMessage || `${marketLabel(market)} predictions are temporarily paused.`);
  if (feed.circuitOpen) throw new Error(control.maintenanceMessage || `${marketLabel(market)} live price feed is unavailable. New predictions are paused automatically.`);
}

async function notePredictFeedSuccess(env: Env, market: TradeMarket, price: number): Promise<void> {
  const clean = Number(price);
  if (!Number.isFinite(clean) || clean <= 0) return;
  const current = await readPredictOpsFeed(env, market);
  const recovered = current.circuitOpen;
  const next: PredictOpsFeed = { lastPrice: clean, lastSuccessAt: new Date().toISOString(), circuitOpen: false, circuitReason: null, circuitOpenedAt: null, lastError: null, lastErrorAt: null };
  await writePredictOpsFeed(env, market, next);
  if (recovered) await appendPredictOpsIncident(env, 'feed_recovered', market, `${marketLabel(market)} price feed recovered.`).catch(() => undefined);
}

async function notePredictFeedFailure(env: Env, market: TradeMarket, reasonInput: unknown): Promise<void> {
  const reason = String(reasonInput || 'Price feed unavailable').replace(/\s+/g, ' ').trim().slice(0, 220);
  const current = await readPredictOpsFeed(env, market);
  const now = new Date().toISOString();
  const next: PredictOpsFeed = { ...current, circuitOpen: true, circuitReason: reason, circuitOpenedAt: current.circuitOpenedAt || now, lastError: reason, lastErrorAt: now };
  await writePredictOpsFeed(env, market, next);
  if (!current.circuitOpen) await appendPredictOpsIncident(env, 'feed_circuit_open', market, `${marketLabel(market)} feed circuit opened: ${reason}`).catch(() => undefined);
}

function isPredictPriceFeedError(error: unknown): boolean {
  return /aster|mark price|boundary price|invalid price|price snapshot|snapshot is empty|monthly boundary/i.test(messageOf(error));
}

async function readPredictOpsControl(env: Env): Promise<PredictOpsControl> {
  const fallback: PredictOpsControl = { emergencyPaused: false, maintenanceMessage: '', pausedMarkets: { bitcoin: false, gold: false, oil: false }, updatedAt: null };
  const raw = await env.BOT_CACHE.get(PREDICT_OPS_CONTROL_KEY).catch(() => null);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<PredictOpsControl>;
    const paused = parsed.pausedMarkets && typeof parsed.pausedMarkets === 'object' ? parsed.pausedMarkets : {} as Record<string, unknown>;
    return {
      emergencyPaused: parsed.emergencyPaused === true,
      maintenanceMessage: typeof parsed.maintenanceMessage === 'string' ? parsed.maintenanceMessage.slice(0, 180) : '',
      pausedMarkets: { bitcoin: paused.bitcoin === true, gold: paused.gold === true, oil: paused.oil === true },
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch { return fallback; }
}

function writePredictOpsControl(env: Env, value: PredictOpsControl): Promise<void> {
  return env.BOT_CACHE.put(PREDICT_OPS_CONTROL_KEY, JSON.stringify(value));
}

async function readPredictOpsFeed(env: Env, market: TradeMarket): Promise<PredictOpsFeed> {
  const fallback: PredictOpsFeed = { lastPrice: null, lastSuccessAt: null, circuitOpen: false, circuitReason: null, circuitOpenedAt: null, lastError: null, lastErrorAt: null };
  const raw = await env.BOT_CACHE.get(PREDICT_OPS_FEED_PREFIX + market).catch(() => null);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<PredictOpsFeed>;
    const lastPrice = Number(parsed.lastPrice);
    return {
      lastPrice: Number.isFinite(lastPrice) && lastPrice > 0 ? lastPrice : null,
      lastSuccessAt: typeof parsed.lastSuccessAt === 'string' ? parsed.lastSuccessAt : null,
      circuitOpen: parsed.circuitOpen === true,
      circuitReason: typeof parsed.circuitReason === 'string' ? parsed.circuitReason.slice(0, 220) : null,
      circuitOpenedAt: typeof parsed.circuitOpenedAt === 'string' ? parsed.circuitOpenedAt : null,
      lastError: typeof parsed.lastError === 'string' ? parsed.lastError.slice(0, 220) : null,
      lastErrorAt: typeof parsed.lastErrorAt === 'string' ? parsed.lastErrorAt : null,
    };
  } catch { return fallback; }
}

function writePredictOpsFeed(env: Env, market: TradeMarket, value: PredictOpsFeed): Promise<void> {
  return env.BOT_CACHE.put(PREDICT_OPS_FEED_PREFIX + market, JSON.stringify(value));
}

async function appendPredictOpsIncident(env: Env, type: string, market: TradeMarket | null, message: string): Promise<void> {
  const incidents = await getPredictOpsIncidents(env);
  incidents.unshift({ id: 'pi_' + crypto.randomUUID().replace(/-/g, '').slice(0, 18), at: new Date().toISOString(), type: String(type || 'event').slice(0, 60), market, message: String(message || '').slice(0, 240) });
  await env.BOT_CACHE.put(PREDICT_OPS_INCIDENTS_KEY, JSON.stringify(incidents.slice(0, PREDICT_OPS_INCIDENT_LIMIT)));
}

function cleanPredictRoundId(value: unknown): string {
  const id = String(value || '').trim();
  if (!/^pr_(bitcoin|gold|oil)_\d+$/.test(id)) throw new Error('Invalid prediction round id.');
  return id;
}

function normalizePredictOpsMarketOrNull(value: unknown): TradeMarket | null {
  try { return normalizeTradeMarket(String(value || '')); } catch { return null; }
}

function marketLabel(market: TradeMarket): string {
  return market === 'bitcoin' ? 'Bitcoin' : market === 'gold' ? 'Gold' : 'Oil';
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error || 'Unknown error');
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
function calendarMonthWindow(now: number): { startMs: number; endMs: number } {
  const date = new Date(now);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return { startMs: Date.UTC(year, month, 1), endMs: Date.UTC(year, month + 1, 1) };
}
function betLockAtMs(round: RoundRow): number {
  const starts = Date.parse(String(round.starts_at || ''));
  const ends = Date.parse(String(round.ends_at || ''));
  if (!Number.isFinite(starts) || !Number.isFinite(ends)) return 0;
  return String(round.market || '') === 'bitcoin' ? Math.max(starts, ends - LOCK_MS) : Math.min(ends, starts + MONTH_BET_WINDOW_MS);
}
function normalizeSide(value: unknown): PredictSide { const side = String(value || '').toLowerCase(); if (side === 'up' || side === 'down') return side; throw new Error('Choose Up or Down'); }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.max(1, Math.floor(n * NANO)); }
function nanoToTon(value: number): number { return Math.floor(Number(value) || 0) / NANO; }
function cleanPrice(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid price'); return n; }
function cleanOptionalPrice(value: unknown): number { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : 0; }
function cleanDbText(value: unknown, message: string): string { const text = String(value ?? '').trim(); if (!text) throw new Error(message); return text; }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Missing user id'); return id; }
function cleanUserIdOptional(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); }
async function authenticateUser(env: Env, claimedInput: unknown, initDataInput: unknown): Promise<string> { const claimed = cleanUserId(claimedInput); const verified = await validateTelegramInitData(initDataInput, gameBotToken(env)); if (verified !== claimed) throw new Error('Telegram user mismatch'); return verified; }

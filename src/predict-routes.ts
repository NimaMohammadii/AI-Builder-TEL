import app from './index';
import './predict-settings-routes';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const CACHE_PREDICT_IMAGE_MANIFEST = 'public, max-age=300, stale-while-revalidate=86400';
const PREDICT_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const PREDICT_MARKETS = ['bitcoin', 'ethereum', 'solana', 'gold', 'oil', 'football', 'politics', 'fun'] as const;
const PREDICT_CRYPTO_CARD_MARKETS = ['bitcoin', 'solana', 'ethereum', 'gold', 'oil'] as const;
const PREDICT_BUTTON_SIDES = ['up', 'down'] as const;
const TRADE_MARKETS = ['bitcoin', 'ethereum', 'solana', 'ton'] as const;
const ROUND_MS = 5 * 60 * 1000;
const LOCK_MS = 15 * 1000;
const PLATFORM_FEE_BPS = 500;
const NANO = 1_000_000_000;
type PredictMarket = typeof PREDICT_MARKETS[number];
type PredictCryptoCardMarket = typeof PREDICT_CRYPTO_CARD_MARKETS[number];
type PredictButtonSide = typeof PREDICT_BUTTON_SIDES[number];
type TradeMarket = typeof TRADE_MARKETS[number];
type PredictSide = 'up' | 'down';
type RoundResult = 'up' | 'down' | 'draw' | null;
type RoundRow = { id: string; market: string; starts_at: string; ends_at: string; start_price: number; end_price: number | null; status: string; result: string | null; settled_at: string | null; created_at: string };
type BetRow = { id: string; round_id: string; market: string; user_id: string; side: string; stake_nano: number; ton_usd_snapshot: number; stake_usd_snapshot: number; status: string; payout_nano: number; created_at: string };

app.get('/app/api/predict-markets', async (c) => c.json(await getPredictMarkets(c.env), 200, { 'cache-control': CACHE_PREDICT_IMAGE_MANIFEST }));

app.get('/app/api/predict-crypto-card-images', async (c) => c.json(await getPredictCryptoCardImages(c.env), 200, { 'cache-control': CACHE_PREDICT_IMAGE_MANIFEST }));

app.get('/app/api/predict-button-images', async (c) => c.json(await getPredictButtonImages(c.env), 200, { 'cache-control': CACHE_PREDICT_IMAGE_MANIFEST }));

app.get('/app/api/predict-button-image/:side', async (c) => {
  try {
    const side = normalizePredictButtonSide(c.req.param('side').replace(/\.png$/i, ''));
    return getPredictImageResponse(c.env, predictButtonImageKey(side));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/predict-crypto-card-image/:market', async (c) => {
  try {
    const market = normalizePredictCryptoCardMarket(c.req.param('market').replace(/\.png$/i, ''));
    return getPredictImageResponse(c.env, predictCryptoCardImageKey(market));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/predict-round', async (c) => {
  try {
    const market = normalizeTradeMarket(String(c.req.query('market') || 'bitcoin'));
    const round = await getOrCreateCurrentRound(c.env, market);
    await settleDueRounds(c.env, market);
    return c.json(await publicRoundJson(c.env, round, String(c.req.query('userId') || '')), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load prediction round' }, 400, { 'cache-control': CACHE_NONE });
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
    userId = cleanUserId(body.userId);
    stakeNano = tonToNano(body.stakeTon);
    const tonUsd = cleanOptionalPrice(body.tonUsdSnapshot);
    if (stakeNano <= 0) throw new Error('Enter a valid TON amount');
    await settleDueRounds(c.env, market);
    const round = await getOrCreateCurrentRound(c.env, market);
    const roundId = cleanDbText(round.id, 'Prediction round is not ready');
    if (Date.now() >= Date.parse(round.ends_at) - LOCK_MS) throw new Error('This round is locked. Wait for the next round.');
    await ensurePredictTables(c.env);
    betId = 'pbet_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22);
    const inserted = await c.env.DB.prepare(`INSERT INTO predict_bets (id, round_id, market, user_id, side, stake_nano, ton_usd_snapshot, stake_usd_snapshot, status, payout_nano, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM predict_bets WHERE round_id = ? AND user_id = ? AND status != 'failed')`)
      .bind(betId, roundId, market, userId, side, stakeNano, tonUsd, nanoToTon(stakeNano) * tonUsd, roundId, userId)
      .run();
    if ((inserted.meta?.changes || 0) <= 0) throw new Error('You already placed a prediction in this round. Wait for the next round.');
    await debitUserTonBalanceIfEnough(c.env, userId, stakeNano, { kind: 'predict', title: 'Prediction stake', referenceId: betId, referenceType: 'predict_bet', metadata: { market, side, roundId } });
    const active = await c.env.DB.prepare("UPDATE predict_bets SET status = 'active' WHERE id = ? AND status = 'pending'").bind(betId).run();
    if ((active.meta?.changes || 0) <= 0) {
      await adjustUserTonBalance(c.env, userId, stakeNano, { kind: 'predict', title: 'Prediction stake rollback', referenceId: betId, referenceType: 'predict_bet', metadata: { market, side, roundId, status: 'rollback' } });
      throw new Error('Could not activate prediction');
    }
    return c.json({ ok: true, bet: await getBet(c.env, betId), round: await publicRoundJson(c.env, round, userId), userControls: await getUserControls(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    if (betId) await c.env.DB.prepare("UPDATE predict_bets SET status = 'failed' WHERE id = ? AND status = 'pending'").bind(betId).run().catch(() => undefined);
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not place prediction' }, 400, { 'cache-control': CACHE_NONE });
  }
});
app.post('/app/api/predict-settle', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const market = normalizeTradeMarket(String(body.market || 'bitcoin'));
    const settled = await settleDueRounds(c.env, market, true);
    return c.json({ ok: true, settled }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not settle predictions' }, 400, { 'cache-control': CACHE_NONE });
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

async function getPredictCryptoCardImages(env: Env): Promise<{ images: Record<PredictCryptoCardMarket, { imageUrl: string }> }> {
  const entries = await Promise.all(PREDICT_CRYPTO_CARD_MARKETS.map(async (market) => {
    const head = await env.ASSETS.head(predictCryptoCardImageKey(market)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return [market, { imageUrl: head ? `/app/api/predict-crypto-card-image/${market}.png?v=${version}` : '' }] as const;
  }));
  return { images: Object.fromEntries(entries) as Record<PredictCryptoCardMarket, { imageUrl: string }> };
}

async function getPredictButtonImages(env: Env): Promise<{ images: Record<PredictButtonSide, { imageUrl: string }> }> {
  const entries = await Promise.all(PREDICT_BUTTON_SIDES.map(async (side) => {
    const head = await env.ASSETS.head(predictButtonImageKey(side)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return [side, { imageUrl: head ? `/app/api/predict-button-image/${side}.png?v=${version}` : '' }] as const;
  }));
  return { images: Object.fromEntries(entries) as Record<PredictButtonSide, { imageUrl: string }> };
}

function normalizePredictButtonSide(value: string): PredictButtonSide {
  if ((PREDICT_BUTTON_SIDES as readonly string[]).includes(value)) return value as PredictButtonSide;
  throw new Error('Invalid predict button');
}
function normalizePredictCryptoCardMarket(value: string): PredictCryptoCardMarket {
  if ((PREDICT_CRYPTO_CARD_MARKETS as readonly string[]).includes(value)) return value as PredictCryptoCardMarket;
  throw new Error('Invalid predict card market');
}

function predictCryptoCardImageKey(market: PredictCryptoCardMarket): string {
  return `predict/crypto-card/${market}`;
}
async function publicRoundJson(env: Env, round: RoundRow, userId: string) {
  await ensurePredictTables(env);
  const cleanedUserId = cleanUserIdOptional(userId);
  const roundId = cleanDbText(round.id, 'Prediction round is not ready');
  const pools = await poolJson(env, roundId);
  const userBets = cleanedUserId ? await userBetsJson(env, roundId, cleanedUserId) : [];
  const recentUserBets = cleanedUserId ? await recentUserBetsJson(env, String(round.market || ''), cleanedUserId) : [];
  const userControls = cleanedUserId ? await getUserControls(env, cleanedUserId) : null;
  const now = Date.now();
  const ends = Date.parse(String(round.ends_at || ''));
  return { ok: true, userControls, round: { id: roundId, market: String(round.market || ''), startsAt: String(round.starts_at || ''), endsAt: String(round.ends_at || ''), startPrice: Number(round.start_price || 0), endPrice: round.end_price == null ? null : Number(round.end_price), status: now >= ends - LOCK_MS && round.status === 'open' ? 'locked' : String(round.status || 'open'), result: round.result || null, remainingMs: Math.max(0, ends - now), lockRemainingMs: Math.max(0, ends - LOCK_MS - now), pools, userBets, recentUserBets } };
}
async function ensurePredictTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_rounds (id TEXT PRIMARY KEY, market TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, start_price REAL NOT NULL, end_price REAL, status TEXT NOT NULL DEFAULT 'open', result TEXT, settled_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_rounds_market_end ON predict_rounds(market, ends_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_bets (id TEXT PRIMARY KEY, round_id TEXT NOT NULL, market TEXT NOT NULL, user_id TEXT NOT NULL, side TEXT NOT NULL, stake_nano INTEGER NOT NULL, ton_usd_snapshot REAL NOT NULL DEFAULT 0, stake_usd_snapshot REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', payout_nano INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_round ON predict_bets(round_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_user_round ON predict_bets(user_id, round_id)').run();
}
async function getOrCreateCurrentRound(env: Env, market: TradeMarket): Promise<RoundRow> {
  await ensurePredictTables(env);
  const now = Date.now();
  const existing = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND datetime(starts_at) <= datetime('now') AND datetime(ends_at) > datetime('now') ORDER BY datetime(starts_at) DESC LIMIT 1`).bind(market).first<RoundRow>();
  if (existing) return existing;
  const startMs = Math.floor(now / ROUND_MS) * ROUND_MS;
  const startsAt = new Date(startMs).toISOString();
  const endsAt = new Date(startMs + ROUND_MS).toISOString();
  const id = `pr_${market}_${startMs}`;
  const startPrice = await fetchPrice(market);
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
  const active = all.filter((b) => b.status === 'active' || b.status === 'settling_payment');
  const upPool = all.filter((b) => b.side === 'up').reduce((s, b) => s + Number(b.stake_nano || 0), 0);
  const downPool = all.filter((b) => b.side === 'down').reduce((s, b) => s + Number(b.stake_nano || 0), 0);
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
  const alreadyPaid = await env.DB.prepare(`SELECT id FROM ton_transactions WHERE reference_type = 'predict_bet' AND reference_id = ? AND amount_nano = ? LIMIT 1`).bind(betId, payoutNano).first<{ id: string }>().catch(() => null);
  if (!alreadyPaid) await adjustUserTonBalance(env, cleanUserId(bet.user_id), payoutNano, { kind: 'predict', title: status === 'won' ? 'Prediction payout' : 'Prediction refund', referenceId: betId, referenceType: 'predict_bet', metadata: { roundId: cleanDbText(bet.round_id, 'Prediction round is not ready'), market: String(bet.market || ''), side: String(bet.side || ''), status } });
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
async function fetchPrice(market: TradeMarket): Promise<number> {
  const providers = priceProviders(market);
  const failures: string[] = [];
  for (const provider of providers) {
    try {
      const price = await provider.fetch();
      return cleanPrice(price);
    } catch (error) {
      failures.push(`${provider.name}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }
  console.warn('predict price feed failed', { market, failures });
  throw new Error('Price feed is unavailable');
}

type PriceProvider = { name: string; fetch: () => Promise<unknown> };

function priceProviders(market: TradeMarket): PriceProvider[] {
  const binanceSymbol = market === 'ton' ? 'TONUSDT' : market === 'ethereum' ? 'ETHUSDT' : market === 'solana' ? 'SOLUSDT' : 'BTCUSDT';
  const coinbaseProduct = market === 'ethereum' ? 'ETH-USD' : market === 'solana' ? 'SOL-USD' : market === 'bitcoin' ? 'BTC-USD' : '';
  const coinGeckoId = market === 'ton' ? 'the-open-network' : market === 'ethereum' ? 'ethereum' : market === 'solana' ? 'solana' : 'bitcoin';
  const providers: PriceProvider[] = [
    {
      name: 'binance',
      fetch: async () => {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`, { cf: { cacheTtl: 1, cacheEverything: false } } as RequestInit);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { price?: string };
        return data.price;
      },
    },
  ];
  if (coinbaseProduct) {
    providers.push({
      name: 'coinbase',
      fetch: async () => {
        const res = await fetch(`https://api.coinbase.com/v2/prices/${coinbaseProduct}/spot`, { cf: { cacheTtl: 1, cacheEverything: false } } as RequestInit);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { data?: { amount?: string } };
        return data.data?.amount;
      },
    });
  }
  providers.push({
    name: 'coingecko',
    fetch: async () => {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`, { cf: { cacheTtl: 1, cacheEverything: false } } as RequestInit);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Record<string, { usd?: number }>;
      return data[coinGeckoId]?.usd;
    },
  });
  return providers;
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
function predictButtonImageKey(side: PredictButtonSide): string { return `predict/buttons/${side}-image`; }
function normalizePredictMarket(value: string): PredictMarket {
  const market = value.trim().toLowerCase();
  if (market === 'bitcoin' || market === 'btc') return 'bitcoin';
  if (market === 'ethereum' || market === 'eth') return 'ethereum';
  if (market === 'solana' || market === 'sol') return 'solana';
  if (market === 'gold' || market === 'paxg') return 'gold';
  if (market === 'oil' || market === 'cl' || market === 'clusdt') return 'oil';
  if (market === 'football') return 'football';
  if (market === 'politics') return 'politics';
  if (market === 'fun') return 'fun';
  throw new Error('Invalid predict market');
}
function normalizeTradeMarket(value: string): TradeMarket {
  const market = value.trim().toLowerCase();
  if (market === 'bitcoin' || market === 'btc') return 'bitcoin';
  if (market === 'ethereum' || market === 'eth') return 'ethereum';
  if (market === 'solana' || market === 'sol') return 'solana';
  if (market === 'ton') return 'ton';
  throw new Error('Invalid predict market');
}
function normalizeSide(value: unknown): PredictSide { const side = String(value || '').toLowerCase(); if (side === 'up' || side === 'down') return side; throw new Error('Choose Up or Down'); }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.max(1, Math.floor(n * NANO)); }
function nanoToTon(value: number): number { return Math.floor(Number(value) || 0) / NANO; }
function cleanPrice(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid price'); return n; }
function cleanOptionalPrice(value: unknown): number { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : 0; }
function cleanDbText(value: unknown, message: string): string { const text = String(value ?? '').trim(); if (!text) throw new Error(message); return text; }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Missing user id'); return id; }
function cleanUserIdOptional(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); }

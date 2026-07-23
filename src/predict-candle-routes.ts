import app from './index';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';

const CACHE_NONE = 'no-store';
const HOUR_MS = 60 * 60 * 1000;
const LOCK_MS = 30 * 60 * 1000;
const PLATFORM_FEE_BPS = 500;
const NANO = 1_000_000_000;
type CandleMarket = 'bitcoin' | 'ethereum' | 'solana' | 'gold' | 'ton';
type CandleSide = 'up' | 'down';
type RoundRow = { id: string; market: string; starts_at: string; ends_at: string; start_price: number; end_price: number | null; status: string; result: string | null; settled_at: string | null; created_at: string };
type EntryRow = { id: string; round_id: string; market: string; user_id: string; side: string; stake_nano: number; ton_usd_snapshot: number; stake_usd_snapshot: number; status: string; payout_nano: number; created_at: string };

app.get('/app/api/predict-round', async (c, next) => {
  if (String(c.req.query('mode') || '').toLowerCase() !== 'candle') return next();
  try {
    const market = normalizeCandleMarket(String(c.req.query('market') || 'bitcoin'));
    await settleDueRounds(c.env, market);
    const round = await getOrCreateCurrentRound(c.env, market);
    return c.json(await publicRoundJson(c.env, round, String(c.req.query('userId') || '')), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load candle round' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/app/api/predict-bet', async (c, next) => {
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  if (String(body.mode || '').toLowerCase() !== 'candle') {
    c.req.raw = new Request(c.req.raw, { body: JSON.stringify(body) });
    return next();
  }
  let entryId = '';
  let userId = '';
  let amountNano = 0;
  try {
    const market = normalizeCandleMarket(String(body.market || 'bitcoin'));
    const side = normalizeSide(body.side);
    userId = cleanUserId(body.userId);
    amountNano = tonToNano(body.stakeTon);
    const tonUsd = cleanOptionalPrice(body.tonUsdSnapshot);
    if (amountNano <= 0) throw new Error('Enter a valid TON amount');
    await settleDueRounds(c.env, market);
    const round = await getOrCreateCurrentRound(c.env, market);
    const roundId = cleanDbText(round.id, 'Candle round is not ready');
    if (Date.now() >= Date.parse(round.ends_at) - LOCK_MS) throw new Error('This candle is locked. Wait for the next candle.');
    await ensurePredictTables(c.env);
    entryId = 'pcnd_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22);
    const storedMarket = storedMarketName(market);
    const inserted = await c.env.DB.prepare(`INSERT INTO predict_bets (id, round_id, market, user_id, side, stake_nano, ton_usd_snapshot, stake_usd_snapshot, status, payout_nano, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM predict_bets WHERE round_id = ? AND user_id = ? AND status != 'failed')`)
      .bind(entryId, roundId, storedMarket, userId, side, amountNano, tonUsd, nanoToTon(amountNano) * tonUsd, roundId, userId)
      .run();
    if ((inserted.meta?.changes || 0) <= 0) throw new Error('You already joined this candle. Wait for the next candle.');
    await debitUserTonBalanceIfEnough(c.env, userId, amountNano, { kind: 'predict', title: 'Candle guess entry', referenceId: entryId, referenceType: 'predict_bet', metadata: { market: storedMarket, side, roundId, mode: 'candle' } });
    const active = await c.env.DB.prepare("UPDATE predict_bets SET status = 'active' WHERE id = ? AND status = 'pending'").bind(entryId).run();
    if ((active.meta?.changes || 0) <= 0) {
      await adjustUserTonBalance(c.env, userId, amountNano, { kind: 'predict', title: 'Candle guess rollback', referenceId: entryId, referenceType: 'predict_bet', metadata: { market: storedMarket, side, roundId, status: 'rollback', mode: 'candle' } });
      throw new Error('Could not activate candle guess');
    }
    return c.json({ ok: true, bet: await getEntry(c.env, entryId), round: await publicRoundJson(c.env, round, userId), userControls: await getUserControls(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    if (entryId) await c.env.DB.prepare("UPDATE predict_bets SET status = 'failed' WHERE id = ? AND status = 'pending'").bind(entryId).run().catch(() => undefined);
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not place candle guess' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/app/api/predict-settle', async (c, next) => {
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  if (String(body.mode || '').toLowerCase() !== 'candle') {
    c.req.raw = new Request(c.req.raw, { body: JSON.stringify(body) });
    return next();
  }
  try {
    const market = normalizeCandleMarket(String(body.market || 'bitcoin'));
    const settled = await settleDueRounds(c.env, market, true);
    return c.json({ ok: true, settled }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not settle candle guesses' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function publicRoundJson(env: Env, round: RoundRow, userId: string) {
  await ensurePredictTables(env);
  const cleanedUserId = cleanUserIdOptional(userId);
  const roundId = cleanDbText(round.id, 'Candle round is not ready');
  const pools = await poolJson(env, roundId);
  const userBets = cleanedUserId ? await userEntriesJson(env, roundId, cleanedUserId) : [];
  const recentUserBets = cleanedUserId ? await recentUserEntriesJson(env, String(round.market || ''), cleanedUserId) : [];
  const userControls = cleanedUserId ? await getUserControls(env, cleanedUserId) : null;
  const now = Date.now();
  const ends = Date.parse(String(round.ends_at || ''));
  return { ok: true, userControls, round: { id: roundId, market: String(round.market || ''), mode: 'candle', startsAt: String(round.starts_at || ''), endsAt: String(round.ends_at || ''), startPrice: Number(round.start_price || 0), endPrice: round.end_price == null ? null : Number(round.end_price), status: now >= ends - LOCK_MS && round.status === 'open' ? 'locked' : String(round.status || 'open'), result: round.result || null, remainingMs: Math.max(0, ends - now), lockRemainingMs: Math.max(0, ends - LOCK_MS - now), pools, userBets, recentUserBets } };
}
async function ensurePredictTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_rounds (id TEXT PRIMARY KEY, market TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, start_price REAL NOT NULL, end_price REAL, status TEXT NOT NULL DEFAULT 'open', result TEXT, settled_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_rounds_market_end ON predict_rounds(market, ends_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS predict_bets (id TEXT PRIMARY KEY, round_id TEXT NOT NULL, market TEXT NOT NULL, user_id TEXT NOT NULL, side TEXT NOT NULL, stake_nano INTEGER NOT NULL, ton_usd_snapshot REAL NOT NULL DEFAULT 0, stake_usd_snapshot REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', payout_nano INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_round ON predict_bets(round_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_predict_bets_user_round ON predict_bets(user_id, round_id)').run();
}
async function getOrCreateCurrentRound(env: Env, market: CandleMarket): Promise<RoundRow> {
  await ensurePredictTables(env);
  const now = Date.now();
  const startMs = Math.floor(now / HOUR_MS) * HOUR_MS;
  const startsAt = new Date(startMs).toISOString();
  const endsAt = new Date(startMs + HOUR_MS).toISOString();
  const storedMarket = storedMarketName(market);
  const existing = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND id = ? LIMIT 1`).bind(storedMarket, `pc_${market}_${startMs}`).first<RoundRow>();
  if (existing) return existing;
  const candle = await fetchHourlyCandle(market, startMs);
  await env.DB.prepare(`INSERT OR IGNORE INTO predict_rounds (id, market, starts_at, ends_at, start_price, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`).bind(`pc_${market}_${startMs}`, storedMarket, startsAt, endsAt, candle.open).run();
  const row = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(`pc_${market}_${startMs}`).first<RoundRow>();
  if (!row) throw new Error('Could not create candle round');
  return row;
}
async function settleDueRounds(env: Env, market: CandleMarket, force = false): Promise<number> {
  await ensurePredictTables(env);
  const storedMarket = storedMarketName(market);
  const rows = await env.DB.prepare(`SELECT * FROM predict_rounds WHERE market = ? AND (status != 'settled' OR id IN (SELECT round_id FROM predict_bets WHERE status IN ('active', 'settling_payment'))) AND (datetime(ends_at) <= datetime('now') OR ? = 1) ORDER BY datetime(ends_at) ASC LIMIT 10`).bind(storedMarket, force ? 1 : 0).all<RoundRow>();
  let settled = 0;
  for (const round of rows.results || []) {
    if (!force && Date.parse(round.ends_at) > Date.now()) continue;
    await settleRound(env, round, market);
    settled += 1;
  }
  return settled;
}
async function settleRound(env: Env, round: RoundRow, market: CandleMarket): Promise<void> {
  const fresh = await env.DB.prepare('SELECT * FROM predict_rounds WHERE id = ?').bind(cleanDbText(round.id, 'Candle round is not ready')).first<RoundRow>();
  if (!fresh) return;
  const freshId = cleanDbText(fresh.id, 'Candle round is not ready');
  const activeCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status IN ('active', 'settling_payment')").bind(freshId).first<{ count: number }>();
  if (fresh.status === 'settled' && Number(activeCount?.count || 0) <= 0) return;
  const startMs = Date.parse(fresh.starts_at);
  const candle = await fetchHourlyCandle(market, startMs);
  const endPrice = fresh.end_price == null ? candle.close : Number(fresh.end_price);
  const result = endPrice > Number(fresh.start_price) ? 'up' : endPrice < Number(fresh.start_price) ? 'down' : 'draw';
  const lock = await env.DB.prepare(`UPDATE predict_rounds SET status = 'settling', end_price = ?, result = ? WHERE id = ? AND status != 'settled'`).bind(endPrice, result, freshId).run();
  if (fresh.status !== 'settled' && (lock.meta?.changes || 0) <= 0) return;
  const all = (await env.DB.prepare('SELECT * FROM predict_bets WHERE round_id = ?').bind(freshId).all<EntryRow>()).results || [];
  const active = all.filter((entry) => entry.status === 'active' || entry.status === 'settling_payment');
  const upPool = all.filter((entry) => entry.side === 'up').reduce((sum, entry) => sum + Number(entry.stake_nano || 0), 0);
  const downPool = all.filter((entry) => entry.side === 'down').reduce((sum, entry) => sum + Number(entry.stake_nano || 0), 0);
  const winnerPool = result === 'up' ? upPool : result === 'down' ? downPool : 0;
  const loserPool = result === 'up' ? downPool : result === 'down' ? upPool : 0;
  const fee = Math.floor(loserPool * PLATFORM_FEE_BPS / 10000);
  const distributable = Math.max(0, loserPool - fee);
  for (const entry of active) {
    const amount = Number(entry.stake_nano || 0);
    const isWinner = result !== 'draw' && entry.side === result && winnerPool > 0 && loserPool > 0;
    const shouldRefund = result === 'draw' || winnerPool <= 0 || loserPool <= 0;
    if (shouldRefund) await payEntry(env, entry, amount, 'refunded');
    else if (isWinner) await payEntry(env, entry, amount + Math.floor(amount / winnerPool * distributable), 'won');
    else await env.DB.prepare(`UPDATE predict_bets SET status = 'lost', payout_nano = 0 WHERE id = ? AND status = 'active'`).bind(cleanDbText(entry.id, 'Candle entry is not ready')).run();
  }
  const remaining = await env.DB.prepare("SELECT COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status IN ('active', 'settling_payment')").bind(freshId).first<{ count: number }>();
  if (Number(remaining?.count || 0) <= 0) await env.DB.prepare(`UPDATE predict_rounds SET status = 'settled', end_price = ?, result = ?, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP) WHERE id = ?`).bind(endPrice, result, freshId).run();
}
async function payEntry(env: Env, entry: EntryRow, payoutNano: number, status: 'won' | 'refunded'): Promise<void> {
  const entryId = cleanDbText(entry.id, 'Candle entry is not ready');
  const lock = entry.status === 'settling_payment' ? { meta: { changes: 1 } } : await env.DB.prepare(`UPDATE predict_bets SET status = 'settling_payment', payout_nano = ? WHERE id = ? AND status = 'active'`).bind(payoutNano, entryId).run();
  if ((lock.meta?.changes || 0) <= 0) return;
  const alreadyPaid = await env.DB.prepare(`SELECT id FROM ton_transactions WHERE reference_type = 'predict_bet' AND reference_id = ? AND amount_nano = ? LIMIT 1`).bind(entryId, payoutNano).first<{ id: string }>().catch(() => null);
  if (!alreadyPaid) await adjustUserTonBalance(env, cleanUserId(entry.user_id), payoutNano, { kind: 'predict', title: status === 'won' ? 'Candle guess reward' : 'Candle guess refund', referenceId: entryId, referenceType: 'predict_bet', metadata: { roundId: cleanDbText(entry.round_id, 'Candle round is not ready'), market: String(entry.market || ''), side: String(entry.side || ''), status, mode: 'candle' } });
  await env.DB.prepare(`UPDATE predict_bets SET status = ?, payout_nano = ? WHERE id = ? AND status = 'settling_payment'`).bind(status, payoutNano, entryId).run();
}
async function poolJson(env: Env, roundId: string) {
  const rows = await env.DB.prepare(`SELECT side, SUM(stake_nano) AS stakeNano, COUNT(*) AS count FROM predict_bets WHERE round_id = ? AND status = 'active' GROUP BY side`).bind(cleanDbText(roundId, 'Candle round is not ready')).all<{ side: string; stakeNano: number; count: number }>();
  const base = { up: { stakeNano: 0, stakeTon: 0, count: 0 }, down: { stakeNano: 0, stakeTon: 0, count: 0 } };
  for (const row of rows.results || []) if (row.side === 'up' || row.side === 'down') base[row.side] = { stakeNano: Number(row.stakeNano || 0), stakeTon: nanoToTon(Number(row.stakeNano || 0)), count: Number(row.count || 0) };
  return base;
}
function entryJson(entry: EntryRow) { return { id: String(entry.id || ''), roundId: String(entry.round_id || ''), market: String(entry.market || ''), mode: 'candle', side: String(entry.side || ''), stakeNano: Number(entry.stake_nano || 0), stakeTon: nanoToTon(Number(entry.stake_nano || 0)), status: String(entry.status || ''), payoutNano: Number(entry.payout_nano || 0), payoutTon: nanoToTon(Number(entry.payout_nano || 0)), createdAt: String(entry.created_at || '') }; }
async function userEntriesJson(env: Env, roundId: string, userId: string) { return ((await env.DB.prepare('SELECT * FROM predict_bets WHERE round_id = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 20').bind(cleanDbText(roundId, 'Candle round is not ready'), userId).all<EntryRow>()).results || []).map(entryJson); }
async function recentUserEntriesJson(env: Env, market: string, userId: string) { return ((await env.DB.prepare('SELECT * FROM predict_bets WHERE market = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 20').bind(cleanDbText(market, 'Candle market is not ready'), userId).all<EntryRow>()).results || []).map(entryJson); }
async function getEntry(env: Env, id: string) { const entry = await env.DB.prepare('SELECT * FROM predict_bets WHERE id = ?').bind(cleanDbText(id, 'Candle entry is not ready')).first<EntryRow>(); return entry ? entryJson(entry) : null; }
async function fetchHourlyCandle(market: CandleMarket, startMs: number): Promise<{ open: number; close: number }> {
  const symbol = candleSymbol(market);
  const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&startTime=${startMs}&limit=1`, { cf: { cacheTtl: 1, cacheEverything: false } } as RequestInit);
  if (!response.ok) throw new Error('Candle feed is unavailable');
  const rows = await response.json() as unknown[];
  const row = Array.isArray(rows) ? rows[0] as unknown[] | undefined : undefined;
  if (!Array.isArray(row)) throw new Error('Candle feed is unavailable');
  return { open: cleanPrice(row[1]), close: cleanPrice(row[4]) };
}
async function fetchSpotPrice(market: 'ton'): Promise<number> {
  const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT', { cf: { cacheTtl: 1, cacheEverything: false } } as RequestInit);
  if (!response.ok) throw new Error('Price feed is unavailable');
  const data = await response.json() as { price?: string };
  return cleanPrice(data.price);
}
function candleSymbol(market: CandleMarket): string { if (market === 'bitcoin') return 'BTCUSDT'; if (market === 'ethereum') return 'ETHUSDT'; if (market === 'solana') return 'SOLUSDT'; if (market === 'gold') return 'PAXGUSDT'; return 'TONUSDT'; }
function storedMarketName(market: CandleMarket): string { return `candle_${market}`; }
function normalizeCandleMarket(value: string): CandleMarket { const market = value.trim().toLowerCase(); if (market === 'bitcoin' || market === 'btc') return 'bitcoin'; if (market === 'ethereum' || market === 'eth') return 'ethereum'; if (market === 'solana' || market === 'sol') return 'solana'; if (market === 'gold' || market === 'paxg') return 'gold'; if (market === 'ton') return 'ton'; throw new Error('Invalid candle market'); }
function normalizeSide(value: unknown): CandleSide { const side = String(value || '').toLowerCase(); if (side === 'green' || side === 'up') return 'up'; if (side === 'red' || side === 'down') return 'down'; throw new Error('Choose Green or Red'); }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.max(1, Math.floor(n * NANO)); }
function nanoToTon(value: number): number { return Math.floor(Number(value) || 0) / NANO; }
function cleanPrice(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid price'); return n; }
function cleanOptionalPrice(value: unknown): number { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : 0; }
function cleanDbText(value: unknown, message: string): string { const text = String(value ?? '').trim(); if (!text) throw new Error(message); return text; }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Missing user id'); return id; }
function cleanUserIdOptional(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); }

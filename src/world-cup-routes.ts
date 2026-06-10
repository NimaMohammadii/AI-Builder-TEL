import app from './index';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough } from './user-controls';

const CACHE_NONE = 'no-store';
const NANO = 1_000_000_000;
const PLATFORM_FEE_BPS = 500;
const PICKS = new Set(['team_a', 'draw', 'team_b']);
const STATUSES = new Set(['open', 'locked', 'settled', 'cancelled']);

type Pick = 'team_a' | 'draw' | 'team_b';
type MatchRow = { id: string; tournament: string; stage: string | null; match_number: string | null; team_a_name: string; team_b_name: string; team_a_logo: string | null; team_b_logo: string | null; venue: string | null; starts_at: string; lock_at: string; status: string; result: string | null; featured: number; created_at: string; updated_at: string | null; settled_at: string | null };
type BetRow = { id: string; match_id: string; user_id: string; pick: string; stake_nano: number; status: string; payout_nano: number; created_at: string; settled_at: string | null };
type PoolInfo = { teamA: number; draw: number; teamB: number; total: number; players: number; teamATon: number; drawTon: number; teamBTon: number; totalTon: number };

app.get('/app/api/world-cup/matches', async (c) => {
  try {
    await ensureWorldCupTables(c.env);
    const range = String(c.req.query('range') || 'all').toLowerCase();
    const userId = cleanOptionalUserId(c.req.query('userId'));
    const rows = await listMatches(c.env, range, false);
    return c.json({ ok: true, matches: await Promise.all(rows.map((row) => matchJson(c.env, row, userId))) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not load World Cup matches') }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/world-cup/matches/:id', async (c) => {
  try {
    await ensureWorldCupTables(c.env);
    const match = await readMatch(c.env, cleanId(c.req.param('id')));
    if (!match) throw new Error('Match not found');
    return c.json({ ok: true, match: await matchJson(c.env, match, cleanOptionalUserId(c.req.query('userId'))) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not load match') }, 400, { 'cache-control': CACHE_NONE });
  }
});


app.get('/app/api/world-cup/my-bets', async (c) => {
  try {
    await ensureWorldCupTables(c.env);
    const userId = cleanUserId(c.req.query('userId'));
    return c.json({ ok: true, predictions: await recentUserBets(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not load predictions') }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/app/api/world-cup/bets', async (c) => {
  let betId = '';
  let userId = '';
  try {
    await ensureWorldCupTables(c.env);
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const matchId = cleanId(body.matchId);
    userId = cleanUserId(body.userId);
    const pick = cleanPick(body.pick);
    const stakeNano = tonToNano(body.stakeTon);
    if (stakeNano <= 0) throw new Error('Enter a valid TON amount');
    const match = await readMatch(c.env, matchId);
    if (!match) throw new Error('Match not found');
    if (computedStatus(match) !== 'open') throw new Error('Prediction is locked for this match');
    betId = 'wcb_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    const inserted = await c.env.DB.prepare(`INSERT INTO world_cup_bets (id, match_id, user_id, pick, stake_nano, status, payout_nano, created_at)
      SELECT ?, ?, ?, ?, ?, 'pending', 0, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM world_cup_bets WHERE match_id = ? AND user_id = ? AND status IN ('pending','active','settling_payment'))`)
      .bind(betId, matchId, userId, pick, stakeNano, matchId, userId)
      .run();
    if ((inserted.meta?.changes || 0) <= 0) throw new Error('You already have an active prediction for this match');
    const userControls = await debitUserTonBalanceIfEnough(c.env, userId, stakeNano, { kind: 'world_cup_predict', title: 'World Cup prediction stake', referenceType: 'world_cup_bet', referenceId: betId, metadata: { matchId, pick } });
    const active = await c.env.DB.prepare("UPDATE world_cup_bets SET status = 'active' WHERE id = ? AND status = 'pending'").bind(betId).run();
    if ((active.meta?.changes || 0) <= 0) {
      await adjustUserTonBalance(c.env, userId, stakeNano, { kind: 'world_cup_predict', title: 'World Cup prediction stake rollback', referenceType: 'world_cup_bet', referenceId: betId, metadata: { matchId, pick, status: 'rollback' } });
      throw new Error('Could not activate prediction');
    }
    const fresh = await readMatch(c.env, matchId);
    const bet = await readBet(c.env, betId);
    return c.json({ ok: true, match: fresh ? await matchJson(c.env, fresh, userId) : null, bet: bet ? betJson(bet) : null, userControls }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    if (betId) await c.env.DB.prepare("UPDATE world_cup_bets SET status = 'failed' WHERE id = ? AND status = 'pending'").bind(betId).run().catch(() => undefined);
    return c.json({ ok: false, error: message(error, 'Could not place prediction') }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/admin/api/world-cup/matches', async (c) => {
  if (!isAdminRequest(c)) return c.json({ ok: false, error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  await ensureWorldCupTables(c.env);
  const rows = await listMatches(c.env, 'all', true);
  return c.json({ ok: true, matches: await Promise.all(rows.map((row) => matchJson(c.env, row))) }, 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/world-cup/matches', async (c) => {
  if (!isAdminRequest(c)) return c.json({ ok: false, error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureWorldCupTables(c.env);
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const match = cleanMatchInput(body, false);
    const id = 'wcm_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    await c.env.DB.prepare(`INSERT INTO world_cup_matches (id,tournament,stage,match_number,team_a_name,team_b_name,team_a_logo,team_b_logo,venue,starts_at,lock_at,status,result,featured,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).bind(id, match.tournament, match.stage, match.matchNumber, match.teamAName, match.teamBName, match.teamALogo, match.teamBLogo, match.venue, match.startsAt, match.lockAt, match.status, match.featured ? 1 : 0).run();
    const row = await readMatch(c.env, id);
    return c.json({ ok: true, match: row ? await matchJson(c.env, row) : null }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not create match') }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.patch('/admin/api/world-cup/matches/:id', editMatchHandler);
app.post('/admin/api/world-cup/matches/:id', editMatchHandler);

app.post('/admin/api/world-cup/matches/:id/lock', async (c) => {
  if (!isAdminRequest(c)) return c.json({ ok: false, error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureWorldCupTables(c.env);
    const id = cleanId(c.req.param('id'));
    const now = new Date().toISOString();
    await c.env.DB.prepare("UPDATE world_cup_matches SET status = 'locked', lock_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status NOT IN ('settled','cancelled')").bind(now, id).run();
    const row = await readMatch(c.env, id);
    return c.json({ ok: true, match: row ? await matchJson(c.env, row) : null }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not lock match') }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/admin/api/world-cup/matches/:id/settle', async (c) => {
  if (!isAdminRequest(c)) return c.json({ ok: false, error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureWorldCupTables(c.env);
    const id = cleanId(c.req.param('id'));
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const result = cleanPick(body.result);
    const summary = await settleMatch(c.env, id, result);
    const row = await readMatch(c.env, id);
    return c.json({ ok: true, summary, match: row ? await matchJson(c.env, row) : null }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not settle match') }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/admin/api/world-cup/matches/:id/refund', async (c) => {
  if (!isAdminRequest(c)) return c.json({ ok: false, error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureWorldCupTables(c.env);
    const id = cleanId(c.req.param('id'));
    const summary = await refundMatch(c.env, id, true);
    const row = await readMatch(c.env, id);
    return c.json({ ok: true, summary, match: row ? await matchJson(c.env, row) : null }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not refund match') }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function editMatchHandler(c: any) {
  if (!isAdminRequest(c)) return c.json({ ok: false, error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureWorldCupTables(c.env);
    const id = cleanId(c.req.param('id'));
    const current = await readMatch(c.env, id);
    if (!current) throw new Error('Match not found');
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const harmlessOnly = current.status === 'settled' || current.result;
    const match = cleanMatchInput({ ...currentToInput(current), ...body }, true);
    if (!harmlessOnly && (match.status === 'settled' || match.status === 'cancelled')) throw new Error('Use Set Result or Refund All for final match states');
    if (harmlessOnly) {
      await c.env.DB.prepare(`UPDATE world_cup_matches SET tournament=?, stage=?, match_number=?, team_a_logo=?, team_b_logo=?, venue=?, featured=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(match.tournament, match.stage, match.matchNumber, match.teamALogo, match.teamBLogo, match.venue, match.featured ? 1 : 0, id).run();
    } else {
      await c.env.DB.prepare(`UPDATE world_cup_matches SET tournament=?, stage=?, match_number=?, team_a_name=?, team_b_name=?, team_a_logo=?, team_b_logo=?, venue=?, starts_at=?, lock_at=?, status=?, featured=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(match.tournament, match.stage, match.matchNumber, match.teamAName, match.teamBName, match.teamALogo, match.teamBLogo, match.venue, match.startsAt, match.lockAt, match.status, match.featured ? 1 : 0, id).run();
    }
    const row = await readMatch(c.env, id);
    return c.json({ ok: true, match: row ? await matchJson(c.env, row) : null }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: message(error, 'Could not edit match') }, 400, { 'cache-control': CACHE_NONE });
  }
}

async function ensureWorldCupTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS world_cup_matches (
    id TEXT PRIMARY KEY,
    tournament TEXT NOT NULL DEFAULT 'World Cup',
    stage TEXT,
    match_number TEXT,
    team_a_name TEXT NOT NULL,
    team_b_name TEXT NOT NULL,
    team_a_logo TEXT,
    team_b_logo TEXT,
    venue TEXT,
    starts_at TEXT NOT NULL,
    lock_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    result TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,
    settled_at TEXT
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_world_cup_matches_starts_at ON world_cup_matches(starts_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_world_cup_matches_status ON world_cup_matches(status)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_world_cup_matches_featured ON world_cup_matches(featured)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_world_cup_matches_lock_at ON world_cup_matches(lock_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS world_cup_bets (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    pick TEXT NOT NULL,
    stake_nano INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    payout_nano INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settled_at TEXT
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_world_cup_bets_match_id ON world_cup_bets(match_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_world_cup_bets_user_id ON world_cup_bets(user_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_world_cup_bets_status ON world_cup_bets(status)').run();
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_world_cup_bets_one_active ON world_cup_bets(match_id, user_id) WHERE status IN ('pending','active','settling_payment')").run().catch(() => undefined);
}

async function listMatches(env: Env, range: string, admin: boolean): Promise<MatchRow[]> {
  const now = new Date();
  const startToday = new Date(now); startToday.setUTCHours(0, 0, 0, 0);
  const startTomorrow = new Date(startToday.getTime() + 86400000);
  const startAfterTomorrow = new Date(startToday.getTime() + 2 * 86400000);
  const weekEnd = new Date(now.getTime() + 7 * 86400000);
  let sql = 'SELECT * FROM world_cup_matches';
  const binds: string[] = [];
  if (range === 'featured') sql += ' WHERE featured = 1';
  else if (range === 'today') { sql += ' WHERE datetime(starts_at) >= datetime(?) AND datetime(starts_at) < datetime(?)'; binds.push(startToday.toISOString(), startTomorrow.toISOString()); }
  else if (range === 'tomorrow') { sql += ' WHERE datetime(starts_at) >= datetime(?) AND datetime(starts_at) < datetime(?)'; binds.push(startTomorrow.toISOString(), startAfterTomorrow.toISOString()); }
  else if (range === 'week') { sql += ' WHERE datetime(starts_at) >= datetime(?) AND datetime(starts_at) <= datetime(?)'; binds.push(now.toISOString(), weekEnd.toISOString()); }
  else if (!admin) { sql += " WHERE datetime(starts_at) >= datetime(?, '-14 days')"; binds.push(now.toISOString()); }
  sql += ' ORDER BY datetime(starts_at) ASC';
  return ((await env.DB.prepare(sql).bind(...binds).all<MatchRow>()).results || []);
}

async function readMatch(env: Env, id: string): Promise<MatchRow | null> { return env.DB.prepare('SELECT * FROM world_cup_matches WHERE id = ?').bind(id).first<MatchRow>(); }
async function readBet(env: Env, id: string): Promise<BetRow | null> { return env.DB.prepare('SELECT * FROM world_cup_bets WHERE id = ?').bind(id).first<BetRow>(); }

async function pools(env: Env, matchId: string): Promise<PoolInfo> {
  const rows = (await env.DB.prepare("SELECT pick, SUM(stake_nano) AS stakeNano, COUNT(*) AS count FROM world_cup_bets WHERE match_id = ? AND status IN ('active','won','lost','settling_payment') GROUP BY pick").bind(matchId).all<{ pick: string; stakeNano: number; count: number }>()).results || [];
  const info = { teamA: 0, draw: 0, teamB: 0, total: 0, players: 0, teamATon: 0, drawTon: 0, teamBTon: 0, totalTon: 0 };
  for (const row of rows) {
    const amount = Math.max(0, Math.floor(Number(row.stakeNano) || 0));
    const count = Math.max(0, Math.floor(Number(row.count) || 0));
    if (row.pick === 'team_a') info.teamA += amount;
    if (row.pick === 'draw') info.draw += amount;
    if (row.pick === 'team_b') info.teamB += amount;
    info.total += amount;
    info.players += count;
  }
  info.teamATon = nanoToTon(info.teamA); info.drawTon = nanoToTon(info.draw); info.teamBTon = nanoToTon(info.teamB); info.totalTon = nanoToTon(info.total);
  return info;
}

async function userBet(env: Env, matchId: string, userId: string): Promise<BetRow | null> {
  if (!userId) return null;
  return env.DB.prepare('SELECT * FROM world_cup_bets WHERE match_id = ? AND user_id = ? AND status != ? ORDER BY datetime(created_at) DESC LIMIT 1').bind(matchId, userId, 'failed').first<BetRow>();
}

async function recentUserBets(env: Env, userId: string): Promise<unknown[]> {
  if (!userId) return [];
  const rows = (await env.DB.prepare(`SELECT b.*, m.team_a_name, m.team_b_name FROM world_cup_bets b JOIN world_cup_matches m ON m.id = b.match_id WHERE b.user_id = ? AND b.status != 'failed' ORDER BY datetime(b.created_at) DESC LIMIT 20`).bind(userId).all<BetRow & { team_a_name: string; team_b_name: string }>()).results || [];
  return rows.map((b) => ({ ...betJson(b), match: `${b.team_a_name} vs ${b.team_b_name}` }));
}

async function matchJson(env: Env, row: MatchRow, userId = '') {
  const pool = await pools(env, row.id);
  const bet = await userBet(env, row.id, userId);
  return {
    id: row.id,
    tournament: row.tournament,
    stage: row.stage || '',
    matchNumber: row.match_number || '',
    teamAName: row.team_a_name,
    teamBName: row.team_b_name,
    teamALogo: row.team_a_logo || '',
    teamBLogo: row.team_b_logo || '',
    venue: row.venue || '',
    startsAt: row.starts_at,
    lockAt: row.lock_at,
    status: row.status,
    computedStatus: computedStatus(row),
    result: row.result,
    featured: Boolean(row.featured),
    settledAt: row.settled_at,
    pools: pool,
    totalPoolTon: pool.totalTon,
    totalPlayers: pool.players,
    userBet: bet ? { ...betJson(bet), potentialPayoutNano: bet.status === 'active' ? estimatePayout(bet, pool) : 0, potentialPayoutTon: bet.status === 'active' ? nanoToTon(estimatePayout(bet, pool)) : 0 } : null,
  };
}

function betJson(bet: BetRow) { return { id: bet.id, matchId: bet.match_id, userId: bet.user_id, pick: bet.pick, stakeNano: Math.floor(Number(bet.stake_nano) || 0), stakeTon: nanoToTon(bet.stake_nano), status: bet.status, payoutNano: Math.floor(Number(bet.payout_nano) || 0), payoutTon: nanoToTon(bet.payout_nano), createdAt: bet.created_at, settledAt: bet.settled_at }; }

async function settleMatch(env: Env, matchId: string, result: Pick) {
  const match = await readMatch(env, matchId);
  if (!match) throw new Error('Match not found');
  if (match.status === 'settled') return { alreadySettled: true };
  if (match.status === 'cancelled') throw new Error('Cancelled matches cannot be settled');
  const active = (await env.DB.prepare("SELECT * FROM world_cup_bets WHERE match_id = ? AND status = 'active' ORDER BY datetime(created_at) ASC").bind(matchId).all<BetRow>()).results || [];
  const pool = await pools(env, matchId);
  const winnerPool = result === 'team_a' ? pool.teamA : result === 'draw' ? pool.draw : pool.teamB;
  if (active.length && winnerPool <= 0) return refundMatch(env, matchId, true, result);
  const loserPool = Math.max(0, pool.total - winnerPool);
  const platformFee = Math.floor(loserPool * PLATFORM_FEE_BPS / 10000);
  const distributable = Math.max(0, loserPool - platformFee);
  let won = 0; let lost = 0; let paidNano = 0;
  for (const bet of active) {
    if (bet.pick === result) {
      const payout = Math.max(0, Math.floor(Number(bet.stake_nano) || 0) + Math.floor((Math.floor(Number(bet.stake_nano) || 0) / winnerPool) * distributable));
      await payBet(env, bet, payout, 'won', result); won++; paidNano += payout;
    } else {
      await env.DB.prepare("UPDATE world_cup_bets SET status = 'lost', payout_nano = 0, settled_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").bind(bet.id).run(); lost++;
    }
  }
  await env.DB.prepare("UPDATE world_cup_matches SET status = 'settled', result = ?, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'settled'").bind(result, matchId).run();
  return { result, winners: won, losers: lost, platformFeeNano: platformFee, paidNano };
}

async function refundMatch(env: Env, matchId: string, cancelMatch = true, forcedResult: Pick | null = null) {
  const match = await readMatch(env, matchId);
  if (!match) throw new Error('Match not found');
  if (match.status === 'settled' && !cancelMatch) return { alreadySettled: true };
  const active = (await env.DB.prepare("SELECT * FROM world_cup_bets WHERE match_id = ? AND status = 'active' ORDER BY datetime(created_at) ASC").bind(matchId).all<BetRow>()).results || [];
  let refunded = 0; let paidNano = 0;
  for (const bet of active) {
    const payout = Math.max(0, Math.floor(Number(bet.stake_nano) || 0));
    await payBet(env, bet, payout, 'refunded', forcedResult || 'cancelled');
    refunded++; paidNano += payout;
  }
  if (cancelMatch) await env.DB.prepare("UPDATE world_cup_matches SET status = 'cancelled', result = 'cancelled', settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'settled'").bind(matchId).run();
  else await env.DB.prepare("UPDATE world_cup_matches SET status = 'settled', result = ?, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'settled'").bind(forcedResult, matchId).run();
  return { refunded, paidNano, reason: forcedResult ? 'no_winners' : 'cancelled' };
}

async function payBet(env: Env, bet: BetRow, payoutNano: number, status: 'won' | 'refunded', result: string) {
  const betId = cleanId(bet.id);
  const lock = bet.status === 'settling_payment' ? { meta: { changes: 1 } } : await env.DB.prepare('UPDATE world_cup_bets SET status = ?, payout_nano = ? WHERE id = ? AND status = ?').bind('settling_payment', payoutNano, betId, 'active').run();
  if ((lock.meta?.changes || 0) <= 0) return;
  const alreadyPaid = await env.DB.prepare("SELECT id FROM ton_transactions WHERE reference_type = 'world_cup_bet' AND reference_id = ? AND amount_nano = ? LIMIT 1").bind(betId, payoutNano).first<{ id: string }>().catch(() => null);
  if (!alreadyPaid && payoutNano > 0) await adjustUserTonBalance(env, cleanUserId(bet.user_id), payoutNano, { kind: 'world_cup_predict', title: status === 'won' ? 'World Cup prediction payout' : 'World Cup prediction refund', referenceType: 'world_cup_bet', referenceId: betId, metadata: { matchId: bet.match_id, pick: bet.pick, result } });
  await env.DB.prepare('UPDATE world_cup_bets SET status = ?, payout_nano = ?, settled_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?').bind(status, payoutNano, betId, 'settling_payment').run();
}

function estimatePayout(bet: BetRow, pool: PoolInfo): number {
  const winnerPool = bet.pick === 'team_a' ? pool.teamA : bet.pick === 'draw' ? pool.draw : pool.teamB;
  if (winnerPool <= 0) return Math.floor(Number(bet.stake_nano) || 0);
  const loserPool = Math.max(0, pool.total - winnerPool);
  return Math.floor(Number(bet.stake_nano) || 0) + Math.floor((Math.floor(Number(bet.stake_nano) || 0) / winnerPool) * Math.max(0, loserPool - Math.floor(loserPool * PLATFORM_FEE_BPS / 10000)));
}

function computedStatus(match: MatchRow): string {
  if (match.status === 'settled' || match.result && match.result !== 'cancelled') return 'settled';
  if (match.status === 'cancelled' || match.result === 'cancelled') return 'cancelled';
  if (match.status === 'locked') return 'locked';
  if (Date.now() >= Date.parse(match.lock_at)) return 'locked';
  return 'open';
}

function cleanMatchInput(body: Record<string, unknown>, editing: boolean) {
  const tournament = cleanText(body.tournament || 'World Cup', 80) || 'World Cup';
  const stage = cleanNullable(body.stage, 80);
  const matchNumber = cleanNullable(body.matchNumber ?? body.match_number, 40);
  const teamAName = cleanText(body.teamAName ?? body.team_a_name, 80);
  const teamBName = cleanText(body.teamBName ?? body.team_b_name, 80);
  if (!teamAName || !teamBName) throw new Error('Team names are required');
  const teamALogo = cleanUrlish(body.teamALogo ?? body.team_a_logo);
  const teamBLogo = cleanUrlish(body.teamBLogo ?? body.team_b_logo);
  const venue = cleanNullable(body.venue, 120);
  const startsAt = cleanDate(body.startsAt ?? body.starts_at);
  const lockAt = cleanDate((body.lockAt ?? body.lock_at) || startsAt);
  const status = cleanStatus(body.status || 'open');
  if (!editing && (status === 'settled' || status === 'cancelled')) throw new Error('New matches must start open or locked');
  return { tournament, stage, matchNumber, teamAName, teamBName, teamALogo, teamBLogo, venue, startsAt, lockAt, status, featured: truthy(body.featured) };
}

function currentToInput(row: MatchRow): Record<string, unknown> { return { tournament: row.tournament, stage: row.stage, matchNumber: row.match_number, teamAName: row.team_a_name, teamBName: row.team_b_name, teamALogo: row.team_a_logo, teamBLogo: row.team_b_logo, venue: row.venue, startsAt: row.starts_at, lockAt: row.lock_at, status: row.status, featured: Boolean(row.featured) }; }
function cleanPick(value: unknown): Pick { const pick = String(value || '').trim(); if (!PICKS.has(pick)) throw new Error('Choose a valid result'); return pick as Pick; }
function cleanStatus(value: unknown): string { const status = String(value || 'open').trim().toLowerCase(); if (!STATUSES.has(status)) throw new Error('Invalid match status'); return status; }
function cleanId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Invalid match id'); return id; }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Telegram user not found'); return id; }
function cleanOptionalUserId(value: unknown): string { try { return value == null || value === '' ? '' : cleanUserId(value); } catch { return ''; } }
function cleanText(value: unknown, max: number): string { return String(value ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max); }
function cleanNullable(value: unknown, max: number): string | null { const text = cleanText(value, max); return text || null; }
function cleanUrlish(value: unknown): string | null { const raw = String(value ?? '').replace(/[<>"']/g, '').trim().slice(0, 500); if (!raw) return null; if (/^(https?:\/\/|\/)/i.test(raw) || raw.startsWith('data:image/')) return raw; return null; }
function cleanDate(value: unknown): string { const date = new Date(String(value || '')); if (!Number.isFinite(date.getTime())) throw new Error('Choose a valid date and time'); return date.toISOString(); }
function truthy(value: unknown): boolean { return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'on'; }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.floor(n * NANO); }
function nanoToTon(value: unknown): number { return Math.floor(Number(value) || 0) / NANO; }
function message(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

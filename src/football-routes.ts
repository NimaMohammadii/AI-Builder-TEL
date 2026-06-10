import app from './index';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const NANO = 1_000_000_000;
const PLATFORM_FEE_BPS = 1500;

const FOOTBALL_TEAMS = [
  ['mexico', 'Mexico'],
  ['south-africa', 'South Africa'],
  ['korea-republic', 'Korea Republic'],
  ['czechia', 'Czechia'],
  ['canada', 'Canada'],
  ['bosnia-and-herzegovina', 'Bosnia and Herzegovina'],
  ['usa', 'USA'],
  ['paraguay', 'Paraguay'],
  ['qatar', 'Qatar'],
  ['switzerland', 'Switzerland'],
  ['brazil', 'Brazil'],
  ['morocco', 'Morocco'],
  ['haiti', 'Haiti'],
  ['scotland', 'Scotland'],
  ['australia', 'Australia'],
  ['turkiye', 'Türkiye'],
  ['germany', 'Germany'],
  ['curacao', 'Curaçao'],
  ['netherlands', 'Netherlands'],
  ['japan', 'Japan'],
  ['cote-divoire', "Côte d'Ivoire"],
  ['ecuador', 'Ecuador'],
  ['sweden', 'Sweden'],
  ['tunisia', 'Tunisia'],
  ['spain', 'Spain'],
  ['cabo-verde', 'Cabo Verde'],
  ['belgium', 'Belgium'],
  ['egypt', 'Egypt'],
  ['saudi-arabia', 'Saudi Arabia'],
  ['uruguay', 'Uruguay'],
  ['iran', 'IR Iran'],
  ['new-zealand', 'New Zealand'],
  ['france', 'France'],
  ['senegal', 'Senegal'],
  ['iraq', 'Iraq'],
  ['norway', 'Norway'],
  ['argentina', 'Argentina'],
  ['algeria', 'Algeria'],
  ['austria', 'Austria'],
  ['jordan', 'Jordan'],
  ['england', 'England'],
  ['croatia', 'Croatia'],
  ['ghana', 'Ghana'],
  ['panama', 'Panama'],
  ['portugal', 'Portugal'],
  ['congo-dr', 'Congo DR'],
  ['uzbekistan', 'Uzbekistan'],
  ['colombia', 'Colombia'],
] as const;

type FootballTeamId = typeof FOOTBALL_TEAMS[number][0];
type FootballPick = 'team_a' | 'draw' | 'team_b';
type FootballMatchRow = { id: string; team_a_id: string; team_b_id: string; starts_at: string; ends_at: string | null; status: string; result: string | null; featured: number; created_at: string; updated_at: string; settled_at: string | null };
type FootballBetRow = { id: string; match_id: string; user_id: string; pick: string; stake_nano: number; status: string; payout_nano: number; created_at: string; settled_at: string | null };

app.get('/app/api/football-teams', async (c) => c.json(await getFootballTeams(c.env), 200, { 'cache-control': CACHE_NONE }));

app.get('/app/api/football-team-logo/:team', async (c) => {
  try {
    const team = normalizeTeam(c.req.param('team').replace(/\.png$/i, ''));
    return getTeamLogoResponse(c.env, teamLogoKey(team));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/football-matches', async (c) => {
  try {
    await ensureFootballPredictTables(c.env);
    await lockStartedMatches(c.env);
    const userId = cleanUserIdOptional(c.req.query('userId'));
    const rows = await c.env.DB.prepare(`SELECT * FROM football_matches WHERE status != 'cancelled' ORDER BY featured DESC, datetime(starts_at) ASC, datetime(created_at) DESC LIMIT 50`).all<FootballMatchRow>();
    return c.json({ ok: true, matches: await Promise.all((rows.results || []).map((row) => footballMatchJson(c.env, row, userId))), userControls: userId ? await getUserControls(c.env, userId) : null }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not load football matches' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/app/api/football-bet', async (c) => {
  let betId = '';
  try {
    await ensureFootballPredictTables(c.env);
    await lockStartedMatches(c.env);
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const matchId = cleanDbText(body.matchId, 'Missing match id');
    const userId = cleanUserId(body.userId);
    const pick = normalizePick(body.pick);
    const stakeNano = tonToNano(body.stakeTon);
    if (stakeNano <= 0) throw new Error('Enter a valid TON amount');
    const match = await c.env.DB.prepare('SELECT * FROM football_matches WHERE id = ?').bind(matchId).first<FootballMatchRow>();
    if (!match) throw new Error('Match not found');
    if (Date.now() >= Date.parse(match.starts_at) || match.status !== 'open') throw new Error('This match is locked.');
    betId = 'fbet_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22);
    const inserted = await c.env.DB.prepare(`INSERT INTO football_bets (id, match_id, user_id, pick, stake_nano, status, payout_nano, created_at)
      SELECT ?, ?, ?, ?, ?, 'pending', 0, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM football_bets WHERE match_id = ? AND user_id = ? AND status != 'failed')`)
      .bind(betId, matchId, userId, pick, stakeNano, matchId, userId)
      .run();
    if ((inserted.meta?.changes || 0) <= 0) throw new Error('You already placed a prediction for this match.');
    await debitUserTonBalanceIfEnough(c.env, userId, stakeNano, { kind: 'predict', title: 'Football prediction stake', referenceId: betId, referenceType: 'football_bet', metadata: { matchId, pick } });
    const active = await c.env.DB.prepare("UPDATE football_bets SET status = 'active' WHERE id = ? AND status = 'pending'").bind(betId).run();
    if ((active.meta?.changes || 0) <= 0) {
      await adjustUserTonBalance(c.env, userId, stakeNano, { kind: 'predict', title: 'Football prediction stake rollback', referenceId: betId, referenceType: 'football_bet', metadata: { matchId, pick, status: 'rollback' } });
      throw new Error('Could not activate prediction');
    }
    const fresh = await c.env.DB.prepare('SELECT * FROM football_matches WHERE id = ?').bind(matchId).first<FootballMatchRow>();
    return c.json({ ok: true, bet: await getFootballBet(c.env, betId), match: fresh ? await footballMatchJson(c.env, fresh, userId) : null, userControls: await getUserControls(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    if (betId) await c.env.DB.prepare("UPDATE football_bets SET status = 'failed' WHERE id = ? AND status = 'pending'").bind(betId).run().catch(() => undefined);
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not place football prediction' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/admin/api/football-teams', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await getFootballTeams(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/football-team-logo', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const form = await c.req.formData();
    const team = normalizeTeam(String(form.get('team') || ''));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400, { 'cache-control': CACHE_NONE });
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400, { 'cache-control': CACHE_NONE });
    if (file.size > 3_000_000) return c.json({ error: 'Image must be under 3MB.' }, 400, { 'cache-control': CACHE_NONE });
    const version = String(Date.now());
    await c.env.ASSETS.put(teamLogoKey(team), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json(await getFootballTeams(c.env), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload football logo' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/admin/api/football-matches', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureFootballPredictTables(c.env);
    await lockStartedMatches(c.env);
    const rows = await c.env.DB.prepare('SELECT * FROM football_matches ORDER BY datetime(starts_at) DESC, datetime(created_at) DESC LIMIT 100').all<FootballMatchRow>();
    return c.json({ ok: true, matches: await Promise.all((rows.results || []).map((row) => footballMatchJson(c.env, row, ''))) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load football matches' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/admin/api/football-matches', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureFootballPredictTables(c.env);
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const teamA = normalizeTeam(String(body.teamAId || body.team_a_id || ''));
    const teamB = normalizeTeam(String(body.teamBId || body.team_b_id || ''));
    if (teamA === teamB) throw new Error('Choose two different teams');
    const startsAt = normalizeDateTime(body.startsAt || body.starts_at, 'Start time is required');
    const endsAt = body.endsAt || body.ends_at ? normalizeDateTime(body.endsAt || body.ends_at, 'Invalid end time') : null;
    const status = normalizeMatchStatus(body.status || 'open');
    const featured = truthy(body.featured) ? 1 : 0;
    const id = 'fmatch_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    await c.env.DB.prepare(`INSERT INTO football_matches (id, team_a_id, team_b_id, starts_at, ends_at, status, result, featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`).bind(id, teamA, teamB, startsAt, endsAt, status, featured).run();
    return c.json({ ok: true, match: await footballMatchJson(c.env, (await c.env.DB.prepare('SELECT * FROM football_matches WHERE id = ?').bind(id).first<FootballMatchRow>())!, '') }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not create football match' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/admin/api/football-matches/:id/action', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    await ensureFootballPredictTables(c.env);
    const id = cleanDbText(c.req.param('id'), 'Missing match id');
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(body.action || '').trim().toLowerCase();
    if (action === 'lock') await c.env.DB.prepare("UPDATE football_matches SET status = 'locked', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'open'").bind(id).run();
    else if (action === 'refund') await refundFootballMatch(c.env, id);
    else if (action === 'set_result') await settleFootballMatch(c.env, id, normalizePick(body.result));
    else throw new Error('Unknown match action');
    const match = await c.env.DB.prepare('SELECT * FROM football_matches WHERE id = ?').bind(id).first<FootballMatchRow>();
    return c.json({ ok: true, match: match ? await footballMatchJson(c.env, match, '') : null }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not update football match' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function getFootballTeams(env: Env): Promise<{ teams: Array<{ id: FootballTeamId; name: string; logoUrl: string }> }> {
  const teams = await Promise.all(FOOTBALL_TEAMS.map(async ([id, name]) => {
    const head = await env.ASSETS.head(teamLogoKey(id)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return { id, name, logoUrl: head ? `/app/api/football-team-logo/${id}.png?v=${version}` : '' };
  }));
  return { teams };
}

async function ensureFootballPredictTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS football_matches (id TEXT PRIMARY KEY, team_a_id TEXT NOT NULL, team_b_id TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT, status TEXT NOT NULL DEFAULT 'open', result TEXT, featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, settled_at TEXT)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_matches_status_start ON football_matches(status, starts_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_matches_featured_start ON football_matches(featured, starts_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS football_bets (id TEXT PRIMARY KEY, match_id TEXT NOT NULL, user_id TEXT NOT NULL, pick TEXT NOT NULL, stake_nano INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active', payout_nano INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, settled_at TEXT)`).run();
  await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_football_bets_one_active_user_match ON football_bets(match_id, user_id) WHERE status != \'failed\'').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_bets_match ON football_bets(match_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_bets_user_match ON football_bets(user_id, match_id)').run();
}

async function lockStartedMatches(env: Env): Promise<void> {
  await ensureFootballPredictTables(env);
  await env.DB.prepare("UPDATE football_matches SET status = 'locked', updated_at = CURRENT_TIMESTAMP WHERE status = 'open' AND datetime(starts_at) <= datetime('now')").run();
}

async function settleFootballMatch(env: Env, matchId: string, result: FootballPick): Promise<void> {
  await lockStartedMatches(env);
  const match = await env.DB.prepare('SELECT * FROM football_matches WHERE id = ?').bind(matchId).first<FootballMatchRow>();
  if (!match) throw new Error('Match not found');
  if (match.status === 'settled') return;
  if (match.status === 'refunded') throw new Error('Match is already refunded');
  const lock = await env.DB.prepare("UPDATE football_matches SET status = 'settling', result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status NOT IN ('settled', 'refunded')").bind(result, matchId).run();
  if ((lock.meta?.changes || 0) <= 0) return;
  const all = (await env.DB.prepare('SELECT * FROM football_bets WHERE match_id = ?').bind(matchId).all<FootballBetRow>()).results || [];
  const active = all.filter((bet) => bet.status === 'active');
  const winnerPool = active.filter((bet) => bet.pick === result).reduce((sum, bet) => sum + Number(bet.stake_nano || 0), 0);
  if (winnerPool <= 0) {
    for (const bet of active) await payFootballBet(env, bet, Number(bet.stake_nano || 0), 'refunded');
    await env.DB.prepare("UPDATE football_matches SET status = 'refunded', result = NULL, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(matchId).run();
    return;
  }
  const loserPool = active.filter((bet) => bet.pick !== result).reduce((sum, bet) => sum + Number(bet.stake_nano || 0), 0);
  const fee = Math.floor(loserPool * PLATFORM_FEE_BPS / 10000);
  const distributable = Math.max(0, loserPool - fee);
  for (const bet of active) {
    const stake = Number(bet.stake_nano || 0);
    if (bet.pick === result) await payFootballBet(env, bet, stake + Math.floor(stake / winnerPool * distributable), 'won');
    else await env.DB.prepare("UPDATE football_bets SET status = 'lost', payout_nano = 0, settled_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").bind(cleanDbText(bet.id, 'Prediction bet is not ready')).run();
  }
  await env.DB.prepare("UPDATE football_matches SET status = 'settled', result = ?, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(result, matchId).run();
}

async function refundFootballMatch(env: Env, matchId: string): Promise<void> {
  const lock = await env.DB.prepare("UPDATE football_matches SET status = 'refunding', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status NOT IN ('settled', 'refunded')").bind(matchId).run();
  if ((lock.meta?.changes || 0) <= 0) return;
  const bets = (await env.DB.prepare("SELECT * FROM football_bets WHERE match_id = ? AND status = 'active'").bind(matchId).all<FootballBetRow>()).results || [];
  for (const bet of bets) await payFootballBet(env, bet, Number(bet.stake_nano || 0), 'refunded');
  await env.DB.prepare("UPDATE football_matches SET status = 'refunded', result = NULL, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(matchId).run();
}

async function payFootballBet(env: Env, bet: FootballBetRow, payoutNano: number, status: 'won' | 'refunded'): Promise<void> {
  const betId = cleanDbText(bet.id, 'Prediction bet is not ready');
  const locked = await env.DB.prepare('UPDATE football_bets SET status = ?, payout_nano = ?, settled_at = CURRENT_TIMESTAMP WHERE id = ? AND status = \'active\'').bind(status, payoutNano, betId).run();
  if ((locked.meta?.changes || 0) <= 0) return;
  const alreadyPaid = await env.DB.prepare("SELECT id FROM ton_transactions WHERE reference_type = 'football_bet' AND reference_id = ? LIMIT 1").bind(betId).first<{ id: string }>().catch(() => null);
  if (!alreadyPaid && payoutNano > 0) await adjustUserTonBalance(env, cleanUserId(bet.user_id), payoutNano, { kind: 'predict', title: status === 'won' ? 'Football prediction payout' : 'Football prediction refund', referenceId: betId, referenceType: 'football_bet', metadata: { matchId: bet.match_id, pick: bet.pick, status } });
}

async function footballMatchJson(env: Env, row: FootballMatchRow, userId: string) {
  const now = Date.now();
  const startsMs = Date.parse(row.starts_at);
  const status = row.status === 'open' && now >= startsMs ? 'locked' : row.status;
  const pools = await footballPoolsJson(env, row.id);
  const cleanedUserId = cleanUserIdOptional(userId);
  const userBets = cleanedUserId ? ((await env.DB.prepare('SELECT * FROM football_bets WHERE match_id = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 20').bind(row.id, cleanedUserId).all<FootballBetRow>()).results || []).map(footballBetJson) : [];
  return { id: row.id, stage: 'World Cup', time: formatMatchTime(row.starts_at), teamAId: row.team_a_id, teamBId: row.team_b_id, a: row.team_a_id, b: row.team_b_id, startsAt: row.starts_at, endsAt: row.ends_at, status, result: row.result, featured: Number(row.featured || 0) === 1, settledAt: row.settled_at, remainingMs: Math.max(0, startsMs - now), locked: status !== 'open' || now >= startsMs, pools, userBets };
}

async function footballPoolsJson(env: Env, matchId: string) {
  const rows = await env.DB.prepare("SELECT pick, SUM(stake_nano) AS stakeNano, COUNT(*) AS count FROM football_bets WHERE match_id = ? AND status = 'active' GROUP BY pick").bind(matchId).all<{ pick: string; stakeNano: number; count: number }>();
  const base = { team_a: poolItem(0, 0), draw: poolItem(0, 0), team_b: poolItem(0, 0) };
  for (const row of rows.results || []) if (row.pick === 'team_a' || row.pick === 'draw' || row.pick === 'team_b') base[row.pick] = poolItem(Number(row.stakeNano || 0), Number(row.count || 0));
  return base;
}
function poolItem(stakeNano: number, count: number) { return { stakeNano, stakeTon: nanoToTon(stakeNano), count }; }
function footballBetJson(bet: FootballBetRow) { return { id: String(bet.id || ''), matchId: String(bet.match_id || ''), userId: String(bet.user_id || ''), pick: String(bet.pick || ''), stakeNano: Number(bet.stake_nano || 0), stakeTon: nanoToTon(Number(bet.stake_nano || 0)), status: String(bet.status || ''), payoutNano: Number(bet.payout_nano || 0), payoutTon: nanoToTon(Number(bet.payout_nano || 0)), createdAt: String(bet.created_at || ''), settledAt: bet.settled_at || null }; }
async function getFootballBet(env: Env, id: string) { const bet = await env.DB.prepare('SELECT * FROM football_bets WHERE id = ?').bind(cleanDbText(id, 'Prediction bet is not ready')).first<FootballBetRow>(); return bet ? footballBetJson(bet) : null; }

async function getTeamLogoResponse(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', CACHE_LONG);
  if (!headers.get('content-type')) headers.set('content-type', object.customMetadata?.contentType || 'image/png');
  return new Response(object.body, { headers });
}

function teamLogoKey(team: FootballTeamId): string { return `football/teams/${team}/logo`; }
function normalizeTeam(value: string): FootballTeamId { const team = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''); for (const [id] of FOOTBALL_TEAMS) if (team === id) return id; throw new Error('Unknown football team'); }
function normalizePick(value: unknown): FootballPick { const pick = String(value || '').trim().toLowerCase(); if (pick === 'team_a' || pick === 'draw' || pick === 'team_b') return pick; throw new Error('Choose Team A, Draw or Team B'); }
function normalizeMatchStatus(value: unknown): string { const status = String(value || '').trim().toLowerCase(); if (['open', 'locked', 'live', 'settled', 'refunded'].includes(status)) return status === 'live' ? 'locked' : status; throw new Error('Invalid match status'); }
function normalizeDateTime(value: unknown, message: string): string { const raw = String(value || '').trim(); const date = new Date(raw); if (!raw || Number.isNaN(date.getTime())) throw new Error(message); return date.toISOString(); }
function formatMatchTime(value: string): string { const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.max(1, Math.floor(n * NANO)); }
function nanoToTon(value: number): number { return Math.floor(Number(value) || 0) / NANO; }
function cleanDbText(value: unknown, message: string): string { const text = String(value ?? '').trim(); if (!text) throw new Error(message); return text; }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Missing user id'); return id; }
function cleanUserIdOptional(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); }
function truthy(value: unknown): boolean { return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'on'; }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

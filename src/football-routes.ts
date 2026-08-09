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

type FootballTeamId = typeof FOOTBALL_TEAMS[number][0] | string;
type FootballPick = 'team_a' | 'draw' | 'team_b';
type FootballLivePick = 'yes' | 'no';
type FootballMatchRow = { id: string; team_a_id: string; team_b_id: string; starts_at: string; ends_at: string | null; status: string; result: string | null; featured: number; team_a_goals?: number | null; team_b_goals?: number | null; created_at: string; updated_at: string; settled_at: string | null };
type FootballBetRow = { id: string; match_id: string; user_id: string; pick: string; stake_nano: number; status: string; payout_nano: number; created_at: string; settled_at: string | null };
type FootballTeamRow = { id: string; name: string; custom: number; created_at: string; updated_at: string };
type FootballLiveQuestionRow = { id: string; match_id: string; question_text: string; status: string; result: string | null; starts_at: string; expires_at: string; created_at: string; updated_at: string; settled_at: string | null };
type FootballLiveQuestionBetRow = { id: string; question_id: string; match_id: string; user_id: string; pick: string; stake_nano: number; status: string; payout_nano: number; created_at: string; settled_at: string | null };

app.get('/app/api/football-teams', async (c) => c.json(await getFootballTeams(c.env), 200, { 'cache-control': CACHE_NONE }));

app.get('/app/api/football-team-logo/:team', async (c) => {
  try {
    const team = cleanTeamId(c.req.param('team').replace(/\.png$/i, ''));
    return getTeamLogoResponse(c.env, teamLogoKey(team));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/football-matches', async (c) => {
  try {
    await ensureFootballPredictTables(c.env);
    await lockStartedMatches(c.env);
    await expireFootballLiveQuestions(c.env);
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
    if (Date.now() >= matchStartMinuteMs(match.starts_at) || match.status !== 'open') throw new Error('This match is locked.');
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

app.post('/app/api/football-live-question-bet', async (c) => {
  let betId = '';
  try {
    await ensureFootballPredictTables(c.env);
    await expireFootballLiveQuestions(c.env);
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const questionId = cleanDbText(body.questionId, 'Missing live question id');
    const userId = cleanUserId(body.userId);
    const pick = normalizeLivePick(body.pick);
    const stakeNano = tonToNano(body.stakeTon);
    if (stakeNano <= 0) throw new Error('Enter a valid TON amount');
    const question = await c.env.DB.prepare("SELECT * FROM football_live_questions WHERE id = ? AND status = 'open' AND datetime(expires_at) > datetime('now')").bind(questionId).first<FootballLiveQuestionRow>();
    if (!question) throw new Error('This live question is closed.');
    const match = await c.env.DB.prepare("SELECT * FROM football_matches WHERE id = ? AND status != 'cancelled'").bind(question.match_id).first<FootballMatchRow>();
    if (!match) throw new Error('Match not found');
    betId = 'flqbet_' + crypto.randomUUID().replace(/-/g, '').slice(0, 21);
    const inserted = await c.env.DB.prepare(`INSERT INTO football_live_question_bets (id, question_id, match_id, user_id, pick, stake_nano, status, payout_nano, created_at)
      SELECT ?, ?, ?, ?, ?, ?, 'pending', 0, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM football_live_question_bets WHERE question_id = ? AND user_id = ? AND status != 'failed')`)
      .bind(betId, questionId, question.match_id, userId, pick, stakeNano, questionId, userId)
      .run();
    if ((inserted.meta?.changes || 0) <= 0) throw new Error('You already answered this live question.');
    await debitUserTonBalanceIfEnough(c.env, userId, stakeNano, { kind: 'predict', title: 'Football live question stake', referenceId: betId, referenceType: 'football_live_question_bet', metadata: { matchId: question.match_id, questionId, pick } });
    const active = await c.env.DB.prepare("UPDATE football_live_question_bets SET status = 'active' WHERE id = ? AND status = 'pending'").bind(betId).run();
    if ((active.meta?.changes || 0) <= 0) {
      await adjustUserTonBalance(c.env, userId, stakeNano, { kind: 'predict', title: 'Football live question rollback', referenceId: betId, referenceType: 'football_live_question_bet', metadata: { matchId: question.match_id, questionId, pick, status: 'rollback' } });
      throw new Error('Could not activate answer');
    }
    const fresh = await c.env.DB.prepare('SELECT * FROM football_matches WHERE id = ?').bind(question.match_id).first<FootballMatchRow>();
    return c.json({ ok: true, bet: await getFootballLiveQuestionBet(c.env, betId), match: fresh ? await footballMatchJson(c.env, fresh, userId) : null, userControls: await getUserControls(c.env, userId) }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    if (betId) await c.env.DB.prepare("UPDATE football_live_question_bets SET status = 'failed' WHERE id = ? AND status = 'pending'").bind(betId).run().catch(() => undefined);
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not answer live question' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function getFootballTeams(env: Env): Promise<{ teams: Array<{ id: FootballTeamId; name: string; logoUrl: string; custom: boolean }> }> {
  await ensureFootballPredictTables(env);
  const rows = (await env.DB.prepare('SELECT * FROM football_teams ORDER BY name ASC').all<FootballTeamRow>()).results || [];
  const hidden = new Set(rows.filter((row) => Number(row.custom || 0) < 0).map((row) => cleanTeamId(row.id)));
  const overrides = new Map(rows.filter((row) => Number(row.custom || 0) === 0).map((row) => [cleanTeamId(row.id), cleanTeamName(row.name)]));
  const customRows = rows.filter((row) => Number(row.custom || 0) > 0 && !FOOTBALL_TEAMS.some(([builtInId]) => builtInId === cleanTeamId(row.id)));
  const base = [
    ...FOOTBALL_TEAMS.filter(([id]) => !hidden.has(id)).map(([id, name]) => ({ id, name: overrides.get(id) || name, custom: false })),
    ...customRows.map((row) => ({ id: cleanTeamId(row.id), name: cleanTeamName(row.name), custom: true })),
  ];
  const teams = await Promise.all(base.map(async (team) => {
    const head = await env.ASSETS.head(teamLogoKey(team.id)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return { ...team, logoUrl: head ? `/app/api/football-team-logo/${team.id}.png?v=${version}` : '' };
  }));
  return { teams };
}

async function ensureFootballPredictTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS football_matches (id TEXT PRIMARY KEY, team_a_id TEXT NOT NULL, team_b_id TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT, status TEXT NOT NULL DEFAULT 'open', result TEXT, featured INTEGER NOT NULL DEFAULT 0, team_a_goals INTEGER NOT NULL DEFAULT 0, team_b_goals INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, settled_at TEXT)`).run();
  await addFootballColumnIfMissing(env, 'team_a_goals', 'INTEGER NOT NULL DEFAULT 0');
  await addFootballColumnIfMissing(env, 'team_b_goals', 'INTEGER NOT NULL DEFAULT 0');
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_matches_status_start ON football_matches(status, starts_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_matches_featured_start ON football_matches(featured, starts_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS football_bets (id TEXT PRIMARY KEY, match_id TEXT NOT NULL, user_id TEXT NOT NULL, pick TEXT NOT NULL, stake_nano INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active', payout_nano INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, settled_at TEXT)`).run();
  await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_football_bets_one_active_user_match ON football_bets(match_id, user_id) WHERE status != \'failed\'').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_bets_match ON football_bets(match_id)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_bets_user_match ON football_bets(user_id, match_id)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS football_teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, custom INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS football_live_questions (id TEXT PRIMARY KEY, match_id TEXT NOT NULL, question_text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', result TEXT, starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, settled_at TEXT)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_live_questions_match_status ON football_live_questions(match_id, status, expires_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS football_live_question_bets (id TEXT PRIMARY KEY, question_id TEXT NOT NULL, match_id TEXT NOT NULL, user_id TEXT NOT NULL, pick TEXT NOT NULL, stake_nano INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active', payout_nano INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, settled_at TEXT)`).run();
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_football_live_question_bets_one_user ON football_live_question_bets(question_id, user_id) WHERE status != 'failed'").run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_football_live_question_bets_question ON football_live_question_bets(question_id)').run();
}



async function addFootballColumnIfMissing(env: Env, name: string, definition: string): Promise<void> {
  const columns = (await env.DB.prepare('PRAGMA table_info(football_matches)').all<{ name: string }>()).results || [];
  if (!columns.some((column) => column.name === name)) await env.DB.prepare(`ALTER TABLE football_matches ADD COLUMN ${name} ${definition}`).run();
}

async function deleteFootballTeamEverywhere(env: Env, teamId: FootballTeamId): Promise<void> {
  const id = cleanTeamId(teamId);
  const matches = (await env.DB.prepare("SELECT id FROM football_matches WHERE (team_a_id = ? OR team_b_id = ?) AND status != 'cancelled'").bind(id, id).all<{ id: string }>()).results || [];
  for (const match of matches) await cancelFootballMatch(env, cleanDbText(match.id, 'Match is not ready'));
  if (FOOTBALL_TEAMS.some(([builtInId]) => builtInId === id)) {
    const name = FOOTBALL_TEAMS.find(([builtInId]) => builtInId === id)?.[1] || id;
    await env.DB.prepare(`INSERT INTO football_teams (id, name, custom, created_at, updated_at) VALUES (?, ?, -1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET custom = -1, updated_at = CURRENT_TIMESTAMP`).bind(id, name).run();
  } else {
    await env.DB.prepare('DELETE FROM football_teams WHERE id = ?').bind(id).run();
  }
  await env.ASSETS.delete(teamLogoKey(id)).catch(() => undefined);
}


async function deleteFootballMatchEverywhere(env: Env, matchId: string): Promise<void> {
  const id = cleanDbText(matchId, 'Match is not ready');
  const match = await env.DB.prepare('SELECT id FROM football_matches WHERE id = ?').bind(id).first<{ id: string }>();
  if (!match) throw new Error('Match not found');
  const questions = (await env.DB.prepare('SELECT id FROM football_live_questions WHERE match_id = ?').bind(id).all<{ id: string }>()).results || [];
  for (const question of questions) await refundFootballLiveQuestion(env, cleanDbText(question.id, 'Live question is not ready'));
  await refundFootballMatch(env, id);
  await env.DB.prepare('DELETE FROM football_live_question_bets WHERE match_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM football_live_questions WHERE match_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM football_bets WHERE match_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM football_matches WHERE id = ?').bind(id).run();
}

async function cancelFootballMatch(env: Env, matchId: string): Promise<void> {
  const questions = (await env.DB.prepare("SELECT id FROM football_live_questions WHERE match_id = ? AND status != 'deleted'").bind(matchId).all<{ id: string }>()).results || [];
  for (const question of questions) await deleteFootballLiveQuestion(env, cleanDbText(question.id, 'Live question is not ready'));
  await refundFootballMatch(env, matchId);
  await env.DB.prepare("UPDATE football_matches SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(matchId).run();
}

async function lockStartedMatches(env: Env): Promise<void> {
  await ensureFootballPredictTables(env);
  await env.DB.prepare("UPDATE football_matches SET status = 'locked', updated_at = CURRENT_TIMESTAMP WHERE status = 'open' AND datetime(strftime('%Y-%m-%dT%H:%M:00Z', starts_at)) <= datetime(strftime('%Y-%m-%dT%H:%M:00Z', 'now'))").run();
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


async function expireFootballLiveQuestions(env: Env): Promise<void> {
  await ensureFootballPredictTables(env);
  const rows = (await env.DB.prepare("SELECT id FROM football_live_questions WHERE status = 'open' AND datetime(expires_at) <= datetime('now') LIMIT 50").all<{ id: string }>()).results || [];
  for (const row of rows) await deleteFootballLiveQuestion(env, row.id);
}

async function settleFootballLiveQuestion(env: Env, questionId: string, result: FootballLivePick): Promise<void> {
  await ensureFootballPredictTables(env);
  const lock = await env.DB.prepare("UPDATE football_live_questions SET status = 'settling', result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('open', 'expired')").bind(result, questionId).run();
  if ((lock.meta?.changes || 0) <= 0) return;
  const active = (await env.DB.prepare("SELECT * FROM football_live_question_bets WHERE question_id = ? AND status = 'active'").bind(questionId).all<FootballLiveQuestionBetRow>()).results || [];
  const winnerPool = active.filter((bet) => bet.pick === result).reduce((sum, bet) => sum + Number(bet.stake_nano || 0), 0);
  if (winnerPool <= 0) {
    for (const bet of active) await payFootballLiveQuestionBet(env, bet, Number(bet.stake_nano || 0), 'refunded');
    await env.DB.prepare("UPDATE football_live_questions SET status = 'refunded', result = NULL, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(questionId).run();
    return;
  }
  const loserPool = active.filter((bet) => bet.pick !== result).reduce((sum, bet) => sum + Number(bet.stake_nano || 0), 0);
  const fee = Math.floor(loserPool * PLATFORM_FEE_BPS / 10000);
  const distributable = Math.max(0, loserPool - fee);
  for (const bet of active) {
    const stake = Number(bet.stake_nano || 0);
    if (bet.pick === result) await payFootballLiveQuestionBet(env, bet, stake + Math.floor(stake / winnerPool * distributable), 'won');
    else await env.DB.prepare("UPDATE football_live_question_bets SET status = 'lost', payout_nano = 0, settled_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").bind(cleanDbText(bet.id, 'Live question bet is not ready')).run();
  }
  await env.DB.prepare("UPDATE football_live_questions SET status = 'settled', result = ?, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(result, questionId).run();
}

async function refundFootballLiveQuestion(env: Env, questionId: string): Promise<void> {
  const lock = await env.DB.prepare("UPDATE football_live_questions SET status = 'refunding', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status NOT IN ('settled', 'refunded', 'deleted')").bind(questionId).run();
  if ((lock.meta?.changes || 0) <= 0) return;
  const bets = (await env.DB.prepare("SELECT * FROM football_live_question_bets WHERE question_id = ? AND status = 'active'").bind(questionId).all<FootballLiveQuestionBetRow>()).results || [];
  for (const bet of bets) await payFootballLiveQuestionBet(env, bet, Number(bet.stake_nano || 0), 'refunded');
  await env.DB.prepare("UPDATE football_live_questions SET status = 'refunded', result = NULL, settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(questionId).run();
}

async function deleteFootballLiveQuestion(env: Env, questionId: string): Promise<void> {
  await refundFootballLiveQuestion(env, questionId);
  await env.DB.prepare("UPDATE football_live_questions SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(questionId).run();
}

async function payFootballLiveQuestionBet(env: Env, bet: FootballLiveQuestionBetRow, payoutNano: number, status: 'won' | 'refunded'): Promise<void> {
  const betId = cleanDbText(bet.id, 'Live question bet is not ready');
  const locked = await env.DB.prepare("UPDATE football_live_question_bets SET status = ?, payout_nano = ?, settled_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").bind(status, payoutNano, betId).run();
  if ((locked.meta?.changes || 0) <= 0) return;
  const alreadyPaid = await env.DB.prepare("SELECT id FROM ton_transactions WHERE reference_type = 'football_live_question_bet' AND reference_id = ? LIMIT 1").bind(betId).first<{ id: string }>().catch(() => null);
  if (!alreadyPaid && payoutNano > 0) await adjustUserTonBalance(env, cleanUserId(bet.user_id), payoutNano, { kind: 'predict', title: status === 'won' ? 'Football live question payout' : 'Football live question refund', referenceId: betId, referenceType: 'football_live_question_bet', metadata: { matchId: bet.match_id, questionId: bet.question_id, pick: bet.pick, status } });
}

async function footballLiveQuestionsJson(env: Env, matchId: string, userId: string, includeClosed = false) {
  const cleanedUserId = cleanUserIdOptional(userId);
  const query = includeClosed
    ? "SELECT * FROM football_live_questions WHERE match_id = ? AND status != 'deleted' ORDER BY datetime(created_at) DESC LIMIT 50"
    : "SELECT * FROM football_live_questions WHERE match_id = ? AND status = 'open' AND datetime(expires_at) > datetime('now') ORDER BY datetime(expires_at) ASC, datetime(created_at) ASC LIMIT 20";
  const rows = (await env.DB.prepare(query).bind(matchId).all<FootballLiveQuestionRow>()).results || [];
  const userBets = cleanedUserId ? ((await env.DB.prepare("SELECT * FROM football_live_question_bets WHERE match_id = ? AND user_id = ? AND status != 'failed'").bind(matchId, cleanedUserId).all<FootballLiveQuestionBetRow>()).results || []) : [];
  return rows.map((row) => ({ id: String(row.id || ''), matchId: String(row.match_id || ''), question: String(row.question_text || ''), status: String(row.status || ''), result: row.result || null, startsAt: row.starts_at, expiresAt: row.expires_at, remainingMs: Math.max(0, Date.parse(row.expires_at) - Date.now()), userBet: (userBets.find((bet) => bet.question_id === row.id) || null) ? footballLiveQuestionBetJson(userBets.find((bet) => bet.question_id === row.id)!) : null }));
}

function footballLiveQuestionBetJson(bet: FootballLiveQuestionBetRow) { return { id: String(bet.id || ''), questionId: String(bet.question_id || ''), matchId: String(bet.match_id || ''), userId: String(bet.user_id || ''), pick: String(bet.pick || ''), stakeNano: Number(bet.stake_nano || 0), stakeTon: nanoToTon(Number(bet.stake_nano || 0)), status: String(bet.status || ''), payoutNano: Number(bet.payout_nano || 0), payoutTon: nanoToTon(Number(bet.payout_nano || 0)), createdAt: String(bet.created_at || ''), settledAt: bet.settled_at || null }; }
async function getFootballLiveQuestionBet(env: Env, id: string) { const bet = await env.DB.prepare('SELECT * FROM football_live_question_bets WHERE id = ?').bind(cleanDbText(id, 'Live question bet is not ready')).first<FootballLiveQuestionBetRow>(); return bet ? footballLiveQuestionBetJson(bet) : null; }

async function footballMatchJson(env: Env, row: FootballMatchRow, userId: string, includeClosedLiveQuestions = false) {
  const now = Date.now();
  const startsMs = matchStartMinuteMs(row.starts_at);
  const status = row.status === 'open' && now >= startsMs ? 'locked' : row.status;
  const pools = await footballPoolsJson(env, row.id);
  const cleanedUserId = cleanUserIdOptional(userId);
  const userBets = cleanedUserId ? ((await env.DB.prepare('SELECT * FROM football_bets WHERE match_id = ? AND user_id = ? ORDER BY datetime(created_at) DESC LIMIT 20').bind(row.id, cleanedUserId).all<FootballBetRow>()).results || []).map(footballBetJson) : [];
  const live = status === 'locked' && now >= startsMs;
  const elapsedMinutes = live ? Math.max(1, Math.floor((now - startsMs) / 60000) + 1) : 0;
  return { id: row.id, stage: 'World Cup', time: formatMatchTime(row.starts_at), teamAId: row.team_a_id, teamBId: row.team_b_id, a: row.team_a_id, b: row.team_b_id, startsAt: row.starts_at, endsAt: row.ends_at, status, result: row.result, featured: Number(row.featured || 0) === 1, teamAGoals: Number(row.team_a_goals || 0), teamBGoals: Number(row.team_b_goals || 0), scoreA: Number(row.team_a_goals || 0), scoreB: Number(row.team_b_goals || 0), isLive: live, matchMinute: elapsedMinutes, settledAt: row.settled_at, remainingMs: Math.max(0, startsMs - now), locked: status !== 'open' || now >= startsMs, pools, userBets, liveQuestions: await footballLiveQuestionsJson(env, row.id, cleanedUserId, includeClosedLiveQuestions) };
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
async function validateFootballTeam(env: Env, value: unknown): Promise<FootballTeamId> { const id = cleanTeamId(value); const row = await env.DB.prepare('SELECT id, custom FROM football_teams WHERE id = ?').bind(id).first<{ id: string; custom: number }>(); if (row && Number(row.custom || 0) < 0) throw new Error('Unknown football team'); if (FOOTBALL_TEAMS.some(([builtInId]) => builtInId === id)) return id; if (row) return id; throw new Error('Unknown football team'); }
function normalizePick(value: unknown): FootballPick { const pick = String(value || '').trim().toLowerCase(); if (pick === 'team_a' || pick === 'draw' || pick === 'team_b') return pick; throw new Error('Choose Team A, Draw or Team B'); }
function normalizeLivePick(value: unknown): FootballLivePick { const pick = String(value || '').trim().toLowerCase(); if (pick === 'yes' || pick === 'no') return pick; throw new Error('Choose Yes or No'); }
function normalizeGoals(value: unknown): number { const goals = Number(value ?? 0); if (!Number.isFinite(goals) || goals < 0 || goals > 99) throw new Error('Invalid team goals'); return Math.floor(goals); }

function normalizeMatchStatus(value: unknown): string { const status = String(value || '').trim().toLowerCase(); if (['open', 'locked', 'live', 'settled', 'refunded'].includes(status)) return status === 'live' ? 'locked' : status; throw new Error('Invalid match status'); }
function normalizeDateTime(value: unknown, message: string): string { const raw = String(value || '').trim(); const date = new Date(raw); if (!raw || Number.isNaN(date.getTime())) throw new Error(message); return date.toISOString(); }
function matchStartMinuteMs(value: string): number { const parsed = Date.parse(value); if (!Number.isFinite(parsed)) return 0; const date = new Date(parsed); date.setSeconds(0, 0); return date.getTime(); }
function formatMatchTime(value: string): string { const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function tonToNano(value: unknown): number { const n = Number(value); if (!Number.isFinite(n) || n <= 0) return 0; return Math.max(1, Math.floor(n * NANO)); }
function nanoToTon(value: number): number { return Math.floor(Number(value) || 0) / NANO; }
function cleanDbText(value: unknown, message: string): string { const text = String(value ?? '').trim(); if (!text) throw new Error(message); return text; }
function cleanTeamId(value: unknown): FootballTeamId { const id = String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 64); if (!id) throw new Error('Missing football team'); return id; }
function cleanTeamName(value: unknown): string { const name = String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 80); if (!name) throw new Error('Team name is required'); return name; }
function slugifyTeamName(value: unknown): string { return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 64); }
function cleanQuestionText(value: unknown): string { const text = String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 140); if (!text) throw new Error('Live question text is required'); return text; }
function normalizeTimerMinutes(value: unknown): number { const n = Math.floor(Number(value)); if (!Number.isFinite(n) || n <= 0) throw new Error('Timer must be at least 1 minute'); return Math.min(180, n); }
function cleanUserId(value: unknown): string { const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); if (!id) throw new Error('Missing user id'); return id; }
function cleanUserIdOptional(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80); }
function truthy(value: unknown): Promise<boolean> { return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'on'; }

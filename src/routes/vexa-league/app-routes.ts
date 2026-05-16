import app from '../../index';
import type { Env } from '../../types';

app.get('/app/api/vexa-league', async (c) => {
  await ensurePublicLeagueTables(c.env);
  const userId = cleanUserId(c.req.query('userId'));
  const week = await getCurrentWeek(c.env);
  const today = new Date().toISOString().slice(0, 10);
  const [todayMissions, weeklyPrizes, seedUsers, userState] = await Promise.all([
    getTodayMissions(c.env, week.id, today),
    getWeeklyPrizes(c.env, week.id),
    getLeaderboardUsers(c.env, week.id),
    getUserLeagueState(c.env, week.id, userId),
  ]);
  return c.json({ ok: true, currentWeek: week, todayMissions, weeklyPrizes, seedUsers, userState }, 200, { 'cache-control': 'no-store' });
});

app.post('/app/api/vexa-league/claim', async (c) => {
  await ensurePublicLeagueTables(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const userId = cleanUserId(body.userId);
  const missionId = cleanId(body.missionId, 120);
  if (!userId) return c.json({ error: 'Missing userId' }, 400, { 'cache-control': 'no-store' });
  if (!missionId) return c.json({ error: 'Missing missionId' }, 400, { 'cache-control': 'no-store' });
  const week = await getCurrentWeek(c.env);
  if (String(week.status) === 'hidden' || String(week.status) === 'ended') return c.json({ error: 'League is not active' }, 400, { 'cache-control': 'no-store' });
  const today = new Date().toISOString().slice(0, 10);
  const mission = await c.env.DB.prepare('SELECT id, template_id AS templateId, vex_amount AS vexAmount FROM vexa_league_daily_missions WHERE week_id = ? AND active_date = ? AND enabled = 1 AND id = ? LIMIT 1').bind(week.id, today, missionId).first<Record<string, unknown>>();
  if (!mission) return c.json({ error: 'Mission is not available today' }, 404, { 'cache-control': 'no-store' });
  const amount = Math.max(0, Math.floor(Number(mission.vexAmount) || 0));
  const claimId = `${week.id}:${today}:${missionId}:${userId}`;
  const existing = await c.env.DB.prepare('SELECT id FROM vexa_league_claims WHERE id = ? LIMIT 1').bind(claimId).first<{ id: string }>();
  if (!existing) {
    await c.env.DB.prepare('INSERT INTO vexa_league_claims (id, week_id, user_id, mission_id, active_date, vex_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)').bind(claimId, week.id, userId, missionId, today, amount).run();
    await c.env.DB.prepare(`INSERT INTO vexa_league_scores (user_id, week_id, vex, hidden, banned, updated_at) VALUES (?, ?, ?, 0, 0, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, week_id) DO UPDATE SET vex = vex + excluded.vex, updated_at = CURRENT_TIMESTAMP`).bind(userId, week.id, amount).run();
    await c.env.DB.prepare('INSERT INTO vexa_league_vex_events (id, week_id, user_id, amount, source, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)').bind(id('vle'), week.id, userId, amount, 'mission-claim', String(mission.templateId || missionId)).run();
  }
  return c.json({ ok: true, claimed: true, alreadyClaimed: Boolean(existing), userState: await getUserLeagueState(c.env, week.id, userId), leaderboard: await getLeaderboardUsers(c.env, week.id) }, 200, { 'cache-control': 'no-store' });
});

async function ensurePublicLeagueTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weeks (id TEXT PRIMARY KEY, title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'hidden', rewards_enabled INTEGER NOT NULL DEFAULT 0, seed_users_enabled INTEGER NOT NULL DEFAULT 1, show_prizes INTEGER NOT NULL DEFAULT 1, winner_count INTEGER NOT NULL DEFAULT 50, announcement TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_daily_missions (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, active_date TEXT NOT NULL, template_id TEXT NOT NULL, vex_amount INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weekly_prizes (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, prize_template_id TEXT NOT NULL, rank_from INTEGER NOT NULL DEFAULT 1, rank_to INTEGER NOT NULL DEFAULT 1, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_seed_users (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 999, name TEXT NOT NULL, username TEXT NOT NULL, avatar_initials TEXT NOT NULL, level INTEGER NOT NULL DEFAULT 1, rank_name TEXT NOT NULL DEFAULT 'Rookie', vex INTEGER NOT NULL DEFAULT 0, balance_ton REAL NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_scores (user_id TEXT NOT NULL, week_id TEXT NOT NULL, vex INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, banned INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, week_id))`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_claims (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, user_id TEXT NOT NULL, mission_id TEXT NOT NULL, active_date TEXT NOT NULL, vex_amount INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_vex_events (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, user_id TEXT NOT NULL, amount INTEGER NOT NULL, source TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getCurrentWeek(env: Env): Promise<Record<string, unknown> & { id: string }> {
  const row = await env.DB.prepare('SELECT id, title, starts_at AS startsAt, ends_at AS endsAt, status, rewards_enabled AS rewardsEnabled, seed_users_enabled AS seedUsersEnabled, show_prizes AS showPrizes, winner_count AS winnerCount, announcement FROM vexa_league_weeks ORDER BY created_at DESC LIMIT 1').first<Record<string, unknown> & { id: string }>();
  if (!row) return defaultWeek();
  return { ...row, rewardsEnabled: Boolean(row.rewardsEnabled), seedUsersEnabled: Boolean(row.seedUsersEnabled), showPrizes: Boolean(row.showPrizes) };
}

async function getTodayMissions(env: Env, weekId: string, activeDate: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, template_id AS templateId, vex_amount AS vexAmount, enabled FROM vexa_league_daily_missions WHERE week_id = ? AND active_date = ? AND enabled = 1 ORDER BY created_at ASC LIMIT 20').bind(weekId, activeDate).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, title: missionTitle(String(row.templateId)), description: missionDescription(String(row.templateId)) }));
}

async function getWeeklyPrizes(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, prize_template_id AS prizeTemplateId, rank_from AS rankFrom, rank_to AS rankTo, enabled FROM vexa_league_weekly_prizes WHERE week_id = ? AND enabled = 1 ORDER BY rank_from ASC LIMIT 20').bind(weekId).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, title: prizeTitle(String(row.prizeTemplateId)), description: prizeDescription(String(row.prizeTemplateId)) }));
}

async function getLeaderboardUsers(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const real = await env.DB.prepare('SELECT user_id AS userId, vex FROM vexa_league_scores WHERE week_id = ? AND hidden = 0 AND banned = 0 ORDER BY vex DESC LIMIT 50').bind(weekId).all<Record<string, unknown>>();
  const seed = await env.DB.prepare('SELECT id, position, name, username, avatar_initials AS avatarInitials, level, rank_name AS rankName, vex, balance_ton AS balanceTon, is_active AS isActive FROM vexa_league_seed_users WHERE week_id = ? AND is_active = 1 ORDER BY position ASC LIMIT 50').bind(weekId).all<Record<string, unknown>>();
  const realRows = real.results.map((row, index) => ({ position: index + 1, name: `Player ${String(row.userId || '').slice(-4) || index + 1}`, username: `user${String(row.userId || '').slice(-4) || index + 1}`, avatarInitials: 'VX', level: 1, rankName: 'Rookie', vex: Number(row.vex || 0), balanceTon: 0, isSeedUser: false }));
  const seedRows = seed.results.map((row) => ({ ...row, isActive: Boolean(row.isActive), isSeedUser: true }));
  return realRows.concat(seedRows).sort((a, b) => Number(b.vex || 0) - Number(a.vex || 0)).slice(0, 50).map((row, index) => ({ ...row, position: index + 1 }));
}

async function getUserLeagueState(env: Env, weekId: string, userId: string): Promise<Record<string, unknown>> {
  if (!userId) return { userId: '', vex: 0, claimedMissionIds: [] };
  const score = await env.DB.prepare('SELECT vex FROM vexa_league_scores WHERE week_id = ? AND user_id = ? LIMIT 1').bind(weekId, userId).first<{ vex: number }>();
  const today = new Date().toISOString().slice(0, 10);
  const claims = await env.DB.prepare('SELECT mission_id AS missionId FROM vexa_league_claims WHERE week_id = ? AND user_id = ? AND active_date = ?').bind(weekId, userId, today).all<{ missionId: string }>();
  return { userId, vex: Number(score?.vex || 0), claimedMissionIds: claims.results.map((row) => row.missionId) };
}

function defaultWeek(): Record<string, unknown> & { id: string } {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 86400000);
  return { id: 'preview', title: 'Vexa Weekly Race', startsAt: now.toISOString(), endsAt: end.toISOString(), status: 'preview', rewardsEnabled: false, seedUsersEnabled: true, showPrizes: true, winnerCount: 50, announcement: 'Weekly Vex Race is warming up.' };
}

function missionTitle(id: string): string { return titleFromId(id, 'Mission'); }
function missionDescription(id: string): string { return 'Complete this mission to earn Vex.'; }
function prizeTitle(id: string): string { return titleFromId(id, 'Prize'); }
function prizeDescription(id: string): string { return 'Weekly league reward.'; }
function titleFromId(id: string, fallback: string): string { return String(id || fallback).split('-').filter(Boolean).map((part) => part.slice(0,1).toUpperCase() + part.slice(1)).join(' ') || fallback; }
function cleanUserId(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80); }
function cleanId(value: unknown, max: number): string { return String(value ?? '').replace(/[^0-9A-Za-z:_-]/g, '').slice(0, max); }
function id(prefix: string): string { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`; }

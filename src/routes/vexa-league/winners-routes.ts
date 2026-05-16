import app from '../../index';
import type { Env } from '../../types';

app.get('/admin/api/vexa-league/winners', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureWinnerTables(c.env);
  const week = await getCurrentWeek(c.env);
  return c.json({ ok: true, week, winners: await listWinners(c.env, week.id), previousWinners: await listPreviousWinners(c.env) }, 200, { 'cache-control': 'no-store' });
});

app.post('/admin/api/vexa-league/finalize', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureWinnerTables(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const winnerCount = cleanInt(body.winnerCount, 1, 500, 50);
  const week = await getCurrentWeek(c.env);
  const rows = await c.env.DB.prepare('SELECT user_id AS userId, vex FROM vexa_league_scores WHERE week_id = ? AND hidden = 0 AND banned = 0 ORDER BY vex DESC, updated_at ASC LIMIT ?').bind(week.id, winnerCount).all<Record<string, unknown>>();
  await c.env.DB.prepare('DELETE FROM vexa_league_winners WHERE week_id = ?').bind(week.id).run();
  for (const [index, row] of rows.results.entries()) {
    const position = index + 1;
    const userId = String(row.userId || '');
    const vex = Number(row.vex || 0);
    if (!userId) continue;
    await c.env.DB.prepare('INSERT INTO vexa_league_winners (id, week_id, position, user_id, name, username, vex, prize_label, finalized_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
      .bind(id('vlwin'), week.id, position, userId, `Player ${userId.slice(-4) || position}`, `user${userId.slice(-4) || position}`, vex, await prizeLabel(c.env, week.id, position))
      .run();
  }
  await c.env.DB.prepare('UPDATE vexa_league_weeks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('ended', week.id).run();
  return c.json({ ok: true, week: await getCurrentWeek(c.env), winners: await listWinners(c.env, week.id), previousWinners: await listPreviousWinners(c.env) }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/vexa-league/winners', async (c) => {
  await ensureWinnerTables(c.env);
  return c.json({ ok: true, previousWinners: await listPreviousWinners(c.env) }, 200, { 'cache-control': 'no-store' });
});

async function ensureWinnerTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weeks (id TEXT PRIMARY KEY, title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'hidden', rewards_enabled INTEGER NOT NULL DEFAULT 0, seed_users_enabled INTEGER NOT NULL DEFAULT 1, show_prizes INTEGER NOT NULL DEFAULT 1, winner_count INTEGER NOT NULL DEFAULT 50, announcement TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_scores (user_id TEXT NOT NULL, week_id TEXT NOT NULL, vex INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, banned INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, week_id))`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weekly_prizes (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, prize_template_id TEXT NOT NULL, rank_from INTEGER NOT NULL DEFAULT 1, rank_to INTEGER NOT NULL DEFAULT 1, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_winners (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, position INTEGER NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, username TEXT NOT NULL, vex INTEGER NOT NULL DEFAULT 0, prize_label TEXT NOT NULL DEFAULT '', finalized_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getCurrentWeek(env: Env): Promise<Record<string, unknown> & { id: string; title: string }> {
  const row = await env.DB.prepare('SELECT id, title, starts_at AS startsAt, ends_at AS endsAt, status, winner_count AS winnerCount FROM vexa_league_weeks ORDER BY created_at DESC LIMIT 1').first<Record<string, unknown> & { id: string; title: string }>();
  if (row) return row;
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 86400000);
  const week = { id: id('vlw'), title: 'Vexa Weekly Race', startsAt: now.toISOString(), endsAt: end.toISOString(), status: 'hidden', winnerCount: 50 } as Record<string, unknown> & { id: string; title: string };
  await env.DB.prepare('INSERT INTO vexa_league_weeks (id, title, starts_at, ends_at, status, rewards_enabled, seed_users_enabled, show_prizes, winner_count, announcement, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, 1, 1, 50, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
    .bind(week.id, week.title, week.startsAt, week.endsAt, week.status, 'Top players win weekly rewards.')
    .run();
  return week;
}

async function prizeLabel(env: Env, weekId: string, position: number): Promise<string> {
  const row = await env.DB.prepare('SELECT prize_template_id AS prizeTemplateId FROM vexa_league_weekly_prizes WHERE week_id = ? AND enabled = 1 AND rank_from <= ? AND rank_to >= ? ORDER BY rank_from ASC LIMIT 1').bind(weekId, position, position).first<{ prizeTemplateId: string }>();
  return row ? titleFromId(row.prizeTemplateId, 'Weekly Prize') : '';
}

async function listWinners(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, week_id AS weekId, position, user_id AS userId, name, username, vex, prize_label AS prizeLabel, finalized_at AS finalizedAt FROM vexa_league_winners WHERE week_id = ? ORDER BY position ASC LIMIT 500').bind(weekId).all<Record<string, unknown>>();
  return rows.results;
}

async function listPreviousWinners(env: Env): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT w.id, w.week_id AS weekId, wk.title AS weekTitle, w.position, w.user_id AS userId, w.name, w.username, w.vex, w.prize_label AS prizeLabel, w.finalized_at AS finalizedAt FROM vexa_league_winners w LEFT JOIN vexa_league_weeks wk ON wk.id = w.week_id ORDER BY w.finalized_at DESC, w.position ASC LIMIT 100').all<Record<string, unknown>>();
  return rows.results;
}

function titleFromId(value: string, fallback: string): string { return String(value || fallback).split('-').filter(Boolean).map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(' ') || fallback; }
function cleanInt(value: unknown, min: number, max: number, fallback: number): number { const n = Math.floor(Number(value)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function id(prefix: string): string { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`; }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

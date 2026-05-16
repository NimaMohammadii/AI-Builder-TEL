import app from './index';
import type { Env } from './types';

app.get('/admin/api/vexa-league/users', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureLeagueUserTables(c.env);
  const week = await getCurrentWeek(c.env);
  return c.json({ ok: true, week, users: await listLeagueUsers(c.env, week.id) }, 200, { 'cache-control': 'no-store' });
});

app.post('/admin/api/vexa-league/users/adjust-vex', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureLeagueUserTables(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const userId = cleanUserId(body.userId);
  const delta = cleanInt(body.delta, -999999, 999999, 0);
  const reason = cleanText(body.reason, 160, 'admin-adjust');
  if (!userId) return c.json({ error: 'Missing userId' }, 400);
  const week = await getCurrentWeek(c.env);
  await c.env.DB.prepare(`INSERT INTO vexa_league_scores (user_id, week_id, vex, hidden, banned, updated_at) VALUES (?, ?, MAX(0, ?), 0, 0, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, week_id) DO UPDATE SET vex = MAX(0, vex + excluded.vex), updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, week.id, delta)
    .run();
  await c.env.DB.prepare('INSERT INTO vexa_league_vex_events (id, week_id, user_id, amount, source, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
    .bind(id('vleadj'), week.id, userId, delta, 'admin-adjust', reason)
    .run();
  return c.json({ ok: true, users: await listLeagueUsers(c.env, week.id) }, 200, { 'cache-control': 'no-store' });
});

app.post('/admin/api/vexa-league/users/moderate', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureLeagueUserTables(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const userId = cleanUserId(body.userId);
  if (!userId) return c.json({ error: 'Missing userId' }, 400);
  const hidden = truthy(body.hidden);
  const banned = truthy(body.banned);
  const week = await getCurrentWeek(c.env);
  await c.env.DB.prepare(`INSERT INTO vexa_league_scores (user_id, week_id, vex, hidden, banned, updated_at) VALUES (?, ?, 0, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, week_id) DO UPDATE SET hidden = excluded.hidden, banned = excluded.banned, updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, week.id, hidden ? 1 : 0, banned ? 1 : 0)
    .run();
  await c.env.DB.prepare('INSERT INTO vexa_league_vex_events (id, week_id, user_id, amount, source, reason, created_at) VALUES (?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP)')
    .bind(id('vlmod'), week.id, userId, 'admin-moderate', `hidden:${hidden};banned:${banned}`)
    .run();
  return c.json({ ok: true, users: await listLeagueUsers(c.env, week.id) }, 200, { 'cache-control': 'no-store' });
});

async function ensureLeagueUserTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weeks (id TEXT PRIMARY KEY, title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'hidden', rewards_enabled INTEGER NOT NULL DEFAULT 0, seed_users_enabled INTEGER NOT NULL DEFAULT 1, show_prizes INTEGER NOT NULL DEFAULT 1, winner_count INTEGER NOT NULL DEFAULT 50, announcement TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_scores (user_id TEXT NOT NULL, week_id TEXT NOT NULL, vex INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, banned INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, week_id))`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_vex_events (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, user_id TEXT NOT NULL, amount INTEGER NOT NULL, source TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getCurrentWeek(env: Env): Promise<{ id: string; title: string }> {
  const row = await env.DB.prepare('SELECT id, title FROM vexa_league_weeks ORDER BY created_at DESC LIMIT 1').first<{ id: string; title: string }>();
  if (row) return row;
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 86400000);
  const week = { id: id('vlw'), title: 'Vexa Weekly Race' };
  await env.DB.prepare('INSERT INTO vexa_league_weeks (id, title, starts_at, ends_at, status, rewards_enabled, seed_users_enabled, show_prizes, winner_count, announcement, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, 1, 1, 50, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
    .bind(week.id, week.title, now.toISOString(), end.toISOString(), 'hidden', 'Top players win weekly rewards.')
    .run();
  return week;
}

async function listLeagueUsers(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT user_id AS userId, vex, hidden, banned, updated_at AS updatedAt FROM vexa_league_scores WHERE week_id = ? ORDER BY vex DESC, updated_at DESC LIMIT 200').bind(weekId).all<Record<string, unknown>>();
  return rows.results.map((row, index) => ({
    position: index + 1,
    userId: row.userId,
    username: `user${String(row.userId || '').slice(-4) || index + 1}`,
    name: `Player ${String(row.userId || '').slice(-4) || index + 1}`,
    vex: Number(row.vex || 0),
    hidden: Boolean(row.hidden),
    banned: Boolean(row.banned),
    updatedAt: row.updatedAt,
  }));
}

function id(prefix: string): string { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`; }
function cleanUserId(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80); }
function cleanText(value: unknown, max: number, fallback: string): string { const text = String(value ?? '').trim().replace(/[<>]/g, '').slice(0, max); return text || fallback; }
function cleanInt(value: unknown, min: number, max: number, fallback: number): number { const n = Math.floor(Number(value)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function truthy(value: unknown): boolean { return value === true || value === 1 || value === '1' || value === 'true' || value === 'on'; }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

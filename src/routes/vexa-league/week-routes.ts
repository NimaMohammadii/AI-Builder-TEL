import app from '../../index';
import type { Env } from '../../types';

app.post('/admin/api/vexa-league/new-week', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureWeekTables(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const now = new Date();
  const start = cleanIso(body.startsAt) || now.toISOString();
  const end = cleanIso(body.endsAt) || new Date(now.getTime() + 7 * 86400000).toISOString();
  const title = cleanText(body.title, 90, 'Vexa Weekly Race');
  const announcement = cleanText(body.announcement, 240, 'Complete missions, earn Vex and climb the weekly race.');
  const winnerCount = cleanInt(body.winnerCount, 1, 500, 50);
  const weekId = id('vlw');
  await c.env.DB.prepare('UPDATE vexa_league_weeks SET status = CASE WHEN status = ? THEN ? ELSE status END, updated_at = CURRENT_TIMESTAMP').bind('active', 'ended').run();
  await c.env.DB.prepare('INSERT INTO vexa_league_weeks (id, title, starts_at, ends_at, status, rewards_enabled, seed_users_enabled, show_prizes, winner_count, announcement, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
    .bind(weekId, title, start, end, 'preview', truthy(body.rewardsEnabled) ? 1 : 0, body.seedUsersEnabled === false ? 0 : 1, body.showPrizes === false ? 0 : 1, winnerCount, announcement)
    .run();
  return c.json({ ok: true, week: await getWeek(c.env, weekId) }, 200, { 'cache-control': 'no-store' });
});

async function ensureWeekTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weeks (id TEXT PRIMARY KEY, title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'hidden', rewards_enabled INTEGER NOT NULL DEFAULT 0, seed_users_enabled INTEGER NOT NULL DEFAULT 1, show_prizes INTEGER NOT NULL DEFAULT 1, winner_count INTEGER NOT NULL DEFAULT 50, announcement TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getWeek(env: Env, weekId: string): Promise<Record<string, unknown> | null> {
  const row = await env.DB.prepare('SELECT id, title, starts_at AS startsAt, ends_at AS endsAt, status, rewards_enabled AS rewardsEnabled, seed_users_enabled AS seedUsersEnabled, show_prizes AS showPrizes, winner_count AS winnerCount, announcement FROM vexa_league_weeks WHERE id = ? LIMIT 1').bind(weekId).first<Record<string, unknown>>();
  return row ? { ...row, rewardsEnabled: Boolean(row.rewardsEnabled), seedUsersEnabled: Boolean(row.seedUsersEnabled), showPrizes: Boolean(row.showPrizes) } : null;
}

function id(prefix: string): string { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`; }
function cleanText(value: unknown, max: number, fallback: string): string { const text = String(value ?? '').trim().replace(/[<>]/g, '').slice(0, max); return text || fallback; }
function cleanInt(value: unknown, min: number, max: number, fallback: number): number { const n = Math.floor(Number(value)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function cleanIso(value: unknown): string { const d = new Date(String(value ?? '')); return Number.isFinite(d.getTime()) ? d.toISOString() : ''; }
function truthy(value: unknown): boolean { return value === true || value === 1 || value === '1' || value === 'true' || value === 'on'; }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

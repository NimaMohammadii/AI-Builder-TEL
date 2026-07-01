import type { Hono } from 'hono';
import { ensureLevelTables, getUserLevel, nextLevelXp } from './levels';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

export function registerAdminLevelRoutes(app: Hono<{ Bindings: Env }>): void {
  app.post('/admin/api/users/level-set', async (c) => {
    if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json().catch(() => ({})) as { userId?: unknown; level?: unknown };
      return c.json(await setUserLevel(c.env, body.userId, body.level));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not update level' }, 400);
    }
  });

  app.post('/admin/api/users/level-adjust', async (c) => {
    if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json().catch(() => ({})) as { userId?: unknown; deltaLevel?: unknown };
      const current = await getUserLevel(c.env, body.userId);
      return c.json(await setUserLevel(c.env, body.userId, current.level + cleanDelta(body.deltaLevel)));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not adjust level' }, 400);
    }
  });
}

async function setUserLevel(env: Env, userIdInput: unknown, levelInput: unknown): Promise<{ ok: true; profile: Awaited<ReturnType<typeof getUserLevel>> }> {
  const userId = cleanUserId(userIdInput);
  const level = Math.max(1, Math.min(999, Math.floor(Number(levelInput) || 1)));
  await ensureLevelTables(env);
  const totalXp = totalXpForLevel(level);
  await env.DB.prepare(`INSERT INTO user_levels (user_id, level, xp, total_xp, updated_at) VALUES (?, ?, 0, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET level = excluded.level, xp = 0, total_xp = excluded.total_xp, updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, level, totalXp)
    .run();
  return { ok: true, profile: await getUserLevel(env, userId) };
}

function totalXpForLevel(level: number): number {
  let total = 0;
  for (let current = 1; current < level; current += 1) total += nextLevelXp(current);
  return total;
}

function cleanDelta(value: unknown): number {
  const delta = Math.floor(Number(value) || 0);
  return Math.max(-100, Math.min(100, delta));
}

function cleanUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!userId) throw new Error('Missing user id');
  return userId;
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): Promise<boolean> {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

async function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<boolean> {
  return isAdminSession(c.env, c.req.header('cookie'));
}

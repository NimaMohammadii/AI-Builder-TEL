import type { Hono } from 'hono';
import { getDailyRewardsAdminPayload, getDailyRewardsPublicPayload, saveDailyRewardsSettings } from './daily-rewards-missions';
import type { Env } from './types';

export function registerDailyRewardsAdminRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/daily-rewards', async (c) => {
    return c.json(await getDailyRewardsPublicPayload(c.env), 200, { 'cache-control': 'no-store' });
  });

  app.get('/admin/api/daily-rewards/missions', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    return c.json(await getDailyRewardsAdminPayload(c.env), 200, { 'cache-control': 'no-store' });
  });

  app.post('/admin/api/daily-rewards/settings', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json();
      return c.json({ ok: true, settings: await saveDailyRewardsSettings(c.env, body) }, 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not save Daily Rewards settings' }, 400);
    }
  });
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): boolean {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean {
  return isAdmin(c.env, adminCookieValue(c.req.header('cookie')));
}

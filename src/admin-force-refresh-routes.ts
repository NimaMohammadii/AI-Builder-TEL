import type { Hono } from 'hono';
import type { Env } from './types';

const APP_CACHE_VERSION_KEY = 'admin:app-cache-version';

export function registerAdminForceRefreshRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/app-version', async (c) => {
    const version = await getAppVersion(c.env);
    return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
  });

  app.post('/admin/api/force-app-refresh', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
    const version = String(Date.now());
    await c.env.BOT_CACHE.put(APP_CACHE_VERSION_KEY, version);
    return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
  });
}

async function getAppVersion(env: Env): Promise<string> {
  const value = await env.BOT_CACHE.get(APP_CACHE_VERSION_KEY).catch(() => null);
  return value || '1';
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

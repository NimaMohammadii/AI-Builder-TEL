import app from './index';
import type { Env } from './types';

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function optionalUserId(value: unknown): string {
  return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
}

function key(userId: string): string {
  return 'admin:user-access-override:' + userId;
}

async function getAccessOverride(env: Env, userId: string): Promise<{ userId: string; trustedAccess: boolean }> {
  const id = cleanUserId(userId);
  const value = await env.BOT_CACHE.get(key(id)).catch(() => null);
  return { userId: id, trustedAccess: value === '1' };
}

async function hasAccessOverride(env: Env, userIdInput: unknown): Promise<boolean> {
  const id = optionalUserId(userIdInput);
  if (!id) return false;
  return (await env.BOT_CACHE.get(key(id)).catch(() => null)) === '1';
}

async function setAccessOverride(env: Env, userId: string, enabled: boolean): Promise<{ userId: string; trustedAccess: boolean }> {
  const id = cleanUserId(userId);
  if (enabled) await env.BOT_CACHE.put(key(id), '1');
  else await env.BOT_CACHE.delete(key(id));
  return getAccessOverride(env, id);
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, keyValue: string): boolean {
  return Boolean(env.ADMIN_KEY && keyValue && keyValue === env.ADMIN_KEY);
}

function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean {
  return isAdmin(c.env, adminCookieValue(c.req.header('cookie')));
}

app.use('/app/api/section-locks', async (c, next) => {
  if (await hasAccessOverride(c.env, c.req.query('userId'))) {
    return c.json({ sections: [] }, 200, { 'cache-control': 'no-store' });
  }
  return next();
});

app.get('/app/api/user-access-override', async (c) => {
  try {
    return c.json(await getAccessOverride(c.env, c.req.query('userId') || ''), 200, { 'cache-control': 'no-store' });
  } catch {
    return c.json({ trustedAccess: false }, 200, { 'cache-control': 'no-store' });
  }
});

app.get('/admin/api/users/access-override', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await getAccessOverride(c.env, c.req.query('userId') || ''), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load access override' }, 400);
  }
});

app.post('/admin/api/users/access-override', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = await c.req.json().catch(() => ({})) as { userId?: unknown; enabled?: unknown };
  try {
    return c.json(await setAccessOverride(c.env, String(body.userId ?? ''), Boolean(body.enabled)), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save access override' }, 400);
  }
});

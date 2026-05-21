import app from './index';
import type { Env } from './types';

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function key(userId: string): string {
  return 'admin:user-lock-bypass:' + userId;
}

async function getBypass(env: Env, userId: string): Promise<{ userId: string; bypassSectionLocks: boolean }> {
  const id = cleanUserId(userId);
  const value = await env.BOT_CACHE.get(key(id)).catch(() => null);
  return { userId: id, bypassSectionLocks: value === '1' };
}

async function setBypass(env: Env, userId: string, enabled: boolean): Promise<{ userId: string; bypassSectionLocks: boolean }> {
  const id = cleanUserId(userId);
  if (enabled) await env.BOT_CACHE.put(key(id), '1');
  else await env.BOT_CACHE.delete(key(id));
  return getBypass(env, id);
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

app.get('/app/api/user-lock-bypass', async (c) => {
  try {
    return c.json(await getBypass(c.env, c.req.query('userId') || ''));
  } catch (error) {
    return c.json({ bypassSectionLocks: false }, 200, { 'cache-control': 'no-store' });
  }
});

app.get('/admin/api/users/lock-bypass', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await getBypass(c.env, c.req.query('userId') || ''));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load bypass' }, 400);
  }
});

app.post('/admin/api/users/lock-bypass', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = await c.req.json().catch(() => ({})) as { userId?: unknown; enabled?: unknown };
  try {
    return c.json(await setBypass(c.env, String(body.userId ?? ''), Boolean(body.enabled)));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save bypass' }, 400);
  }
});

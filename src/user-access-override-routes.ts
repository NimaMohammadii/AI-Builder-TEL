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

type AccessOverrideRow = { trusted_access: number | boolean | null };

async function ensureAccessOverrideTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_user_access_overrides (
    user_id TEXT PRIMARY KEY,
    trusted_access INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function getAccessOverride(env: Env, userId: string): Promise<{ userId: string; trustedAccess: boolean }> {
  const id = cleanUserId(userId);
  await ensureAccessOverrideTable(env);
  const row = await env.DB.prepare('SELECT trusted_access FROM admin_user_access_overrides WHERE user_id = ?')
    .bind(id)
    .first<AccessOverrideRow>();
  return { userId: id, trustedAccess: row?.trusted_access === 1 || row?.trusted_access === true };
}

export async function hasAccessOverride(env: Env, userIdInput: unknown): Promise<boolean> {
  const id = optionalUserId(userIdInput);
  if (!id) return false;
  await ensureAccessOverrideTable(env);
  const row = await env.DB.prepare('SELECT trusted_access FROM admin_user_access_overrides WHERE user_id = ?')
    .bind(id)
    .first<AccessOverrideRow>();
  return row?.trusted_access === 1 || row?.trusted_access === true;
}

async function setAccessOverride(env: Env, userId: string, enabled: boolean): Promise<{ userId: string; trustedAccess: boolean }> {
  const id = cleanUserId(userId);
  await ensureAccessOverrideTable(env);
  if (enabled) {
    await env.DB.prepare(`INSERT INTO admin_user_access_overrides (user_id, trusted_access, updated_at)
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        trusted_access = 1,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(id)
      .run();
  } else {
    await env.DB.prepare('DELETE FROM admin_user_access_overrides WHERE user_id = ?').bind(id).run();
  }
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

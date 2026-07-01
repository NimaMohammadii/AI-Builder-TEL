import app from './index';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

function eventStub(env: Env): DurableObjectStub | null {
  const namespace = (env as unknown as { SECTION_LOCK_EVENTS?: DurableObjectNamespace }).SECTION_LOCK_EVENTS;
  if (!namespace) return null;
  return namespace.get(namespace.idFromName('section-lock-events'));
}

app.get('/app/api/section-lock-events', async (c) => {
  const stub = eventStub(c.env);
  if (!stub) return new Response('Section lock events unavailable', { status: 503, headers: { 'cache-control': 'no-store' } });
  return stub.fetch(c.req.raw);
});

app.post('/admin/api/section-lock-events/broadcast', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  const stub = eventStub(c.env);
  if (!stub) return c.json({ ok: false, error: 'Section lock events unavailable' }, 503, { 'cache-control': 'no-store' });
  await stub.fetch(new Request(new URL('/broadcast', c.req.url), { method: 'POST' }));
  return c.json({ ok: true }, 200, { 'cache-control': 'no-store' });
});

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

import app from './index';
import { setSectionLoadingLock } from './section-locks';
import type { Env } from './types';

const META_KEY = 'admin:section-loading-meta';

type LoadingMeta = { startedAt: string; expiresAt: string | null; durationMs: number | null };
type LoadingMetaMap = Record<string, LoadingMeta>;

function cleanSection(value: unknown): string {
  return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 40);
}

async function readMeta(env: Env): Promise<LoadingMetaMap> {
  return (await env.BOT_CACHE.get(META_KEY, 'json').catch(() => null) as LoadingMetaMap | null) || {};
}

async function writeMeta(env: Env, meta: LoadingMetaMap): Promise<void> {
  await env.BOT_CACHE.put(META_KEY, JSON.stringify(meta)).catch(() => undefined);
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

app.get('/app/api/section-loading-meta', async (c) => {
  return c.json({ items: await readMeta(c.env) }, 200, { 'cache-control': 'no-store' });
});

app.post('/admin/api/section-loading-mode', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = await c.req.json().catch(() => ({})) as { sectionId?: unknown; minutes?: unknown; expiresAt?: unknown };
  try {
    const sectionId = cleanSection(body.sectionId);
    if (!sectionId) throw new Error('Missing section id');
    const minutes = Math.max(0, Number(body.minutes || 0));
    const startedAt = new Date();
    const expiresAt = minutes > 0 ? new Date(startedAt.getTime() + minutes * 60000).toISOString() : String(body.expiresAt || '').trim() || null;
    const durationMs = expiresAt ? Math.max(1000, Date.parse(expiresAt) - startedAt.getTime()) : null;
    const [sections, meta] = await Promise.all([setSectionLoadingLock(c.env, sectionId, expiresAt), readMeta(c.env)]);
    meta[sectionId] = { startedAt: startedAt.toISOString(), expiresAt, durationMs };
    await writeMeta(c.env, meta);
    return c.json({ ...sections, loadingMeta: meta[sectionId] }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save loading mode' }, 400);
  }
});

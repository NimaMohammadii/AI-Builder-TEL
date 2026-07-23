import type { Hono } from 'hono';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

const RANKS = ['Rookie', 'Explorer', 'Pro', 'Elite', 'Master', 'Legend', 'Titan'];
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0';

export function registerRankCharacterRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/rank-character/:rank', async (c) => {
    const rank = cleanRank(c.req.param('rank'));
    if (!rank) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
    const object = await c.env.ASSETS.get(rankCharacterKey(rank)).catch(() => null);
    if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
    return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': CACHE_CONTROL } });
  });

  app.post('/admin/api/upload-rank-character', async (c) => {
    if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const form = await c.req.formData();
      const rank = cleanRank(form.get('rank'));
      const file = form.get('image');
      if (!rank) return c.json({ error: 'Invalid rank.' }, 400);
      if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
      if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
      const version = String(Date.now());
      await c.env.ASSETS.put(rankCharacterKey(rank), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
      return c.json({ ok: true, rank, url: `/app/api/rank-character/${rank}.png?v=${version}` });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not upload rank character' }, 400);
    }
  });
}

function rankCharacterKey(rank: string): string {
  return `rank-character/${rank}`;
}

function cleanRank(value: unknown): string {
  const raw = String(value || '').replace(/\.png$/i, '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 40);
  return RANKS.includes(raw) ? raw : '';
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

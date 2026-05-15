import type { Hono } from 'hono';
import { registerAdminLevelRoutes } from './admin-level-routes';
import type { Env } from './types';

const RANKS = ['Rookie', 'Explorer', 'Pro', 'Elite', 'Master', 'Legend', 'Titan'];
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0';

export function registerRankCharacterRoutes(app: Hono<{ Bindings: Env }>): void {
  registerAdminLevelRoutes(app);

  app.get('/app/api/rank-character/:rank', async (c) => {
    const rank = cleanRank(c.req.param('rank')) || 'Rookie';
    const object = await c.env.ASSETS.get(rankCharacterKey(rank)).catch(() => null);
    if (!object) return fallbackRankImage(rank);
    return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': CACHE_CONTROL } });
  });

  app.post('/admin/api/upload-rank-character', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
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

function fallbackRankImage(rank: string): Response {
  const safeRank = cleanRank(rank) || 'Rookie';
  const initial = safeRank.slice(0, 1).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><radialGradient id="g" cx="35%" cy="20%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.42"/><stop offset="0.42" stop-color="#c03a5b" stop-opacity="0.32"/><stop offset="1" stop-color="#050507"/></radialGradient><filter id="s"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity="0.55"/></filter></defs><rect width="128" height="128" rx="38" fill="url(#g)"/><circle cx="64" cy="56" r="31" fill="#07070a" filter="url(#s)"/><rect x="39" y="44" width="50" height="30" rx="15" fill="#0f1014" stroke="rgba(255,255,255,.42)"/><circle cx="54" cy="59" r="4" fill="#fff"/><circle cx="74" cy="59" r="4" fill="#fff"/><path d="M42 92c8-12 36-12 44 0" fill="none" stroke="#fff" stroke-opacity=".74" stroke-width="6" stroke-linecap="round"/><text x="64" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#fff">${initial}</text></svg>`;
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': CACHE_CONTROL } });
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

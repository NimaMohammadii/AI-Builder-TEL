import type { Hono } from 'hono';
import type { Env } from './types';

const TOP_PLAYERS_HERO_IMAGE_KEY = 'top-players/hero-image';
const TOP_PLAYERS_IMAGE_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0';
const TOP_PLAYERS_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function registerTopPlayersImageRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/top-players-hero-image.png', async (c) => imageFromR2(c.env));
  app.post('/admin/api/upload-top-players-hero-image', async (c) => uploadImage(c));
}

async function imageFromR2(env: Env): Promise<Response> {
  const object = await env.ASSETS.get(TOP_PLAYERS_HERO_IMAGE_KEY).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': TOP_PLAYERS_IMAGE_CACHE_CONTROL } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': TOP_PLAYERS_IMAGE_CACHE_CONTROL,
    },
  });
}

async function uploadImage(c: { env: Env; req: { formData: () => Promise<FormData>; header: (name: string) => string | undefined }; json: (data: unknown, status?: number) => Response }): Promise<Response> {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!TOP_PLAYERS_IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(TOP_PLAYERS_HERO_IMAGE_KEY, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { version },
    });
    return c.json({ ok: true, url: `/app/api/top-players-hero-image.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Top Players image' }, 400);
  }
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

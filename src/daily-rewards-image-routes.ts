import type { Hono } from 'hono';
import type { Env } from './types';

const DAILY_REWARDS_HERO_IMAGE_KEY = 'daily-rewards/hero-image';
const DAILY_REWARDS_BOTTOM_IMAGE_KEY = 'daily-rewards/bottom-image';
const DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY = 'daily-rewards/day-future-image';
const DAILY_REWARDS_DAY_TODAY_IMAGE_KEY = 'daily-rewards/day-today-image';
const DAILY_REWARDS_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const DAILY_REWARDS_EMPTY_CACHE_CONTROL = 'public, max-age=60';
const DAILY_REWARDS_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function registerDailyRewardsImageRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/daily-rewards-hero-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_HERO_IMAGE_KEY));
  app.get('/app/api/daily-rewards-bottom-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_BOTTOM_IMAGE_KEY));
  app.get('/app/api/daily-rewards-day-future-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY));
  app.get('/app/api/daily-rewards-day-today-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY));

  app.post('/admin/api/upload-daily-rewards-hero-image', async (c) => uploadImage(c, DAILY_REWARDS_HERO_IMAGE_KEY, '/app/api/daily-rewards-hero-image.png', 'Daily Rewards image'));
  app.post('/admin/api/upload-daily-rewards-bottom-image', async (c) => uploadImage(c, DAILY_REWARDS_BOTTOM_IMAGE_KEY, '/app/api/daily-rewards-bottom-image.png', 'Daily Rewards bottom image'));
  app.post('/admin/api/upload-daily-rewards-day-future-image', async (c) => uploadImage(c, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY, '/app/api/daily-rewards-day-future-image.png', 'Daily Rewards future day image'));
  app.post('/admin/api/upload-daily-rewards-day-today-image', async (c) => uploadImage(c, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY, '/app/api/daily-rewards-day-today-image.png', 'Daily Rewards today image'));
}

async function imageFromR2(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': DAILY_REWARDS_EMPTY_CACHE_CONTROL } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': DAILY_REWARDS_IMAGE_CACHE_CONTROL,
    },
  });
}

async function uploadImage(c: { env: Env; req: { formData: () => Promise<FormData>; header: (name: string) => string | undefined }; json: (data: unknown, status?: number) => Response }, key: string, publicUrl: string, label: string): Promise<Response> {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!DAILY_REWARDS_IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { version },
    });
    return c.json({ ok: true, url: `${publicUrl}?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : `Could not upload ${label}` }, 400);
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

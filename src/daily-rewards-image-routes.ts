import type { Hono } from 'hono';
import type { Env } from './types';

const DAILY_REWARDS_HERO_IMAGE_KEY = 'daily-rewards/hero-image';
const DAILY_REWARDS_BOTTOM_IMAGE_KEY = 'daily-rewards/bottom-image';
const DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY = 'daily-rewards/day-future-image';
const DAILY_REWARDS_DAY_TODAY_IMAGE_KEY = 'daily-rewards/day-today-image';
const DAILY_REWARDS_DAY_IMAGE_KEY_PREFIX = 'daily-rewards/day-image-';
const DAILY_REWARDS_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL = 'no-store';
const DAILY_REWARDS_EMPTY_CACHE_CONTROL = 'public, max-age=60';
const DAILY_REWARDS_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function registerDailyRewardsImageRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/daily-rewards-hero-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_HERO_IMAGE_KEY));
  app.get('/app/api/daily-rewards-bottom-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_BOTTOM_IMAGE_KEY));
  app.get('/app/api/daily-rewards-day-future-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY, DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL));
  app.get('/app/api/daily-rewards-day-today-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY, DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL));
  app.get('/app/api/daily-rewards-day-image/:day', async (c) => {
    const day = dayFromParam(c.req.param('day'));
    if (day === null) return new Response('', { status: 404, headers: { 'cache-control': DAILY_REWARDS_EMPTY_CACHE_CONTROL } });
    return imageFromR2(c.env, dayImageKey(day), DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL);
  });

  app.post('/admin/api/upload-daily-rewards-hero-image', async (c) => uploadImage(c, DAILY_REWARDS_HERO_IMAGE_KEY, '/app/api/daily-rewards-hero-image.png', 'Daily Rewards image'));
  app.post('/admin/api/upload-daily-rewards-bottom-image', async (c) => uploadImage(c, DAILY_REWARDS_BOTTOM_IMAGE_KEY, '/app/api/daily-rewards-bottom-image.png', 'Daily Rewards bottom image'));
  app.post('/admin/api/upload-daily-rewards-day-future-image', async (c) => uploadImage(c, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY, '/app/api/daily-rewards-day-future-image.png', 'Daily Rewards future day image'));
  app.post('/admin/api/upload-daily-rewards-day-today-image', async (c) => uploadImage(c, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY, '/app/api/daily-rewards-day-today-image.png', 'Daily Rewards today image'));
  app.post('/admin/api/upload-daily-rewards-day-image/:day', async (c) => {
    const day = dayFromParam(c.req.param('day'));
    if (day === null) return c.json({ error: 'Choose a day from 1 to 7.' }, 400);
    return uploadImage(c, dayImageKey(day), `/app/api/daily-rewards-day-image/${day}`, `Daily Rewards Day ${day + 1} image`);
  });
  app.post('/admin/api/delete-daily-rewards-day-future-image', async (c) => deleteImage(c, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY, 'Daily Rewards future day image'));
  app.post('/admin/api/delete-daily-rewards-day-today-image', async (c) => deleteImage(c, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY, 'Daily Rewards today image'));
  app.post('/admin/api/delete-daily-rewards-day-image/:day', async (c) => {
    const day = dayFromParam(c.req.param('day'));
    if (day === null) return c.json({ error: 'Choose a day from 1 to 7.' }, 400);
    return deleteImage(c, dayImageKey(day), `Daily Rewards Day ${day + 1} image`);
  });
}

function dayImageKey(day: number): string {
  return `${DAILY_REWARDS_DAY_IMAGE_KEY_PREFIX}${day}`;
}

function dayFromParam(value: string | undefined): number | null {
  const day = Math.floor(Number(value));
  return Number.isFinite(day) && day >= 0 && day <= 6 ? day : null;
}

async function imageFromR2(env: Env, key: string, cacheControl = DAILY_REWARDS_IMAGE_CACHE_CONTROL): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': cacheControl === DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL ? DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL : DAILY_REWARDS_EMPTY_CACHE_CONTROL } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': cacheControl,
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

async function deleteImage(c: { env: Env; req: { header: (name: string) => string | undefined }; json: (data: unknown, status?: number) => Response }, key: string, label: string): Promise<Response> {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    await c.env.ASSETS.delete(key);
    return c.json({ ok: true, deleted: true });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : `Could not delete ${label}` }, 400);
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

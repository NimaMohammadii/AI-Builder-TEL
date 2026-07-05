import type { Hono } from 'hono';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

const DAILY_REWARDS_HERO_IMAGE_KEY = 'daily-rewards/hero-image';
const DAILY_REWARDS_BOTTOM_IMAGE_KEY = 'daily-rewards/bottom-image';
const DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY = 'daily-rewards/day-future-image';
const DAILY_REWARDS_DAY_TODAY_IMAGE_KEY = 'daily-rewards/day-today-image';
const DAILY_REWARDS_DAY_IMAGE_KEY_PREFIX = 'daily-rewards/day-image-';
const DAILY_REWARDS_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const DAILY_REWARDS_EMPTY_CACHE_CONTROL = 'public, max-age=60';
const DAILY_REWARDS_MAX_IMAGE_BYTES = 5_000_000;
const DAILY_REWARDS_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

type UploadableFile = {
  name?: string;
  type?: string;
  size?: number;
  arrayBuffer?: () => Promise<ArrayBuffer>;
};

export function registerDailyRewardsImageRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/daily-rewards-hero-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_HERO_IMAGE_KEY, 'no-store'));
  app.get('/app/api/daily-rewards-bottom-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_BOTTOM_IMAGE_KEY));
  app.get('/app/api/daily-rewards-day-future-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY, DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL));
  app.get('/app/api/daily-rewards-day-today-image.png', async (c) => imageFromR2(c.env, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY, DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL));
  app.get('/app/api/daily-rewards-day-image/:day', async (c) => {
    const day = dayFromParam(c.req.param('day'));
    if (day === null) return new Response('', { status: 404, headers: { 'cache-control': DAILY_REWARDS_EMPTY_CACHE_CONTROL } });
    return imageFromR2(c.env, dayImageKey(day), DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL);
  });
  app.get('/app/api/daily-rewards-day-image-version/:day', async (c) => {
    const day = dayFromParam(c.req.param('day'));
    if (day === null) return c.json({ version: 'missing' }, 404, { 'cache-control': 'no-store' });
    const version = await imageVersionFromR2(c.env, dayImageKey(day));
    return c.json({ version }, 200, { 'cache-control': 'no-store' });
  });

  app.post('/admin/api/upload-daily-rewards-hero-image', async (c) => uploadImage(c, DAILY_REWARDS_HERO_IMAGE_KEY, '/app/api/daily-rewards-hero-image.png', 'Daily Rewards image'));
  app.post('/admin/api/upload-daily-rewards-bottom-image', async (c) => uploadImage(c, DAILY_REWARDS_BOTTOM_IMAGE_KEY, '/app/api/daily-rewards-bottom-image.png', 'Daily Rewards bottom image'));
  app.post('/admin/api/upload-daily-rewards-day-future-image', async (c) => uploadImage(c, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY, '/app/api/daily-rewards-day-future-image.png', 'Daily Rewards future day image'));
  app.post('/admin/api/upload-daily-rewards-day-today-image', async (c) => uploadImage(c, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY, '/app/api/daily-rewards-day-today-image.png', 'Daily Rewards today image'));
  app.post('/admin/api/upload-daily-rewards-day-image/:day', async (c) => {
    const day = dayFromParam(c.req.param('day'));
    if (day === null) return c.json({ error: 'Choose a day from 1 to 7.' }, 400, { 'cache-control': 'no-store' });
    return uploadImage(c, dayImageKey(day), `/app/api/daily-rewards-day-image/${day}`, `Daily Rewards Day ${day + 1} image`);
  });
  app.post('/admin/api/delete-daily-rewards-day-future-image', async (c) => deleteImage(c, DAILY_REWARDS_DAY_FUTURE_IMAGE_KEY, 'Daily Rewards future day image'));
  app.post('/admin/api/delete-daily-rewards-day-today-image', async (c) => deleteImage(c, DAILY_REWARDS_DAY_TODAY_IMAGE_KEY, 'Daily Rewards today image'));
  app.post('/admin/api/delete-daily-rewards-day-image/:day', async (c) => {
    const day = dayFromParam(c.req.param('day'));
    if (day === null) return c.json({ error: 'Choose a day from 1 to 7.' }, 400, { 'cache-control': 'no-store' });
    return deleteImage(c, dayImageKey(day), `Daily Rewards Day ${day + 1} image`);
  });
}

function dayImageKey(day: number): string {
  return `${DAILY_REWARDS_DAY_IMAGE_KEY_PREFIX}${day}`;
}

function dayFromParam(value: string | undefined): number | null {
  if (value === undefined || value === null || value === '') return null;
  const clean = String(value).replace(/\.png$/i, '');
  if (!/^\d+$/.test(clean)) return null;
  const day = Number(clean);
  return day >= 0 && day <= 6 ? day : null;
}

async function imageVersionFromR2(env: Env, key: string): Promise<string> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return 'missing';
  return String(object.customMetadata?.version || object.uploaded?.getTime?.() || Date.now());
}

async function imageFromR2(env: Env, key: string, cacheControl = DAILY_REWARDS_IMAGE_CACHE_CONTROL): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('', { status: 404, headers: { 'cache-control': cacheControl === DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL ? DAILY_REWARDS_DAY_IMAGE_CACHE_CONTROL : DAILY_REWARDS_EMPTY_CACHE_CONTROL } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': cacheControl,
    },
  });
}

async function uploadImage(c: { env: Env; req: { formData: () => Promise<FormData>; header: (name: string) => string | undefined }; json: (data: unknown, status?: number, headers?: Record<string, string>) => Response }, key: string, publicUrl: string, label: string): Promise<Response> {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const value = firstUploadableFile(form);
    if (!value) return c.json({ error: 'Choose an image file.' }, 400, { 'cache-control': 'no-store' });
    const type = normalizeImageType(value.type, value.name);
    if (!DAILY_REWARDS_IMAGE_TYPES.has(type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400, { 'cache-control': 'no-store' });
    const size = Math.floor(Number(value.size) || 0);
    if (size <= 0) return c.json({ error: 'Choose a non-empty image file.' }, 400, { 'cache-control': 'no-store' });
    if (size > DAILY_REWARDS_MAX_IMAGE_BYTES) return c.json({ error: 'Image must be under 5MB.' }, 413, { 'cache-control': 'no-store' });
    const version = String(Date.now());
    const body = await value.arrayBuffer!();
    await c.env.ASSETS.put(key, body, {
      httpMetadata: { contentType: type },
      customMetadata: { version },
    });
    return c.json({ ok: true, label, size, type, version, url: `${publicUrl}?v=${version}` }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : `Could not upload ${label}` }, 400, { 'cache-control': 'no-store' });
  }
}

async function deleteImage(c: { env: Env; req: { header: (name: string) => string | undefined }; json: (data: unknown, status?: number, headers?: Record<string, string>) => Response }, key: string, label: string): Promise<Response> {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    await c.env.ASSETS.delete(key);
    return c.json({ ok: true, deleted: true, label }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : `Could not delete ${label}` }, 400, { 'cache-control': 'no-store' });
  }
}

function firstUploadableFile(form: FormData): UploadableFile | null {
  const value = form.get('image') as UploadableFile | null;
  return isUploadableFile(value) ? value : null;
}

function isUploadableFile(value: UploadableFile | null): value is UploadableFile {
  return Boolean(value && typeof value === 'object' && typeof value.arrayBuffer === 'function');
}

function normalizeImageType(type: string | undefined, name: string | undefined): string {
  const clean = String(type || '').split(';')[0]!.trim().toLowerCase();
  if (clean === 'image/jpg') return 'image/jpeg';
  if (clean) return clean;
  const ext = String(name || '').split('.').pop()?.toLowerCase() || '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  return '';
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

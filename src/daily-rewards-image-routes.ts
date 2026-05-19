import type { Hono } from 'hono';
import type { Env } from './types';

const DAILY_REWARDS_HERO_IMAGE_KEY = 'daily-rewards/hero-image';
const DAILY_REWARDS_IMAGE_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0';
const DAILY_REWARDS_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function registerDailyRewardsImageRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/daily-rewards-hero-image.png', async (c) => {
    const object = await c.env.ASSETS.get(DAILY_REWARDS_HERO_IMAGE_KEY).catch(() => null);
    if (!object) return new Response('', { status: 204, headers: { 'cache-control': DAILY_REWARDS_IMAGE_CACHE_CONTROL } });
    return new Response(object.body, {
      headers: {
        'content-type': object.httpMetadata?.contentType || 'image/png',
        'cache-control': DAILY_REWARDS_IMAGE_CACHE_CONTROL,
      },
    });
  });

  app.post('/admin/api/upload-daily-rewards-hero-image', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const form = await c.req.formData();
      const file = form.get('image');
      if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
      if (!DAILY_REWARDS_IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
      if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
      const version = String(Date.now());
      await c.env.ASSETS.put(DAILY_REWARDS_HERO_IMAGE_KEY, file.stream(), {
        httpMetadata: { contentType: file.type },
        customMetadata: { version },
      });
      return c.json({ ok: true, url: `/app/api/daily-rewards-hero-image.png?v=${version}` });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not upload Daily Rewards image' }, 400);
    }
  });
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

import type { Env } from './types';

type AppLike = {
  get: (path: string, handler: (c: HandlerContext) => Promise<Response> | Response) => unknown;
  post: (path: string, handler: (c: HandlerContext) => Promise<Response> | Response) => unknown;
};

type HandlerContext = {
  env: Env;
  req: {
    formData: () => Promise<FormData>;
    header: (name: string) => string | undefined;
  };
  json: (data: Record<string, unknown>, status?: number) => Response;
};

const HOME_FINANCE_IMAGE_KEY = 'home-finance/image';
const HOME_INTRO_IMAGE_KEY = 'home-intro/image';
const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function registerHomeImageCacheEndpoint(app: AppLike): void {
  app.get('/app/api/home-finance-image-cached.png', async (c) => cachedImageResponse(c.env, HOME_FINANCE_IMAGE_KEY));
  app.get('/app/api/home-intro-image-cached.png', async (c) => cachedImageResponse(c.env, HOME_INTRO_IMAGE_KEY));
  app.get('/app/api/home-intro-image-meta', async (c) => imageMetaResponse(c.env, HOME_INTRO_IMAGE_KEY, '/app/api/home-intro-image-cached.png'));
  app.post('/admin/api/upload-home-intro-image', async (c) => uploadImage(c, HOME_INTRO_IMAGE_KEY, '/app/api/home-intro-image-cached.png', 'Home intro image'));
}

async function cachedImageResponse(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': CACHE_CONTROL,
    },
  });
}

async function imageMetaResponse(env: Env, key: string, path: string): Promise<Response> {
  const object = await env.ASSETS.head(key).catch(() => null);
  const version = object?.customMetadata?.version || object?.uploaded?.getTime?.() || 'default';
  return Response.json({ ok: true, version: String(version), url: `${path}?v=${encodeURIComponent(String(version))}` }, {
    headers: { 'cache-control': 'private, max-age=300' },
  });
}

async function uploadImage(c: HandlerContext, key: string, path: string, label: string): Promise<Response> {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: `${path}?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : `Could not upload ${label}` }, 400);
  }
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(c: HandlerContext, key: string): boolean {
  return Boolean(c.env.ADMIN_KEY && key && key === c.env.ADMIN_KEY);
}

function isAdminRequest(c: HandlerContext): boolean {
  return isAdmin(c, adminCookieValue(c.req.header('cookie')));
}

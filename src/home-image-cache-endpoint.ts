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
const FALLBACK_CACHE_CONTROL = 'public, max-age=300';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

const FALLBACK_IMAGES: Record<string, string> = {
  [HOME_INTRO_IMAGE_KEY]: fallbackSvg('Vexa Flow', 'Play, predict and manage TON in one place'),
  [HOME_FINANCE_IMAGE_KEY]: fallbackSvg('TON Balance', 'Deposit, withdraw and track your rewards'),
};

export function registerHomeImageCacheEndpoint(app: AppLike): void {
  app.get('/app/api/home-finance-image-cached.png', async (c) => cachedImageResponse(c.env, HOME_FINANCE_IMAGE_KEY));
  app.get('/app/api/home-intro-image-cached.png', async (c) => cachedImageResponse(c.env, HOME_INTRO_IMAGE_KEY));
  app.get('/app/api/home-intro-image-meta', async (c) => imageMetaResponse(c.env, HOME_INTRO_IMAGE_KEY, '/app/api/home-intro-image-cached.png'));
  app.post('/admin/api/upload-home-intro-image', async (c) => uploadImage(c, HOME_INTRO_IMAGE_KEY, '/app/api/home-intro-image-cached.png', 'Home intro image'));
}

async function cachedImageResponse(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) {
    return new Response(FALLBACK_IMAGES[key] ?? fallbackSvg('Vexa', 'Image not configured yet'), {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': FALLBACK_CACHE_CONTROL,
      },
    });
  }
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
    const version = String(Date.now());
    await c.env.ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: `${path}?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : `Could not upload ${label}` }, 400);
  }
}

function fallbackSvg(title: string, subtitle: string): string {
  const safeTitle = escapeSvg(title);
  const safeSubtitle = escapeSvg(subtitle);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" role="img" aria-label="${safeTitle}">
  <defs>
    <radialGradient id="g1" cx="22%" cy="8%" r="72%"><stop offset="0" stop-color="#8c1d3b" stop-opacity="0.95"/><stop offset="0.46" stop-color="#2b0712" stop-opacity="0.72"/><stop offset="1" stop-color="#060507"/></radialGradient>
    <radialGradient id="g2" cx="88%" cy="28%" r="54%"><stop offset="0" stop-color="#ff5b8a" stop-opacity="0.34"/><stop offset="0.58" stop-color="#7e1430" stop-opacity="0.15"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>
    <linearGradient id="card" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ffffff" stop-opacity="0.16"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.035"/></linearGradient>
  </defs>
  <rect width="1200" height="500" rx="54" fill="url(#g1)"/>
  <rect width="1200" height="500" rx="54" fill="url(#g2)"/>
  <g opacity="0.8" fill="none" stroke="#fff" stroke-opacity="0.13" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M924 88l54 27 54-27-54-27-54 27z"/>
    <path d="M975 338c42-50 42-101 0-151-42 50-42 101 0 151z"/>
    <circle cx="172" cy="352" r="58"/>
    <path d="M112 352h120M172 292v120"/>
    <path d="M662 118l42 42 42-42"/>
  </g>
  <rect x="72" y="68" width="1056" height="364" rx="46" fill="url(#card)" stroke="#fff" stroke-opacity="0.13"/>
  <circle cx="955" cy="250" r="106" fill="#7e1430" fill-opacity="0.22"/>
  <path d="M932 165h92l-46 132-46-132z" fill="#fff" fill-opacity="0.92"/>
  <path d="M948 183h60l-30 86-30-86z" fill="#0096ff" fill-opacity="0.62"/>
  <text x="126" y="232" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="68" font-weight="800" letter-spacing="-3">${safeTitle}</text>
  <text x="130" y="294" fill="#fff" fill-opacity="0.68" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="600">${safeSubtitle}</text>
  <rect x="130" y="330" width="224" height="54" rx="27" fill="#fff" fill-opacity="0.92"/>
  <text x="162" y="366" fill="#21050d" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="800">Vexa Game</text>
</svg>`;
}

function escapeSvg(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

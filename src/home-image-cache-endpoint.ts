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

const HOME_INTRO_IMAGE_KEY = 'home-intro/image';
const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const FALLBACK_CACHE_CONTROL = 'public, max-age=300';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function registerHomeImageCacheEndpoint(app: AppLike): void {
  app.get('/app/api/home-intro-image.png', async (c) => homeIntroImageResponse(c.env));
  app.get('/app/api/home-intro-image-meta', async (c) => homeIntroImageMetaResponse(c.env));
}

async function homeIntroImageMetaResponse(env: Env): Promise<Response> {
  const object = await env.ASSETS.head(HOME_INTRO_IMAGE_KEY).catch(() => null);
  const version = assetVersion(object);
  return new Response(JSON.stringify({ ok: true, version, url: `/app/api/home-intro-image.png?v=${encodeURIComponent(version)}` }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

async function homeIntroImageResponse(env: Env): Promise<Response> {
  const object = await env.ASSETS.get(HOME_INTRO_IMAGE_KEY).catch(() => null);
  if (!object) {
    return new Response(fallbackSvg(), {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': FALLBACK_CACHE_CONTROL,
      },
    });
  }
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': IMAGE_CACHE_CONTROL,
    },
  });
}

function pickImageFile(form: FormData): File | null {
  for (const name of ['image', 'file', 'icon', 'upload']) {
    const item = form.get(name);
    if (item instanceof File) return item;
  }
  for (const item of form.values()) {
    if (item instanceof File) return item;
  }
  return null;
}

function assetVersion(object: { customMetadata?: Record<string, string>; uploaded?: Date } | null): string {
  return String(object?.customMetadata?.version || object?.customMetadata?.uploadedAt || object?.uploaded?.getTime?.() || 'default');
}

function fallbackSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" role="img" aria-label="Vexa Flow">
  <defs>
    <radialGradient id="g1" cx="22%" cy="8%" r="72%"><stop offset="0" stop-color="#8c1d3b" stop-opacity="0.95"/><stop offset="0.46" stop-color="#2b0712" stop-opacity="0.72"/><stop offset="1" stop-color="#060507"/></radialGradient>
    <radialGradient id="g2" cx="88%" cy="28%" r="54%"><stop offset="0" stop-color="#ff5b8a" stop-opacity="0.34"/><stop offset="0.58" stop-color="#7e1430" stop-opacity="0.15"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>
    <linearGradient id="card" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ffffff" stop-opacity="0.16"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.035"/></linearGradient>
  </defs>
  <rect width="1200" height="500" rx="54" fill="url(#g1)"/>
  <rect width="1200" height="500" rx="54" fill="url(#g2)"/>
  <rect x="72" y="68" width="1056" height="364" rx="46" fill="url(#card)" stroke="#fff" stroke-opacity="0.13"/>
  <circle cx="955" cy="250" r="106" fill="#7e1430" fill-opacity="0.22"/>
  <path d="M932 165h92l-46 132-46-132z" fill="#fff" fill-opacity="0.92"/>
  <path d="M948 183h60l-30 86-30-86z" fill="#0096ff" fill-opacity="0.62"/>
  <text x="126" y="232" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="68" font-weight="800" letter-spacing="-3">Vexa Flow</text>
  <text x="130" y="294" fill="#fff" fill-opacity="0.68" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="600">Play, predict and manage TON in one place</text>
  <rect x="130" y="330" width="224" height="54" rx="27" fill="#fff" fill-opacity="0.92"/>
  <text x="162" y="366" fill="#21050d" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="800">Vexa Game</text>
</svg>`;
}

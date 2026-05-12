import type { Env } from './types';

type AppLike = {
  get: (path: string, handler: (c: HandlerContext) => Promise<Response> | Response) => unknown;
};

type HandlerContext = { env: Env };

const HOME_FINANCE_IMAGE_KEY = 'home-finance/image';
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

export function registerHomeImageCacheEndpoint(app: AppLike): void {
  app.get('/app/api/home-finance-image-cached.png', async (c) => {
    const object = await c.env.ASSETS.get(HOME_FINANCE_IMAGE_KEY).catch(() => null);
    if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
    return new Response(object.body, {
      headers: {
        'content-type': object.httpMetadata?.contentType || 'image/png',
        'cache-control': CACHE_CONTROL,
      },
    });
  });
}

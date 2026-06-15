import app from './index';
import type { Env } from './types';

const HOME_LOWER_ASSET_KEY = 'home-lower/asset';
const HOME_LOWER_ASSET_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const HOME_LOWER_ASSET_CACHE = 'public, max-age=31536000, immutable';

app.get('/app/api/home-lower-asset.png', async (c) => assetResponse(c.env));

app.post('/admin/api/home-lower-asset', async (c) => {
  if (!isPanelRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!HOME_LOWER_ASSET_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(HOME_LOWER_ASSET_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: `/app/api/home-lower-asset.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save image' }, 400);
  }
});

async function assetResponse(env: Env): Promise<Response> {
  const object = await env.ASSETS.get(HOME_LOWER_ASSET_KEY).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': HOME_LOWER_ASSET_CACHE } });
}

function isPanelRequest(c: { req: { header(name: string): string | undefined }; env: Env }): boolean {
  const cookie = c.req.header('Cookie') || '';
  return cookie.includes('admin_session=ok') || cookie.includes('admin=1');
}

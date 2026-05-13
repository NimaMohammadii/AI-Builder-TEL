import app from './index';
import { getMarketItems, MARKET_IMAGE_TYPES, marketImageKey, normalizeMarketItemId, setMarketItem } from './market-config';
import type { Env } from './types';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';

app.get('/app/api/market-items', async (c) => c.json(await getMarketItems(c.env), 200, { 'cache-control': CACHE_NONE }));

app.get('/app/api/market-item-image/:item', async (c) => {
  try {
    const id = normalizeMarketItemId(c.req.param('item').replace(/\.png$/i, ''));
    return getMarketAsset(c.env, marketImageKey(id));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.get('/admin/api/market-items', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getMarketItems(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/market-items', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  try {
    const id = normalizeMarketItemId(String(body.id || ''));
    return c.json(await setMarketItem(c.env, id, { title: String(body.title || ''), price: String(body.price || ''), stock: String(body.stock || '') }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save market item' }, 400);
  }
});

app.post('/admin/api/market-item-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const id = normalizeMarketItemId(String(form.get('id') || ''));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!MARKET_IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(marketImageKey(id), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json(await getMarketItems(c.env));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload market image' }, 400);
  }
});

async function getMarketAsset(env: Env, key: string): Promise<Response> {
  const head = await env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || head.httpMetadata?.contentType || 'image/png', 'cache-control': CACHE_LONG } });
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

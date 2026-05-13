import app from './index';
import { getMarketItems, isAllowedMarketMedia, marketContentType, marketImageKey, normalizeMarketItemId, setMarketItem } from './market-config';
import type { Env } from './types';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const MARKET_UPLOAD_MAX_BYTES = 25_000_000;

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
    return c.json(await setMarketItem(c.env, id, { title: String(body.title || ''), price: String(body.price || ''), stock: String(body.stock || ''), animation: String(body.animation || 'none') as never }));
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
    if (!(file instanceof File)) return c.json({ error: 'Choose an image or video file.' }, 400);
    if (!isAllowedMarketMedia(file.type, file.name)) return c.json({ error: `Only PNG, JPG, JPEG, WebP, GIF, MP4, WebM, MOV or M4V files are allowed. Got ${file.type || 'unknown'} ${file.name || ''}` }, 400);
    if (file.size > MARKET_UPLOAD_MAX_BYTES) return c.json({ error: 'Market media must be under 25MB.' }, 400);
    const version = String(Date.now());
    const contentType = marketContentType(file.type, file.name);
    await c.env.ASSETS.put(marketImageKey(id), file.stream(), { httpMetadata: { contentType }, customMetadata: { version } });
    return c.json(await getMarketItems(c.env));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload market media' }, 400);
  }
});

async function getMarketAsset(env: Env, key: string): Promise<Response> {
  const head = await env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || head.httpMetadata?.contentType || 'application/octet-stream', 'cache-control': CACHE_LONG } });
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

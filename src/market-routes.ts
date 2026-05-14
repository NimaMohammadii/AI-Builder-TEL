import app from './index';
import { buyMarketItem, getMarketItems, getUserMarketNfts, isAllowedMarketMedia, marketContentType, marketImageKey, marketMediaTypeFromContentType, normalizeMarketItemId, setMarketItem } from './market-config';
import type { Env } from './types';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const MARKET_UPLOAD_MAX_BYTES = 25_000_000;

app.get('/app/api/market-items', async (c) => c.json(await getMarketItems(c.env), 200, { 'cache-control': CACHE_NONE }));

app.get('/app/api/my-nfts', async (c) => {
  try {
    const userId = String(c.req.query('userId') || '');
    return c.json(await getUserMarketNfts(c.env, userId), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load NFTs' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.post('/app/api/market-buy', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const userId = String(body.userId || '');
    const itemId = String(body.itemId || '');
    return c.json(await buyMarketItem(c.env, userId, itemId), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not buy NFT' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/market-item-media/:item', async (c) => {
  try {
    const id = normalizeMarketItemId(c.req.param('item'));
    return getMarketAsset(c.env, marketImageKey(id), c.req.header('range'));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/market-item-image/:item', async (c) => {
  try {
    const id = normalizeMarketItemId(c.req.param('item').replace(/\.png$/i, ''));
    return getMarketAsset(c.env, marketImageKey(id), c.req.header('range'));
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
    return c.json(await setMarketItem(c.env, id, {
      title: String(body.title || ''),
      price: String(body.price || ''),
      stock: String(body.stock || ''),
      animation: String(body.animation || 'none') as never,
      symbol: String(body.symbol || ''),
      collection: String(body.collection || ''),
      rarity: String(body.rarity || ''),
      tag: String(body.tag || ''),
      supply: String(body.supply || ''),
      edition: String(body.edition || ''),
      utility: String(body.utility || ''),
      description: String(body.description || ''),
    }));
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
    if (!isAllowedMarketMedia(file.type, file.name)) return c.json({ error: `Only PNG, JPG, JPEG, WebP or GIF files are allowed. Got ${file.type || 'unknown'} ${file.name || ''}` }, 400);
    if (file.size > MARKET_UPLOAD_MAX_BYTES) return c.json({ error: 'Market image must be under 25MB.' }, 400);
    const version = String(Date.now());
    const contentType = marketContentType(file.type, file.name);
    const mediaType = marketMediaTypeFromContentType(contentType);
    await c.env.ASSETS.put(marketImageKey(id), file.stream(), { httpMetadata: { contentType }, customMetadata: { version, contentType, mediaType } });
    return c.json(await getMarketItems(c.env));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload market image' }, 400);
  }
});

async function getMarketAsset(env: Env, key: string, rangeHeader?: string): Promise<Response> {
  const head = await env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const contentType = head.httpMetadata?.contentType || head.customMetadata?.contentType || 'application/octet-stream';
  const size = head.size || 0;
  const range = parseByteRange(rangeHeader, size);
  const object = await env.ASSETS.get(key, range ? { range: { offset: range.start, length: range.end - range.start + 1 } } : undefined).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const headers = new Headers({
    'content-type': object.httpMetadata?.contentType || object.customMetadata?.contentType || contentType,
    'cache-control': CACHE_LONG,
    'accept-ranges': 'bytes',
    'content-length': String(range ? range.end - range.start + 1 : size),
  });
  if (range) headers.set('content-range', `bytes ${range.start}-${range.end}/${size}`);
  return new Response(object.body, { status: range ? 206 : 200, headers });
}

function parseByteRange(header: string | undefined, size: number): { start: number; end: number } | null {
  if (!header || !Number.isFinite(size) || size <= 0) return null;
  const match = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) return null;
  let start = match[1] ? Number(match[1]) : size - Number(match[2]);
  let end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
  start = Math.max(0, start);
  end = Math.min(size - 1, end);
  return start <= end ? { start, end } : null;
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

import app from './index';
import { buyMarketItem, getMarketItems, getUserMarketNfts, isAllowedMarketMedia, marketContentType, marketImageKey, marketMediaTypeFromContentType, normalizeMarketItemId, setMarketItem } from './market-config';
import type { Env } from './types';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const MARKET_UPLOAD_MAX_BYTES = 25_000_000;
const TELEGRAM_GIFTS_CACHE_SECONDS = 180;

type TelegramGiftView = {
  id: string;
  title: string;
  collection: string;
  rarity: string;
  supply: string;
  utility: string;
  description: string;
  imageUrl: string | null;
  badge: string;
  source: 'telegram';
  canTransfer: boolean;
  nextTransferDate: number | null;
  transferStars: number | null;
};

app.get('/app/api/market-items', async (c) => c.json(await getMarketItems(c.env), 200, { 'cache-control': CACHE_NONE }));

app.get('/app/api/my-nfts', async (c) => {
  try {
    const userId = String(c.req.query('userId') || '');
    return c.json(await getUserMarketNfts(c.env, userId), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load NFTs' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/telegram-gifts', async (c) => {
  try {
    const userId = String(c.req.query('userId') || '').replace(/[^0-9]/g, '').slice(0, 32);
    if (!userId) return c.json({ gifts: [] }, 200, { 'cache-control': CACHE_NONE });
    const gifts = await getTelegramGifts(c.env, userId);
    return c.json({ gifts }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ gifts: [], error: error instanceof Error ? error.message : 'Could not load Telegram Gifts' }, 200, { 'cache-control': CACHE_NONE });
  }
});

app.get('/app/api/telegram-gift-file/:fileId', async (c) => {
  try {
    const fileId = c.req.param('fileId');
    if (!fileId) return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
    const fileUrl = await getTelegramFileUrl(c.env, fileId);
    if (!fileUrl) return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
    const response = await fetch(fileUrl, { cf: { cacheTtl: 3600, cacheEverything: true } as never });
    if (!response.ok || !response.body) return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
    const headers = new Headers(response.headers);
    headers.set('cache-control', 'public, max-age=3600');
    return new Response(response.body, { status: response.status, headers });
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
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

async function getTelegramGifts(env: Env, userId: string): Promise<TelegramGiftView[]> {
  const cacheKey = `telegram:gifts:${userId}`;
  const cached = await env.BOT_CACHE.get(cacheKey, 'json').catch(() => null) as TelegramGiftView[] | null;
  if (Array.isArray(cached)) return cached;
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return [];
  const raw = await callTelegram(token, 'getUserGifts', { user_id: Number(userId), limit: 100 });
  const giftsRaw = Array.isArray(raw?.gifts) ? raw.gifts : Array.isArray(raw?.owned_gifts) ? raw.owned_gifts : Array.isArray(raw?.items) ? raw.items : [];
  const gifts = giftsRaw.map((entry: unknown, index: number) => normalizeTelegramGift(entry, index)).filter(Boolean) as TelegramGiftView[];
  await env.BOT_CACHE.put(cacheKey, JSON.stringify(gifts), { expirationTtl: TELEGRAM_GIFTS_CACHE_SECONDS }).catch(() => undefined);
  return gifts;
}

async function callTelegram(token: string, method: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => null) as { ok?: boolean; result?: Record<string, unknown>; description?: string } | null;
  if (!response.ok || !json?.ok) throw new Error(json?.description || 'Telegram API failed');
  return json.result || {};
}

async function getTelegramFileUrl(env: Env, fileId: string): Promise<string | null> {
  const safe = decodeURIComponent(fileId);
  const cacheKey = `telegram:file:${safe}`;
  const cached = await env.BOT_CACHE.get(cacheKey).catch(() => null);
  if (cached) return cached;
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  const result = await callTelegram(token, 'getFile', { file_id: safe });
  const path = String(result.file_path || '');
  if (!path) return null;
  const url = `https://api.telegram.org/file/bot${token}/${path}`;
  await env.BOT_CACHE.put(cacheKey, url, { expirationTtl: 3600 }).catch(() => undefined);
  return url;
}

function normalizeTelegramGift(entry: unknown, index: number): TelegramGiftView | null {
  const owned = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>;
  const unique = objectValue(owned.gift) || objectValue(owned.unique_gift) || owned;
  const regularGift = objectValue(owned.regular_gift) || objectValue(owned.gift) || owned;
  const id = String(owned.owned_gift_id || owned.id || unique.slug || unique.name || regularGift.id || `gift_${index}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  const model = objectValue(unique.model);
  const symbol = objectValue(unique.symbol);
  const backdrop = objectValue(unique.backdrop);
  const title = cleanGiftText(unique.name || unique.title || regularGift.title || regularGift.name || 'Telegram Gift', 80);
  const number = unique.number || unique.num || owned.number;
  const modelName = cleanGiftText(model.name || unique.model_name || 'Telegram Gift', 80);
  const symbolName = cleanGiftText(symbol.name || unique.symbol_name || 'Unique', 60);
  const backdropName = cleanGiftText(backdrop.name || unique.backdrop_name || 'Collectible', 60);
  const imageFileId = firstText(
    objectValue(unique.sticker).file_id,
    objectValue(model.sticker).file_id,
    objectValue(regularGift.sticker).file_id,
    objectValue(objectValue(regularGift.sticker).thumbnail).file_id,
    objectValue(objectValue(unique.sticker).thumbnail).file_id
  );
  const supply = firstText(unique.total_count, regularGift.total_count, number ? `#${number}` : 'Telegram');
  const canTransfer = owned.can_be_transferred === true || unique.can_be_transferred === true;
  return {
    id: `telegram_${id}`,
    title: number ? `${title} #${number}` : title,
    collection: 'Telegram Gifts',
    rarity: modelName,
    supply,
    utility: canTransfer ? 'Telegram collectible gift. Transfer may be available in Telegram.' : 'Telegram collectible gift. Display only inside Vexa.',
    description: `${modelName} · ${symbolName} · ${backdropName}`,
    imageUrl: imageFileId ? `/app/api/telegram-gift-file/${encodeURIComponent(imageFileId)}` : null,
    badge: 'Telegram Gift',
    source: 'telegram',
    canTransfer,
    nextTransferDate: numberOrNull(owned.next_transfer_date || unique.next_transfer_date),
    transferStars: numberOrNull(owned.transfer_star_count || unique.transfer_star_count),
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return '';
}

function cleanGiftText(value: unknown, limit: number): string {
  return String(value ?? '').trim().slice(0, limit) || 'Telegram Gift';
}

function numberOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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

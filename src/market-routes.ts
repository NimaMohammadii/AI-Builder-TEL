import app from './index';
import './routes/vexa-league/basic-routes';
import { buyMarketItem, getMarketItems, getUserMarketNfts, isAllowedMarketMedia, marketContentType, marketImageKey, marketMediaTypeFromContentType, normalizeMarketItemId, setMarketItem } from './market-config';
import { loadTonNftMarket, type TonNftMarketItem } from './ton-nft-market';
import type { Env } from './types';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const MARKET_UPLOAD_MAX_BYTES = 25_000_000;
const TON_GIFT_MARKET_CACHE_SECONDS = 60;
const MARKET_PROVIDER_SETTING_KEY = 'market_provider';

type MarketProvider = 'getgems' | 'fragment';
type TelegramGiftView = TonNftMarketItem;

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
    const gifts = await getTelegramGifts(c.env);
    return c.json({ gifts }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ gifts: [], error: error instanceof Error ? error.message : 'Could not load TON Gift market' }, 200, { 'cache-control': CACHE_NONE });
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

app.get('/admin/api/market-provider', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json({ provider: await getMarketProvider(c.env) }, 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/market-provider', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const body = await c.req.json().catch(() => ({})) as { provider?: unknown };
    const provider = normalizeMarketProvider(body.provider);
    if (!provider) return c.json({ error: 'Provider must be getgems or fragment' }, 400, { 'cache-control': CACHE_NONE });
    await setMarketProvider(c.env, provider);
    await Promise.all([
      c.env.BOT_CACHE.delete('ton:gifts:market:getgems:price_asc').catch(() => undefined),
      c.env.BOT_CACHE.delete('ton:gifts:market:fragment:price_asc').catch(() => undefined),
    ]);
    return c.json({ ok: true, provider }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save market provider' }, 400, { 'cache-control': CACHE_NONE });
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

async function getTelegramGifts(env: Env): Promise<TelegramGiftView[]> {
  const sort = 'price_asc';
  const provider = await getMarketProvider(env);
  const cacheKey = `ton:gifts:market:${provider}:${sort}`;
  const cached = await env.BOT_CACHE.get(cacheKey, 'json').catch(() => null) as TelegramGiftView[] | null;
  if (Array.isArray(cached)) return cached;
  const gifts = provider === 'fragment' ? await getFragmentGifts(env) : await loadTonNftMarket(env, { sort, limit: 90 });
  await env.BOT_CACHE.put(cacheKey, JSON.stringify(gifts), { expirationTtl: TON_GIFT_MARKET_CACHE_SECONDS }).catch(() => undefined);
  return gifts;
}

async function ensureAppSettings(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getMarketProvider(env: Env): Promise<MarketProvider> {
  await ensureAppSettings(env);
  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind(MARKET_PROVIDER_SETTING_KEY).first<{ value: string }>().catch(() => null);
  return normalizeMarketProvider(row?.value) || 'getgems';
}

async function setMarketProvider(env: Env, provider: MarketProvider): Promise<void> {
  await ensureAppSettings(env);
  await env.DB.prepare(`INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`).bind(MARKET_PROVIDER_SETTING_KEY, provider).run();
}

function normalizeMarketProvider(value: unknown): MarketProvider | null {
  const provider = String(value || '').trim().toLowerCase();
  return provider === 'getgems' || provider === 'fragment' ? provider : null;
}

async function getFragmentGifts(env: Env): Promise<TelegramGiftView[]> {
  const providerUrl = String(env.TON_GIFT_MARKET_URL || '').trim();
  if (!providerUrl) throw new Error('TON_GIFT_MARKET_URL is missing for Fragment provider');
  const response = await fetch(providerUrl, {
    headers: { accept: 'application/json', 'user-agent': 'VexaFLOW/1.0' },
    cf: { cacheTtl: TON_GIFT_MARKET_CACHE_SECONDS, cacheEverything: true } as never,
  });
  if (!response.ok) throw new Error(`Fragment provider failed: ${response.status}`);
  const json = await response.json().catch(() => null);
  return marketRows(json).map((entry, index) => normalizeTonGiftMarketItem(entry, index)).filter(Boolean) as TelegramGiftView[];
}

function marketRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(isObject) as Record<string, unknown>[];
  const object = objectValue(value);
  for (const key of ['results', 'nfts', 'items', 'data', 'list']) {
    const rows = object[key];
    if (Array.isArray(rows)) return rows.filter(isObject) as Record<string, unknown>[];
  }
  return [];
}

function normalizeTonGiftMarketItem(entry: Record<string, unknown>, index: number): TelegramGiftView | null {
  const metadata = firstObject(entry.metadata, entry.meta, entry.nft_metadata);
  const collection = firstObject(entry.collection, entry.collection_info, metadata.collection);
  const sale = firstObject(entry.sale, entry.auction, entry.sale_data, entry.listing);
  const rawId = firstText(entry.nft_address, entry.address, entry.item_address, entry.id, metadata.address, `ton_gift_${index}`);
  const title = cleanGiftText(firstText(entry.name, entry.title, metadata.name, `TON Gift ${index + 1}`), 80);
  const collectionName = cleanGiftText(firstText(collection.name, collection.title, entry.collection_name, metadata.collection_name, 'TON Gifts'), 80);
  const imageUrl = firstText(entry.photo_url, entry.preview_url, entry.image_url, entry.image, metadata.image, metadata.image_url, metadata.preview_url);
  const priceTon = normalizeTonPrice(firstText(entry.price, entry.price_ton, entry.priceTon, entry.price_nano, entry.priceNano, sale.price, sale.price_ton, sale.price_nano));
  const model = cleanGiftText(firstText(metadata.model, entry.model, entry.rarity, collectionName), 60);
  const description = cleanGiftText(firstText(metadata.description, entry.description, collectionName), 120);
  return {
    id: `ton_gift_${rawId}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 90),
    title,
    collection: collectionName,
    rarity: model,
    supply: firstText(entry.number, metadata.number, entry.rank, 'Listed'),
    utility: priceTon ? `${priceTon} TON` : 'Listed for TON',
    description,
    imageUrl: imageUrl || null,
    animationUrl: null,
    sourceUrl: null,
    badge: 'TON NFT',
    source: 'telegram',
    canTransfer: true,
    nextTransferDate: null,
    transferStars: null,
  };
}

function normalizeTonPrice(value: unknown): string {
  const raw = firstText(value).replace(/,/g, '').trim();
  if (!raw) return '';
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw.replace(/\s*TON$/i, '').trim();
  const ton = n > 1_000_000 ? n / 1_000_000_000 : n;
  return ton.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
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

function getMarketAsset(env: Env, key: string, rangeHeader?: string): Promise<Response> | Response {
  return env.ASSETS.get(key, rangeHeader ? { range: parseRange(rangeHeader) } : undefined).then((object) => {
    if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', CACHE_LONG);
    if (!headers.get('content-type')) headers.set('content-type', object.customMetadata?.contentType || 'image/png');
    if ('range' in object && object.range) {
      headers.set('content-range', `bytes ${object.range.offset}-${object.range.end ?? object.size - 1}/${object.size}`);
      return new Response(object.body, { status: 206, headers });
    }
    return new Response(object.body, { headers });
  });
}

function parseRange(header: string): { offset: number; length?: number } | undefined {
  const match = header.match(/bytes=(\d+)-(\d*)/);
  if (!match) return undefined;
  const offset = Number(match[1]);
  const end = match[2] ? Number(match[2]) : undefined;
  if (!Number.isFinite(offset)) return undefined;
  return end && end >= offset ? { offset, length: end - offset + 1 } : { offset };
}

function firstObject(...values: unknown[]): Record<string, unknown> { for (const value of values) { if (isObject(value)) return value as Record<string, unknown>; } return {}; }
function objectValue(value: unknown): Record<string, unknown> { return isObject(value) ? value as Record<string, unknown> : {}; }
function firstText(...values: unknown[]): string { for (const value of values) { if (value === null || value === undefined) continue; const text = String(value).trim(); if (text) return text; } return ''; }
function cleanGiftText(value: string, max: number): string { return value.replace(/[<>]/g, '').slice(0, max); }
function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

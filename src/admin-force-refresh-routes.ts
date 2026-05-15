import type { Hono } from 'hono';
import type { Env } from './types';

const APP_CACHE_VERSION_KEY = 'admin:app-cache-version';
const ACTIVE_MARKET_PROVIDER: 'getgems' | 'fragment' = 'getgems';
const FRAGMENT_GIFTS_URL = 'https://fragment.com/gifts?sort=price_asc&filter=sale';
const GETGEMS_MARKET_URL = 'https://getgems.io/';
const TONAPI_BASE_URL = 'https://tonapi.io/v2';
const DEFAULT_GIFT_LIMIT = 90;
const MAX_GIFT_LIMIT = 180;
const GETGEMS_DISCOVERY_LIMIT = 90;
const GETGEMS_COLLECTION_LIMIT = 10;
const GETGEMS_ITEMS_PER_COLLECTION = 12;

type Gift = {
  id: string;
  title: string;
  collection: string;
  rarity: string;
  supply: string;
  utility: string;
  description: string;
  imageUrl: string | null;
  animationUrl?: string | null;
  sourceUrl?: string | null;
  badge: string;
  source: 'telegram';
  canTransfer: boolean;
  nextTransferDate: number | null;
  transferStars: number | null;
};

type MarketEnv = Env & { TONAPI_KEY?: string };

type TonApiNft = {
  address?: string;
  index?: number | string;
  metadata?: Record<string, unknown>;
  previews?: Array<{ url?: string; resolution?: string }>;
  collection?: { address?: string; name?: string } | null;
  sale?: unknown;
  owner?: { address?: string; name?: string } | null;
};

type TonApiCollection = {
  address?: string;
  name?: string;
  description?: string;
};

export function registerAdminForceRefreshRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/app-version', async (c) => {
    const version = await getAppVersion(c.env);
    return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
  });

  app.get('/app/api/ton-gift-market-fresh', async (c) => {
    try {
      const sort = c.req.query('sort') === 'price_desc' ? 'price_desc' : 'price_asc';
      const limit = clampInt(c.req.query('limit'), 1, MAX_GIFT_LIMIT, DEFAULT_GIFT_LIMIT);
      const offset = clampInt(c.req.query('offset'), 0, 100000, 0);
      const gifts = await loadActiveMarketGifts(c.env as MarketEnv, sort);
      const page = gifts.slice(offset, offset + limit);
      return c.json({
        gifts: page,
        total: gifts.length,
        offset,
        limit,
        nextOffset: offset + page.length,
        hasMore: offset + page.length < gifts.length,
      }, 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ gifts: [], total: 0, offset: 0, limit: DEFAULT_GIFT_LIMIT, hasMore: false, error: error instanceof Error ? error.message : 'Could not refresh TON NFT market' }, 200, { 'cache-control': 'no-store' });
    }
  });

  app.post('/admin/api/force-app-refresh', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
    const version = String(Date.now());
    await c.env.BOT_CACHE.put(APP_CACHE_VERSION_KEY, version);
    return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
  });
}

async function loadActiveMarketGifts(env: MarketEnv, sort: string): Promise<Gift[]> {
  if (ACTIVE_MARKET_PROVIDER === 'fragment') return loadFreshFragmentGifts(sort);
  return loadGetgemsNfts(env, sort);
}

async function loadGetgemsNfts(env: MarketEnv, sort: string): Promise<Gift[]> {
  if (!env.TONAPI_KEY) throw new Error('TONAPI_KEY is missing');
  const discovered = await discoverGetgemsAddresses();
  let items: TonApiNft[] = [];

  if (discovered.nfts.length) {
    const direct = await Promise.all(discovered.nfts.slice(0, GETGEMS_DISCOVERY_LIMIT).map((address) => getTonApiNft(env, address)));
    items = direct.filter((item): item is TonApiNft => Boolean(item?.address));
  }

  const collectionAddresses = discovered.collections.slice(0, GETGEMS_COLLECTION_LIMIT);
  if (items.length < DEFAULT_GIFT_LIMIT && collectionAddresses.length) {
    const groups = await Promise.all(collectionAddresses.map((address) => getTonApiCollectionItems(env, address, GETGEMS_ITEMS_PER_COLLECTION)));
    items = items.concat(groups.flat());
  }

  if (items.length < DEFAULT_GIFT_LIMIT) {
    const collections = await getTonApiCollections(env, GETGEMS_COLLECTION_LIMIT);
    const groups = await Promise.all(collections.map((collection) => collection.address ? getTonApiCollectionItems(env, collection.address, GETGEMS_ITEMS_PER_COLLECTION) : Promise.resolve([])));
    items = items.concat(groups.flat());
  }

  const gifts = dedupeGifts(items.map(getgemsNftToGift).filter((gift): gift is Gift => Boolean(gift)));
  return sortGifts(gifts.slice(0, GETGEMS_DISCOVERY_LIMIT), sort);
}

async function discoverGetgemsAddresses(): Promise<{ collections: string[]; nfts: string[] }> {
  try {
    const response = await fetch(GETGEMS_MARKET_URL, {
      headers: getgemsHeaders(),
      cf: { cacheTtl: 60, cacheEverything: true } as never,
    });
    if (!response.ok) return { collections: [], nfts: [] };
    const html = await response.text();
    return {
      collections: uniqueMatches(html, /\/collection\/([A-Za-z0-9_-]{40,80})/g),
      nfts: uniqueMatches(html, /\/nft\/([A-Za-z0-9_-]{40,80})/g),
    };
  } catch {
    return { collections: [], nfts: [] };
  }
}

async function getTonApiNft(env: MarketEnv, address: string): Promise<TonApiNft | null> {
  try {
    const response = await tonApiFetch(env, `/nfts/${encodeURIComponent(address)}`);
    if (!response.ok) return null;
    return await response.json() as TonApiNft;
  } catch {
    return null;
  }
}

async function getTonApiCollections(env: MarketEnv, limit: number): Promise<TonApiCollection[]> {
  const response = await tonApiFetch(env, `/nfts/collections?limit=${encodeURIComponent(String(limit))}&offset=0`);
  if (!response.ok) throw new Error(`TonAPI collections failed: ${response.status}`);
  const data = await response.json() as Record<string, unknown>;
  const collections = arrayValue(data.nft_collections) || arrayValue(data.collections) || arrayValue(data.items) || [];
  return collections.map(toCollection).filter((collection): collection is TonApiCollection => Boolean(collection.address));
}

async function getTonApiCollectionItems(env: MarketEnv, collectionAddress: string, limit: number): Promise<TonApiNft[]> {
  try {
    const response = await tonApiFetch(env, `/nfts/collections/${encodeURIComponent(collectionAddress)}/items?limit=${encodeURIComponent(String(limit))}&offset=0`);
    if (!response.ok) return [];
    const data = await response.json() as Record<string, unknown>;
    const items = arrayValue(data.nft_items) || arrayValue(data.items) || [];
    return items.map(toNft).filter((item): item is TonApiNft => Boolean(item.address));
  } catch {
    return [];
  }
}

function tonApiFetch(env: MarketEnv, path: string): Promise<Response> {
  return fetch(`${TONAPI_BASE_URL}${path}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${env.TONAPI_KEY || ''}`,
    },
    cf: { cacheTtl: 60, cacheEverything: true } as never,
  });
}

function getgemsNftToGift(item: TonApiNft): Gift | null {
  const address = stringValue(item.address);
  if (!address) return null;
  const metadata = recordValue(item.metadata) || {};
  const collection = item.collection || null;
  const title = firstString([
    stringValue(metadata.name),
    stringValue(metadata.title),
    item.index != null && stringValue(collection?.name) ? `${stringValue(collection?.name)} #${item.index}` : '',
    `TON NFT ${address.slice(0, 6)}`,
  ]);
  const collectionName = firstString([stringValue(collection?.name), 'Getgems']);
  const price = getSalePriceTon(item.sale);
  const imageUrl = firstString([
    previewUrl(item.previews),
    stringValue(metadata.image),
    stringValue(metadata.image_url),
    stringValue(metadata.content_url),
  ]);
  const number = item.index != null ? `#${String(item.index)}` : 'TON NFT';
  return {
    id: `getgems_${address}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120),
    title,
    collection: collectionName,
    rarity: 'Getgems',
    supply: number,
    utility: price ? `${price} TON` : 'Getgems NFT',
    description: [collectionName, number, price ? `${price} TON` : 'Getgems NFT'].filter(Boolean).join(' · '),
    imageUrl: imageUrl || null,
    animationUrl: null,
    sourceUrl: null,
    badge: 'Getgems',
    source: 'telegram',
    canTransfer: true,
    nextTransferDate: null,
    transferStars: null,
  };
}

function getSalePriceTon(sale: unknown): string {
  const value = firstString([
    deepString(sale, ['price', 'value']),
    deepString(sale, ['price', 'amount']),
    deepString(sale, ['full_price']),
    deepString(sale, ['amount']),
  ]).replace(/,/g, '.');
  if (!value) return '';
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  const ton = numeric > 1_000_000 ? numeric / 1_000_000_000 : numeric;
  return formatTon(ton);
}

function formatTon(value: number): string {
  if (!Number.isFinite(value)) return '';
  return value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function toCollection(value: unknown): TonApiCollection {
  const record = recordValue(value) || {};
  return {
    address: stringValue(record.address),
    name: stringValue(record.name),
    description: stringValue(record.description),
  };
}

function toNft(value: unknown): TonApiNft {
  const record = recordValue(value) || {};
  return {
    address: stringValue(record.address),
    index: typeof record.index === 'number' || typeof record.index === 'string' ? record.index : undefined,
    metadata: recordValue(record.metadata) || undefined,
    previews: arrayValue(record.previews) as TonApiNft['previews'],
    collection: recordValue(record.collection) as TonApiNft['collection'],
    sale: record.sale,
    owner: recordValue(record.owner) as TonApiNft['owner'],
  };
}

function previewUrl(previews: TonApiNft['previews']): string {
  if (!Array.isArray(previews) || !previews.length) return '';
  const sorted = previews.slice().sort((a, b) => previewRank(b.resolution) - previewRank(a.resolution));
  return stringValue(sorted[0]?.url);
}

function previewRank(value: string | undefined): number {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) || 0 : 0;
}

function arrayValue(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

function firstString(values: string[]): string {
  return values.find((value) => value.trim())?.trim() || '';
}

function deepString(value: unknown, path: string[]): string {
  let cursor: unknown = value;
  for (const key of path) {
    const record = recordValue(cursor);
    if (!record) return '';
    cursor = record[key];
  }
  return stringValue(cursor);
}

function uniqueMatches(value: string, pattern: RegExp): string[] {
  const seen = new Set<string>();
  for (const match of value.matchAll(pattern)) {
    const item = match[1];
    if (item) seen.add(item);
  }
  return [...seen];
}

function getgemsHeaders(): HeadersInit {
  return {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  };
}

async function loadFreshFragmentGifts(sort: string): Promise<Gift[]> {
  const url = sort === 'price_desc' ? 'https://fragment.com/gifts?sort=price_desc&filter=sale' : FRAGMENT_GIFTS_URL;
  const response = await fetch(url, {
    headers: fragmentHeaders(),
    cf: { cacheTtl: 0, cacheEverything: false } as never,
  });
  if (!response.ok) throw new Error(`Fragment refresh failed: ${response.status}`);
  const gifts = parseFragmentGifts(await response.text());
  return sortGifts(gifts, sort);
}

function fragmentHeaders(): HeadersInit {
  return {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  };
}

function parseFragmentGifts(html: string): Gift[] {
  const gifts: Gift[] = [];
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']*\/gift\/[^"']+)["'][\s\S]*?<\/a>/gi)];
  for (const [index, match] of anchors.entries()) {
    const href = absoluteFragmentUrl(decodeHtml(match[1] || ''));
    const block = match[0] || '';
    if (!/for sale/i.test(block) && !/tm-icon-ton|icon-ton|ton-symbol/i.test(block)) continue;
    const title = fragmentGiftTitle(block, href, index);
    const number = fragmentGiftNumber(block, href);
    const price = fragmentGiftPrice(block);
    const image = fragmentGiftImage(block);
    const animation = fragmentGiftAnimation(block);
    gifts.push({
      id: `fragment_${href.split('/').pop() || index}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 90),
      title,
      collection: 'Fragment Gifts',
      rarity: 'For sale',
      supply: number || 'For sale',
      utility: price ? `${price} TON` : 'For sale on Fragment',
      description: [number, price ? `${price} TON` : '', 'For sale on Fragment'].filter(Boolean).join(' · '),
      imageUrl: image,
      animationUrl: animation,
      sourceUrl: href,
      badge: 'For sale',
      source: 'telegram',
      canTransfer: true,
      nextTransferDate: null,
      transferStars: null,
    });
  }
  return dedupeGifts(gifts);
}

function sortGifts(gifts: Gift[], sort: string): Gift[] {
  return gifts.slice().sort((a, b) => {
    const pa = Number(fragmentGiftPrice(a.description + ' ' + a.utility)) || 999999999;
    const pb = Number(fragmentGiftPrice(b.description + ' ' + b.utility)) || 999999999;
    return sort === 'price_desc' ? pb - pa : pa - pb;
  });
}

function fragmentGiftTitle(block: string, href: string, index: number): string {
  const direct = firstMatch(block, [
    /class=["'][^"']*(?:title|name)[^"']*["'][^>]*>([\s\S]*?)<\//i,
    /alt=["']([^"']+)["']/i,
    /aria-label=["']([^"']+)["']/i,
  ]);
  if (direct) return cleanText(direct.replace(/#\d+.*/, ''));
  const slug = (href.split('/').pop() || '').replace(/[-_]?\d+$/, '').replace(/[-_]+/g, ' ');
  return titleCase(slug || `Fragment Gift ${index + 1}`);
}

function fragmentGiftNumber(block: string, href: string): string {
  const fromBlock = firstMatch(block, [/#\s*([0-9]{2,})/i]);
  if (fromBlock) return `#${fromBlock}`;
  const fromHref = href.match(/(\d{2,})$/)?.[1];
  return fromHref ? `#${fromHref}` : '';
}

function fragmentGiftPrice(block: string): string {
  const price = firstMatch(block, [
    /(?:tm-icon-ton|icon-ton|ton-symbol)[\s\S]{0,180}?([0-9]+(?:\.[0-9]+)?)/i,
    /([0-9]+(?:\.[0-9]+)?)\s*(?:TON|Ton)/i,
    /class=["'][^"']*(?:price|value)[^"']*["'][^>]*>[\s\S]*?([0-9]+(?:\.[0-9]+)?)/i,
  ]);
  return price || '';
}

function fragmentGiftImage(block: string): string | null {
  const src = firstMatch(block, [
    /<img\b[^>]*src=["']([^"']+)["']/i,
    /poster=["']([^"']+)["']/i,
    /background-image\s*:\s*url\(([^)]+)\)/i,
    /data-src=["']([^"']+)["']/i,
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
  ]);
  return src ? absoluteFragmentUrl(decodeHtml(src).replace(/^['"]|['"]$/g, '')) : null;
}

function fragmentGiftAnimation(block: string): string | null {
  const src = firstMatch(block, [
    /<video\b[^>]*src=["']([^"']+)["']/i,
    /<source\b[^>]*src=["']([^"']+)["']/i,
    /data-animation=["']([^"']+)["']/i,
    /data-video=["']([^"']+)["']/i,
    /property=["']og:video["'][^>]*content=["']([^"']+)["']/i,
    /name=["']twitter:player:stream["'][^>]*content=["']([^"']+)["']/i,
    /["']([^"']+\.(?:mp4|webm|mov)(?:\?[^"']*)?)["']/i,
  ]);
  const value = src ? absoluteFragmentUrl(decodeHtml(src).replace(/^['"]|['"]$/g, '')) : '';
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(value) ? value : null;
}

function dedupeGifts(gifts: Gift[]): Gift[] {
  const seen = new Set<string>();
  const out: Gift[] = [];
  for (const gift of gifts) {
    if (seen.has(gift.id)) continue;
    seen.add(gift.id);
    out.push(gift);
  }
  return out;
}

function absoluteFragmentUrl(value: string): string {
  if (!value) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `https://fragment.com${value}`;
  return value;
}

function firstMatch(value: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }
  return '';
}

function cleanText(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase()).trim() || 'Fragment Gift';
}

function clampInt(value: string | null | undefined, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

async function getAppVersion(env: Env): Promise<string> {
  const value = await env.BOT_CACHE.get(APP_CACHE_VERSION_KEY).catch(() => null);
  return value || '1';
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): boolean {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean {
  return isAdmin(c.env, adminCookieValue(c.req.header('cookie')));
}
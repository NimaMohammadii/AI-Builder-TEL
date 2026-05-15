import type { Env } from './types';

const TONAPI_BASE_URL = 'https://tonapi.io/v2';
const GETGEMS_HOME_URL = 'https://getgems.io/';
const DEFAULT_LIMIT = 90;
const DISCOVERY_LIMIT = 90;
const COLLECTION_LIMIT = 10;
const ITEMS_PER_COLLECTION = 12;

export type TonNftMarketEnv = Env & { TONAPI_KEY?: string };

export type TonNftMarketItem = {
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

type TonApiNft = {
  address?: string;
  index?: number | string;
  metadata?: Record<string, unknown>;
  previews?: Array<{ url?: string; resolution?: string }>;
  collection?: { address?: string; name?: string } | null;
  sale?: unknown;
};

type TonApiCollection = {
  address?: string;
  name?: string;
};

export async function loadTonNftMarket(env: TonNftMarketEnv, options: { limit?: number; sort?: string } = {}): Promise<TonNftMarketItem[]> {
  if (!env.TONAPI_KEY) throw new Error('TONAPI_KEY is missing');
  const limit = clamp(options.limit ?? DEFAULT_LIMIT, 1, DISCOVERY_LIMIT);
  const sort = options.sort === 'price_desc' ? 'price_desc' : 'price_asc';
  const discovered = await discoverGetgemsAddresses();
  let nfts: TonApiNft[] = [];

  if (discovered.nfts.length) {
    const direct = await Promise.all(discovered.nfts.slice(0, limit).map((address) => getTonApiNft(env, address)));
    nfts = direct.filter((item): item is TonApiNft => Boolean(item?.address));
  }

  if (nfts.length < limit && discovered.collections.length) {
    const groups = await Promise.all(discovered.collections.slice(0, COLLECTION_LIMIT).map((address) => getTonApiCollectionItems(env, address, ITEMS_PER_COLLECTION)));
    nfts = nfts.concat(groups.flat());
  }

  if (nfts.length < limit) {
    const collections = await getTonApiCollections(env, COLLECTION_LIMIT);
    const groups = await Promise.all(collections.map((collection) => collection.address ? getTonApiCollectionItems(env, collection.address, ITEMS_PER_COLLECTION) : Promise.resolve([])));
    nfts = nfts.concat(groups.flat());
  }

  return sortMarketItems(dedupe(nfts.map(toFragmentStyleMarketItem).filter((item): item is TonNftMarketItem => Boolean(item))).slice(0, limit), sort);
}

async function discoverGetgemsAddresses(): Promise<{ collections: string[]; nfts: string[] }> {
  try {
    const response = await fetch(GETGEMS_HOME_URL, {
      headers: getgemsHeaders(),
      cf: { cacheTtl: 60, cacheEverything: true } as never,
    });
    if (!response.ok) return { collections: [], nfts: [] };
    const html = await response.text();
    return {
      collections: uniqueMatches(html, /\/collection\/([A-Za-z0-9_-]{40,90})/g),
      nfts: uniqueMatches(html, /\/nft\/([A-Za-z0-9_-]{40,90})/g),
    };
  } catch {
    return { collections: [], nfts: [] };
  }
}

async function getTonApiNft(env: TonNftMarketEnv, address: string): Promise<TonApiNft | null> {
  try {
    const response = await tonApiFetch(env, `/nfts/${encodeURIComponent(address)}`);
    if (!response.ok) return null;
    return await response.json() as TonApiNft;
  } catch {
    return null;
  }
}

async function getTonApiCollections(env: TonNftMarketEnv, limit: number): Promise<TonApiCollection[]> {
  try {
    const response = await tonApiFetch(env, `/nfts/collections?limit=${encodeURIComponent(String(limit))}&offset=0`);
    if (!response.ok) return [];
    const data = await response.json() as Record<string, unknown>;
    const rows = arrayValue(data.nft_collections) || arrayValue(data.collections) || arrayValue(data.items) || [];
    return rows.map(toCollection).filter((collection): collection is TonApiCollection => Boolean(collection.address));
  } catch {
    return [];
  }
}

async function getTonApiCollectionItems(env: TonNftMarketEnv, collectionAddress: string, limit: number): Promise<TonApiNft[]> {
  try {
    const response = await tonApiFetch(env, `/nfts/collections/${encodeURIComponent(collectionAddress)}/items?limit=${encodeURIComponent(String(limit))}&offset=0`);
    if (!response.ok) return [];
    const data = await response.json() as Record<string, unknown>;
    const rows = arrayValue(data.nft_items) || arrayValue(data.items) || [];
    return rows.map(toNft).filter((item): item is TonApiNft => Boolean(item.address));
  } catch {
    return [];
  }
}

function tonApiFetch(env: TonNftMarketEnv, path: string): Promise<Response> {
  return fetch(`${TONAPI_BASE_URL}${path}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${env.TONAPI_KEY || ''}`,
    },
    cf: { cacheTtl: 60, cacheEverything: true } as never,
  });
}

function toFragmentStyleMarketItem(item: TonApiNft): TonNftMarketItem | null {
  const address = text(item.address);
  if (!address) return null;
  const metadata = objectValue(item.metadata);
  const collection = item.collection || null;
  const collectionName = firstText(text(collection?.name), 'Telegram Gifts');
  const index = item.index != null ? String(item.index) : '';
  const title = firstText(
    text(metadata.name),
    text(metadata.title),
    index ? `${collectionName} #${index}` : '',
    'Telegram Gift'
  );
  const imageUrl = firstText(
    previewUrl(item.previews),
    text(metadata.image),
    text(metadata.image_url),
    text(metadata.content_url)
  );
  const price = salePriceTon(item.sale);
  const number = index ? `#${index}` : '';
  return {
    id: `fragment_${address}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 90),
    title,
    collection: 'Fragment Gifts',
    rarity: 'For sale',
    supply: number || 'For sale',
    utility: price ? `${price} TON` : 'For sale on Fragment',
    description: [number, price ? `${price} TON` : '', 'For sale on Fragment'].filter(Boolean).join(' · '),
    imageUrl: imageUrl || null,
    animationUrl: null,
    sourceUrl: null,
    badge: 'For sale',
    source: 'telegram',
    canTransfer: true,
    nextTransferDate: null,
    transferStars: null,
  };
}

function salePriceTon(sale: unknown): string {
  const raw = firstText(
    deepText(sale, ['price', 'value']),
    deepText(sale, ['price', 'amount']),
    deepText(sale, ['full_price']),
    deepText(sale, ['amount'])
  ).replace(/,/g, '.');
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return '';
  const ton = value > 1_000_000 ? value / 1_000_000_000 : value;
  return ton.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function sortMarketItems(items: TonNftMarketItem[], sort: string): TonNftMarketItem[] {
  return items.slice().sort((a, b) => {
    const pa = priceFromItem(a);
    const pb = priceFromItem(b);
    return sort === 'price_desc' ? pb - pa : pa - pb;
  });
}

function priceFromItem(item: TonNftMarketItem): number {
  const match = `${item.description} ${item.utility}`.match(/([0-9]+(?:\.[0-9]+)?)\s*TON/i);
  const value = match?.[1] ? Number(match[1]) : Number.NaN;
  return Number.isFinite(value) ? value : 999999999;
}

function toCollection(value: unknown): TonApiCollection {
  const object = objectValue(value);
  return { address: text(object.address), name: text(object.name) };
}

function toNft(value: unknown): TonApiNft {
  const object = objectValue(value);
  return {
    address: text(object.address),
    index: typeof object.index === 'number' || typeof object.index === 'string' ? object.index : undefined,
    metadata: objectValue(object.metadata),
    previews: arrayValue(object.previews) as TonApiNft['previews'],
    collection: objectValue(object.collection) as TonApiNft['collection'],
    sale: object.sale,
  };
}

function previewUrl(previews: TonApiNft['previews']): string {
  if (!Array.isArray(previews) || !previews.length) return '';
  return text(previews.slice().sort((a, b) => previewRank(b.resolution) - previewRank(a.resolution))[0]?.url);
}

function previewRank(value: string | undefined): number {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) || 0 : 0;
}

function dedupe(items: TonNftMarketItem[]): TonNftMarketItem[] {
  const seen = new Set<string>();
  const out: TonNftMarketItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function uniqueMatches(value: string, pattern: RegExp): string[] {
  const seen = new Set<string>();
  for (const match of value.matchAll(pattern)) {
    if (match[1]) seen.add(match[1]);
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

function arrayValue(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const out = text(value);
    if (out) return out;
  }
  return '';
}

function deepText(value: unknown, path: string[]): string {
  let cursor: unknown = value;
  for (const key of path) {
    const object = objectValue(cursor);
    if (!Object.keys(object).length) return '';
    cursor = object[key];
  }
  return text(cursor);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

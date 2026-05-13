import type { Env } from './types';

export type MarketAnimation = 'none' | 'spin' | 'glow' | 'shine' | 'pulse' | 'spin-glow';
export type MarketMediaType = 'image' | 'video';

export type MarketItem = {
  id: string;
  title: string;
  badge: string;
  price: string;
  stock: string;
  animation: MarketAnimation;
  mediaType: MarketMediaType;
  imageUrl: string | null;
};

type SavedMarketItem = Partial<Pick<MarketItem, 'title' | 'price' | 'stock' | 'animation'>>;

type R2Head = { customMetadata?: Record<string, string>; httpMetadata?: { contentType?: string } } | null;

export const MARKET_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']);
export const MARKET_ITEMS_KEY = 'admin:market-items';
export const MARKET_ANIMATIONS = new Set<MarketAnimation>(['none', 'spin', 'glow', 'shine', 'pulse', 'spin-glow']);

export const DEFAULT_MARKET_ITEMS: Array<Omit<MarketItem, 'imageUrl' | 'mediaType'>> = [
  { id: 'genesis', title: 'Genesis Vexa', badge: '1/100', price: '12.5', stock: '100', animation: 'none' },
  { id: 'ruby', title: 'Ruby Core', badge: 'Rare', price: '8.0', stock: '250', animation: 'none' },
  { id: 'nova', title: 'Nova Mask', badge: 'Epic', price: '15.75', stock: '120', animation: 'none' },
  { id: 'shadow', title: 'Shadow Pass', badge: 'Limited', price: '6.25', stock: '300', animation: 'none' },
  { id: 'orbit', title: 'Orbit Key', badge: 'Utility', price: '4.5', stock: '500', animation: 'none' },
  { id: 'pulse', title: 'Pulse Badge', badge: 'Common', price: '2.0', stock: '1000', animation: 'none' },
  { id: 'onyx', title: 'Onyx Crown', badge: 'Legend', price: '22.0', stock: '50', animation: 'none' },
  { id: 'flare', title: 'Flare Wing', badge: 'Rare', price: '9.5', stock: '180', animation: 'none' },
  { id: 'ghost', title: 'Ghost Node', badge: 'Epic', price: '14.0', stock: '90', animation: 'none' },
  { id: 'matrix', title: 'Matrix Chip', badge: 'Utility', price: '5.75', stock: '350', animation: 'none' },
  { id: 'crystal', title: 'Crystal Bot', badge: 'Rare', price: '7.25', stock: '220', animation: 'none' },
  { id: 'void', title: 'Void Signal', badge: 'Limited', price: '18.5', stock: '70', animation: 'none' },
  { id: 'neon', title: 'Neon Fang', badge: 'Common', price: '3.0', stock: '800', animation: 'none' },
  { id: 'omega', title: 'Omega Key', badge: 'Epic', price: '16.0', stock: '110', animation: 'none' },
  { id: 'prism', title: 'Prism Eye', badge: 'Rare', price: '10.25', stock: '160', animation: 'none' },
  { id: 'alpha', title: 'Alpha Mark', badge: '1/50', price: '25.0', stock: '50', animation: 'none' },
];

export function marketImageKey(id: string): string {
  return `market-items/${normalizeMarketItemId(id)}`;
}

export function normalizeMarketItemId(id: string): string {
  const cleaned = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  if (!DEFAULT_MARKET_ITEMS.some((item) => item.id === cleaned)) throw new Error('Unknown market item');
  return cleaned;
}

export function normalizeMarketAnimation(value: unknown): MarketAnimation {
  const animation = String(value || 'none') as MarketAnimation;
  return MARKET_ANIMATIONS.has(animation) ? animation : 'none';
}

export async function getMarketItems(env: Env): Promise<{ items: MarketItem[] }> {
  const saved = await readSavedItems(env);
  const items = await Promise.all(DEFAULT_MARKET_ITEMS.map(async (item) => {
    const custom = saved[item.id] || {};
    const head = await env.ASSETS.head(marketImageKey(item.id)).catch(() => null) as R2Head;
    const version = head?.customMetadata?.version || '1';
    const contentType = head?.httpMetadata?.contentType || '';
    return {
      ...item,
      title: cleanText(custom.title, item.title, 80),
      price: cleanText(custom.price, item.price, 24),
      stock: cleanText(custom.stock, item.stock, 24),
      animation: normalizeMarketAnimation(custom.animation || item.animation),
      mediaType: contentType.startsWith('video/') ? 'video' : 'image',
      imageUrl: head ? `/app/api/market-item-image/${item.id}.png?v=${version}` : null,
    };
  }));
  return { items };
}

export async function setMarketItem(env: Env, id: string, input: SavedMarketItem): Promise<{ items: MarketItem[] }> {
  const itemId = normalizeMarketItemId(id);
  const saved = await readSavedItems(env);
  saved[itemId] = {
    ...(saved[itemId] || {}),
    title: cleanOptional(input.title),
    price: cleanOptional(input.price),
    stock: cleanOptional(input.stock),
    animation: normalizeMarketAnimation(input.animation),
  };
  await env.BOT_CACHE.put(MARKET_ITEMS_KEY, JSON.stringify(saved));
  return getMarketItems(env);
}

async function readSavedItems(env: Env): Promise<Record<string, SavedMarketItem>> {
  const raw = await env.BOT_CACHE.get(MARKET_ITEMS_KEY, 'json').catch(() => null) as Record<string, SavedMarketItem> | null;
  return raw && typeof raw === 'object' ? raw : {};
}

function cleanOptional(value: unknown): string | undefined {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, 80) : undefined;
}

function cleanText(value: unknown, fallback: string, limit: number): string {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, limit) : fallback;
}

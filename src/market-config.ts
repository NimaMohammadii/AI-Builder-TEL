import type { Env } from './types';

export type MarketAnimation = 'none' | 'spin' | 'glow' | 'shine' | 'pulse' | 'spin-glow';
export type MarketMediaType = 'image';

export type MarketItem = {
  id: string;
  title: string;
  badge: string;
  price: string;
  stock: string;
  animation: MarketAnimation;
  mediaType: MarketMediaType;
  imageUrl: string | null;
  symbol: string;
  collection: string;
  rarity: string;
  tag: string;
  supply: string;
  edition: string;
  utility: string;
  description: string;
};

type SavedMarketItem = Partial<Pick<MarketItem, 'title' | 'price' | 'stock' | 'animation' | 'symbol' | 'collection' | 'rarity' | 'tag' | 'supply' | 'edition' | 'utility' | 'description'>>;

type R2Head = { customMetadata?: Record<string, string>; httpMetadata?: { contentType?: string } } | null;

export const MARKET_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
export const MARKET_MEDIA_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);
export const MARKET_ITEMS_KEY = 'admin:market-items';
export const MARKET_ANIMATIONS = new Set<MarketAnimation>(['none', 'spin', 'glow', 'shine', 'pulse', 'spin-glow']);

export const DEFAULT_MARKET_ITEMS: Array<Omit<MarketItem, 'imageUrl' | 'mediaType'>> = [
  { id: 'genesis', title: 'Genesis Vexa', badge: '1/100', price: '12.5', stock: '100', animation: 'none', symbol: 'VEX-GEN', collection: 'Vexa Genesis', rarity: 'Genesis', tag: 'Founders', supply: '100', edition: '1/100', utility: 'Early access badge and future Vexa perks.', description: 'The first internal Vexa collectible series. Ownership is stored inside Vexa and can later support marketplace actions.' },
  { id: 'ruby', title: 'Ruby Core', badge: 'Rare', price: '8.0', stock: '250', animation: 'none', symbol: 'VEX-RBY', collection: 'Vexa Core', rarity: 'Rare', tag: 'Core', supply: '250', edition: 'Open #250', utility: 'Profile style and marketplace collectible.', description: 'A Ruby powered Vexa collectible with rare core energy.' },
  { id: 'nova', title: 'Nova Mask', badge: 'Epic', price: '15.75', stock: '120', animation: 'none', symbol: 'VEX-NVA', collection: 'Vexa Masks', rarity: 'Epic', tag: 'Mask', supply: '120', edition: 'Open #120', utility: 'Epic collectible for future avatar and profile features.', description: 'A sharp Nova mask collectible designed for premium Vexa holders.' },
  { id: 'shadow', title: 'Shadow Pass', badge: 'Limited', price: '6.25', stock: '300', animation: 'none', symbol: 'VEX-SHD', collection: 'Vexa Passes', rarity: 'Limited', tag: 'Pass', supply: '300', edition: 'Limited #300', utility: 'Access-style collectible for future in-app gates.', description: 'A limited Shadow Pass collectible for the Vexa ecosystem.' },
  { id: 'orbit', title: 'Orbit Key', badge: 'Utility', price: '4.5', stock: '500', animation: 'none', symbol: 'VEX-ORB', collection: 'Vexa Keys', rarity: 'Utility', tag: 'Key', supply: '500', edition: 'Utility #500', utility: 'Utility collectible for future unlocks.', description: 'A Vexa Orbit Key collectible built for future utility unlocks.' },
  { id: 'pulse', title: 'Pulse Badge', badge: 'Common', price: '2.0', stock: '1000', animation: 'none', symbol: 'VEX-PLS', collection: 'Vexa Badges', rarity: 'Common', tag: 'Badge', supply: '1000', edition: 'Common #1000', utility: 'Basic collectible badge.', description: 'A common Pulse Badge for starting a Vexa collectible profile.' },
  { id: 'onyx', title: 'Onyx Crown', badge: 'Legend', price: '22.0', stock: '50', animation: 'none', symbol: 'VEX-ONX', collection: 'Vexa Relics', rarity: 'Legendary', tag: 'Crown', supply: '50', edition: 'Legend #50', utility: 'Legendary status collectible.', description: 'A rare Onyx Crown collectible made for top-tier Vexa status.' },
  { id: 'flare', title: 'Flare Wing', badge: 'Rare', price: '9.5', stock: '180', animation: 'none', symbol: 'VEX-FLR', collection: 'Vexa Wings', rarity: 'Rare', tag: 'Wing', supply: '180', edition: 'Rare #180', utility: 'Visual collectible for future display features.', description: 'A Flare Wing collectible with bright Vexa energy.' },
  { id: 'ghost', title: 'Ghost Node', badge: 'Epic', price: '14.0', stock: '90', animation: 'none', symbol: 'VEX-GST', collection: 'Vexa Nodes', rarity: 'Epic', tag: 'Node', supply: '90', edition: 'Epic #90', utility: 'Epic node collectible.', description: 'A Ghost Node collectible for high-value Vexa collectors.' },
  { id: 'matrix', title: 'Matrix Chip', badge: 'Utility', price: '5.75', stock: '350', animation: 'none', symbol: 'VEX-MTX', collection: 'Vexa Chips', rarity: 'Utility', tag: 'Chip', supply: '350', edition: 'Utility #350', utility: 'Utility chip collectible.', description: 'A Matrix Chip collectible with future utility potential.' },
  { id: 'crystal', title: 'Crystal Bot', badge: 'Rare', price: '7.25', stock: '220', animation: 'none', symbol: 'VEX-CRY', collection: 'Vexa Bots', rarity: 'Rare', tag: 'Bot', supply: '220', edition: 'Rare #220', utility: 'Bot-themed profile collectible.', description: 'A Crystal Bot collectible built around the Vexa bot identity.' },
  { id: 'void', title: 'Void Signal', badge: 'Limited', price: '18.5', stock: '70', animation: 'none', symbol: 'VEX-VOID', collection: 'Vexa Signals', rarity: 'Limited', tag: 'Signal', supply: '70', edition: 'Limited #70', utility: 'Limited signal collectible.', description: 'A dark Void Signal collectible for limited Vexa drops.' },
  { id: 'neon', title: 'Neon Fang', badge: 'Common', price: '3.0', stock: '800', animation: 'none', symbol: 'VEX-NEO', collection: 'Vexa Fangs', rarity: 'Common', tag: 'Fang', supply: '800', edition: 'Common #800', utility: 'Entry collectible.', description: 'A Neon Fang collectible for everyday Vexa holders.' },
  { id: 'omega', title: 'Omega Key', badge: 'Epic', price: '16.0', stock: '110', animation: 'none', symbol: 'VEX-OMG', collection: 'Vexa Keys', rarity: 'Epic', tag: 'Key', supply: '110', edition: 'Epic #110', utility: 'Epic key collectible.', description: 'An Omega Key collectible for premium Vexa unlock concepts.' },
  { id: 'prism', title: 'Prism Eye', badge: 'Rare', price: '10.25', stock: '160', animation: 'none', symbol: 'VEX-PRI', collection: 'Vexa Eyes', rarity: 'Rare', tag: 'Eye', supply: '160', edition: 'Rare #160', utility: 'Visual identity collectible.', description: 'A Prism Eye collectible with rare visual status.' },
  { id: 'alpha', title: 'Alpha Mark', badge: '1/50', price: '25.0', stock: '50', animation: 'none', symbol: 'VEX-ALP', collection: 'Vexa Alpha', rarity: 'Alpha', tag: 'Mark', supply: '50', edition: '1/50', utility: 'Alpha status and future premium perks.', description: 'A scarce Alpha Mark collectible for the earliest premium Vexa holders.' },
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

export function marketMediaExtension(fileName: string): string {
  return String(fileName || '').split('.').pop()?.toLowerCase() || '';
}

export function marketContentType(type: string, fileName: string): string {
  const cleanType = String(type || '').toLowerCase();
  if (MARKET_IMAGE_TYPES.has(cleanType)) return cleanType === 'image/jpg' ? 'image/jpeg' : cleanType;
  const extension = marketMediaExtension(fileName);
  if (extension === 'png') return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'gif') return 'image/gif';
  return cleanType;
}

export function marketMediaTypeFromContentType(_contentType: string): MarketMediaType {
  return 'image';
}

export function isAllowedMarketMedia(type: string, fileName: string): boolean {
  const cleanType = String(type || '').toLowerCase();
  if (MARKET_IMAGE_TYPES.has(cleanType)) return true;
  return MARKET_MEDIA_EXTENSIONS.has(marketMediaExtension(fileName));
}

export async function getMarketItems(env: Env): Promise<{ items: MarketItem[] }> {
  const saved = await readSavedItems(env);
  const items = await Promise.all(DEFAULT_MARKET_ITEMS.map(async (item) => {
    const custom = saved[item.id] || {};
    const head = await env.ASSETS.head(marketImageKey(item.id)).catch(() => null) as R2Head;
    const version = head?.customMetadata?.version || '1';
    return {
      ...item,
      title: cleanText(custom.title, item.title, 80),
      price: cleanText(custom.price, item.price, 24),
      stock: cleanText(custom.stock, item.stock, 24),
      animation: normalizeMarketAnimation(custom.animation || item.animation),
      symbol: cleanText(custom.symbol, item.symbol, 24),
      collection: cleanText(custom.collection, item.collection, 80),
      rarity: cleanText(custom.rarity, item.rarity, 40),
      tag: cleanText(custom.tag, item.tag, 40),
      supply: cleanText(custom.supply, item.supply, 24),
      edition: cleanText(custom.edition, item.edition, 40),
      utility: cleanText(custom.utility, item.utility, 180),
      description: cleanText(custom.description, item.description, 280),
      mediaType: 'image',
      imageUrl: head ? `/app/api/market-item-media/${item.id}?v=${version}` : null,
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
    symbol: cleanOptional(input.symbol),
    collection: cleanOptional(input.collection),
    rarity: cleanOptional(input.rarity),
    tag: cleanOptional(input.tag),
    supply: cleanOptional(input.supply),
    edition: cleanOptional(input.edition),
    utility: cleanOptional(input.utility),
    description: cleanOptional(input.description),
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
  return text ? text.slice(0, 280) : undefined;
}

function cleanText(value: unknown, fallback: string, limit: number): string {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, limit) : fallback;
}

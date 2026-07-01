import type { Hono } from 'hono';
import { loadTonNftMarket } from './ton-nft-market';
import { registerDailyRewardsImageRoutes } from './daily-rewards-image-routes';
import { registerDailyRewardsAdminRoutes } from './daily-rewards-admin-routes';
import { registerTopPlayersImageRoutes } from './top-players-image-routes';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

const APP_CACHE_VERSION_KEY = 'admin:app-cache-version';
const MARKET_PROVIDER_SETTING_KEY = 'market_provider';
const FRAGMENT_GIFTS_URL = 'https://fragment.com/gifts?sort=price_asc&filter=sale';
const DEFAULT_GIFT_LIMIT = 90;
const MAX_GIFT_LIMIT = 180;

type MarketProvider = 'getgems' | 'fragment';

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

export function registerAdminForceRefreshRoutes(app: Hono<{ Bindings: Env }>): void {
  registerDailyRewardsImageRoutes(app);
  registerDailyRewardsAdminRoutes(app);
  registerTopPlayersImageRoutes(app);

  app.get('/app/api/app-version', async (c) => {
    const version = await getAppVersion(c.env);
    return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
  });

  app.get('/app/api/ton-gift-market-fresh', async (c) => {
    try {
      const sort = c.req.query('sort') === 'price_desc' ? 'price_desc' : 'price_asc';
      const limit = clampInt(c.req.query('limit'), 1, MAX_GIFT_LIMIT, DEFAULT_GIFT_LIMIT);
      const offset = clampInt(c.req.query('offset'), 0, 100000, 0);
      const provider = await getMarketProvider(c.env);
      const gifts = provider === 'getgems' ? await loadTonNftMarket(c.env, { sort, limit: MAX_GIFT_LIMIT }) as Gift[] : await loadFreshFragmentGifts(sort);
      const page = gifts.slice(offset, offset + limit);
      return c.json({
        provider,
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
    if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
    const version = String(Date.now());
    await c.env.BOT_CACHE.put(APP_CACHE_VERSION_KEY, version);
    return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
  });
}

async function ensureAppSettings(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getMarketProvider(env: Env): Promise<MarketProvider> {
  await ensureAppSettings(env);
  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind(MARKET_PROVIDER_SETTING_KEY).first<{ value: string }>().catch(() => null);
  const value = String(row?.value || '').trim().toLowerCase();
  return value === 'fragment' ? 'fragment' : 'getgems';
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

function isAdmin(env: Env, key: string): Promise<boolean> {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

async function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<boolean> {
  return isAdminSession(c.env, c.req.header('cookie'));
}

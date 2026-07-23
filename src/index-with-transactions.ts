import app from './index-admin-plinko';
import { registerAdvancedAdminRoutes } from './admin-advanced-routes';
import { groupAiProviderJson, setGroupAiProvider } from './group-ai-provider';
import { registerGroupPhotoEndpoint } from './group-photo-endpoint';
import { registerHomeImageCacheEndpoint } from './home-image-cache-endpoint';
import { listUserTonTransactions, listUserTonWalletTransactions } from './ton-transactions';
import { adjustUserTonBalance, setUserTonBalance } from './user-controls';
import { addUserXp, getUserLevel } from './levels';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

const HOME_FINANCE_IMAGE_KEY = 'home-finance/image';
const TON_GIFT_NFT_CACHE_SECONDS = 120;
const FRAGMENT_GIFTS_URL = 'https://fragment.com/gifts?sort=price_asc&filter=sale';
const FRAGMENT_DETAIL_ANIMATION_LIMIT = 18;

type TonGiftEnv = Env;

type TonGiftView = {
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

registerGroupPhotoEndpoint(app);
registerHomeImageCacheEndpoint(app);
registerAdvancedAdminRoutes(app);

app.get('/admin/api/group-ai-provider', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await groupAiProviderJson(c.env));
});

app.post('/admin/api/group-ai-provider', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const body = await c.req.json() as { provider?: unknown };
    return c.json(await setGroupAiProvider(c.env, body.provider));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save group AI provider' }, 400);
  }
});

app.post('/admin/api/users/credit', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const body = await c.req.json() as { userId?: unknown; credit?: unknown; tonBalanceNano?: unknown };
    const value = body.tonBalanceNano ?? body.credit ?? 0;
    return c.json(await setUserTonBalance(c.env, String(body.userId || ''), Number(value) || 0, { title: 'Admin balance update' }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not update TON balance' }, 400);
  }
});

app.post('/admin/api/users/credit-adjust', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const body = await c.req.json() as { userId?: unknown; delta?: unknown; deltaNano?: unknown };
    const value = body.deltaNano ?? body.delta ?? 0;
    return c.json(await adjustUserTonBalance(c.env, String(body.userId || ''), Number(value) || 0, { kind: 'admin', title: 'Admin balance adjustment' }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not adjust TON balance' }, 400);
  }
});

app.post('/app/api/groups/:chatId/payer', async (c) => {
  try {
    const chatId = c.req.param('chatId');
    const body = await c.req.json() as { userId?: unknown; username?: unknown; firstName?: unknown };
    const userId = String(body.userId || '').replace(/[^0-9]/g, '').slice(0, 32);
    if (!chatId || !userId) return c.json({ error: 'Missing chatId or userId' }, 400);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_user_id TEXT').run().catch(() => undefined);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_username TEXT').run().catch(() => undefined);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_first_name TEXT').run().catch(() => undefined);
    const result = await c.env.DB.prepare(`UPDATE bot_groups SET added_by_user_id = ?, added_by_username = ?, added_by_first_name = ?, last_seen_at = CURRENT_TIMESTAMP WHERE bot_id = 'main' AND chat_id = ? AND (added_by_user_id IS NULL OR added_by_user_id = '')`)
      .bind(userId, String(body.username || '').slice(0, 80) || null, String(body.firstName || '').slice(0, 120) || null, chatId)
      .run();
    return c.json({ ok: true, chatId, userId, claimed: (result.meta?.changes ?? 0) > 0 });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not set group payer' }, 400);
  }
});

app.get('/app/api/level', async (c) => {
  try {
    return c.json(await getUserLevel(c.env, c.req.query('userId') || ''), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load level' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/app/api/level/xp', async (c) => {
  try {
    const body = await c.req.json() as { userId?: string; amount?: unknown; source?: unknown; metadata?: unknown; eventId?: unknown };
    return c.json(await addUserXp(c.env, body.userId || '', body.amount, body.source || 'manual', body.metadata || {}, body.eventId), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not add XP' }, 400, { 'cache-control': 'no-store' });
  }
});

app.get('/app/api/ton/history', async (c) => {
  try {
    const userId = String(c.req.query('userId') || '');
    const limit = Number(c.req.query('limit') || 50);
    const walletOnly = String(c.req.query('wallet') || '') === '1';
    const result = walletOnly
      ? await listUserTonWalletTransactions(c.env, userId, limit)
      : await listUserTonTransactions(c.env, userId, limit);
    return c.json(result, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load history' }, 400);
  }
});

app.get('/app/api/ton-gift-market', async (c) => {
  try {
    const gifts = await loadFragmentGiftMarket(c.env as TonGiftEnv);
    return c.json({ gifts }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ gifts: [], error: error instanceof Error ? error.message : 'Could not load Fragment Gift market' }, 200, { 'cache-control': 'no-store' });
  }
});

app.get('/app/api/home-finance-image-meta', async (c) => {
  try {
    const object = await c.env.ASSETS.head(HOME_FINANCE_IMAGE_KEY).catch(() => null);
    const version = object?.customMetadata?.version || object?.uploaded?.getTime?.() || 'default';
    return c.json({ ok: true, version: String(version), url: `/app/api/home-finance-image-cached.png?v=${encodeURIComponent(String(version))}` }, 200, {
      'cache-control': 'private, max-age=300',
    });
  } catch (error) {
    return c.json({ ok: true, version: 'default', url: '/app/api/home-finance-image-cached.png?v=default' }, 200, {
      'cache-control': 'private, max-age=300',
    });
  }
});

async function loadFragmentGiftMarket(env: TonGiftEnv): Promise<TonGiftView[]> {
  const cacheKey = 'fragment:gifts:for-sale:v3';
  const cached = await env.BOT_CACHE.get(cacheKey, 'json').catch(() => null) as TonGiftView[] | null;
  if (Array.isArray(cached)) return cached;
  const response = await fetch(FRAGMENT_GIFTS_URL, {
    headers: fragmentHeaders(),
    cf: { cacheTtl: TON_GIFT_NFT_CACHE_SECONDS, cacheEverything: true } as never,
  });
  if (!response.ok) throw new Error(`Fragment Gift market failed: ${response.status}`);
  const html = await response.text();
  const baseGifts = parseFragmentGifts(html).slice(0, 80);
  if (!baseGifts.length) throw new Error('Fragment Gift market returned no parsable gifts');
  const animated = await attachFragmentDetailAnimations(baseGifts);
  await env.BOT_CACHE.put(cacheKey, JSON.stringify(animated), { expirationTtl: TON_GIFT_NFT_CACHE_SECONDS }).catch(() => undefined);
  return animated;
}

function fragmentHeaders(): HeadersInit {
  return {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  };
}

async function attachFragmentDetailAnimations(gifts: TonGiftView[]): Promise<TonGiftView[]> {
  const head = gifts.slice(0, FRAGMENT_DETAIL_ANIMATION_LIMIT);
  const tail = gifts.slice(FRAGMENT_DETAIL_ANIMATION_LIMIT);
  const enriched = await Promise.all(head.map(async (gift) => {
    if (gift.animationUrl || !gift.sourceUrl) return gift;
    try {
      const response = await fetch(gift.sourceUrl, { headers: fragmentHeaders(), cf: { cacheTtl: TON_GIFT_NFT_CACHE_SECONDS, cacheEverything: true } as never });
      if (!response.ok) return gift;
      const html = await response.text();
      const animation = fragmentGiftAnimation(html);
      const image = gift.imageUrl || fragmentGiftImage(html);
      return { ...gift, imageUrl: image, animationUrl: animation || gift.animationUrl || null };
    } catch {
      return gift;
    }
  }));
  return [...enriched, ...tail];
}

function parseFragmentGifts(html: string): TonGiftView[] {
  const gifts: TonGiftView[] = [];
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
  return firstMatch(block, [/#\s*([0-9]{2,})/i]) ? `#${firstMatch(block, [/#\s*([0-9]{2,})/i])}` : (href.match(/(\d{2,})$/)?.[1] ? `#${href.match(/(\d{2,})$/)?.[1]}` : '');
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
  return src ? absoluteFragmentUrl(decodeHtml(src).replace(/^["']|["']$/g, '')) : null;
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
  const value = src ? absoluteFragmentUrl(decodeHtml(src).replace(/^["']|["']$/g, '')) : '';
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(value) ? value : null;
}

function dedupeGifts(gifts: TonGiftView[]): TonGiftView[] {
  const seen = new Set<string>();
  const out: TonGiftView[] = [];
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

export default app;

import app from './index-admin-plinko';
import { registerAdvancedAdminRoutes } from './admin-advanced-routes';
import { groupAiProviderJson, setGroupAiProvider } from './group-ai-provider';
import { registerGroupPhotoEndpoint } from './group-photo-endpoint';
import { registerHomeImageCacheEndpoint } from './home-image-cache-endpoint';
import { listUserTonTransactions } from './ton-transactions';
import { adjustUserTonBalance, setUserTonBalance } from './user-controls';
import { addUserXp, getUserLevel } from './levels';
import type { Env } from './types';

const HOME_FINANCE_IMAGE_KEY = 'home-finance/image';
const TON_GIFT_NFT_CACHE_SECONDS = 120;

type TonGiftEnv = Env & {
  TONAPI_BASE_URL?: string;
  TONAPI_KEY?: string;
  TON_GIFT_COLLECTIONS?: string;
};

type TonGiftView = {
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

registerGroupPhotoEndpoint(app);
registerHomeImageCacheEndpoint(app);
registerAdvancedAdminRoutes(app);

app.get('/admin/api/group-ai-provider', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await groupAiProviderJson(c.env));
});

app.post('/admin/api/group-ai-provider', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const body = await c.req.json() as { provider?: unknown };
    return c.json(await setGroupAiProvider(c.env, body.provider));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save group AI provider' }, 400);
  }
});

app.post('/admin/api/users/credit', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const body = await c.req.json() as { userId?: unknown; credit?: unknown; tonBalanceNano?: unknown };
    const value = body.tonBalanceNano ?? body.credit ?? 0;
    return c.json(await setUserTonBalance(c.env, String(body.userId || ''), Number(value) || 0, { title: 'Admin balance update' }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not update TON balance' }, 400);
  }
});

app.post('/admin/api/users/credit-adjust', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
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
    return c.json(await getUserLevel(c.env, c.req.query('userId') || ''));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load level' }, 400);
  }
});

app.post('/app/api/level/xp', async (c) => {
  try {
    const body = await c.req.json() as { userId?: string; amount?: unknown; source?: unknown; metadata?: unknown };
    return c.json(await addUserXp(c.env, body.userId || '', body.amount, body.source || 'manual', body.metadata || {}));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not add XP' }, 400);
  }
});

app.get('/app/api/ton/history', async (c) => {
  try {
    const userId = String(c.req.query('userId') || '');
    const limit = Number(c.req.query('limit') || 50);
    const walletOnly = String(c.req.query('wallet') || '') === '1';
    const result = await listUserTonTransactions(c.env, userId, limit);
    return c.json(walletOnly ? {
      transactions: result.transactions.filter((item) => item.kind === 'deposit' || item.kind === 'withdraw'),
    } : result);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load history' }, 400);
  }
});

app.get('/app/api/ton-gift-market', async (c) => {
  try {
    const gifts = await loadTonGiftNfts(c.env as TonGiftEnv);
    return c.json({ gifts }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ gifts: [], error: error instanceof Error ? error.message : 'Could not load TON Gift NFTs' }, 200, { 'cache-control': 'no-store' });
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

async function loadTonGiftNfts(env: TonGiftEnv): Promise<TonGiftView[]> {
  const collections = splitCsv(env.TON_GIFT_COLLECTIONS);
  if (!collections.length) throw new Error('TON_GIFT_COLLECTIONS is not configured');
  const baseUrl = String(env.TONAPI_BASE_URL || 'https://tonapi.io').replace(/\/+$/, '');
  const cacheKey = `tonapi:gifts:${await hashKey(`${baseUrl}:${collections.join(',')}`)}`;
  const cached = await env.BOT_CACHE.get(cacheKey, 'json').catch(() => null) as TonGiftView[] | null;
  if (Array.isArray(cached)) return cached;
  const batches = await Promise.all(collections.map((collection) => loadTonApiCollectionItems(env, baseUrl, collection)));
  const gifts = batches.flat().slice(0, 80);
  await env.BOT_CACHE.put(cacheKey, JSON.stringify(gifts), { expirationTtl: TON_GIFT_NFT_CACHE_SECONDS }).catch(() => undefined);
  return gifts;
}

async function loadTonApiCollectionItems(env: TonGiftEnv, baseUrl: string, collection: string): Promise<TonGiftView[]> {
  const url = `${baseUrl}/v2/nfts/collections/${encodeURIComponent(collection)}/items?limit=40&offset=0`;
  const response = await fetch(url, {
    headers: tonApiHeaders(env),
    cf: { cacheTtl: TON_GIFT_NFT_CACHE_SECONDS, cacheEverything: true } as never,
  });
  if (!response.ok) throw new Error(`TonAPI collection load failed: ${response.status}`);
  const json = await response.json().catch(() => null);
  const rows = tonApiRows(json);
  return rows.map((item, index) => normalizeTonApiNft(item, collection, index)).filter(Boolean) as TonGiftView[];
}

function tonApiHeaders(env: TonGiftEnv): HeadersInit {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (env.TONAPI_KEY) headers.authorization = `Bearer ${env.TONAPI_KEY}`;
  return headers;
}

function tonApiRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(isRecord) as Record<string, unknown>[];
  const object = record(value);
  for (const key of ['nft_items', 'items', 'results', 'data']) {
    if (Array.isArray(object[key])) return object[key].filter(isRecord) as Record<string, unknown>[];
  }
  return [];
}

function normalizeTonApiNft(item: Record<string, unknown>, collection: string, index: number): TonGiftView | null {
  const metadata = record(item.metadata);
  const previews = Array.isArray(item.previews) ? item.previews.filter(isRecord) as Record<string, unknown>[] : [];
  const preview = previews.find((entry) => String(entry.resolution || '').includes('500')) || previews[0] || {};
  const address = text(item.address) || text(item.account_address) || `${collection}_${index}`;
  const name = text(metadata.name) || text(item.dns) || `TON Gift #${index + 1}`;
  const image = text(preview.url) || text(item.image) || text(metadata.image) || text(metadata.image_url) || null;
  const collectionInfo = record(item.collection);
  const collectionName = text(collectionInfo.name) || text(collectionInfo.title) || 'Telegram Gift NFTs';
  return {
    id: `tonapi_${address}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 90),
    title: name,
    collection: collectionName,
    rarity: text(metadata.model) || text(metadata.rarity) || 'TON NFT',
    supply: text(metadata.number) || text(item.index) || 'NFT',
    utility: 'TON NFT',
    description: text(metadata.description) || 'Telegram Gift NFT on TON.',
    imageUrl: image,
    badge: 'TON NFT',
    source: 'telegram',
    canTransfer: true,
    nextTransferDate: null,
    transferStars: null,
  };
}

function splitCsv(value: unknown): string[] {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

async function hashKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function record(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function text(value: unknown): string {
  return String(value ?? '').trim();
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

export default app;

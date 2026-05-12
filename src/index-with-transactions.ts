import app from './index-admin-plinko';
import { groupAiProviderJson, setGroupAiProvider } from './group-ai-provider';
import { registerGroupPhotoEndpoint } from './group-photo-endpoint';
import { registerHomeImageCacheEndpoint } from './home-image-cache-endpoint';
import { listUserTonTransactions } from './ton-transactions';
import { adjustUserTonBalance, setUserTonBalance } from './user-controls';
import { addUserXp, getUserLevel } from './levels';
import type { Env } from './types';

const HOME_FINANCE_IMAGE_KEY = 'home-finance/image';

registerGroupPhotoEndpoint(app);
registerHomeImageCacheEndpoint(app);

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

import app from './index-admin-plinko';
import { listUserTonTransactions } from './ton-transactions';
import { addUserXp, getUserLevel } from './levels';

const HOME_FINANCE_IMAGE_KEY = 'home-finance/image';

app.post('/app/api/groups/:chatId/payer', async (c) => {
  try {
    const chatId = c.req.param('chatId');
    const body = await c.req.json() as { userId?: unknown; username?: unknown; firstName?: unknown };
    const userId = String(body.userId || '').replace(/[^0-9]/g, '').slice(0, 32);
    if (!chatId || !userId) return c.json({ error: 'Missing chatId or userId' }, 400);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_user_id TEXT').run().catch(() => undefined);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_username TEXT').run().catch(() => undefined);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_first_name TEXT').run().catch(() => undefined);
    await c.env.DB.prepare(`UPDATE bot_groups SET added_by_user_id = ?, added_by_username = ?, added_by_first_name = ?, last_seen_at = CURRENT_TIMESTAMP WHERE bot_id = 'main' AND chat_id = ?`)
      .bind(userId, String(body.username || '').slice(0, 80) || null, String(body.firstName || '').slice(0, 120) || null, chatId)
      .run();
    return c.json({ ok: true, chatId, userId });
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
    return c.json({ ok: true, version: String(version), url: `/app/api/home-finance-image.png?v=${encodeURIComponent(String(version))}` }, 200, {
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
    });
  } catch (error) {
    return c.json({ ok: true, version: 'default', url: '/app/api/home-finance-image.png?v=default' }, 200, {
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
    });
  }
});

export default app;

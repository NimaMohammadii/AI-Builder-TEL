import app from './index-admin';
import { getPlinkoControl, resetPlinkoControl, savePlinkoControl } from './plinko-control';
import { createStarsDeposit, listUserStarsDeposits } from './stars-deposits';
import { createTonDeposit, getTonDeposit, listUserTonDeposits, verifyTonDeposit } from './ton-deposits';
import { createTonWithdrawal, listUserTonWithdrawals } from './ton-withdrawals';
import { getSectionLocks, normalizeSectionId, normalizeSectionImageKind, SECTION_LOCK_IMAGE_TYPES, sectionImageKey, sectionImageR2Key, sectionImageVersionKey } from './section-locks';
import { setTelegramWebhook } from './telegram-agent-safe';
import { registerAdminForceRefreshRoutes } from './admin-force-refresh-routes';
import { registerRankCharacterRoutes } from './rank-character-routes';
import { registerPlinkoLiveRoutes, PlinkoLiveRoom } from './plinko-live';
import type { Env } from './types';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const HOME_IMAGE_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0';
const HOME_FINANCE_IMAGE_KEY = 'home-finance/image';
const CRASH_TIP_IMAGE_KEY = 'crash-tip/image';
const NFT_PRICE_ICON_KEY = 'market/nft-price-icon';

registerAdminForceRefreshRoutes(app);
registerRankCharacterRoutes(app);
registerPlinkoLiveRoutes(app);

app.get('/app/api/plinko-control', async (c) => c.json(await getPlinkoControl(c.env)));

app.get('/app/api/nft-price-icon.png', async (c) => {
  const object = await c.env.ASSETS.get(NFT_PRICE_ICON_KEY).catch(() => null);
  if (!object) return new Response(defaultNftPriceIconSvg(), { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': IMAGE_CACHE_CONTROL } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': IMAGE_CACHE_CONTROL } });
});

app.post('/admin/api/upload-nft-price-icon', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 1_200_000) return c.json({ error: 'Image must be under 1.2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(NFT_PRICE_ICON_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: `/app/api/nft-price-icon.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload NFT price icon' }, 400);
  }
});

app.get('/app/api/main-bot', async (c) => {
  try {
    const webhook = await setTelegramWebhook(c.env).catch((error) => ({ ok: false, description: error instanceof Error ? error.message : 'Could not sync webhook' }));
    const me = await telegram<{ ok: boolean; result?: { username?: string; first_name?: string }; description?: string }>(c.env.TELEGRAM_BOT_TOKEN, 'getMe', {});
    if (!me.ok || !me.result?.username) return c.json({ error: me.description || 'Main bot username not found' }, 502);
    if (!webhook.ok) console.warn('main bot webhook sync failed before group add', webhook.description);
    return c.json({ username: me.result.username, title: me.result.first_name || 'Vexa', addGroupUrl: `https://t.me/${me.result.username}?startgroup=true`, webhook });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load main bot' }, 502);
  }
});

app.post('/app/api/stars/deposits', async (c) => {
  try {
    const body = await c.req.json() as { userId?: string; stars?: unknown };
    return c.json(await createStarsDeposit(c.env, String(body.userId || ''), body.stars));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not create Stars deposit' }, 400);
  }
});

app.get('/app/api/stars/deposits', async (c) => {
  try {
    return c.json(await listUserStarsDeposits(c.env, String(c.req.query('userId') || '')));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load Stars deposits' }, 400);
  }
});

app.post('/app/api/ton/withdrawals', async (c) => {
  try {
    const body = await c.req.json() as { userId?: string; amountTon?: unknown; walletAddress?: unknown };
    return c.json(await createTonWithdrawal(c.env, body.userId, body.amountTon, body.walletAddress));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not create TON withdrawal' }, 400);
  }
});

app.get('/app/api/ton/withdrawals', async (c) => {
  try {
    return c.json(await listUserTonWithdrawals(c.env, String(c.req.query('userId') || '')));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load TON withdrawals' }, 400);
  }
});

app.post('/app/api/ton/deposits', async (c) => {
  try {
    const body = await c.req.json() as { userId?: string; amountTon?: unknown };
    return c.json(await createTonDeposit(c.env, String(body.userId || ''), body.amountTon));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not create TON deposit' }, 400);
  }
});

app.get('/app/api/ton/deposits', async (c) => {
  try {
    return c.json(await listUserTonDeposits(c.env, String(c.req.query('userId') || '')));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load TON deposits' }, 400);
  }
});

app.get('/app/api/ton/deposits/:id', async (c) => {
  try {
    const deposit = await getTonDeposit(c.env, c.req.param('id'));
    return deposit ? c.json(deposit) : c.json({ error: 'Deposit not found' }, 404);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load TON deposit' }, 400);
  }
});

app.post('/app/api/ton/deposits/:id/verify', async (c) => {
  try {
    return c.json(await verifyTonDeposit(c.env, c.req.param('id')));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not verify TON deposit' }, 400);
  }
});

app.get('/app/api/bots/:id/groups', async (c) => {
  try {
    const userId = cleanTelegramUserId(c.req.query('userId'));
    const claim = c.req.query('claim') === '1';
    if (!userId) return c.json({ groups: [] });
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_user_id TEXT').run().catch(() => undefined);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_username TEXT').run().catch(() => undefined);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_first_name TEXT').run().catch(() => undefined);
    await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN ton_spent_nano INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
    const rows = await c.env.DB.prepare(`SELECT chat_id AS chatId, chat_type AS type, title, username, first_seen_at AS firstSeenAt, last_seen_at AS lastSeenAt, COALESCE(ton_spent_nano, 0) AS tonSpentNano
      FROM bot_groups
      WHERE bot_id = ?
        AND (added_by_user_id = ? OR (? = 1 AND (added_by_user_id IS NULL OR added_by_user_id = '')))
      ORDER BY datetime(last_seen_at) DESC
      LIMIT 50`)
      .bind(c.req.param('id'), userId, claim ? 1 : 0)
      .all<{ chatId: string; type: string; title: string | null; username: string | null; firstSeenAt: string; lastSeenAt: string; tonSpentNano: number }>();
    return c.json({ groups: (rows.results ?? []).map((group) => ({ ...group, tonSpent: Number(group.tonSpentNano || 0) / 1_000_000_000 })) });
  } catch (error) {
    console.warn('load bot groups failed', error);
    return c.json({ groups: [], warning: 'Could not load bot groups from D1.' });
  }
});

app.delete('/app/api/groups/:chatId/leave', async (c) => {
  const chatId = c.req.param('chatId');
  try {
    const body = await c.req.json().catch(() => ({})) as { userId?: unknown };
    const userId = cleanTelegramUserId(body.userId);
    if (!userId) return c.json({ error: 'Missing userId' }, 400);
    const owner = await c.env.DB.prepare("SELECT added_by_user_id FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?")
      .bind(chatId)
      .first<{ added_by_user_id: string | null }>();
    if (String(owner?.added_by_user_id || '') !== userId) return c.json({ error: 'Group is not connected to this user.' }, 403);
    await telegram(c.env.TELEGRAM_BOT_TOKEN, 'leaveChat', { chat_id: chatId }).catch((error) => console.warn('main bot leave group failed', error));
    await c.env.DB.prepare("DELETE FROM bot_groups WHERE bot_id = 'main' AND chat_id = ? AND added_by_user_id = ?").bind(chatId, userId).run().catch(() => undefined);
    return c.json({ ok: true, chatId });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not leave group' }, 400);
  }
});

app.get('/app/api/home-finance-image.png', async (c) => imageFromR2(c.env, HOME_FINANCE_IMAGE_KEY, HOME_IMAGE_CACHE_CONTROL));
app.get('/app/api/crash-tip-image.png', async (c) => imageFromR2(c.env, CRASH_TIP_IMAGE_KEY, HOME_IMAGE_CACHE_CONTROL));
app.get('/app/api/uploaded-image/mines-safe.png', async (c) => imageFromR2(c.env, 'mines-tile/safe'));
app.get('/app/api/uploaded-image/mines-bomb.png', async (c) => imageFromR2(c.env, 'mines-tile/bomb'));

app.post('/admin/api/upload-home-finance-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(HOME_FINANCE_IMAGE_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: `/app/api/home-finance-image.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Home image' }, 400);
  }
});

app.post('/admin/api/upload-crash-tip-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(CRASH_TIP_IMAGE_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: `/app/api/crash-tip-image.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Crash image' }, 400);
  }
});

app.get('/admin/api/plinko-control', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getPlinkoControl(c.env));
});

app.post('/admin/api/plinko-control', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await savePlinkoControl(c.env, await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save Plinko control' }, 400);
  }
});

app.post('/admin/api/plinko-control/reset', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await resetPlinkoControl(c.env));
});

app.post('/admin/api/upload-mines-tile-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const kind = String(form.get('kind') || '') === 'bomb' ? 'bomb' : 'safe';
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(`mines-tile/${kind}`, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, kind, url: `/app/api/uploaded-image/mines-${kind}.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Mines image' }, 400);
  }
});

app.post('/admin/api/section-lock-image-v2', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const section = normalizeSectionId(String(form.get('sectionId') || ''));
    const kind = normalizeSectionImageKind(String(form.get('kind') || 'locked'));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!SECTION_LOCK_IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(sectionImageR2Key(section, kind), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    await Promise.all([
      c.env.BOT_CACHE.delete(sectionImageKey(section, kind)).catch(() => undefined),
      c.env.BOT_CACHE.delete(sectionImageTypeKey(section, kind)).catch(() => undefined),
      c.env.BOT_CACHE.delete(sectionImageVersionKey(section, kind)).catch(() => undefined),
    ]);
    return c.json(await getSectionLocks(c.env));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload image' }, 400);
  }
});

async function imageFromR2(env: Env, key: string, cacheControl = IMAGE_CACHE_CONTROL): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': cacheControl } });
}

function defaultNftPriceIconSvg(): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="white" d="M12 16h40c4.2 0 6.7 4.8 4.2 8.2L36.2 52.4c-2 2.9-6.4 2.9-8.4 0L7.8 24.2C5.3 20.8 7.8 16 12 16Zm4.1 7 13.4 19.3V23H16.1Zm18.4 0v19.3L47.9 23H34.5ZM32 47.2 48.3 23H15.7L32 47.2Z"/></svg>';
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<T>;
}

function cleanTelegramUserId(value: unknown): string {
  return String(value || '').replace(/[^0-9]/g, '').slice(0, 32);
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

export { PlinkoLiveRoom };

export default app;

import app from './index-admin';
import { getPlinkoControl, resetPlinkoControl, savePlinkoControl } from './plinko-control';
import { getPlinkoVirtualUsers, resetPlinkoVirtualUsers, savePlinkoVirtualUsers } from './plinko-virtual-users';
import { getCrashVirtualUsers, resetCrashVirtualUsers, saveCrashVirtualUsers } from './crash-virtual-users-config';
import { getSlotVirtualUsers, resetSlotVirtualUsers, saveSlotVirtualUsers } from './slot-virtual-users';
import { createStarsDeposit, listUserStarsDeposits } from './stars-deposits';
import { createTonDeposit, getTonDeposit, listUserTonDeposits, verifyTonDeposit } from './ton-deposits';
import { createTonWithdrawal, listUserTonWithdrawals } from './ton-withdrawals';
import { setTelegramWebhook } from './telegram-game-bot';
import { registerRankCharacterRoutes } from './rank-character-routes';
import { registerPlinkoLiveRoutes, PlinkoLiveRoom } from './plinko-live';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';
import { gameBotToken, validateTelegramInitData } from './utils';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const HOME_IMAGE_CACHE_CONTROL = 'public, max-age=300, must-revalidate';
// Ghost Run scene art is referenced by stable CSS URLs, so keep it browser-cached
// instead of re-downloading every time the user opens the game.
const GHOST_RUN_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const GHOST_RUN_ASSET_MANIFEST_CACHE_CONTROL = 'public, max-age=86400, stale-while-revalidate=604800';
const WALLET_HERO_IMAGE_KEY = 'wallet/hero-image';
const CRASH_TIP_IMAGE_KEY = 'crash-tip/image';
const PLINKO_CONTROL_IMAGE_KINDS = new Set(['drop', 'input', 'house']);
const GHOST_RUN_ASSET_KINDS = new Set(['background', 'background1', 'background2', 'background3', 'background4', 'background5', 'background6']);

registerRankCharacterRoutes(app);
registerPlinkoLiveRoutes(app);




app.get('/app/api/plinko-control', async (c) => c.json(await getPlinkoControlPayload(c.env)));
app.get('/app/api/plinko-virtual-users', async (c) => c.json(await getPlinkoVirtualUsers(c.env)));
app.get('/app/api/slot-virtual-users', async (c) => c.json(await getSlotVirtualUsers(c.env)));

app.get('/app/api/plinko-control-image/:kind', async (c) => {
  const kind = normalizePlinkoControlImageKind(c.req.param('kind'));
  const object = await c.env.ASSETS.get(plinkoControlImageKey(kind)).catch(() => null);
  if (!object) return new Response(defaultPlinkoControlImageSvg(kind), { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': HOME_IMAGE_CACHE_CONTROL } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': HOME_IMAGE_CACHE_CONTROL } });
});

app.post('/admin/api/upload-plinko-control-image', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const kind = normalizePlinkoControlImageKind(String(form.get('kind') || 'drop'));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(plinkoControlImageKey(kind), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, kind, url: `/app/api/plinko-control-image/${kind}.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Plinko control image' }, 400);
  }
});


app.get('/app/api/ghost-run-asset/:kind', async (c) => {
  const kind = normalizeGhostRunAssetKind(c.req.param('kind'));
  const object = await c.env.ASSETS.get(ghostRunAssetKey(kind)).catch(() => null);
  if (!object) return new Response(defaultGhostRunAssetSvg(kind), { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': GHOST_RUN_ASSET_CACHE_CONTROL } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': GHOST_RUN_ASSET_CACHE_CONTROL } });
});

app.get('/app/api/ghost-run-assets', async (c) => {
  const manifest = await getGhostRunAssetManifest(c.env);
  return c.json(manifest, 200, { 'cache-control': GHOST_RUN_ASSET_MANIFEST_CACHE_CONTROL });
});

app.post('/admin/api/upload-ghost-run-asset', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const kind = normalizeGhostRunAssetKind(String(form.get('kind') || 'background'));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 3_000_000) return c.json({ error: 'Image must be under 3MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(ghostRunAssetKey(kind), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, kind, url: `/app/api/ghost-run-asset/${kind}.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Ghost Run asset' }, 400);
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
    const body = await c.req.json() as { initData?: unknown; amountGram?: unknown; amountTon?: unknown; walletAddress?: unknown };
    const userId = await validateTelegramInitData(body.initData, gameBotToken(c.env));
    return c.json(await createTonWithdrawal(c.env, userId, body.amountGram ?? body.amountTon, body.walletAddress));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not create Gram withdrawal' }, 400);
  }
});

app.get('/app/api/ton/withdrawals', async (c) => {
  try {
    const initData = c.req.header('x-telegram-init-data') || c.req.query('initData') || '';
    const userId = await validateTelegramInitData(initData, gameBotToken(c.env));
    return c.json(await listUserTonWithdrawals(c.env, userId));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load Gram withdrawals' }, 400);
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

app.get('/app/api/crash-tip-image.png', async (c) => imageFromR2(c.env, CRASH_TIP_IMAGE_KEY, HOME_IMAGE_CACHE_CONTROL));
app.get('/app/api/uploaded-image/mines-safe.png', async (c) => imageFromR2(c.env, 'mines-tile/safe'));
app.get('/app/api/uploaded-image/mines-bomb.png', async (c) => imageFromR2(c.env, 'mines-tile/bomb'));




app.post('/admin/api/upload-crash-tip-image', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(CRASH_TIP_IMAGE_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: `/app/api/crash-tip-image.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Crash image' }, 400);
  }
});

app.get('/admin/api/plinko-control', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getPlinkoControlPayload(c.env));
});

app.post('/admin/api/plinko-control', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await savePlinkoControl(c.env, await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save Plinko control' }, 400);
  }
});

app.post('/admin/api/plinko-control/reset', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await resetPlinkoControl(c.env));
});


app.get('/admin/api/plinko-virtual-users', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getPlinkoVirtualUsers(c.env));
});

app.post('/admin/api/plinko-virtual-users', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await savePlinkoVirtualUsers(c.env, await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save Plinko virtual users' }, 400);
  }
});

app.post('/admin/api/plinko-virtual-users/reset', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await resetPlinkoVirtualUsers(c.env));
});



app.get('/admin/api/crash-virtual-users', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getCrashVirtualUsers(c.env));
});

app.post('/admin/api/crash-virtual-users', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await saveCrashVirtualUsers(c.env, await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save Crash virtual users' }, 400);
  }
});

app.post('/admin/api/crash-virtual-users/reset', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await resetCrashVirtualUsers(c.env));
});

app.get('/admin/api/slot-virtual-users', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getSlotVirtualUsers(c.env));
});

app.post('/admin/api/slot-virtual-users', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await saveSlotVirtualUsers(c.env, await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save Slot virtual users' }, 400);
  }
});

app.post('/admin/api/slot-virtual-users/reset', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await resetSlotVirtualUsers(c.env));
});

app.post('/admin/api/upload-mines-tile-image', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const kind = String(form.get('kind') || '') === 'bomb' ? 'bomb' : 'safe';
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(`mines-tile/${kind}`, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, kind, url: `/app/api/uploaded-image/mines-${kind}.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Mines image' }, 400);
  }
});


async function imageFromR2(env: Env, key: string, cacheControl = IMAGE_CACHE_CONTROL): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': cacheControl } });
}


async function getPlinkoControlPayload(env: Env) {
  const config = await getPlinkoControl(env);
  const house = await env.ASSETS.head(plinkoControlImageKey('house')).catch(() => null);
  const houseVersion = house?.customMetadata?.version || house?.uploaded?.getTime?.() || '';
  return { ...config, assets: { houseVersion: String(houseVersion || '') } };
}

function normalizePlinkoControlImageKind(value: string): 'drop' | 'input' | 'house' {
  const clean = String(value || '').replace(/\.png$/i, '');
  return PLINKO_CONTROL_IMAGE_KINDS.has(clean) ? clean as 'drop' | 'input' | 'house' : 'drop';
}

function plinkoControlImageKey(kind: 'drop' | 'input' | 'house'): string {
  return `plinko-control/${kind}`;
}

function defaultPlinkoControlImageSvg(kind: 'drop' | 'input' | 'house'): string {
  if (kind === 'house') {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 748 96"><rect width="748" height="96" fill="none"/><g fill="none" stroke="#ffffff" stroke-opacity=".34" stroke-width="3"><rect x="2" y="6" width="50" height="84" rx="16"/><rect x="55" y="6" width="50" height="84" rx="16"/><rect x="108" y="6" width="50" height="84" rx="16"/><rect x="161" y="6" width="50" height="84" rx="16"/><rect x="214" y="6" width="50" height="84" rx="16"/><rect x="267" y="6" width="50" height="84" rx="16"/><rect x="320" y="6" width="50" height="84" rx="16"/><rect x="373" y="6" width="50" height="84" rx="16"/><rect x="426" y="6" width="50" height="84" rx="16"/><rect x="479" y="6" width="50" height="84" rx="16"/><rect x="532" y="6" width="50" height="84" rx="16"/><rect x="585" y="6" width="50" height="84" rx="16"/><rect x="638" y="6" width="50" height="84" rx="16"/><rect x="691" y="6" width="50" height="84" rx="16"/></g></svg>';
  }
  if (kind === 'input') {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 748 96"><rect width="748" height="96" fill="none"/><rect x="0" y="0" width="170" height="96" rx="30" fill="#1d1d1d" stroke="#565656" stroke-width="3"/><rect x="190" y="0" width="368" height="96" rx="30" fill="#343434" stroke="#6a6a6a" stroke-width="3"/><rect x="578" y="0" width="170" height="96" rx="30" fill="#1d1d1d" stroke="#565656" stroke-width="3"/><text x="85" y="58" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="800">1/2</text><text x="374" y="58" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="800">1</text><text x="663" y="58" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="800">2x</text></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 748 96"><rect width="748" height="96" fill="none"/><rect x="0" y="0" width="748" height="96" rx="30" fill="#191919" stroke="#4d4d4d" stroke-width="3"/><text x="374" y="59" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="34" font-weight="800">Drop Ball</text></svg>';
}


function cleanTelegramUserId(value: unknown): string {
  return String(value || '').replace(/[^0-9]/g, '').slice(0, 32);
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

export { PlinkoLiveRoom };

export default app;

function normalizeGhostRunAssetKind(value: string): string {
  const clean = String(value || '').replace(/\.png$/i, '').trim().toLowerCase();
  if (!GHOST_RUN_ASSET_KINDS.has(clean)) throw new Error('Invalid Ghost Run asset kind.');
  return clean;
}

function ghostRunAssetKey(kind: string): string {
  return `ghost-run-assets/${kind}`;
}

async function getGhostRunAssetManifest(env: Env): Promise<{ ok: true; urls: Record<string, string> }> {
  const kinds = Array.from(GHOST_RUN_ASSET_KINDS);
  const heads = await Promise.all(kinds.map((kind) => env.ASSETS.head(ghostRunAssetKey(kind)).catch(() => null)));
  const urls: Record<string, string> = {};
  kinds.forEach((kind, index) => {
    const head = heads[index];
    const version = head?.customMetadata?.version || head?.uploaded?.getTime?.() || 'default';
    urls[kind] = `/app/api/ghost-run-asset/${kind}.png?v=${encodeURIComponent(String(version))}`;
  });
  return { ok: true, urls };
}

function defaultGhostRunAssetSvg(kind: string): string {
  if (kind === 'background' || kind === 'background1') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#05030a"/><stop offset=".58" stop-color="#100611"/><stop offset="1" stop-color="#030102"/></linearGradient><radialGradient id="r" cx="50%" cy="18%" r="58%"><stop stop-color="#4b0819" stop-opacity=".46"/><stop offset="1" stop-color="#4b0819" stop-opacity="0"/></radialGradient></defs><rect width="900" height="520" fill="url(#g)"/><rect width="900" height="520" fill="url(#r)"/><g fill="#fff" opacity=".36"><circle cx="72" cy="84" r="1.2"/><circle cx="156" cy="49" r="1.5"/><circle cx="263" cy="116" r="1.3"/><circle cx="369" cy="62" r="1.1"/><circle cx="522" cy="136" r="1.4"/><circle cx="684" cy="52" r="1.2"/><circle cx="819" cy="109" r="1.5"/></g></svg>`;
  if (kind === 'background2' || kind === 'background3' || kind === 'background4' || kind === 'background5' || kind === 'background6') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice"><rect width="900" height="520" fill="transparent"/></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220"></svg>`;
}

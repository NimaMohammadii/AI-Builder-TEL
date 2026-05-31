import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { buildBlueprint, defaultBlueprint, defaultFlow, emptyFlow, improveFlow, plainAiReply, type BotFlow } from './ai';
import { miniAppHtml } from './miniapp-chat';
import { miniAppHtml as builderAppHtml } from './miniapp';
import { adminHtml, adminPanelHtml } from './admin';
import { processTelegramUpdate } from './telegram-agent-safe';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough } from './user-controls';
import { createStarsDeposit, listUserStarsDeposits } from './stars-deposits';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { APP_NAME, PUBLIC_BASE_URL, decryptUserToken, encryptUserToken, gameBotToken, id, rateLimit, safeParseJson } from './utils';
import { isWheelFillReady, pickWheelFillEntries } from './wheel-fill-entries';

const app = new Hono<{ Bindings: Env }>();
const DEFAULT_BOT_ID = 'main';
const FALLBACK_PNG = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,120,156,99,248,255,255,63,0,5,254,2,254,167,53,129,132,0,0,0,0,73,69,78,68,174,66,96,130]);
const CREDIT_ICON_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const USER_BOT_ALLOWED_UPDATES = ['message', 'callback_query', 'pre_checkout_query'];
const WHEEL_MAX_PLAYERS = 5;
const WHEEL_MIN_ENTRY_NANO = 10_000_000;
const HOME_INTRO_IMAGE_KEY = 'home-intro/image';

type WheelRoundRow = {
  id: string;
  status: 'open' | 'closed';
  total_amount_nano: number;
  winner_user_id: string | null;
  selected_ticket: number | null;
  created_at: string;
  closed_at: string | null;
};

type WheelEntryRow = {
  id: string;
  round_id: string;
  user_id: string;
  username: string;
  first_name: string | null;
  amount_nano: number;
  ticket_start: number;
  ticket_end: number;
  created_at: string;
};

type RpsChoice = 'rock' | 'paper' | 'scissors';
type RpsFriendRoomRow = {
  id: string;
  host_user_id: string;
  host_name: string | null;
  guest_user_id: string | null;
  guest_name: string | null;
  status: 'waiting' | 'active' | 'finished' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at: string;
};
type RpsFriendRoundRow = {
  id: string;
  room_id: string;
  round_index: number;
  host_choice: RpsChoice | null;
  guest_choice: RpsChoice | null;
  winner_user_id: string | null;
  status: 'open' | 'draw' | 'resolved';
  created_at: string;
  resolved_at: string | null;
};

const createBotSchema = z.object({ ownerTelegramId: z.string().min(1), telegramToken: z.string().min(30).max(128), prompt: z.string().min(10).max(6000) });
const chatSchema = z.object({ instruction: z.string().min(2).max(4000) });
const statusSchema = z.object({ status: z.enum(['active', 'paused']) });
const productSchema = z.object({ title: z.string().min(1).max(120), description: z.string().max(1000).default(''), priceAmount: z.number().int().nonnegative().default(0), currency: z.string().min(3).max(8).default('USD'), deliveryText: z.string().max(4000).default(''), metadata: z.record(z.unknown()).default({}) });
const adminLoginSchema = z.object({ key: z.string().min(1).max(500) });
const rpsFriendUserSchema = z.object({ userId: z.string().min(1).max(80), name: z.string().max(80).optional().nullable() });
const rpsFriendChoiceSchema = rpsFriendUserSchema.extend({ choice: z.enum(['rock', 'paper', 'scissors']) });

app.get('/', (c) => c.redirect('/app'));
app.get('/app', () => html(miniAppHtml()));
app.get('/app/', () => html(miniAppHtml()));
app.get('/miniapp', () => html(miniAppHtml()));
app.get('/app/index.html', () => html(miniAppHtml()));
app.get('/builder', () => html(builderAppHtml()));
app.get('/builder/', () => html(builderAppHtml()));
app.get('/app/health', (c) => c.json({ ok: true, page: 'miniapp', appUrl: `${PUBLIC_BASE_URL}/app` }));
app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

app.get('/admin', () => html(adminHtml()));
app.get('/admin/', () => html(adminHtml()));
app.post('/admin/login', zValidator('json', adminLoginSchema), (c) => {
  const { key } = c.req.valid('json');
  if (!isAdmin(c.env, key)) return c.json({ error: 'Wrong admin key' }, 401);
  return c.json({ ok: true });
});
app.post('/admin/panel', async (c) => {
  const form = await c.req.formData();
  const key = String(form.get('key') ?? '');
  if (!isAdmin(c.env, key)) return html(adminHtml().replace('Only authenticated admins can open tools.', 'Wrong admin key.'));
  return html(adminPanelHtml(), { 'set-cookie': adminCookie(key) });
});
app.get('/admin/panel', (c) => {
  if (!isAdminRequest(c)) return c.redirect('/admin');
  return html(adminPanelHtml());
});
app.post('/admin/logout', (c) => new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json', 'set-cookie': 'vexa_admin=; Path=/admin; Max-Age=0; HttpOnly; SameSite=Lax; Secure' } }));
app.get('/app/api/credit-icon', (c) => c.redirect('/app/api/credit-icon.png'));
app.get('/app/api/credit-icon.png', async (c) => {
  const icon = await c.env.ASSETS.get('credit-icon').catch(() => null);
  if (icon) return new Response(icon.body, { headers: { 'content-type': icon.httpMetadata?.contentType ?? 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
  return new Response(FALLBACK_PNG, { headers: { 'content-type': 'image/png', 'cache-control': 'no-store' } });
});
app.post('/admin/upload-credit-icon', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const form = await c.req.formData();
  const file = form.get('icon');
  if (!file || typeof file !== 'object' || !('type' in file) || !('size' in file) || !('stream' in file)) return c.json({ error: 'Choose an image file.' }, 400);
  const iconFile = file as { type: string; size: number; stream: () => ReadableStream };
  if (!CREDIT_ICON_TYPES.has(iconFile.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
  if (iconFile.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
  const version = String(Date.now());
  await c.env.ASSETS.put('credit-icon', iconFile.stream(), { httpMetadata: { contentType: iconFile.type }, customMetadata: { version } });
  await Promise.all([
    c.env.BOT_CACHE.delete('admin:credit-icon').catch(() => undefined),
    c.env.BOT_CACHE.delete('admin:credit-icon-type').catch(() => undefined),
    c.env.BOT_CACHE.delete('admin:credit-icon-version').catch(() => undefined),
  ]);
  return c.json({ ok: true, size: iconFile.size, type: iconFile.type, creditIconUrl: `/app/api/credit-icon.png?v=${version}` });
});

app.get('/app/api/home-intro-image-cached.png', async (c) => {
  const image = await c.env.ASSETS.get(HOME_INTRO_IMAGE_KEY).catch(() => null);
  if (!image) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(image.body, { headers: { 'content-type': image.httpMetadata?.contentType ?? 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
});
app.get('/app/api/home-intro-image-meta', async (c) => {
  const image = await c.env.ASSETS.head(HOME_INTRO_IMAGE_KEY).catch(() => null);
  const version = image?.customMetadata?.version || image?.uploaded?.getTime?.() || 'default';
  return c.json({ ok: true, version: String(version), url: `/app/api/home-intro-image-cached.png?v=${encodeURIComponent(String(version))}` }, 200, { 'cache-control': 'private, max-age=300' });
});
app.post('/admin/api/upload-home-intro-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const form = await c.req.formData();
  const file = form.get('image');
  if (!file || typeof file !== 'object' || !('type' in file) || !('stream' in file)) return c.json({ error: 'Choose an image file.' }, 400);
  const imageFile = file as { type: string; stream: () => ReadableStream };
  if (!CREDIT_ICON_TYPES.has(imageFile.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
  const version = String(Date.now());
  await c.env.ASSETS.put(HOME_INTRO_IMAGE_KEY, imageFile.stream(), { httpMetadata: { contentType: imageFile.type }, customMetadata: { version } });
  return c.json({ ok: true, url: `/app/api/home-intro-image-cached.png?v=${version}` });
});

app.post('/app/api/ai/chat', zValidator('json', chatSchema), async (c) => {
  const body = c.req.valid('json');
  return c.json({ reply: await plainAiReply(c.env, body.instruction) });
});

app.post('/app/api/rps/friend/rooms', zValidator('json', rpsFriendUserSchema), async (c) => {
  const body = c.req.valid('json');
  const userId = cleanRpsUserId(body.userId);
  const name = cleanRpsName(body.name, 'Host');
  const allowed = await safeRateLimit(c.env, `rps-room:${userId}`, 20, 3600);
  if (!allowed) return c.json({ error: 'Too many RPS rooms. Try again later.' }, 429);
  const roomId = id('rps');
  const roundId = id('rps_round');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  try {
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO rps_friend_rooms (id, host_user_id, host_name, status, expires_at) VALUES (?, ?, ?, ?, ?)').bind(roomId, userId, name, 'waiting', expiresAt),
      c.env.DB.prepare('INSERT INTO rps_friend_rounds (id, room_id, round_index) VALUES (?, ?, 1)').bind(roundId, roomId),
    ]);
    return c.json(await rpsFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('create rps friend room failed', error);
    return c.json({ error: 'RPS friend rooms are not ready. Run the D1 migration.' }, 500);
  }
});

app.post('/app/api/rps/friend/rooms/:roomId/join', zValidator('json', rpsFriendUserSchema), async (c) => {
  const roomId = cleanRpsRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanRpsUserId(body.userId);
  const name = cleanRpsName(body.name, 'Friend');
  try {
    const room = await getRpsFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isRpsRoomExpired(room)) {
      await expireRpsRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    if (room.host_user_id === userId) return c.json(await rpsFriendState(c.env, roomId, userId));
    if (room.guest_user_id && room.guest_user_id !== userId) return c.json({ error: 'Room already has two players' }, 409);
    if (!room.guest_user_id) {
      await c.env.DB.prepare("UPDATE rps_friend_rooms SET guest_user_id = ?, guest_name = ?, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND guest_user_id IS NULL")
        .bind(userId, name, roomId)
        .run();
    }
    return c.json(await rpsFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('join rps friend room failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not join room' }, 400);
  }
});

app.get('/app/api/rps/friend/rooms/:roomId', async (c) => {
  const roomId = cleanRpsRoomId(c.req.param('roomId'));
  const userId = cleanRpsUserId(c.req.query('userId') || '');
  try {
    return c.json(await rpsFriendState(c.env, roomId, userId));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load room' }, error instanceof Error && error.message === 'Room not found' ? 404 : 400);
  }
});

app.post('/app/api/rps/friend/rooms/:roomId/choice', zValidator('json', rpsFriendChoiceSchema), async (c) => {
  const roomId = cleanRpsRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanRpsUserId(body.userId);
  const choice = body.choice;
  try {
    const room = await getRpsFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isRpsRoomExpired(room)) {
      await expireRpsRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    if (room.status === 'finished') return c.json({ error: 'Room is finished' }, 409);
    if (!room.guest_user_id) return c.json({ error: 'Waiting for friend' }, 409);
    const role = rpsRole(room, userId);
    if (role !== 'host' && role !== 'guest') return c.json({ error: 'You are not in this room' }, 403);
    const column = role === 'host' ? 'host_choice' : 'guest_choice';
    const result = await c.env.DB.prepare(`UPDATE rps_friend_rounds SET ${column} = ? WHERE id = (SELECT id FROM rps_friend_rounds WHERE room_id = ? AND status = 'open' ORDER BY round_index DESC LIMIT 1) AND ${column} IS NULL`)
      .bind(choice, roomId)
      .run();
    if ((result.meta?.changes ?? 0) === 0) return c.json(await rpsFriendState(c.env, roomId, userId));
    await resolveRpsFriendRound(c.env, roomId, room.host_user_id, room.guest_user_id);
    return c.json(await rpsFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('save rps friend choice failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not save choice' }, 400);
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

app.get('/app/api/bots', async (c) => {
  const ownerId = c.req.query('ownerId') ?? '';
  if (!ownerId) return c.json({ bots: [] });
  try {
    const rows = await c.env.DB.prepare('SELECT id, title, username, status, created_at, updated_at FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 50')
      .bind(ownerId)
      .all<{ id: string; title: string; username: string | null; status: string; created_at: string; updated_at: string }>();
    return c.json({ bots: rows.results });
  } catch (error) {
    console.error('load app bots failed', error);
    return c.json({ bots: [], warning: 'Database is not ready. Run the D1 migration.' });
  }
});

app.post('/app/api/bots', zValidator('json', createBotSchema), async (c) => {
  const body = c.req.valid('json');
  const allowed = await safeRateLimit(c.env, `create:${body.ownerTelegramId}`, 12, 3600);
  if (!allowed) return c.json({ error: 'Rate limit exceeded' }, 429);

  const me = await telegramApiWithToken<{ ok: boolean; result?: { username?: string; first_name?: string }; description?: string }>(body.telegramToken, 'getMe', {});
  if (!me.ok) return c.json({ error: me.description ?? 'Invalid Telegram bot token' }, 400);

  const blueprint = defaultBlueprint('Blank connected bot. Build it with AI when the user asks.');
  const flow = emptyFlow();
  const botId = id('bot');
  const encryptedToken = await encryptUserToken(c.env, body.telegramToken);
  const webhookUrl = `${PUBLIC_BASE_URL}/bot/${botId}/webhook`;
  const webhook = await setBotWebhook(body.telegramToken, webhookUrl);
  if (!webhook.ok) return c.json({ error: webhook.description ?? 'Could not set Telegram webhook' }, 502);

  const title = me.result?.first_name ?? inferTitle(body.prompt);
  try {
    await c.env.DB.prepare(`INSERT INTO bots (id, owner_telegram_id, username, title, status, encrypted_token, webhook_secret, blueprint_json, settings_json) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`)
      .bind(botId, body.ownerTelegramId, me.result?.username ?? null, title, encryptedToken, 'mini-app-webhook', JSON.stringify(blueprint), JSON.stringify({ sourcePrompt: body.prompt, createdFromMiniApp: true, webhookUrl, flow }))
      .run();
  } catch (error) {
    console.error('create mini app bot failed', error);
    return c.json({ error: 'Database is not ready. Run the D1 migration first.' }, 500);
  }
  return c.json({ botId, username: me.result?.username ?? null, title, status: 'active', webhookUrl, blueprint, flow });
});

app.get('/app/api/bots/:id', async (c) => {
  const bot = await getBot(c.env, c.req.param('id'));
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  return c.json(safeBot(bot));
});

app.post('/app/api/bots/:id/chat', zValidator('json', chatSchema), async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  const body = c.req.valid('json');
  const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
  const currentFlow = ((settings.flow as BotFlow | undefined) ?? emptyFlow());
  const flowResult = await improveFlow(c.env, currentFlow, body.instruction);
  settings.flow = flowResult.flow;
  try {
    await c.env.DB.prepare('UPDATE bots SET settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(JSON.stringify(settings), botId)
      .run();
  } catch (error) {
    console.error('save flow change failed', error);
    return c.json({ error: 'Could not save changes. Check D1 migration.' }, 500);
  }
  return c.json({ ok: true, summary: flowResult.summary, flow: flowResult.flow });
});

app.patch('/app/api/bots/:id/status', zValidator('json', statusSchema), async (c) => {
  const botId = c.req.param('id');
  const body = c.req.valid('json');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  const token = await decryptUserToken(c.env, bot.encrypted_token);
  const result = await setBotWebhook(token, `${PUBLIC_BASE_URL}/bot/${bot.id}/webhook`);
  if (!result.ok) return c.json({ error: result.description ?? 'Could not update webhook' }, 502);
  await c.env.DB.prepare('UPDATE bots SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(body.status, botId).run();
  return c.json({ ok: true, botId, status: body.status });
});

app.post('/app/api/bots/:id/publish', async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  const token = await decryptUserToken(c.env, bot.encrypted_token);
  const webhookUrl = `${PUBLIC_BASE_URL}/bot/${bot.id}/webhook`;
  const result = await setBotWebhook(token, webhookUrl);
  if (!result.ok) return c.json({ error: result.description ?? 'Could not publish webhook' }, 502);
  const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
  settings.webhookUrl = webhookUrl;
  await c.env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), botId).run();
  return c.json({ ok: true, botId, status: 'active', webhookUrl });
});

app.delete('/app/api/bots/:id', async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  try {
    const token = await decryptUserToken(c.env, bot.encrypted_token);
    await deleteBotWebhook(token);
  } catch (error) {
    console.warn('delete webhook failed', error);
  }
  await c.env.DB.prepare('DELETE FROM bots WHERE id = ?').bind(botId).run();
  return c.json({ ok: true, botId });
});

app.put('/app/api/bots/:id/blueprint', async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  return c.json({ error: 'Blueprint editing is disabled. Runtime uses settings.flow only.' }, 409);
});

app.post('/api/bots/:id/products', zValidator('json', productSchema), async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  const body = c.req.valid('json');
  const productId = id('prd');
  await c.env.DB.prepare(`INSERT INTO products (id, bot_id, title, description, price_amount, currency, delivery_text, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(productId, botId, body.title, body.description, body.priceAmount, body.currency, body.deliveryText, JSON.stringify(body.metadata)).run();
  return c.json({ productId, botId });
});

app.post('/api/bots/:id/publish', async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  const token = await decryptUserToken(c.env, bot.encrypted_token);
  const webhookUrl = `${PUBLIC_BASE_URL}/bot/${bot.id}/webhook`;
  const result = await setBotWebhook(token, webhookUrl);
  if (!result.ok) return c.json({ error: 'Telegram setWebhook failed', details: result }, 502);
  const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
  settings.webhookUrl = webhookUrl;
  await c.env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), botId).run();
  return c.json({ ok: true, botId, webhookUrl });
});

app.get('/app/api/wheel-round', async (c) => {
  try {
    await ensureWheelTables(c.env);
    const round = await fillWheelRoundIfReady(c.env, await currentWheelRound(c.env));
    return c.json(await wheelState(c.env, round), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load wheel round' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/app/api/wheel-round/join', async (c) => {
  try {
    await ensureWheelTables(c.env);
    const body = await c.req.json().catch(() => ({})) as { userId?: unknown; username?: unknown; firstName?: unknown; amountNano?: unknown };
    const userId = cleanWheelUserId(body.userId);
    const amountNano = cleanWheelAmount(body.amountNano);
    let round = await currentWheelRound(c.env);
    let entries = await wheelEntries(c.env, round.id);
    if (entries.some((entry) => entry.user_id === userId)) return c.json(await wheelState(c.env, round), 200, { 'cache-control': 'no-store' });
    if (entries.length >= WHEEL_MAX_PLAYERS) {
      round = await createWheelRound(c.env);
      entries = [];
    }
    await debitUserTonBalanceIfEnough(c.env, userId, amountNano, { kind: 'game', title: 'Wheel entry', roundId: round.id });
    try {
      const ticketStart = entries.reduce((max, entry) => Math.max(max, Number(entry.ticket_end || 0)), 0) + 1;
      const ticketEnd = ticketStart + amountNano - 1;
      await c.env.DB.prepare(`INSERT OR IGNORE INTO wheel_entries (id, round_id, user_id, username, first_name, amount_nano, ticket_start, ticket_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
        .bind(id('whent'), round.id, userId, cleanWheelName(body.username, userId), cleanWheelFirstName(body.firstName), amountNano, ticketStart, ticketEnd)
        .run();
      await c.env.DB.prepare('UPDATE wheel_rounds SET total_amount_nano = total_amount_nano + ? WHERE id = ? AND status = ?')
        .bind(amountNano, round.id, 'open')
        .run();
    } catch (error) {
      await adjustUserTonBalance(c.env, userId, amountNano, { kind: 'game', title: 'Wheel entry refund', roundId: round.id }).catch(() => undefined);
      throw error;
    }
    round = await getWheelRound(c.env, round.id) ?? round;
    round = await fillWheelRoundIfReady(c.env, round);
    entries = await wheelEntries(c.env, round.id);
    if (entries.length >= WHEEL_MAX_PLAYERS && round.status === 'open') round = await closeWheelRound(c.env, round, entries);
    return c.json(await wheelState(c.env, round), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not join wheel round' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/telegram/ai-webhook', async (c) => handleAiWebhook(c));
app.post('/telegram/game-webhook', async (c) => handleGameWebhook(c));
app.post('/bot/:botId/webhook', async (c) => handleUserBotWebhook(c, c.req.param('botId')));

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((error, c) => { console.error(error); return c.json({ error: 'Internal error' }, 500); });

function adminCookie(key: string): string { return `vexa_admin=${encodeURIComponent(key)}; Path=/admin; Max-Age=604800; HttpOnly; SameSite=Lax; Secure`; }
function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }

async function handleAiWebhook(c: { req: { json: () => Promise<unknown> }; env: Env; executionCtx: ExecutionContext }) {
  try {
    const update = (await c.req.json()) as TelegramUpdate;
    const bot = defaultBotRecord();

    if (update.pre_checkout_query || update.message?.successful_payment) {
      await processTelegramUpdate(c.env, bot, update);
      return Response.json({ ok: true });
    }

    c.executionCtx.waitUntil(
      processTelegramUpdate(c.env, bot, update).catch((error) => {
        console.error('ai telegram processing failed', error);
      }),
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error('ai telegram webhook failed', error);
    return Response.json({ ok: true, recovered: true });
  }
}

async function handleGameWebhook(c: { req: { json: () => Promise<unknown> }; env: Env }) {
  try {
    const update = (await c.req.json()) as TelegramUpdate;
    const chatId = update.message?.chat.id;

    if (!chatId) {
      return Response.json({
        ok: true,
        ignored: true,
        bot: 'game',
      });
    }

    await telegramApiWithToken(gameBotToken(c.env), 'sendMessage', {
      chat_id: chatId,
      text: 'Open the mini app.',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open Mini App',
              web_app: {
                url: `${PUBLIC_BASE_URL}/app`,
              },
            },
          ],
        ],
      },
    });

    return Response.json({
      ok: true,
      bot: 'game',
    });
  } catch (error) {
    console.error('game telegram webhook failed', error);

    return Response.json({
      ok: true,
      recovered: true,
      bot: 'game',
    });
  }
}

async function handleUserBotWebhook(c: { req: { json: () => Promise<unknown> }; env: Env; executionCtx: ExecutionContext }, botId: string) {
  try {
    const update = (await c.req.json()) as TelegramUpdate;
    const bot = await getBot(c.env, botId);
    if (!bot || bot.status === 'suspended' || bot.status === 'paused') return Response.json({ ok: true, ignored: true });
    c.executionCtx.waitUntil(processTelegramUpdate(c.env, bot, update).catch((error) => console.error('user bot telegram processing failed', error)));
    return Response.json({ ok: true });
  } catch (error) { console.error('user bot webhook failed', error); return Response.json({ ok: true, recovered: true }); }
}

async function getBot(env: Env, botId: string): Promise<BotRecord | null> {
  try {
    return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(botId).first<BotRecord>()) ?? null;
  } catch (error) { console.warn('getBot failed', error); return null; }
}

function defaultBotRecord(): BotRecord {
  return { id: DEFAULT_BOT_ID, owner_telegram_id: null, username: null, title: APP_NAME, status: 'active', encrypted_token: 'env:AI_BOT_TOKEN', webhook_secret: 'default', blueprint_json: JSON.stringify(defaultBlueprint('An AI no-code Telegram bot builder.')), settings_json: JSON.stringify({ isBuilderBot: true }), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

function safeBot(bot: BotRecord) {
  const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
  return { id: bot.id, ownerTelegramId: bot.owner_telegram_id, username: bot.username, title: bot.title, status: bot.status, hasToken: Boolean(bot.encrypted_token), blueprint: safeParseJson(bot.blueprint_json, null), flow: settings.flow ?? null, settings, createdAt: bot.created_at, updatedAt: bot.updated_at };
}

async function safeRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try { return await rateLimit(env.RATE_LIMITS, key, limit, windowSeconds); } catch { return true; }
}

async function ensureWheelTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wheel_rounds (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'open',
    total_amount_nano INTEGER NOT NULL DEFAULT 0,
    winner_user_id TEXT,
    selected_ticket INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TEXT
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wheel_entries (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    first_name TEXT,
    amount_nano INTEGER NOT NULL,
    ticket_start INTEGER NOT NULL,
    ticket_end INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(round_id, user_id)
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wheel_rounds_status_created ON wheel_rounds (status, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wheel_entries_round_ticket ON wheel_entries (round_id, ticket_start)').run();
}

async function currentWheelRound(env: Env): Promise<WheelRoundRow> {
  const open = await env.DB.prepare("SELECT * FROM wheel_rounds WHERE status = 'open' ORDER BY datetime(created_at) DESC LIMIT 1").first<WheelRoundRow>();
  return open ?? createWheelRound(env);
}

async function createWheelRound(env: Env): Promise<WheelRoundRow> {
  const roundId = id('whrnd');
  await env.DB.prepare("INSERT INTO wheel_rounds (id, status, total_amount_nano, created_at) VALUES (?, 'open', 0, CURRENT_TIMESTAMP)").bind(roundId).run();
  const round = await getWheelRound(env, roundId);
  if (!round) throw new Error('Could not create wheel round');
  return round;
}

async function getWheelRound(env: Env, roundId: string): Promise<WheelRoundRow | null> {
  return await env.DB.prepare('SELECT * FROM wheel_rounds WHERE id = ?').bind(roundId).first<WheelRoundRow>();
}

async function wheelEntries(env: Env, roundId: string): Promise<WheelEntryRow[]> {
  const rows = await env.DB.prepare('SELECT * FROM wheel_entries WHERE round_id = ? ORDER BY ticket_start ASC').bind(roundId).all<WheelEntryRow>();
  return rows.results ?? [];
}

async function fillWheelRoundIfReady(env: Env, round: WheelRoundRow): Promise<WheelRoundRow> {
  if (round.status !== 'open') return round;
  let entries = await wheelEntries(env, round.id);
  if (entries.length >= WHEEL_MAX_PLAYERS) return closeWheelRound(env, round, entries);
  if (!isWheelFillReady(round.created_at)) return round;
  const needed = WHEEL_MAX_PLAYERS - entries.length;
  let ticketStart = entries.reduce((max, entry) => Math.max(max, Number(entry.ticket_end || 0)), 0) + 1;
  let addedTotal = 0;
  for (const fillEntry of pickWheelFillEntries(round.id, entries.map((entry) => entry.user_id), needed)) {
    const amountNano = fillEntry.amountTon * 1_000_000_000;
    const ticketEnd = ticketStart + amountNano - 1;
    const result = await env.DB.prepare(`INSERT OR IGNORE INTO wheel_entries (id, round_id, user_id, username, first_name, amount_nano, ticket_start, ticket_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
      .bind(id('whent'), round.id, fillEntry.userId, fillEntry.name, fillEntry.name, amountNano, ticketStart, ticketEnd)
      .run();
    if ((result.meta?.changes ?? 0) > 0) {
      ticketStart = ticketEnd + 1;
      addedTotal += amountNano;
    }
  }
  if (addedTotal > 0) {
    await env.DB.prepare('UPDATE wheel_rounds SET total_amount_nano = total_amount_nano + ? WHERE id = ? AND status = ?').bind(addedTotal, round.id, 'open').run();
  }
  const nextRound = await getWheelRound(env, round.id) ?? round;
  entries = await wheelEntries(env, round.id);
  return entries.length >= WHEEL_MAX_PLAYERS ? closeWheelRound(env, nextRound, entries) : nextRound;
}

async function closeWheelRound(env: Env, round: WheelRoundRow, entries: WheelEntryRow[]): Promise<WheelRoundRow> {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, Math.floor(Number(entry.amount_nano) || 0)), 0);
  if (total <= 0) return round;
  const selectedTicket = secureTicket(total);
  const winner = entries.find((entry) => selectedTicket >= Number(entry.ticket_start) && selectedTicket <= Number(entry.ticket_end)) ?? entries[entries.length - 1];
  const result = await env.DB.prepare("UPDATE wheel_rounds SET status = 'closed', total_amount_nano = ?, winner_user_id = ?, selected_ticket = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'open'")
    .bind(total, winner.user_id, selectedTicket, round.id)
    .run();
  const closed = await getWheelRound(env, round.id) ?? round;
  if ((result.meta?.changes ?? 0) > 0) {
    await adjustUserTonBalance(env, winner.user_id, total, { kind: 'game', title: 'Wheel prize', roundId: round.id });
  }
  return closed;
}

async function wheelState(env: Env, round: WheelRoundRow) {
  const entries = await wheelEntries(env, round.id);
  const winner = round.winner_user_id ? entries.find((entry) => entry.user_id === round.winner_user_id) ?? null : null;
  return {
    ok: true,
    maxPlayers: WHEEL_MAX_PLAYERS,
    round: {
      id: round.id,
      status: round.status,
      totalAmountNano: Number(round.total_amount_nano || 0),
      totalTon: formatTon(round.total_amount_nano),
      winnerUserId: round.winner_user_id,
      selectedTicket: round.selected_ticket == null ? null : Number(round.selected_ticket),
      winner: winner ? wheelEntryJson(winner) : null,
      createdAt: round.created_at,
      closedAt: round.closed_at,
    },
    entries: entries.map(wheelEntryJson),
  };
}

function wheelEntryJson(entry: WheelEntryRow) {
  return {
    id: entry.id,
    roundId: entry.round_id,
    userId: entry.user_id,
    username: entry.username,
    firstName: entry.first_name,
    amountNano: Number(entry.amount_nano || 0),
    amountTon: formatTon(entry.amount_nano),
    ticketStart: Number(entry.ticket_start || 0),
    ticketEnd: Number(entry.ticket_end || 0),
    createdAt: entry.created_at,
  };
}

function secureTicket(maxTicket: number): number {
  const max = BigInt(Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(maxTicket) || 1))));
  const space = 1n << 64n;
  const limit = space - (space % max);
  const values = new Uint32Array(2);
  let value = 0n;
  do {
    crypto.getRandomValues(values);
    value = (BigInt(values[0]) << 32n) + BigInt(values[1]);
  } while (value >= limit);
  return Number((value % max) + 1n);
}

function cleanWheelUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!userId) throw new Error('Telegram user not found');
  return userId;
}

function cleanWheelName(value: unknown, fallback: string): string {
  let name = String(value || fallback || 'User').replace(/[<>]/g, '').trim();
  if (name.startsWith('@')) name = name.slice(1);
  if (name.includes(' ')) name = name.split(' ')[0];
  return name.slice(0, 80) || 'User';
}

function cleanWheelFirstName(value: unknown): string | null {
  const firstName = String(value || '').replace(/[<>]/g, '').trim().slice(0, 80);
  return firstName || null;
}

function cleanWheelAmount(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isFinite(amount) || amount < WHEEL_MIN_ENTRY_NANO) throw new Error('Minimum wheel entry is 0.01 TON');
  return amount;
}

function formatTon(value: unknown): string {
  return (Math.max(0, Math.floor(Number(value) || 0)) / 1_000_000_000).toFixed(4).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}


async function getRpsFriendRoom(env: Env, roomId: string): Promise<RpsFriendRoomRow | null> {
  return env.DB.prepare('SELECT id, host_user_id, host_name, guest_user_id, guest_name, status, created_at, updated_at, expires_at FROM rps_friend_rooms WHERE id = ?')
    .bind(roomId)
    .first<RpsFriendRoomRow>();
}

async function getLatestRpsFriendRound(env: Env, roomId: string): Promise<RpsFriendRoundRow | null> {
  return env.DB.prepare('SELECT id, room_id, round_index, host_choice, guest_choice, winner_user_id, status, created_at, resolved_at FROM rps_friend_rounds WHERE room_id = ? ORDER BY round_index DESC LIMIT 1')
    .bind(roomId)
    .first<RpsFriendRoundRow>();
}

async function getLatestResolvedRpsFriendRound(env: Env, roomId: string): Promise<RpsFriendRoundRow | null> {
  return env.DB.prepare("SELECT id, room_id, round_index, host_choice, guest_choice, winner_user_id, status, created_at, resolved_at FROM rps_friend_rounds WHERE room_id = ? AND status != 'open' ORDER BY round_index DESC LIMIT 1")
    .bind(roomId)
    .first<RpsFriendRoundRow>();
}

async function rpsFriendState(env: Env, roomId: string, userId: string) {
  const room = await getRpsFriendRoom(env, roomId);
  if (!room) throw new Error('Room not found');
  if (isRpsRoomExpired(room) && room.status !== 'finished' && room.status !== 'expired') {
    await expireRpsRoom(env, roomId);
    room.status = 'expired';
  }
  const round = await getLatestRpsFriendRound(env, roomId);
  const latestResolvedRound = await getLatestResolvedRpsFriendRound(env, roomId);
  const role = rpsRole(room, userId);
  const resolved = round?.status === 'resolved' || round?.status === 'draw';
  const yourChoice = role === 'host' ? round?.host_choice ?? null : role === 'guest' ? round?.guest_choice ?? null : null;
  const opponentChoice = resolved ? (role === 'host' ? round?.guest_choice ?? null : role === 'guest' ? round?.host_choice ?? null : null) : null;
  const winnerRole = round?.winner_user_id ? (round.winner_user_id === room.host_user_id ? 'host' : round.winner_user_id === room.guest_user_id ? 'guest' : null) : null;
  return {
    ok: true,
    room: {
      id: room.id,
      status: room.status,
      hostName: room.host_name || 'Host',
      guestName: room.guest_name || null,
      hasGuest: Boolean(room.guest_user_id),
      createdAt: room.created_at,
      updatedAt: room.updated_at,
      expiresAt: room.expires_at,
    },
    player: { role },
    round: round ? {
      id: round.id,
      roundIndex: Number(round.round_index || 1),
      status: round.status,
      yourChoice,
      opponentChoice,
      hostChoice: resolved ? round.host_choice : null,
      guestChoice: resolved ? round.guest_choice : null,
      hostPicked: Boolean(round.host_choice),
      guestPicked: Boolean(round.guest_choice),
      winnerUserId: round.winner_user_id,
      winnerRole,
      isDraw: round.status === 'draw',
      createdAt: round.created_at,
      resolvedAt: round.resolved_at,
    } : null,
    lastResult: latestResolvedRound ? {
      id: latestResolvedRound.id,
      roundIndex: Number(latestResolvedRound.round_index || 1),
      status: latestResolvedRound.status,
      winnerUserId: latestResolvedRound.winner_user_id,
      winnerRole: latestResolvedRound.winner_user_id === room.host_user_id ? 'host' : latestResolvedRound.winner_user_id === room.guest_user_id ? 'guest' : null,
      isDraw: latestResolvedRound.status === 'draw',
      resolvedAt: latestResolvedRound.resolved_at,
    } : null,
  };
}

async function resolveRpsFriendRound(env: Env, roomId: string, hostUserId: string, guestUserId: string): Promise<void> {
  const round = await getLatestRpsFriendRound(env, roomId);
  if (!round || round.status !== 'open' || !round.host_choice || !round.guest_choice) return;
  if (round.host_choice === round.guest_choice) {
    const result = await env.DB.prepare("UPDATE rps_friend_rounds SET status = 'draw', resolved_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'open' AND host_choice IS NOT NULL AND guest_choice IS NOT NULL")
      .bind(round.id)
      .run();
    if ((result.meta?.changes ?? 0) > 0) {
      await env.DB.prepare('INSERT INTO rps_friend_rounds (id, room_id, round_index) VALUES (?, ?, ?)')
        .bind(id('rps_round'), roomId, Number(round.round_index || 1) + 1)
        .run();
      await env.DB.prepare('UPDATE rps_friend_rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != ?')
        .bind('active', roomId, 'finished')
        .run();
    }
    return;
  }
  const hostWins = rpsChoiceBeats(round.host_choice, round.guest_choice);
  const winnerUserId = hostWins ? hostUserId : guestUserId;
  await env.DB.batch([
    env.DB.prepare("UPDATE rps_friend_rounds SET status = 'resolved', winner_user_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'open' AND host_choice IS NOT NULL AND guest_choice IS NOT NULL").bind(winnerUserId, round.id),
    env.DB.prepare("UPDATE rps_friend_rooms SET status = 'finished', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(roomId),
  ]);
}

function rpsChoiceBeats(a: RpsChoice, b: RpsChoice): boolean {
  return (a === 'rock' && b === 'scissors') || (a === 'paper' && b === 'rock') || (a === 'scissors' && b === 'paper');
}

function rpsRole(room: RpsFriendRoomRow, userId: string): 'host' | 'guest' | 'spectator' {
  if (room.host_user_id === userId) return 'host';
  if (room.guest_user_id === userId) return 'guest';
  return 'spectator';
}

function isRpsRoomExpired(room: RpsFriendRoomRow): boolean {
  return Date.parse(room.expires_at) <= Date.now();
}

async function expireRpsRoom(env: Env, roomId: string): Promise<void> {
  await env.DB.prepare("UPDATE rps_friend_rooms SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'finished'").bind(roomId).run();
}

function cleanRpsRoomId(value: unknown): string {
  const roomId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!roomId) throw new Error('Room not found');
  return roomId;
}

function cleanRpsUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!userId) throw new Error('Telegram user not found');
  return userId;
}

function cleanRpsName(value: unknown, fallback: string): string {
  const name = String(value || fallback || 'Player').replace(/[<>]/g, '').trim().slice(0, 80);
  return name || fallback;
}

async function setBotWebhook(token: string, url: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url, allowed_updates: USER_BOT_ALLOWED_UPDATES, drop_pending_updates: true }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

async function deleteBotWebhook(token: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ drop_pending_updates: true }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

async function telegramApiWithToken<T>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}

function inferTitle(prompt: string): string { const cleaned = prompt.replace(/\s+/g, ' ').trim(); return cleaned.length <= 34 ? cleaned : cleaned.slice(0, 34) + '...'; }
function html(content: string, extraHeaders: Record<string, string> = {}): Response { return new Response(content, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store, no-cache, must-revalidate', 'x-frame-options': 'ALLOWALL', ...extraHeaders } }); }

export default app;

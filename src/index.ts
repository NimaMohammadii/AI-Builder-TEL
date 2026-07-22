import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { buildBlueprint, defaultBlueprint, defaultFlow, emptyFlow, improveFlow, plainAiReply, type BotFlow } from './ai';
import { miniAppHtml } from './miniapp-chat';
import { adminCodeHtml, adminHtml, adminPanelHtml } from './admin';
import { processTelegramUpdate } from './telegram-agent-safe';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough } from './user-controls';
import { createStarsDeposit, listUserStarsDeposits } from './stars-deposits';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { APP_NAME, PUBLIC_BASE_URL, decryptUserToken, encryptUserToken, gameBotToken, id, rateLimit, safeParseJson } from './utils';
import { adminSessionCookie, clearAdminSessionCookie, createAdminPasswordChallenge, isAdminPassword, isAdminSession, verifyAdminCode } from './admin-auth';
import { isWheelFillReady, pickWheelFillEntries } from './wheel-fill-entries';
import { getOnlineUserCountConfig, ONLINE_COUNT_SECTIONS } from './online-user-counts';

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

type MinesFriendRoomRow = {
  id: string;
  host_user_id: string;
  host_name: string | null;
  guest_user_id: string | null;
  guest_name: string | null;
  status: 'waiting' | 'active' | 'finished' | 'expired';
  current_turn_user_id: string | null;
  hidden_cells_json: string;
  revealed_cells_json: string;
  mine_count: number;
  board_size: number;
  round_index: number;
  finished_reason: string | null;
  host_ready: number | null;
  guest_ready: number | null;
  host_has_points: number | null;
  guest_has_points: number | null;
  amount_nano: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

const createBotSchema = z.object({ ownerTelegramId: z.string().min(1), telegramToken: z.string().min(30).max(128), prompt: z.string().min(10).max(6000) });
const chatSchema = z.object({ instruction: z.string().min(2).max(4000) });
const statusSchema = z.object({ status: z.enum(['active', 'paused']) });
const productSchema = z.object({ title: z.string().min(1).max(120), description: z.string().max(1000).default(''), priceAmount: z.number().int().nonnegative().default(0), currency: z.string().min(3).max(8).default('USD'), deliveryText: z.string().max(4000).default(''), metadata: z.record(z.unknown()).default({}) });
const adminLoginSchema = z.object({ key: z.string().min(1).max(500) });
const rpsFriendUserSchema = z.object({ userId: z.string().min(1).max(80), name: z.string().max(80).optional().nullable() });
const rpsFriendChoiceSchema = rpsFriendUserSchema.extend({ choice: z.enum(['rock', 'paper', 'scissors']) });
const minesFriendUserSchema = z.object({ userId: z.string().min(1).max(80), name: z.string().max(80).optional().nullable(), amountNano: z.number().int().positive().optional(), mineCount: z.number().int().min(1).max(20).optional() });
const minesFriendReadySchema = minesFriendUserSchema.extend({ hasPoints: z.boolean(), amountNano: z.number().int().positive() });
const minesFriendRevealSchema = minesFriendUserSchema.extend({ cell: z.number().int().min(0).max(24) });

app.get('/', (c) => c.redirect('/app'));
app.get('/app', () => html(miniAppHtml()));
app.get('/app/health', (c) => c.json({ ok: true, page: 'miniapp', appUrl: `${PUBLIC_BASE_URL}/app` }));
app.get('/app/api/online-user-counts', async (c) => c.json({ ok: true, sections: ONLINE_COUNT_SECTIONS, ...(await getOnlineUserCountConfig(c.env)) }, 200, { 'cache-control': 'no-store' }));
app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

app.get('/admin', () => html(adminHtml()));
app.get('/admin/', () => html(adminHtml()));
app.post('/admin/login', zValidator('json', adminLoginSchema), async (c) => {
  const { key } = c.req.valid('json');
  if (!isAdminPassword(c.env, key)) return c.json({ error: 'Wrong admin key' }, 401);
  const challenge = await createAdminPasswordChallenge(c.env);
  if (!challenge.ok) return c.json({ error: challenge.error, retryAfter: challenge.retryAfter }, challenge.status as 401 | 429 | 500 | 502);
  return c.json(challenge);
});
app.post('/admin/panel', async (c) => {
  const form = await c.req.formData();
  const key = String(form.get('key') ?? '');
  if (!isAdminPassword(c.env, key)) return html(adminHtml('Wrong admin key.'));
  const challenge = await createAdminPasswordChallenge(c.env);
  if (!challenge.ok) return html(adminHtml(challenge.error));
  return html(adminCodeHtml(challenge.challengeId));
});
app.post('/admin/verify', async (c) => {
  const form = await c.req.formData();
  const challengeId = String(form.get('challenge') ?? '');
  const code = String(form.get('code') ?? '');
  const result = await verifyAdminCode(c.env, challengeId, code);
  if (!result.ok) return html(result.status === 429 ? adminHtml(result.error) : adminCodeHtml(challengeId, result.error));
  return html(adminPanelHtml(), { 'set-cookie': adminSessionCookie(result.sessionToken) });
});
app.get('/admin/panel', async (c) => {
  if (!(await isAdminRequest(c))) return c.redirect('/admin');
  return html(adminPanelHtml());
});
app.post('/admin/logout', (c) => new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json', 'set-cookie': clearAdminSessionCookie() } }));
app.get('/app/api/credit-icon', (c) => c.redirect('/app/api/credit-icon.png'));
app.get('/app/api/credit-icon.png', async (c) => {
  const icon = await c.env.ASSETS.get('credit-icon').catch(() => null);
  if (icon) return new Response(icon.body, { headers: { 'content-type': icon.httpMetadata?.contentType ?? 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
  return new Response(FALLBACK_PNG, { headers: { 'content-type': 'image/png', 'cache-control': 'no-store' } });
});
app.post('/admin/upload-credit-icon', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const form = await c.req.formData();
  const file = form.get('icon');
  if (!file || typeof file !== 'object' || !('type' in file) || !('size' in file) || !('stream' in file)) return c.json({ error: 'Choose an image file.' }, 400);
  const iconFile = file as { type: string; size: number; stream: () => ReadableStream };
  if (!CREDIT_ICON_TYPES.has(iconFile.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
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
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
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


app.post('/app/api/rps/friend/rooms/:roomId/share', zValidator('json', rpsFriendUserSchema), async (c) => {
  const roomId = cleanRpsRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanRpsUserId(body.userId);
  const name = cleanRpsName(body.name, 'Player');
  try {
    const room = await getRpsFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isRpsRoomExpired(room)) {
      await expireRpsRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    const role = rpsRole(room, userId);
    if (role !== 'host' && role !== 'guest') return c.json({ error: 'You are not in this room' }, 403);
    const invite = await createRpsPreparedInvite(c.env, roomId, userId, name);
    return c.json({ ok: true, ...invite });
  } catch (error) {
    console.error('prepare rps friend invite failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not prepare invite' }, 400);
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


app.post('/app/api/mines/friend/rooms', zValidator('json', minesFriendUserSchema), async (c) => {
  const body = c.req.valid('json');
  const userId = cleanFriendUserId(body.userId);
  const name = cleanFriendName(body.name, 'Host');
  const allowed = await safeRateLimit(c.env, `mines-room:${userId}`, 20, 3600);
  if (!allowed) return c.json({ error: 'Too many friend rooms. Try again later.' }, 429);
  const roomId = id('mines');
  const mineCount = Math.max(1, Math.min(20, Math.floor(Number(body.mineCount) || 3)));
  const amountNano = Math.max(1, Math.floor(Number(body.amountNano) || 10_000_000));
  const hidden = makeMinesHiddenCells(25, mineCount);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  try {
    await c.env.DB.prepare("INSERT INTO mines_friend_rooms (id, host_user_id, host_name, status, current_turn_user_id, hidden_cells_json, revealed_cells_json, mine_count, board_size, amount_nano, expires_at) VALUES (?, ?, ?, 'waiting', ?, ?, '[]', ?, 25, ?, ?)")
      .bind(roomId, userId, name, userId, JSON.stringify(hidden), mineCount, amountNano, expiresAt)
      .run();
    return c.json(await minesFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('create mines friend room failed', error);
    return c.json({ error: 'Mines friend rooms are not ready. Run the D1 migration.' }, 500);
  }
});

app.post('/app/api/mines/friend/rooms/:roomId/share', zValidator('json', minesFriendUserSchema), async (c) => {
  const roomId = cleanFriendRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanFriendUserId(body.userId);
  const name = cleanFriendName(body.name, 'Player');
  try {
    const room = await getMinesFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isMinesRoomExpired(room)) {
      await expireMinesRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    const role = minesRole(room, userId);
    if (role !== 'host' && role !== 'guest') return c.json({ error: 'You are not in this room' }, 403);
    const invite = await createMinesPreparedInvite(c.env, roomId, userId, name);
    return c.json({ ok: true, ...invite });
  } catch (error) {
    console.error('prepare mines friend invite failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not prepare invite' }, 400);
  }
});

app.post('/app/api/mines/friend/rooms/:roomId/join', zValidator('json', minesFriendUserSchema), async (c) => {
  const roomId = cleanFriendRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanFriendUserId(body.userId);
  const name = cleanFriendName(body.name, 'Friend');
  try {
    const room = await getMinesFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isMinesRoomExpired(room)) {
      await expireMinesRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    if (room.host_user_id === userId) return c.json(await minesFriendState(c.env, roomId, userId));
    if (room.guest_user_id && room.guest_user_id !== userId) return c.json({ error: 'Room already has two players' }, 409);
    if (!room.guest_user_id) {
      await c.env.DB.prepare("UPDATE mines_friend_rooms SET guest_user_id = ?, guest_name = ?, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND guest_user_id IS NULL")
        .bind(userId, name, roomId)
        .run();
    }
    return c.json(await minesFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('join mines friend room failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not join room' }, 400);
  }
});

app.get('/app/api/mines/friend/rooms/:roomId', async (c) => {
  const roomId = cleanFriendRoomId(c.req.param('roomId'));
  const userId = cleanFriendUserId(c.req.query('userId') || '');
  try {
    return c.json(await minesFriendState(c.env, roomId, userId));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load room' }, error instanceof Error && error.message === 'Room not found' ? 404 : 400);
  }
});

app.post('/app/api/mines/friend/rooms/:roomId/ready', zValidator('json', minesFriendReadySchema), async (c) => {
  const roomId = cleanFriendRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanFriendUserId(body.userId);
  const name = cleanFriendName(body.name, 'Player');
  const amountNano = Math.max(1, Math.floor(Number(body.amountNano) || 0));
  try {
    const room = await getMinesFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isMinesRoomExpired(room)) {
      await expireMinesRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    const role = minesRole(room, userId);
    if (role !== 'host' && role !== 'guest') return c.json({ error: 'You are not in this room' }, 403);
    if (role === 'host') {
      await c.env.DB.prepare('UPDATE mines_friend_rooms SET host_name = ?, host_ready = 1, host_has_points = ?, amount_nano = COALESCE(amount_nano, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(name, body.hasPoints ? 1 : 0, amountNano, roomId)
        .run();
    } else {
      await c.env.DB.prepare('UPDATE mines_friend_rooms SET guest_name = ?, guest_ready = 1, guest_has_points = ?, amount_nano = COALESCE(amount_nano, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(name, body.hasPoints ? 1 : 0, amountNano, roomId)
        .run();
    }
    return c.json(await minesFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('save mines friend ready failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not save ready state' }, 400);
  }
});

app.post('/app/api/mines/friend/rooms/:roomId/start', zValidator('json', minesFriendUserSchema), async (c) => {
  const roomId = cleanFriendRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanFriendUserId(body.userId);
  try {
    const room = await getMinesFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isMinesRoomExpired(room)) {
      await expireMinesRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    const role = minesRole(room, userId);
    if (role !== 'host' && role !== 'guest') return c.json({ error: 'You are not in this room' }, 403);
    if (!room.guest_user_id) return c.json({ error: 'Waiting for friend' }, 409);
    if (room.status === 'finished') {
      const hidden = makeMinesHiddenCells(25, Number(room.mine_count || 3));
      await c.env.DB.prepare("UPDATE mines_friend_rooms SET status = 'active', current_turn_user_id = host_user_id, hidden_cells_json = ?, revealed_cells_json = '[]', finished_reason = NULL, round_index = round_index + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(JSON.stringify(hidden), roomId)
        .run();
    } else if (room.status === 'waiting') {
      await c.env.DB.prepare("UPDATE mines_friend_rooms SET status = 'active', current_turn_user_id = host_user_id, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(roomId)
        .run();
    }
    return c.json(await minesFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('start mines friend round failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not start round' }, 400);
  }
});

app.post('/app/api/mines/friend/rooms/:roomId/reveal', zValidator('json', minesFriendRevealSchema), async (c) => {
  const roomId = cleanFriendRoomId(c.req.param('roomId'));
  const body = c.req.valid('json');
  const userId = cleanFriendUserId(body.userId);
  const cell = body.cell;
  try {
    const room = await getMinesFriendRoom(c.env, roomId);
    if (!room) return c.json({ error: 'Room not found' }, 404);
    if (isMinesRoomExpired(room)) {
      await expireMinesRoom(c.env, roomId);
      return c.json({ error: 'Room expired' }, 410);
    }
    const role = minesRole(room, userId);
    if (role !== 'host' && role !== 'guest') return c.json({ error: 'You are not in this room' }, 403);
    if (!room.guest_user_id) return c.json({ error: 'Waiting for friend' }, 409);
    if (room.status !== 'active') return c.json({ error: 'Round is not active' }, 409);
    if (room.current_turn_user_id !== userId) return c.json({ error: 'Friend turn' }, 409);
    const hidden = parseNumberList(room.hidden_cells_json);
    const revealed = parseRevealedCells(room.revealed_cells_json);
    if (revealed.some((item) => item.cell === cell)) return c.json(await minesFriendState(c.env, roomId, userId));
    const isHidden = hidden.includes(cell);
    revealed.push({ cell, byUserId: userId, result: isHidden ? 'hidden' : 'safe' });
    const safeRevealed = revealed.filter((item) => item.result === 'safe').length;
    const safeTotal = Number(room.board_size || 25) - Number(room.mine_count || hidden.length || 3);
    const finished = isHidden || safeRevealed >= safeTotal;
    const nextTurn = finished ? null : (userId === room.host_user_id ? room.guest_user_id : room.host_user_id);
    await c.env.DB.prepare("UPDATE mines_friend_rooms SET status = ?, current_turn_user_id = ?, revealed_cells_json = ?, finished_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'")
      .bind(finished ? 'finished' : 'active', nextTurn, JSON.stringify(revealed), finished ? (isHidden ? 'hidden' : 'cleared') : null, roomId)
      .run();
    return c.json(await minesFriendState(c.env, roomId, userId));
  } catch (error) {
    console.error('reveal mines friend tile failed', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not select tile' }, 400);
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

async function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<boolean> { return isAdminSession(c.env, c.req.header('cookie')); }

async function handleAiWebhook(c: { req: { json: () => Promise<unknown> }; env: Env; executionCtx: { waitUntil: (promise: Promise<unknown>) => void } }) {
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

async function handleUserBotWebhook(c: { req: { json: () => Promise<unknown> }; env: Env; executionCtx: { waitUntil: (promise: Promise<unknown>) => void } }, botId: string) {
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



async function getMinesFriendRoom(env: Env, roomId: string): Promise<MinesFriendRoomRow | null> {
  return env.DB.prepare('SELECT id, host_user_id, host_name, guest_user_id, guest_name, status, current_turn_user_id, hidden_cells_json, revealed_cells_json, mine_count, board_size, round_index, finished_reason, host_ready, guest_ready, host_has_points, guest_has_points, amount_nano, created_at, updated_at, expires_at FROM mines_friend_rooms WHERE id = ?')
    .bind(roomId)
    .first<MinesFriendRoomRow>();
}

async function minesFriendState(env: Env, roomId: string, userId: string) {
  const room = await getMinesFriendRoom(env, roomId);
  if (!room) throw new Error('Room not found');
  if (isMinesRoomExpired(room) && room.status !== 'finished' && room.status !== 'expired') {
    await expireMinesRoom(env, roomId);
    room.status = 'expired';
  }
  const role = minesRole(room, userId);
  const hidden = parseNumberList(room.hidden_cells_json);
  const revealed = parseRevealedCells(room.revealed_cells_json);
  const finished = room.status === 'finished' || room.status === 'expired';
  const currentTurnRole = room.current_turn_user_id === room.host_user_id ? 'host' : room.current_turn_user_id === room.guest_user_id ? 'guest' : null;
  const hostReady = Boolean(room.host_ready);
  const guestReady = Boolean(room.guest_ready);
  const hostHasPoints = hostReady ? Boolean(room.host_has_points) : null;
  const guestHasPoints = guestReady ? Boolean(room.guest_has_points) : null;
  const youReady = role === 'host' ? hostReady : role === 'guest' ? guestReady : false;
  const friendReady = role === 'host' ? guestReady : role === 'guest' ? hostReady : false;
  const youHavePoints = role === 'host' ? hostHasPoints : role === 'guest' ? guestHasPoints : null;
  const friendHasPoints = role === 'host' ? guestHasPoints : role === 'guest' ? hostHasPoints : null;
  const amountNano = Math.max(1, Math.floor(Number(room.amount_nano) || 10_000_000));
  return {
    ok: true,
    youReady,
    friendReady,
    youHavePoints,
    friendHasPoints,
    amountNano,
    room: {
      id: room.id,
      status: room.status,
      hostName: room.host_name || 'Host',
      guestName: room.guest_name || null,
      hasGuest: Boolean(room.guest_user_id),
      currentTurnRole,
      isYourTurn: Boolean(userId && room.current_turn_user_id === userId && room.status === 'active'),
      boardSize: Number(room.board_size || 25),
      mineCount: Number(room.mine_count || hidden.length || 3),
      amountNano,
      roundIndex: Number(room.round_index || 1),
      finishedReason: room.finished_reason,
      createdAt: room.created_at,
      updatedAt: room.updated_at,
      expiresAt: room.expires_at,
    },
    player: { role },
    board: {
      revealed: revealed.map((item) => ({ cell: item.cell, result: item.result, byRole: item.byUserId === room.host_user_id ? 'host' : item.byUserId === room.guest_user_id ? 'guest' : null })),
      hiddenCells: finished ? hidden : [],
    },
  };
}

function parseNumberList(value: string): number[] {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item >= 0 && item < 25) : [];
  } catch {
    return [];
  }
}

function parseRevealedCells(value: string): Array<{ cell: number; byUserId: string; result: 'safe' | 'hidden' }> {
  try {
    const parsed = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({ cell: Number(item.cell), byUserId: String(item.byUserId || ''), result: item.result === 'hidden' ? 'hidden' as const : 'safe' as const }))
      .filter((item) => Number.isInteger(item.cell) && item.cell >= 0 && item.cell < 25);
  } catch {
    return [];
  }
}

function makeMinesHiddenCells(boardSize: number, count: number): number[] {
  const size = Math.max(1, Math.min(25, Math.floor(boardSize || 25)));
  const total = Math.max(1, Math.min(size - 1, Math.floor(count || 3)));
  const cells = new Set<number>();
  while (cells.size < total) cells.add(Math.floor(Math.random() * size));
  return [...cells].sort((a, b) => a - b);
}

function minesRole(room: MinesFriendRoomRow, userId: string): 'host' | 'guest' | 'spectator' {
  if (room.host_user_id === userId) return 'host';
  if (room.guest_user_id === userId) return 'guest';
  return 'spectator';
}

function isMinesRoomExpired(room: MinesFriendRoomRow): boolean {
  return Date.parse(room.expires_at) <= Date.now();
}

async function expireMinesRoom(env: Env, roomId: string): Promise<void> {
  await env.DB.prepare("UPDATE mines_friend_rooms SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'finished'").bind(roomId).run();
}

function cleanFriendRoomId(value: unknown): string {
  const roomId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!roomId) throw new Error('Room not found');
  return roomId;
}

function cleanFriendUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!userId) throw new Error('Telegram user not found');
  return userId;
}

function cleanFriendName(value: unknown, fallback: string): string {
  const name = String(value || fallback || 'Player').replace(/[<>]/g, '').trim().slice(0, 80);
  return name || fallback;
}

function minesStartParam(roomId: string): string {
  return `minesroom_${cleanFriendRoomId(roomId)}`;
}

async function minesMiniAppInviteUrl(env: Env, roomId: string): Promise<string> {
  const username = await getGameBotUsername(env);
  const shortName = String(env.TELEGRAM_MINI_APP_SHORT_NAME || '').replace(/[^0-9A-Za-z_]/g, '').trim();
  const appPath = shortName ? `/${shortName}` : '';
  return `https://t.me/${username}${appPath}?startapp=${encodeURIComponent(minesStartParam(roomId))}`;
}

async function createMinesPreparedInvite(env: Env, roomId: string, userId: string, name: string): Promise<{ preparedMessageId: string; inviteUrl: string; fallbackText: string }> {
  const token = gameBotToken(env);
  const numericUserId = Number(userId);
  if (!token || !Number.isSafeInteger(numericUserId) || numericUserId <= 0) throw new Error('Telegram share is available only inside Telegram.');
  const inviteUrl = await minesMiniAppInviteUrl(env, roomId);
  const displayName = name || 'A friend';
  const fallbackText = `🎮 ${displayName} invited you to a Mines friend round in Vexa.`;
  const response = await telegramApiWithToken<{ ok: boolean; result?: { id?: string }; description?: string }>(token, 'savePreparedInlineMessage', {
    user_id: numericUserId,
    result: {
      type: 'article',
      id: `mines_invite_${roomId}`.slice(0, 64),
      title: 'Mines Friend Round',
      description: 'Invite a friend to join your private round in Vexa.',
      input_message_content: {
        message_text: fallbackText,
        disable_web_page_preview: true,
      },
      reply_markup: {
        inline_keyboard: [[{ text: '🎮 Join Friend Round', url: inviteUrl }]],
      },
    },
    allow_user_chats: true,
    allow_bot_chats: false,
    allow_group_chats: true,
    allow_channel_chats: false,
  });
  if (!response.ok || !response.result?.id) throw new Error(response.description || 'Telegram could not prepare invite');
  return { preparedMessageId: response.result.id, inviteUrl, fallbackText };
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


function rpsStartParam(roomId: string): string {
  return `rpsroom_${cleanRpsRoomId(roomId)}`;
}

async function rpsMiniAppInviteUrl(env: Env, roomId: string): Promise<string> {
  const username = await getGameBotUsername(env);
  const shortName = String(env.TELEGRAM_MINI_APP_SHORT_NAME || '').replace(/[^0-9A-Za-z_]/g, '').trim();
  const appPath = shortName ? `/${shortName}` : '';
  return `https://t.me/${username}${appPath}?startapp=${encodeURIComponent(rpsStartParam(roomId))}`;
}

async function createRpsPreparedInvite(env: Env, roomId: string, userId: string, name: string): Promise<{ preparedMessageId: string; inviteUrl: string; fallbackText: string }> {
  const token = gameBotToken(env);
  const numericUserId = Number(userId);
  if (!token || !Number.isSafeInteger(numericUserId) || numericUserId <= 0) throw new Error('Telegram share is available only inside Telegram.');
  const inviteUrl = await rpsMiniAppInviteUrl(env, roomId);
  const displayName = name || 'A friend';
  const fallbackText = `🎮 ${displayName} challenged you to Rock Paper Scissors!

✊✋✌️ Tap the button and join the duel.`;
  const response = await telegramApiWithToken<{ ok: boolean; result?: { id?: string }; description?: string }>(token, 'savePreparedInlineMessage', {
    user_id: numericUserId,
    result: {
      type: 'article',
      id: `rps_invite_${roomId}`.slice(0, 64),
      title: 'Rock Paper Scissors Duel',
      description: 'Invite a friend to join your RPS room in Vexa.',
      input_message_content: {
        message_text: fallbackText,
        disable_web_page_preview: true,
      },
      reply_markup: {
        inline_keyboard: [[{ text: '🎮 Enter RPS Room', url: inviteUrl }]],
      },
    },
    allow_user_chats: true,
    allow_bot_chats: false,
    allow_group_chats: true,
    allow_channel_chats: false,
  });
  if (!response.ok || !response.result?.id) throw new Error(response.description || 'Telegram could not prepare invite');
  return { preparedMessageId: response.result.id, inviteUrl, fallbackText };
}

async function getGameBotUsername(env: Env): Promise<string> {
  const configured = String(env.GAME_BOT_USERNAME || '').replace(/^@/, '').replace(/[^0-9A-Za-z_]/g, '').trim();
  if (configured) return configured;
  const token = gameBotToken(env);
  if (!token) throw new Error('Telegram bot token is not configured');
  const tokenId = String(token).split(':')[0].replace(/[^0-9A-Za-z_-]/g, '') || 'default';
  const cacheKey = `telegram:game-bot-username:${tokenId}`;
  const cached = await env.BOT_CACHE.get(cacheKey).catch(() => null);
  if (cached) return cached;
  const response = await telegramApiWithToken<{ ok: boolean; result?: { username?: string }; description?: string }>(token, 'getMe', {});
  const username = String(response.result?.username || '').replace(/^@/, '').replace(/[^0-9A-Za-z_]/g, '').trim();
  if (!response.ok || !username) throw new Error(response.description || 'Telegram bot username is not available');
  await env.BOT_CACHE.put(cacheKey, username, { expirationTtl: 86400 }).catch(() => undefined);
  return username;
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

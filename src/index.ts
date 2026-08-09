import { Hono } from 'hono';
import { miniAppHtml } from './miniapp-game';
import { getOnlineUserCountConfig, ONLINE_COUNT_SECTIONS } from './online-user-counts';
import { registerFriendGameRoutes } from './game-friend-routes';
import { registerWheelRoutes } from './wheel-routes';
import { registerChickenCrossRoutes } from './chicken-cross-routes';
import { handleGameBotWebhook } from './telegram-game-bot';
import { specialWheelStatusResponse } from './special-wheel-mode';
import { createSpecialWheelInvoiceResponse, specialWheelSpinResponse } from './special-wheel-engine';
import { addUserXp, getUserLevel } from './levels';
import type { Env, TelegramUpdate } from './types';
import { gameBotToken, PUBLIC_BASE_URL, validateTelegramInitData } from './utils';

const app = new Hono<{ Bindings: Env }>();
const FALLBACK_PNG = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,120,156,99,248,255,255,63,0,5,254,2,254,167,53,129,132,0,0,0,0,73,69,78,68,174,66,96,130]);
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const HOME_INTRO_IMAGE_KEY = 'home-intro/image';
const HOME_LOTTERY_SLOT_KEY = 'home-lottery-slot';
const VERSIONED_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

type LevelXpEventInput = {
  amount?: unknown;
  source?: unknown;
  metadata?: unknown;
  eventId?: unknown;
};

type LevelXpBody = LevelXpEventInput & {
  initData?: unknown;
  events?: LevelXpEventInput[];
};

app.get('/', (c) => c.redirect('/app'));
app.get('/app', async (c) => {
  const slot = await c.env.ASSETS.head(HOME_LOTTERY_SLOT_KEY).catch(() => null);
  const version = String(slot?.customMetadata?.version || slot?.uploaded?.getTime?.() || '1');
  const slotUrl = slot ? `/app/api/home-lottery-slot.png?v=${encodeURIComponent(version)}` : undefined;
  return html(miniAppHtml(slotUrl));
});
app.get('/app/health', (c) => c.json({ ok: true, page: 'game-miniapp', appUrl: `${PUBLIC_BASE_URL}/app` }));
app.get('/health', (c) => c.json({ ok: true, service: 'vexa-game', timestamp: new Date().toISOString() }));
app.get('/app/api/online-user-counts', async (c) =>
  c.json({ ok: true, sections: ONLINE_COUNT_SECTIONS, ...(await getOnlineUserCountConfig(c.env)) }, 200, { 'cache-control': 'no-store' }),
);
app.get('/app/api/special-wheel-mode', (c) => specialWheelStatusResponse(c.req.raw, c.env));
app.post('/app/api/special-wheel/invoice', (c) => createSpecialWheelInvoiceResponse(c.req.raw, c.env));
app.post('/app/api/special-wheel/spin', (c) => specialWheelSpinResponse(c.req.raw, c.env));

app.get('/app/api/level', async (c) => {
  try {
    const initData = c.req.header('x-telegram-init-data') || c.req.query('initData') || '';
    const userId = await validateTelegramInitData(initData, gameBotToken(c.env));
    return c.json(await getUserLevel(c.env, userId), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load level' }, 401, { 'cache-control': 'no-store' });
  }
});

app.post('/app/api/level/xp', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({})) as LevelXpBody;
    const userId = await validateTelegramInitData(body.initData, gameBotToken(c.env));
    const rawEvents = Array.isArray(body.events) ? body.events : [body];
    const events = rawEvents.slice(0, 120);
    let profile = await getUserLevel(c.env, userId);
    let leveledUp = false;
    let previousLevel = profile.level;
    for (const event of events) {
      const result = await addUserXp(c.env, userId, event.amount, event.source, event.metadata, event.eventId);
      profile = result.profile;
      if (result.leveledUp) leveledUp = true;
      previousLevel = Math.min(previousLevel, result.previousLevel);
    }
    return c.json({ ok: true, processed: events.length, profile, leveledUp, previousLevel }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not sync XP' }, 400, { 'cache-control': 'no-store' });
  }
});

app.get('/app/api/credit-icon', (c) => c.redirect('/app/api/credit-icon.png'));
app.get('/app/api/credit-icon.png', async (c) => {
  const icon = await c.env.ASSETS.get('credit-icon').catch(() => null);
  if (icon) {
    return new Response(icon.body, {
      headers: {
        'content-type': icon.httpMetadata?.contentType ?? 'image/png',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  }
  return new Response(FALLBACK_PNG, { headers: { 'content-type': 'image/png', 'cache-control': 'no-store' } });
});

app.get('/app/api/home-lottery-slot-meta', async (c) => {
  const image = await c.env.ASSETS.head(HOME_LOTTERY_SLOT_KEY).catch(() => null);
  const version = String(image?.customMetadata?.version || image?.uploaded?.getTime?.() || '1');
  return c.json(
    {
      ok: true,
      hasImage: Boolean(image),
      version,
      url: image ? `/app/api/home-lottery-slot.png?v=${encodeURIComponent(version)}` : null,
    },
    200,
    { 'cache-control': 'no-store' },
  );
});
app.get('/app/api/home-lottery-slot.png', async (c) => {
  const image = await c.env.ASSETS.get(HOME_LOTTERY_SLOT_KEY).catch(() => null);
  if (!image) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(image.body, {
    headers: {
      'content-type': image.httpMetadata?.contentType ?? 'image/png',
      'cache-control': c.req.query('v') ? VERSIONED_IMAGE_CACHE_CONTROL : 'public, max-age=300, must-revalidate',
    },
  });
});

app.get('/app/api/home-intro-image-cached.png', async (c) => {
  const image = await c.env.ASSETS.get(HOME_INTRO_IMAGE_KEY).catch(() => null);
  if (!image) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(image.body, {
    headers: {
      'content-type': image.httpMetadata?.contentType ?? 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
});
app.get('/app/api/home-intro-image-meta', async (c) => {
  const image = await c.env.ASSETS.head(HOME_INTRO_IMAGE_KEY).catch(() => null);
  const version = image?.customMetadata?.version || image?.uploaded?.getTime?.() || 'default';
  return c.json(
    { ok: true, version: String(version), url: `/app/api/home-intro-image-cached.png?v=${encodeURIComponent(String(version))}` },
    200,
    { 'cache-control': 'private, max-age=300' },
  );
});

registerFriendGameRoutes(app);
registerWheelRoutes(app);
registerChickenCrossRoutes(app);

app.post('/telegram/webhook', async (c) => {
  const update = await c.req.json<TelegramUpdate>().catch(() => null);
  if (!update) return c.json({ ok: true, ignored: true });
  await handleGameBotWebhook(c.env, update);
  return c.json({ ok: true }, 200, { 'cache-control': 'no-store' });
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ error: 'Internal error' }, 500);
});

function html(content: string, extraHeaders: Record<string, string> = {}): Response {
  return new Response(content, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
      'x-frame-options': 'ALLOWALL',
      ...extraHeaders,
    },
  });
}

export default app;

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { miniAppHtml } from './miniapp-game';
import { adminCodeHtml, adminHtml, adminPanelHtml } from './admin';
import { adminSessionCookie, clearAdminSessionCookie, createAdminPasswordChallenge, isAdminPassword, isAdminSession, verifyAdminCode } from './admin-auth';
import { getOnlineUserCountConfig, ONLINE_COUNT_SECTIONS } from './online-user-counts';
import { registerFriendGameRoutes } from './game-friend-routes';
import { registerWheelRoutes } from './wheel-routes';
import { registerChickenCrossRoutes } from './chicken-cross-routes';
import { handleGameBotWebhook } from './telegram-game-bot';
import { specialWheelStatusResponse } from './special-wheel-mode';
import { createSpecialWheelInvoiceResponse, specialWheelSpinResponse } from './special-wheel-engine';
import type { Env, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL } from './utils';

const app = new Hono<{ Bindings: Env }>();
const FALLBACK_PNG = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,120,156,99,248,255,255,63,0,5,254,2,254,167,53,129,132,0,0,0,0,73,69,78,68,174,66,96,130]);
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const HOME_INTRO_IMAGE_KEY = 'home-intro/image';
const adminLoginSchema = z.object({ key: z.string().min(1).max(500) });

app.get('/', (c) => c.redirect('/app'));
app.get('/app', () => html(miniAppHtml()));
app.get('/app/health', (c) => c.json({ ok: true, page: 'game-miniapp', appUrl: `${PUBLIC_BASE_URL}/app` }));
app.get('/health', (c) => c.json({ ok: true, service: 'vexa-game', timestamp: new Date().toISOString() }));
app.get('/app/api/online-user-counts', async (c) =>
  c.json({ ok: true, sections: ONLINE_COUNT_SECTIONS, ...(await getOnlineUserCountConfig(c.env)) }, 200, { 'cache-control': 'no-store' }),
);
app.get('/app/api/special-wheel-mode', (c) => specialWheelStatusResponse(c.req.raw, c.env));
app.post('/app/api/special-wheel/invoice', (c) => createSpecialWheelInvoiceResponse(c.req.raw, c.env));
app.post('/app/api/special-wheel/spin', (c) => specialWheelSpinResponse(c.req.raw, c.env));

app.get('/admin', () => html(adminHtml()));
app.get('/admin/', () => html(adminHtml()));
app.post('/admin/login', zValidator('json', adminLoginSchema), async (c) => {
  const { key } = c.req.valid('json');
  if (!isAdminPassword(c.env, key)) return c.json({ error: 'Wrong admin key' }, 401);
  const challenge = await createAdminPasswordChallenge(c.env);
  if (challenge.ok === false) return c.json({ error: challenge.error, retryAfter: challenge.retryAfter }, challenge.status as 401 | 429 | 500 | 502);
  return c.json(challenge);
});
app.post('/admin/panel', async (c) => {
  const form = await c.req.formData();
  const key = String(form.get('key') ?? '');
  if (!isAdminPassword(c.env, key)) return html(adminHtml('Wrong admin key.'));
  const challenge = await createAdminPasswordChallenge(c.env);
  if (challenge.ok === false) return html(adminHtml(challenge.error));
  return html(adminCodeHtml(challenge.challengeId));
});
app.post('/admin/verify', async (c) => {
  const form = await c.req.formData();
  const result = await verifyAdminCode(c.env, String(form.get('challenge') ?? ''), String(form.get('code') ?? ''));
  if (result.ok === false) return html(result.status === 429 ? adminHtml(result.error) : adminCodeHtml(String(form.get('challenge') ?? ''), result.error));
  return html(adminPanelHtml(), { 'set-cookie': adminSessionCookie(result.sessionToken) });
});
app.get('/admin/panel', async (c) => {
  if (!(await isAdminSession(c.env, c.req.header('cookie')))) return c.redirect('/admin');
  return html(adminPanelHtml());
});
app.post('/admin/logout', () =>
  new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json', 'set-cookie': clearAdminSessionCookie() } }),
);

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
app.post('/admin/upload-credit-icon', async (c) => {
  if (!(await isAdminSession(c.env, c.req.header('cookie')))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const form = await c.req.formData();
  const file = form.get('icon');
  if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
  if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
  const version = String(Date.now());
  await c.env.ASSETS.put('credit-icon', file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
  return c.json({ ok: true, size: file.size, type: file.type, creditIconUrl: `/app/api/credit-icon.png?v=${version}` });
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
app.post('/admin/api/upload-home-intro-image', async (c) => {
  if (!(await isAdminSession(c.env, c.req.header('cookie')))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const form = await c.req.formData();
  const file = form.get('image');
  if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
  if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
  const version = String(Date.now());
  await c.env.ASSETS.put(HOME_INTRO_IMAGE_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
  return c.json({ ok: true, url: `/app/api/home-intro-image-cached.png?v=${version}` });
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

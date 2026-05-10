import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { buildBlueprint, defaultBlueprint, defaultFlow, emptyFlow, improveFlow, plainAiReply, type BotFlow } from './ai';
import { miniAppHtml } from './miniapp-chat';
import { adminHtml, adminPanelHtml } from './admin';
import { processTelegramUpdate, setTelegramWebhook } from './telegram-agent-safe';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { APP_NAME, PUBLIC_BASE_URL, decryptUserToken, encryptUserToken, id, rateLimit, safeParseJson } from './utils';

const app = new Hono<{ Bindings: Env }>();
const DEFAULT_BOT_ID = 'main';
const FALLBACK_PNG = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,120,156,99,248,255,255,63,0,5,254,2,254,167,53,129,132,0,0,0,0,73,69,78,68,174,66,96,130]);
const CREDIT_ICON_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const USER_BOT_ALLOWED_UPDATES = ['message', 'callback_query', 'pre_checkout_query', 'my_chat_member'];

const createBotSchema = z.object({ ownerTelegramId: z.string().min(1), telegramToken: z.string().min(30).max(128), prompt: z.string().min(10).max(6000) });
const chatSchema = z.object({ instruction: z.string().min(2).max(4000) });
const statusSchema = z.object({ status: z.enum(['active', 'paused']) });
const productSchema = z.object({ title: z.string().min(1).max(120), description: z.string().max(1000).default(''), priceAmount: z.number().int().nonnegative().default(0), currency: z.string().min(3).max(8).default('USD'), deliveryText: z.string().max(4000).default(''), metadata: z.record(z.unknown()).default({}) });
const adminLoginSchema = z.object({ key: z.string().min(1).max(500) });

app.get('/', (c) => c.redirect('/app'));
app.get('/app', () => html(miniAppHtml()));
app.get('/app/', () => html(miniAppHtml()));
app.get('/miniapp', () => html(miniAppHtml()));
app.get('/app/index.html', () => html(miniAppHtml()));
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
  if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
  if (!CREDIT_ICON_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
  if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
  const version = String(Date.now());
  await c.env.ASSETS.put('credit-icon', file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
  await Promise.all([
    c.env.BOT_CACHE.delete('admin:credit-icon').catch(() => undefined),
    c.env.BOT_CACHE.delete('admin:credit-icon-type').catch(() => undefined),
    c.env.BOT_CACHE.delete('admin:credit-icon-version').catch(() => undefined),
  ]);
  return c.json({ ok: true, size: file.size, type: file.type, creditIconUrl: `/app/api/credit-icon.png?v=${version}` });
});

app.post('/setup-webhook', async (c) => {
  const result = await setTelegramWebhook(c.env);
  const menu = await setBuilderMenuButton(c.env.TELEGRAM_BOT_TOKEN, `${PUBLIC_BASE_URL}/app`);
  return c.json({ ...result, menu, webhookUrl: `${PUBLIC_BASE_URL}/telegram/webhook`, miniApp: `${PUBLIC_BASE_URL}/app` });
});

app.post('/app/api/ai/chat', zValidator('json', chatSchema), async (c) => {
  const body = c.req.valid('json');
  return c.json({ reply: await plainAiReply(c.env, body.instruction) });
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
    await c.env.BOT_CACHE.delete(`bot:${botId}`);
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
    await c.env.BOT_CACHE.delete(`bot:${botId}`);
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
  if (body.status === 'active') {
    const result = await setBotWebhook(token, `${PUBLIC_BASE_URL}/bot/${bot.id}/webhook`);
    if (!result.ok) return c.json({ error: result.description ?? 'Could not activate webhook' }, 502);
  } else {
    await deleteBotWebhook(token);
  }
  await c.env.DB.prepare('UPDATE bots SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(body.status, botId).run();
  await c.env.BOT_CACHE.delete(`bot:${botId}`);
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
  await c.env.BOT_CACHE.delete(`bot:${botId}`);
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
  await c.env.BOT_CACHE.delete(`bot:${botId}`);
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
  await c.env.BOT_CACHE.delete(`bot:${botId}`);
  return c.json({ ok: true, botId, webhookUrl });
});

app.post('/telegram', async (c) => handleBuilderWebhook(c));
app.post('/telegram/webhook', async (c) => handleBuilderWebhook(c));
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

async function handleBuilderWebhook(c: { req: { json: () => Promise<unknown> }; env: Env; executionCtx: ExecutionContext }) {
  try {
    const update = (await c.req.json()) as TelegramUpdate;
    const bot = defaultBotRecord();
    c.executionCtx.waitUntil(processTelegramUpdate(c.env, bot, update).catch((error) => console.error('builder telegram processing failed', error)));
    return Response.json({ ok: true });
  } catch (error) { console.error('builder telegram webhook failed', error); return Response.json({ ok: true, recovered: true }); }
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
    const cached = await env.BOT_CACHE.get(`bot:${botId}`);
    if (cached) {
      const parsed = safeParseJson<BotRecord | null>(cached, null);
      if (parsed?.id === botId) return parsed;
      await env.BOT_CACHE.delete(`bot:${botId}`).catch(() => undefined);
    }
    const bot = await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(botId).first<BotRecord>();
    if (bot) await env.BOT_CACHE.put(`bot:${botId}`, JSON.stringify(bot), { expirationTtl: 60 });
    return bot ?? null;
  } catch (error) { console.warn('getBot failed', error); return null; }
}

function defaultBotRecord(): BotRecord {
  return { id: DEFAULT_BOT_ID, owner_telegram_id: null, username: null, title: APP_NAME, status: 'active', encrypted_token: 'env:TELEGRAM_BOT_TOKEN', webhook_secret: 'default', blueprint_json: JSON.stringify(defaultBlueprint('An AI no-code Telegram bot builder.')), settings_json: JSON.stringify({ isBuilderBot: true }), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

function safeBot(bot: BotRecord) {
  const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
  return { id: bot.id, ownerTelegramId: bot.owner_telegram_id, username: bot.username, title: bot.title, status: bot.status, hasToken: Boolean(bot.encrypted_token), blueprint: safeParseJson(bot.blueprint_json, null), flow: settings.flow ?? null, settings, createdAt: bot.created_at, updatedAt: bot.updated_at };
}

async function safeRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try { return await rateLimit(env.RATE_LIMITS, key, limit, windowSeconds); } catch { return true; }
}

async function setBotWebhook(token: string, url: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url, allowed_updates: USER_BOT_ALLOWED_UPDATES, drop_pending_updates: true }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

async function deleteBotWebhook(token: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ drop_pending_updates: true }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

async function setBuilderMenuButton(token: string, url: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ menu_button: { type: 'web_app', text: 'AI Builder TEL', web_app: { url } } }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

async function telegramApiWithToken<T>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}

function inferTitle(prompt: string): string { const cleaned = prompt.replace(/\s+/g, ' ').trim(); return cleaned.length <= 34 ? cleaned : cleaned.slice(0, 34) + '...'; }
function html(content: string, extraHeaders: Record<string, string> = {}): Response { return new Response(content, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store, no-cache, must-revalidate', 'x-frame-options': 'ALLOWALL', ...extraHeaders } }); }

export default app;

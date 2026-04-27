import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { buildBlueprint, defaultBlueprint } from './ai';
import { processTelegramUpdate, setTelegramWebhook } from './telegram';
import type { BotBlueprint, BotRecord, Env, TelegramUpdate } from './types';
import { APP_NAME, PUBLIC_BASE_URL, id, rateLimit, safeParseJson, sha256 } from './utils';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_BOT_ID = 'main';

const createBotSchema = z.object({
  ownerTelegramId: z.string().optional(),
  title: z.string().min(2).max(80),
  prompt: z.string().min(10).max(6000),
  username: z.string().optional(),
});

const productSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).default(''),
  priceAmount: z.number().int().nonnegative().default(0),
  currency: z.string().min(3).max(8).default('USD'),
  deliveryText: z.string().max(4000).default(''),
  metadata: z.record(z.unknown()).default({}),
});

app.get('/', (c) =>
  c.json({
    name: APP_NAME,
    status: 'ok',
    model: 'gpt-5-mini',
    env: ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY'],
    endpoints: {
      health: '/health',
      setupWebhook: 'POST /setup-webhook',
      createBot: 'POST /api/bots',
      publishBot: 'POST /api/bots/:id/publish',
      telegramWebhook: 'POST /telegram',
    },
  }),
);

app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

app.post('/setup-webhook', async (c) => {
  const result = await setTelegramWebhook(c.env);
  return c.json({ ...result, webhookUrl: `${PUBLIC_BASE_URL}/telegram` });
});

app.post('/api/bots', zValidator('json', createBotSchema), async (c) => {
  const body = c.req.valid('json');
  const allowed = await rateLimit(c.env.RATE_LIMITS, `create:${body.ownerTelegramId ?? 'admin'}`, 20, 3600);
  if (!allowed) return c.json({ error: 'Rate limit exceeded' }, 429);

  const blueprint = await buildBlueprint(c.env, body.prompt);
  const botId = id('bot');
  const secret = await sha256(`${botId}:${c.env.TELEGRAM_BOT_TOKEN}:${crypto.randomUUID()}`);

  await c.env.DB.prepare(
    `INSERT INTO bots (id, owner_telegram_id, username, title, status, encrypted_token, webhook_secret, blueprint_json, settings_json)
     VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?)`,
  )
    .bind(
      botId,
      body.ownerTelegramId ?? null,
      body.username ?? null,
      body.title,
      'env:TELEGRAM_BOT_TOKEN',
      secret,
      JSON.stringify(blueprint),
      JSON.stringify({ sourcePrompt: body.prompt }),
    )
    .run();

  await c.env.DB.prepare('INSERT INTO audit_log (id, actor, action, target, metadata_json) VALUES (?, ?, ?, ?, ?)')
    .bind(id('log'), body.ownerTelegramId ?? 'admin', 'bot.create', botId, JSON.stringify({ title: body.title }))
    .run();

  return c.json({ botId, status: 'draft', blueprint });
});

app.get('/api/bots/:id', async (c) => {
  const bot = await getBot(c.env, c.req.param('id'));
  if (!bot) return c.json({ error: 'Bot not found' }, 404);
  return c.json(safeBot(bot));
});

app.put('/api/bots/:id/blueprint', async (c) => {
  const body = (await c.req.json()) as BotBlueprint;
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);

  await c.env.DB.prepare('UPDATE bots SET blueprint_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(JSON.stringify(body), botId)
    .run();
  await c.env.BOT_CACHE.delete(`bot:${botId}`);
  return c.json({ ok: true, botId });
});

app.post('/api/bots/:id/products', zValidator('json', productSchema), async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);

  const body = c.req.valid('json');
  const productId = id('prd');
  await c.env.DB.prepare(
    `INSERT INTO products (id, bot_id, title, description, price_amount, currency, delivery_text, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(productId, botId, body.title, body.description, body.priceAmount, body.currency, body.deliveryText, JSON.stringify(body.metadata))
    .run();

  return c.json({ productId, botId });
});

app.post('/api/bots/:id/publish', async (c) => {
  const botId = c.req.param('id');
  const bot = await getBot(c.env, botId);
  if (!bot) return c.json({ error: 'Bot not found' }, 404);

  const result = await setTelegramWebhook(c.env);
  if (!result.ok) return c.json({ error: 'Telegram setWebhook failed', details: result }, 502);

  await c.env.DB.prepare("UPDATE bots SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(botId).run();
  await c.env.BOT_CACHE.delete(`bot:${botId}`);
  return c.json({ ok: true, botId, webhookUrl: `${PUBLIC_BASE_URL}/telegram` });
});

app.post('/telegram', async (c) => {
  const update = (await c.req.json()) as TelegramUpdate;
  const bot = await getActiveBotForUpdate(c.env, update);
  c.executionCtx.waitUntil(processTelegramUpdate(c.env, bot, update));
  return c.json({ ok: true });
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ error: 'Internal error' }, 500);
});

async function getBot(env: Env, botId: string): Promise<BotRecord | null> {
  const cached = await env.BOT_CACHE.get(`bot:${botId}`);
  if (cached) return safeParseJson<BotRecord | null>(cached, null);

  const bot = await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(botId).first<BotRecord>();
  if (bot) await env.BOT_CACHE.put(`bot:${botId}`, JSON.stringify(bot), { expirationTtl: 60 });
  return bot ?? null;
}

async function getActiveBotForUpdate(env: Env, update: TelegramUpdate): Promise<BotRecord> {
  const userId = String(update.message?.from?.id ?? update.callback_query?.from?.id ?? '');

  if (userId) {
    const ownedBot = await env.DB.prepare("SELECT * FROM bots WHERE owner_telegram_id = ? AND status = 'active' ORDER BY updated_at DESC LIMIT 1")
      .bind(userId)
      .first<BotRecord>();
    if (ownedBot) return ownedBot;
  }

  const activeBot = await env.DB.prepare("SELECT * FROM bots WHERE status = 'active' ORDER BY updated_at DESC LIMIT 1").first<BotRecord>();
  if (activeBot) return activeBot;

  return defaultBotRecord();
}

function defaultBotRecord(): BotRecord {
  return {
    id: DEFAULT_BOT_ID,
    owner_telegram_id: null,
    username: null,
    title: APP_NAME,
    status: 'active',
    encrypted_token: 'env:TELEGRAM_BOT_TOKEN',
    webhook_secret: 'default',
    blueprint_json: JSON.stringify(defaultBlueprint('یک ربات‌ساز هوشمند تلگرام که با هوش مصنوعی برای کاربران ربات می‌سازد.')),
    settings_json: '{}',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function safeBot(bot: BotRecord) {
  return {
    id: bot.id,
    ownerTelegramId: bot.owner_telegram_id,
    username: bot.username,
    title: bot.title,
    status: bot.status,
    blueprint: safeParseJson(bot.blueprint_json, null),
    settings: safeParseJson(bot.settings_json, {}),
    createdAt: bot.created_at,
    updatedAt: bot.updated_at,
  };
}

export default app;

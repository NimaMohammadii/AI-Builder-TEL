# AI Builder TEL

No-code AI Telegram bot builder built for Cloudflare Workers.

The Worker uses only two environment secrets:

```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
OPENAI_API_KEY=your-openai-api-key
```
Everything else is defined in code/config.

## Stack

- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Cloudflare R2
- Hono
- TypeScript
- OpenAI chat completions
- Telegram Bot API webhooks

## Model

The OpenAI model is hardcoded in `src/utils.ts`:

```ts
export const OPENAI_MODEL = 'gpt-4.1-mini';
```

## Features

- Create Telegram bot blueprints from natural-language prompts
- Runtime executes safe JSON config instead of generated user code
- Telegram webhook publishing
- D1 persistence
- KV bot cache
- KV rate limiting
- R2-ready asset binding
- Products/delivery flow
- AI support replies

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:

```env
TELEGRAM_BOT_TOKEN=123456789:your-telegram-bot-token
OPENAI_API_KEY=sk-your-openai-key
```

Run locally:

```bash
npm run dev
```

## Cloudflare resources

Create D1:

```bash
npx wrangler d1 create ai-builder-tel
```

Copy the returned database id into `wrangler.jsonc` under `d1_databases[0].database_id`.

Create KV namespaces:

```bash
npx wrangler kv namespace create BOT_CACHE
npx wrangler kv namespace create RATE_LIMITS
```

Copy the returned ids into `wrangler.jsonc`.

Create R2 bucket:

```bash
npx wrangler r2 bucket create ai-builder-tel-assets
```

Apply migrations:

```bash
npm run db:migrate:prod
```

Set only these secrets:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put OPENAI_API_KEY
```

Deploy:

```bash
npm run deploy
```

## API

### Health

```http
GET /health
```

### Create bot

```http
POST /api/bots
Content-Type: application/json
```

```json
{
  "title": "Course Sales Bot",
  "ownerTelegramId": "123456789",
  "username": "my_course_bot",
  "prompt": "یک ربات فروش دوره زبان بساز با محصولات، پشتیبانی هوشمند، لحن حرفه‌ای و فارسی."
}
```

Response includes `botId` and generated `blueprint`.

### Add product

```http
POST /api/bots/:id/products
Content-Type: application/json
```

```json
{
  "title": "دوره مکالمه زبان",
  "description": "آموزش کامل مکالمه از صفر تا متوسط",
  "priceAmount": 990000,
  "currency": "IRR",
  "deliveryText": "لینک دانلود یا عضویت خصوصی را اینجا قرار بده."
}
```

### Publish bot

```http
POST /api/bots/:id/publish
```

This calls Telegram `setWebhook` and activates the bot.

### Get bot

```http
GET /api/bots/:id
```

## Architecture

```text
Telegram user
  -> Telegram webhook
  -> Cloudflare Worker
  -> bot lookup in KV/D1
  -> settings.flow runtime engine
  -> D1/KV/R2/OpenAI
  -> Telegram Bot API response
```

## Important

`PUBLIC_BASE_URL`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, and app name are hardcoded in `src/utils.ts`.

Current Worker URL:

```text
https://v.vexaagent.workers.dev
```

If your deployed Worker URL changes, update `PUBLIC_BASE_URL` in `src/utils.ts`.

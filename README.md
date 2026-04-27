# AI Builder TEL

No-code AI Telegram bot builder built for Cloudflare Workers.

This project runs a multi-tenant Telegram bot runtime on Cloudflare. AI generates bot blueprints; the Worker executes those blueprints securely without generating unsafe per-user code.

## Stack

- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Cloudflare R2
- Hono
- TypeScript
- OpenAI-compatible chat completions API
- Telegram Bot API webhooks

## Features

- Create Telegram bots from natural-language prompts
- Multi-bot runtime from one Worker deployment
- AI-generated blueprint/config model
- Telegram webhook publishing
- D1 persistence
- KV bot cache
- KV rate limiting
- R2-ready asset binding
- Encrypted bot-token storage when `TOKEN_ENCRYPTION_KEY` is configured
- Products/delivery flow
- AI support replies
- Admin API protection with `ADMIN_API_KEY`

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:

```env
ADMIN_API_KEY=your-admin-key
OPENAI_API_KEY=your-openai-key
TOKEN_ENCRYPTION_KEY=long-random-secret-at-least-32-chars
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

Set secrets:

```bash
npx wrangler secret put ADMIN_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put TOKEN_ENCRYPTION_KEY
```

Set your real Worker URL in `wrangler.jsonc`:

```json
"PUBLIC_BASE_URL": "https://your-worker.your-subdomain.workers.dev"
```

Deploy:

```bash
npm run deploy
```

## API

All admin endpoints require:

```http
Authorization: Bearer YOUR_ADMIN_API_KEY
```

### Health

```http
GET /health
```

### Create bot

```http
POST /api/bots
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_API_KEY
```

```json
{
  "title": "Course Sales Bot",
  "ownerTelegramId": "123456789",
  "telegramToken": "123456:ABC...",
  "username": "my_course_bot",
  "prompt": "یک ربات فروش دوره زبان بساز با محصولات، پشتیبانی هوشمند، لحن حرفه‌ای و فارسی."
}
```

Response includes `botId` and generated `blueprint`.

### Add product

```http
POST /api/bots/:id/products
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_API_KEY
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
Authorization: Bearer YOUR_ADMIN_API_KEY
```

This calls Telegram `setWebhook` and activates the bot.

### Get bot

```http
GET /api/bots/:id
Authorization: Bearer YOUR_ADMIN_API_KEY
```

### Update blueprint

```http
PUT /api/bots/:id/blueprint
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_API_KEY
```

Send a full `BotBlueprint` JSON object.

## Architecture

```text
Telegram user
  -> Telegram webhook
  -> Cloudflare Worker
  -> bot lookup in KV/D1
  -> blueprint runtime engine
  -> D1/KV/R2/OpenAI
  -> Telegram Bot API response
```

The key design choice is config generation, not code generation:

- AI creates a safe JSON blueprint.
- The runtime executes known actions.
- Bots can be updated without redeploying user code.
- Security and abuse controls stay centralized.

## Next build targets

- Telegram Mini App dashboard
- BotFather/managed-bot onboarding flow
- Payments and subscription logic
- R2 file uploads and protected delivery links
- Per-bot analytics dashboard
- Template gallery
- Clone-this-bot growth loop
- Agency/white-label tenant controls

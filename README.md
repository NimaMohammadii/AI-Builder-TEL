# Vexa Games

Telegram game Mini App running on Cloudflare Workers.

The project uses one Telegram bot and one Telegram token:

```env
BOT_TOKEN=123456789:replace-with-your-game-bot-token
```

## Stack

- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Cloudflare R2
- Hono
- TypeScript
- Telegram Bot API

## Main routes

- `GET /app` — game Mini App
- `POST /telegram/webhook` — the single Telegram bot webhook
- `GET /setup-webhook` — registers the webhook and Mini App menu button
- `GET /admin` — web admin login
- `/admin` inside Telegram — Telegram admin panel

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars
```

Set the game bot token and admin values:

```env
BOT_TOKEN=123456789:your-game-bot-token
BOT_ADMIN=123456789
ADMIN_KEY=replace-with-a-strong-admin-password
```

Run:

```bash
npm run dev
```

## Deploy

Set the only Telegram bot secret:

```bash
npx wrangler secret put BOT_TOKEN
```

Set the admin secrets:

```bash
npx wrangler secret put BOT_ADMIN
npx wrangler secret put ADMIN_KEY
```

Apply migrations and deploy:

```bash
npm run db:migrate:prod
npm run deploy
```

After deployment, open:

```text
https://vexa.games/setup-webhook
```

The webhook is registered at:

```text
https://vexa.games/telegram/webhook
```

## Cloudflare bindings

- `DB` — D1 game/user/payment data
- `BOT_CACHE` — admin sessions and runtime state
- `RATE_LIMITS` — game rate limits
- `ASSETS` — uploaded images and game assets
- `PLINKO_LIVE` — Plinko Durable Object

`PUBLIC_BASE_URL` is defined in `src/utils.ts`.

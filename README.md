# Vexa — Telegram AI Bot on Cloudflare Workers

Vexa is a production-minded starter backend for a Telegram AI bot running on **Cloudflare Workers**.

This first phase supports:
- Telegram webhook updates (no polling)
- Safe update validation and routing
- OpenAI Responses API integration
- Private chat replies
- Group replies only when mentioned or replied-to
- Health and protected debug endpoints for operational control

---

## 1) Prerequisites

- Node.js 20+
- npm 10+
- Cloudflare account
- Wrangler CLI (installed via project devDependency)
- Telegram bot token (from BotFather)
- OpenAI API key

---

## 2) Create Telegram bot with BotFather

1. Open Telegram and message `@BotFather`
2. Run `/newbot`
3. Choose bot name and username (e.g. `vexa_bot`)
4. Copy the bot token into env vars as `TELEGRAM_BOT_TOKEN`

Optional but recommended:
- Use `/setprivacy` and decide privacy mode based on your group behavior goals.

---

## 3) Environment variables

Copy example vars:

```bash
cp .dev.vars.example .dev.vars
```

Fill in all required values:

- Required:
  - `OPENAI_API_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - `PUBLIC_WEBHOOK_URL`
- Recommended:
  - `OPENAI_MODEL` (fallback in code: `gpt-4.1-mini`)
  - `TELEGRAM_WEBHOOK_SECRET`
  - `ADMIN_DEBUG_TOKEN`
  - `BOT_USERNAME`
  - `DEFAULT_SYSTEM_PROMPT`
  - `ENVIRONMENT`

For production, set secrets/vars with Wrangler:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
npx wrangler secret put ADMIN_DEBUG_TOKEN
npx wrangler secret put DEFAULT_SYSTEM_PROMPT
npx wrangler deploy
```

And set non-secret vars in `wrangler.jsonc` (or Wrangler environments).

---

## 4) Install and run locally

```bash
npm install
npm run dev
```

Wrangler loads local secrets from `.dev.vars` automatically in `wrangler dev`.

### Local webhook testing

Telegram needs a public HTTPS URL. Use one of:
- `wrangler dev --remote` (remote edge URL)
- A tunnel like Cloudflare Tunnel to your local worker endpoint

Then set `PUBLIC_WEBHOOK_URL` to that public URL and run `/debug/set-webhook`.

---

## 5) Deploy

```bash
npm run deploy
```

After deployment, your Worker URL will look like:

```text
https://vexa.<subdomain>.workers.dev
```

Set `PUBLIC_WEBHOOK_URL` to this URL.

---

## 6) Webhook setup

Use the protected debug endpoint to set webhook:

```bash
curl -X POST "https://<your-worker>/debug/set-webhook" \
  -H "x-admin-token: <ADMIN_DEBUG_TOKEN>"
```

Optional delete:

```bash
curl -X POST "https://<your-worker>/debug/delete-webhook" \
  -H "x-admin-token: <ADMIN_DEBUG_TOKEN>"
```

If `TELEGRAM_WEBHOOK_SECRET` is set, Telegram webhook requests must include:
`X-Telegram-Bot-Api-Secret-Token`.

---

## 7) Example operational curl commands

Health:

```bash
curl "https://<your-worker>/health"
```

Set webhook:

```bash
curl -X POST "https://<your-worker>/debug/set-webhook" \
  -H "x-admin-token: <ADMIN_DEBUG_TOKEN>"
```

---

## 8) Route behavior

- `GET /`
  - returns base service info JSON
- `GET /health`
  - basic worker health JSON
- `POST /telegram/webhook`
  - verifies secret token (if configured)
  - validates JSON payload
  - processes `message` and `edited_message`
  - replies in:
    - private chat: always for text
    - group/supergroup: only when bot is mentioned or message replies to bot
- `POST /debug/set-webhook`
  - admin-protected endpoint using `x-admin-token`
- `POST /debug/delete-webhook`
  - admin-protected endpoint using `x-admin-token`

---

## 9) Project structure

```text
.
├── .dev.vars.example
├── package.json
├── README.md
├── tsconfig.json
├── wrangler.jsonc
└── src
    ├── config.ts
    ├── index.ts
    ├── handlers
    │   ├── debug.ts
    │   ├── health.ts
    │   └── webhook.ts
    ├── lib
    │   ├── logger.ts
    │   ├── openai.ts
    │   ├── router.ts
    │   └── telegram.ts
    ├── prompts
    │   └── system.ts
    └── types
        └── telegram.ts
```

---

## 10) Cloudflare-specific notes

- Built with Worker `fetch` handler style (no Express/Fastify/Nest).
- Uses Worker-compatible APIs (`fetch`, `Request`, `Response`).
- `nodejs_compat` is enabled in Wrangler for broad package compatibility (including SDK edge cases).
- No long-lived server assumptions.

---

## 11) Next recommended phases

1. Command router (`/start`, `/help`, `/settings`) and middleware pipeline.
2. Per-chat/per-user config storage (KV/D1/R2 depending on needs).
3. Group moderation and policy engine.
4. Prompt templates + scoped prompt overrides (global/group/user).
5. Scheduled automations via Cron Triggers + queued jobs.
6. Admin audit logs and observability dashboards.


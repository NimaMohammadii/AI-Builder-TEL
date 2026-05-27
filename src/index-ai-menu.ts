import worker from './index-with-fragment-detail-polish';
import { setTelegramWebhook } from './telegram-agent-safe';
import { aiBotToken, PUBLIC_BASE_URL } from './utils';
import type { Env } from './types';

export { SectionLockEvents } from './section-lock-events';

async function telegramApi(token: string, method: string, payload: unknown): Promise<unknown> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json().catch(() => ({ ok: false, description: 'Invalid Telegram response' }));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] ?? ch));
}

async function setupWebhook(env: Env): Promise<Response> {
  const miniAppUrl = `${PUBLIC_BASE_URL}/builder`;
  const webhook = await setTelegramWebhook(env);
  const menu = await telegramApi(aiBotToken(env), 'setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Open Mini App',
      web_app: { url: miniAppUrl },
    },
  });
  const payload = { ...webhook, menu, webhookUrl: `${PUBLIC_BASE_URL}/telegram/webhook`, miniApp: miniAppUrl };
  const ok = Boolean((payload as { ok?: boolean }).ok);
  return new Response(`<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Setup Webhook</title><style>body{margin:0;background:#000;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:22px}main{max-width:520px;margin:auto}h1{font-size:28px;margin:0 0 10px}.box{border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:16px;background:#080808}pre{white-space:pre-wrap;word-break:break-word;color:#ddd;font-size:12px}.ok{color:#7CFFB2}.bad{color:#FF8A8A}</style></head><body><main><h1 class="${ok ? 'ok' : 'bad'}">${ok ? 'Webhook updated' : 'Webhook failed'}</h1><div class="box"><p>Webhook URL:</p><pre>${escapeHtml(`${PUBLIC_BASE_URL}/telegram/webhook`)}</pre><p>Mini app:</p><pre>${escapeHtml(miniAppUrl)}</pre><p>Telegram response:</p><pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre></div></main></body></html>`, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/setup-webhook') return setupWebhook(env);
    return worker.fetch(request, env, ctx);
  },
};

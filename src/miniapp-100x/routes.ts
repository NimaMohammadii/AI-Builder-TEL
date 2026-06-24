import app from '../index';
import type { Env, TelegramUpdate } from '../types';
import { PUBLIC_BASE_URL } from '../utils';
import { miniApp100xHtml } from './html';

const BOT_2_ALLOWED_UPDATES = ['message', 'callback_query'];
type EnvWithBot2 = Env & { BOT_TOKEN_2?: string };

app.get('/100x', () => html(miniApp100xHtml()));
app.get('/100x/', () => html(miniApp100xHtml()));
app.get('/100x/health', () => Response.json({ ok: true, page: '100x', appUrl: `${PUBLIC_BASE_URL}/100x` }, { headers: { 'cache-control': 'no-store' } }));

app.get('/setup-webhook-100x', async (c) => {
  const token = bot2Token(c.env);
  if (!token) return html(setupHtml(false, { ok: false, description: 'BOT_TOKEN_2 is not configured' }));
  const webhookUrl = `${PUBLIC_BASE_URL}/telegram/100x-webhook`;
  const miniAppUrl = `${PUBLIC_BASE_URL}/100x`;
  const webhook = await telegram(token, 'setWebhook', { url: webhookUrl, allowed_updates: BOT_2_ALLOWED_UPDATES, drop_pending_updates: true });
  const menu = await telegram(token, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Open 100x', web_app: { url: miniAppUrl } } });
  return html(setupHtml(Boolean((webhook as { ok?: boolean }).ok), { webhook, menu, webhookUrl, miniAppUrl }));
});

app.post('/telegram/100x-webhook', async (c) => handleBot2Webhook(c));

async function handleBot2Webhook(c: { req: { json: () => Promise<unknown> }; env: Env }): Promise<Response> {
  try {
    const token = bot2Token(c.env);
    if (!token) return Response.json({ ok: true, ignored: true, reason: 'BOT_TOKEN_2 missing' });
    const update = await c.req.json() as TelegramUpdate;
    const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id ?? update.callback_query?.from.id;
    if (update.callback_query) await telegram(token, 'answerCallbackQuery', { callback_query_id: update.callback_query.id }).catch(() => undefined);
    if (!chatId) return Response.json({ ok: true, ignored: true, bot: '100x' });
    await sendOpenMiniApp(token, chatId);
    return Response.json({ ok: true, bot: '100x' });
  } catch (error) {
    console.error('100x telegram webhook failed', error);
    return Response.json({ ok: true, recovered: true, bot: '100x' });
  }
}

async function sendOpenMiniApp(token: string, chatId: number): Promise<void> {
  await telegram(token, 'sendMessage', {
    chat_id: chatId,
    text: 'Open 100x mini app.',
    reply_markup: { inline_keyboard: [[{ text: 'Open 100x', web_app: { url: `${PUBLIC_BASE_URL}/100x` } }]] },
  });
}

function bot2Token(env: Env): string {
  return String((env as EnvWithBot2).BOT_TOKEN_2 || '').trim();
}

async function telegram<T = { ok: boolean; description?: string }>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}

function html(content: string): Response {
  return new Response(content, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store, no-cache, must-revalidate', 'x-frame-options': 'ALLOWALL' } });
}

function setupHtml(ok: boolean, payload: unknown): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>100x Webhook</title><style>body{margin:0;background:#000;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:22px}main{max-width:560px;margin:auto}.box{border:1px solid rgba(255,255,255,.16);border-radius:20px;padding:16px;background:#080808}pre{white-space:pre-wrap;word-break:break-word;color:#ddd;font-size:12px}.ok{color:#7CFFB2}.bad{color:#FF8A8A}</style></head><body><main><h1 class="${ok ? 'ok' : 'bad'}">${ok ? 'Webhook updated' : 'Webhook failed'}</h1><div class="box"><pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre></div></main></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char] ?? char));
}

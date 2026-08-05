import './miniapp-voice-ai-routes';
import './deposit-method-icon-routes';
import './withdrawal-admin-routes';
import app from './index-with-admin-refresh';
import { REWARDS_LIVE_WINNERS_EFFECTS } from './miniapp/rewards-live-winners-effects';
import { handleGameCardAdminRequest } from './telegram-game-card-admin';
import type { Env } from './types';

export { PlinkoLiveRoom } from './plinko-live';

export class GhostRunLiveRoom {
  async fetch(): Promise<Response> {
    return new Response(JSON.stringify({ error: 'Ghost Run live room not configured.' }), {
      status: 404,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const adminDiagnosticResponse = await diagnoseAdminCommand(request, env);
    if (adminDiagnosticResponse) return adminDiagnosticResponse;

    const gameCardAdminResponse = await handleGameCardAdminRequest(request, env);
    if (gameCardAdminResponse) return gameCardAdminResponse;

    const response = await app.fetch(request, env as never, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    return new Response(html.replace('</body>', `${REWARDS_LIVE_WINNERS_EFFECTS}</body>`), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

async function diagnoseAdminCommand(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') return null;
  const update = await request.clone().json().catch(() => null) as { message?: { text?: string; chat?: { id?: number }; from?: { id?: number } } } | null;
  const message = update?.message;
  const text = String(message?.text || '').trim().toLowerCase();
  if (!(text === 'admin' || text === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(text))) return null;
  const chatId = message?.chat?.id;
  const userId = message?.from?.id;
  if (!chatId || !userId || !env.TELEGRAM_BOT_TOKEN) return null;

  const admins = String(env.BOT_ADMIN || '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
  if (admins.length && admins.includes(String(userId))) return null;

  const diagnostic = admins.length
    ? `این حساب اجازه ورود به پنل ادمین را ندارد.\n\nآیدی عددی فعلی تو: ${userId}\nمقدار BOT_ADMIN باید شامل همین عدد باشد.`
    : `پنل ادمین هنوز تنظیم نشده است.\n\nآیدی عددی فعلی تو: ${userId}\nدر تنظیمات Worker مقدار BOT_ADMIN را برابر همین عدد قرار بده.`;

  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: diagnostic }),
  }).catch(() => undefined);
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}

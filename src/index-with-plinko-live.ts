import './deposit-method-icon-routes';
import './withdrawal-admin-routes';
import app from './index-with-admin-refresh';
import { REWARDS_LIVE_WINNERS_EFFECTS } from './miniapp/rewards-live-winners-effects';
import { handleGameCardAdminRequest } from './telegram-game-card-admin';
import { setGameMenuButton, setTelegramWebhook } from './telegram-game-bot';
import type { Env } from './types';

export { PlinkoLiveRoom } from './plinko-live';

export class GhostRunLiveRoom {
  async fetch(): Promise<Response> {
    return new Response(JSON.stringify({ error: 'Ghost Run live room not configured.' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Temporary internal aliases keep older game/admin modules working while all
    // secrets still come from the single BOT_TOKEN binding.
    const runtimeEnv = Object.assign(Object.create(env), env, {
      TELEGRAM_BOT_TOKEN: env.BOT_TOKEN,
      GAME_BOT_TOKEN: env.BOT_TOKEN,
    }) as Env;

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/setup-webhook') {
      const [webhook, menu] = await Promise.all([
        setTelegramWebhook(runtimeEnv),
        setGameMenuButton(runtimeEnv),
      ]);
      return Response.json(
        { ok: Boolean(webhook.ok && menu.ok), webhook, menu, webhookUrl: `${url.origin}/telegram/webhook`, miniApp: `${url.origin}/app` },
        { headers: { 'cache-control': 'no-store' } },
      );
    }

    const gameCardAdminResponse = await handleGameCardAdminRequest(request, runtimeEnv);
    if (gameCardAdminResponse) return gameCardAdminResponse;

    const response = await app.fetch(request, runtimeEnv as never, ctx);
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

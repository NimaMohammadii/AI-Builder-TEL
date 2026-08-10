import app from './index-game-services';
import { REWARDS_LIVE_WINNERS_EFFECTS } from './miniapp/rewards-live-winners-effects';
import { HOME_LOTTERY_CLIENT_SCRIPT } from './miniapp/home-lottery-client';
import { handleCrashGhostLiveBetsAdminRequest } from './telegram-crash-ghost-live-bets-admin';
import { handleGameCardAdminRequest } from './telegram-game-card-admin';
import { handleGramWithdrawalAdminRequest, notifyAdminGramWithdrawal } from './telegram-gram-withdrawals-admin';
import { handleLotteryAdminRequest } from './telegram-lottery-admin';
import { handleOnlineCountsAdminRequest } from './telegram-online-counts-admin';
import { handlePlinkoControlAdminRequest } from './telegram-plinko-control-admin';
import { handlePlayZoneCardAdminRequest } from './telegram-play-zone-card-admin';
import { getPlayZoneCardVisibility, isPlayZoneVisibilityAdmin } from './play-zone-card-visibility';
import { handleLotteryRequest } from './lottery-http';
import { gameBotToken, validateTelegramInitData } from './utils';
import { handleSectionAccessAdminRequest } from './telegram-section-access-admin';
import { getSectionAccess, isMiniAppAdmin } from './section-access';
import { handleSlotLiveBetsAdminRequest } from './telegram-slot-live-bets-admin';
import { setGameMenuButton, setTelegramWebhook } from './telegram-game-bot';
import type { Env } from './types';
import type { TonWithdrawal } from './ton-withdrawals';
export { SectionLockEvents } from './section-lock-events';

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
    // Older game/admin modules still receive compatibility aliases, but both are
    // derived only from the single external BOT_TOKEN binding.
    const runtimeEnv = Object.assign(Object.create(env), env, {
      TELEGRAM_BOT_TOKEN: env.BOT_TOKEN,
      GAME_BOT_TOKEN: env.BOT_TOKEN,
    }) as Env;

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/app/api/section-access/live' && request.headers.get('Upgrade') === 'websocket') {
      try {
        const userId = await validateTelegramInitData(url.searchParams.get('initData') || '', gameBotToken(runtimeEnv));
        const locks = await getSectionAccess(runtimeEnv);
        const headers = new Headers(request.headers);
        headers.set('x-section-lock-admin', isMiniAppAdmin(runtimeEnv, userId) ? '1' : '0');
        headers.set('x-section-lock-initial', JSON.stringify(locks));
        const id = runtimeEnv.SECTION_LOCK_EVENTS.idFromName('global');
        return runtimeEnv.SECTION_LOCK_EVENTS.get(id).fetch(new Request('https://section-lock-events/connect', { headers }));
      } catch {
        return new Response('Unauthorized', { status: 401 });
      }
    }
    if (request.method === 'POST' && url.pathname === '/app/api/play-zone-card-visibility') {
      try {
        const body = await request.json().catch(() => ({})) as { initData?: unknown };
        const userId = await validateTelegramInitData(body.initData, gameBotToken(runtimeEnv));
        const state = await getPlayZoneCardVisibility(runtimeEnv);
        return Response.json({ ok: true, admin: isPlayZoneVisibilityAdmin(runtimeEnv, userId), hiddenIds: state.hiddenIds }, { headers: { 'cache-control': 'no-store' } });
      } catch {
        return Response.json({ ok: false, hiddenIds: [] }, { status: 401, headers: { 'cache-control': 'no-store' } });
      }
    }
    if (request.method === 'GET' && url.pathname === '/setup-webhook') {
      const [webhook, menu] = await Promise.all([
        setTelegramWebhook(env),
        setGameMenuButton(env),
      ]);
      return Response.json(
        {
          ok: Boolean(webhook.ok && menu.ok),
          tokenBinding: 'BOT_TOKEN',
          tokenConfigured: Boolean(String(env.BOT_TOKEN ?? '').trim()),
          webhook,
          menu,
          webhookUrl: `${url.origin}/telegram/webhook`,
          miniApp: `${url.origin}/app`,
        },
        { headers: { 'cache-control': 'no-store' } },
      );
    }

    const lotteryResponse = await handleLotteryRequest(request, runtimeEnv);
    if (lotteryResponse) return lotteryResponse;

    const crashGhostLiveBetsAdminResponse = await handleCrashGhostLiveBetsAdminRequest(request, runtimeEnv);
    if (crashGhostLiveBetsAdminResponse) return crashGhostLiveBetsAdminResponse;

    const slotLiveBetsAdminResponse = await handleSlotLiveBetsAdminRequest(request, runtimeEnv);
    if (slotLiveBetsAdminResponse) return slotLiveBetsAdminResponse;

    const onlineCountsAdminResponse = await handleOnlineCountsAdminRequest(request, runtimeEnv);
    if (onlineCountsAdminResponse) return onlineCountsAdminResponse;

    const plinkoControlAdminResponse = await handlePlinkoControlAdminRequest(request, runtimeEnv);
    if (plinkoControlAdminResponse) return plinkoControlAdminResponse;

    const gramWithdrawalAdminResponse = await handleGramWithdrawalAdminRequest(request, runtimeEnv);
    if (gramWithdrawalAdminResponse) return gramWithdrawalAdminResponse;

    const lotteryAdminResponse = await handleLotteryAdminRequest(request, runtimeEnv);
    if (lotteryAdminResponse) return lotteryAdminResponse;

    const sectionAccessAdminResponse = await handleSectionAccessAdminRequest(request, runtimeEnv);
    if (sectionAccessAdminResponse) return sectionAccessAdminResponse;

    const playZoneCardAdminResponse = await handlePlayZoneCardAdminRequest(request, runtimeEnv);
    if (playZoneCardAdminResponse) return playZoneCardAdminResponse;

    const gameCardAdminResponse = await handleGameCardAdminRequest(request, runtimeEnv);
    if (gameCardAdminResponse) return gameCardAdminResponse;

    const isNewGramWithdrawal = request.method === 'POST' && url.pathname === '/app/api/ton/withdrawals';
    const response = await app.fetch(request, runtimeEnv as never, ctx);
    if (isNewGramWithdrawal && response.ok) {
      const withdrawal = await response.clone().json().catch(() => null) as TonWithdrawal | null;
      if (withdrawal?.id) {
        await notifyAdminGramWithdrawal(runtimeEnv, withdrawal).catch((error) => console.warn('Gram withdrawal notification failed', error));
      }
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    return new Response(html.replace('</body>', `${HOME_LOTTERY_CLIENT_SCRIPT}${REWARDS_LIVE_WINNERS_EFFECTS}</body>`), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

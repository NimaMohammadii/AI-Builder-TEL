import app from './index-game-services';
import { REWARDS_LIVE_WINNERS_EFFECTS } from './miniapp/rewards-live-winners-effects';
import { HOME_LOTTERY_CLIENT_SCRIPT } from './miniapp/home';
import { LIVE_ACTIVITY_CLIENT_SCRIPT } from './live-activity';
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
export { LiveActivityRoom } from './live-activity';

export { PlinkoLiveRoom } from './plinko-live';

const GHOST_ROOM_NAME = 'global';
const GHOST_ROUND_KEY = 'ghost-live-round-v3';
const GHOST_ROUND_SEQUENCE_KEY = 'ghost-live-round-sequence-v3';
const GHOST_HISTORY_KEY = 'ghost-live-history-v3';
const GHOST_BETTING_MS = 6500;
const GHOST_RESTART_MS = 4400;
const GHOST_HISTORY_LIMIT = 24;
const DEFAULT_GHOST_HISTORY = [1.18, 1.47, 2.03, 1.09, 3.26, 1.72, 1.31, 2.54, 1.15, 4.08];

type GhostLivePhase = 'betting' | 'running' | 'ended';

type GhostLiveRound = {
  roundId: number;
  phase: GhostLivePhase;
  bettingStartedAt: number;
  runningStartedAt: number;
  crashAt: number;
  nextRoundAt: number;
  crashPoint: number;
};

type GhostPublicState = {
  roundId: number;
  phase: GhostLivePhase;
  serverNow: number;
  bettingStartedAt: number;
  runningStartedAt: number;
  bettingMs: number;
  restartMs: number;
  multiplier: number;
  crashMultiplier: number | null;
  history: number[];
};

export class GhostRunLiveRoom {
  private sockets = new Set<WebSocket>();

  constructor(private state: DurableObjectState) {
    this.state.blockConcurrencyWhile(async () => {
      const existing = await this.state.storage.get<GhostLiveRound>(GHOST_ROUND_KEY).catch(() => null);
      if (!existing) await this.createRound(Date.now());
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET' && request.headers.get('Upgrade') === 'websocket' && url.pathname === '/connect') {
      return this.connect();
    }
    return new Response('Not found', { status: 404 });
  }

  async alarm(): Promise<void> {
    await this.advance(Date.now());
  }

  private async connect(): Promise<Response> {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.sockets.add(server);
    server.addEventListener('close', () => this.sockets.delete(server));
    server.addEventListener('error', () => this.sockets.delete(server));
    server.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') return;
      let message: { type?: unknown; clientSentAt?: unknown } | null = null;
      try { message = JSON.parse(event.data) as { type?: unknown; clientSentAt?: unknown }; } catch { return; }
      if (message?.type !== 'sync') return;
      this.sendState(server, Number(message.clientSentAt) || null).catch(() => undefined);
    });

    await this.sendState(server, null);
    return new Response(null, { status: 101, webSocket: client });
  }

  private async sendState(socket: WebSocket, clientSentAt: number | null): Promise<void> {
    const now = Date.now();
    const round = await this.advance(now);
    safeGhostSend(socket, {
      type: 'ghost-state',
      clientSentAt,
      state: await this.publicState(round, Date.now()),
    });
  }

  private async advance(now: number): Promise<GhostLiveRound> {
    let round = await this.state.storage.get<GhostLiveRound>(GHOST_ROUND_KEY).catch(() => null);
    if (!round) round = await this.createRound(now);

    for (let step = 0; step < 4; step += 1) {
      if (round.phase === 'betting' && now >= round.runningStartedAt) {
        round = { ...round, phase: 'running' };
        await this.state.storage.put(GHOST_ROUND_KEY, round);
        await this.publish(round, now);
        continue;
      }

      if (round.phase === 'running' && now >= round.crashAt) {
        round = { ...round, phase: 'ended' };
        await this.state.storage.put(GHOST_ROUND_KEY, round);
        await this.pushHistory(round.crashPoint);
        await this.publish(round, now);
        continue;
      }

      if (round.phase === 'ended' && now >= round.nextRoundAt) {
        const startAt = now - round.nextRoundAt > 60_000 ? now : round.nextRoundAt;
        round = await this.createRound(startAt);
        await this.publish(round, now);
        continue;
      }

      break;
    }

    await this.scheduleAlarm(round, now);
    return round;
  }

  private async createRound(startAt: number): Promise<GhostLiveRound> {
    const previous = Number(await this.state.storage.get<number>(GHOST_ROUND_SEQUENCE_KEY).catch(() => 0)) || 0;
    const roundId = previous + 1;
    const crashPoint = secureGhostCrashPoint();
    const runningStartedAt = startAt + GHOST_BETTING_MS;
    const crashAt = runningStartedAt + ghostCrashTimeMs(crashPoint);
    const round: GhostLiveRound = {
      roundId,
      phase: 'betting',
      bettingStartedAt: startAt,
      runningStartedAt,
      crashAt,
      nextRoundAt: crashAt + GHOST_RESTART_MS,
      crashPoint,
    };
    await this.state.storage.put(GHOST_ROUND_SEQUENCE_KEY, roundId);
    await this.state.storage.put(GHOST_ROUND_KEY, round);
    return round;
  }

  private async publicState(round: GhostLiveRound, now: number): Promise<GhostPublicState> {
    return {
      roundId: round.roundId,
      phase: round.phase,
      serverNow: now,
      bettingStartedAt: round.bettingStartedAt,
      runningStartedAt: round.runningStartedAt,
      bettingMs: GHOST_BETTING_MS,
      restartMs: GHOST_RESTART_MS,
      multiplier: round.phase === 'running'
        ? ghostDisplayMultiplier(round, now)
        : round.phase === 'ended'
          ? floorGhostMultiplier(round.crashPoint)
          : 1,
      crashMultiplier: round.phase === 'ended' ? floorGhostMultiplier(round.crashPoint) : null,
      history: await this.history(),
    };
  }

  private async publish(round: GhostLiveRound, now: number): Promise<void> {
    const payload = { type: 'ghost-state', clientSentAt: null, state: await this.publicState(round, now) };
    for (const socket of [...this.sockets]) {
      if (!safeGhostSend(socket, payload)) this.sockets.delete(socket);
    }
  }

  private async scheduleAlarm(round: GhostLiveRound, now: number): Promise<void> {
    const next = round.phase === 'betting' ? round.runningStartedAt : round.phase === 'running' ? round.crashAt : round.nextRoundAt;
    await this.state.storage.setAlarm(Math.max(now + 25, next + 10)).catch(() => undefined);
  }

  private async history(): Promise<number[]> {
    const saved = await this.state.storage.get<number[]>(GHOST_HISTORY_KEY).catch(() => null);
    return Array.isArray(saved) && saved.length
      ? saved.filter((value) => Number.isFinite(value)).slice(0, GHOST_HISTORY_LIMIT)
      : DEFAULT_GHOST_HISTORY.slice();
  }

  private async pushHistory(multiplier: number): Promise<void> {
    const history = await this.history();
    const next = [floorGhostMultiplier(multiplier), ...history].slice(0, GHOST_HISTORY_LIMIT);
    await this.state.storage.put(GHOST_HISTORY_KEY, next);
  }
}

function secureGhostCrashPoint(): number {
  const r = secureGhostUnit();
  const n = secureGhostUnit();
  const value = r < 0.84
    ? 1.08 + Math.pow(n, 0.82) * 0.92
    : r < 0.97
      ? 2.02 + Math.pow(n, 1.55) * 2.2
      : 4.25 + Math.pow(n, 2.3) * 5.75;
  return floorGhostMultiplier(value);
}

function secureGhostUnit(): number {
  const data = new Uint32Array(1);
  crypto.getRandomValues(data);
  return data[0] / 4_294_967_296;
}

function ghostMultiplierAt(seconds: number): number {
  const t = Math.max(0, Number(seconds) || 0);
  return 1 + t * 0.038 + Math.pow(t, 1.12) * 0.020;
}

function ghostDisplayMultiplier(round: GhostLiveRound, now: number): number {
  if (round.phase === 'betting') return 1;
  if (round.phase === 'ended' || now >= round.crashAt) return floorGhostMultiplier(round.crashPoint);
  return floorGhostMultiplier(ghostMultiplierAt((now - round.runningStartedAt) / 1000));
}

function ghostCrashTimeMs(crashPoint: number): number {
  let low = 0;
  let high = 180_000;
  for (let i = 0; i < 28; i += 1) {
    const mid = (low + high) / 2;
    if (ghostMultiplierAt(mid / 1000) >= crashPoint) high = mid;
    else low = mid;
  }
  return Math.max(800, Math.floor(high));
}

function floorGhostMultiplier(value: number): number {
  return Math.max(1, Math.floor((Number(value) || 1) * 100) / 100);
}

function safeGhostSend(socket: WebSocket, payload: unknown): boolean {
  try {
    socket.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
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
    if (request.method === 'GET' && url.pathname === '/app/api/ghost-run/live/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return Response.json({ error: 'Expected websocket.' }, { status: 426, headers: { 'cache-control': 'no-store' } });
      }
      try {
        await validateTelegramInitData(url.searchParams.get('initData') || '', gameBotToken(runtimeEnv));
        const id = runtimeEnv.GHOST_RUN_LIVE.idFromName(GHOST_ROOM_NAME);
        return runtimeEnv.GHOST_RUN_LIVE.get(id).fetch(new Request('https://ghost-run-live/connect', {
          method: 'GET',
          headers: request.headers,
        }));
      } catch {
        return new Response('Unauthorized', { status: 401 });
      }
    }
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
    if (request.method === 'GET' && url.pathname === '/app/api/live-activity/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return Response.json({ error: 'Expected websocket.' }, { status: 426, headers: { 'cache-control': 'no-store' } });
      }
      try {
        await validateTelegramInitData(url.searchParams.get('initData') || '', gameBotToken(runtimeEnv));
        const id = runtimeEnv.LIVE_ACTIVITY.idFromName('global');
        return runtimeEnv.LIVE_ACTIVITY.get(id).fetch(new Request('https://live-activity/connect', {
          method: 'GET',
          headers: request.headers,
        }));
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
    return new Response(html.replace('</body>', `${HOME_LOTTERY_CLIENT_SCRIPT}${LIVE_ACTIVITY_CLIENT_SCRIPT}${REWARDS_LIVE_WINNERS_EFFECTS}</body>`), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

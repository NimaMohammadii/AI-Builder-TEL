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
import { ensureTonBalanceColumn, getUserControls } from './user-controls';
import { ensureTonTransactionsTable } from './ton-transactions';
import type { Env } from './types';
import type { TonWithdrawal } from './ton-withdrawals';
export { SectionLockEvents } from './section-lock-events';

export { PlinkoLiveRoom } from './plinko-live';

const GHOST_ROOM_NAME = 'global';
const GHOST_ROUND_KEY = 'ghost:round';
const GHOST_ROUND_SEQUENCE_KEY = 'ghost:round-sequence';
const GHOST_HISTORY_KEY = 'ghost:history';
const GHOST_BETTING_MS = 6500;
const GHOST_RESTART_MS = 4400;
const GHOST_MIN_BET_NANO = 10_000_000;
const GHOST_MAX_BET_NANO = 1_000_000_000_000_000;
const GHOST_HISTORY_LIMIT = 24;

type GhostPhase = 'betting' | 'running' | 'ended';

type GhostRound = {
  roundId: number;
  phase: GhostPhase;
  bettingStartedAt: number;
  runningStartedAt: number;
  crashAt: number;
  nextRoundAt: number;
  crashPoint: number;
  hasBets: boolean;
};

type GhostBetRow = {
  round_id: number;
  user_id: string;
  amount_nano: number;
  auto_cashout: number;
  status: 'placed' | 'cashed' | 'lost';
  debited: number;
  credited: number;
  payout_nano: number;
  cashout_multiplier: number | null;
};

type GhostClientMessage = {
  type?: unknown;
  amountNano?: unknown;
  autoCashout?: unknown;
  clientSentAt?: unknown;
};

type GhostPublicState = {
  roundId: number;
  phase: GhostPhase;
  serverNow: number;
  bettingStartedAt: number;
  runningStartedAt: number;
  nextRoundAt: number;
  bettingMs: number;
  restartMs: number;
  multiplier: number;
  crashMultiplier: number | null;
  history: number[];
};

export class GhostRunRoundRoom {
  private sockets = new Map<WebSocket, string>();
  private tablesReady: Promise<void> | null = null;

  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.headers.get('Upgrade') === 'websocket' && url.pathname === '/connect') return this.connect(request);
    return new Response('Not found', { status: 404 });
  }

  async alarm(): Promise<void> {
    await this.advance(Date.now());
  }

  private async connect(request: Request): Promise<Response> {
    const userId = cleanGhostUserId(request.headers.get('x-ghost-user-id'));
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.sockets.set(server, userId);
    server.addEventListener('close', () => this.sockets.delete(server));
    server.addEventListener('error', () => this.sockets.delete(server));
    server.addEventListener('message', (event) => {
      this.handleMessage(server, userId, event.data).catch((error) => {
        safeGhostSend(server, { type: 'ghost-error', error: error instanceof Error ? error.message : 'Ghost Run action failed.' });
      });
    });

    const round = await this.advance(Date.now());
    await this.sendSync(server, userId, round, null);
    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleMessage(socket: WebSocket, userId: string, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== 'string') return;
    const message = JSON.parse(raw) as GhostClientMessage;
    const type = String(message.type || '');

    if (type === 'sync') {
      const round = await this.advance(Date.now());
      await this.sendSync(socket, userId, round, Number(message.clientSentAt) || null);
      return;
    }

    if (type === 'bet') {
      const round = await this.advance(Date.now());
      const result = await this.placeBet(round, userId, message.amountNano, message.autoCashout);
      safeGhostSend(socket, { type: 'ghost-bet', ...result });
      return;
    }

    if (type === 'cashout') {
      const round = await this.advance(Date.now());
      const result = await this.cashOut(round, userId);
      safeGhostSend(socket, { type: 'ghost-cashout', ...result });
    }
  }

  private async sendSync(socket: WebSocket, userId: string, round: GhostRound, clientSentAt: number | null): Promise<void> {
    const [history, controls, bet] = await Promise.all([
      this.history(),
      getUserControls(this.env, userId),
      this.readBet(round.roundId, userId),
    ]);
    safeGhostSend(socket, {
      type: 'ghost-sync',
      clientSentAt,
      state: ghostPublicState(round, history, Date.now()),
      bet: publicGhostBet(bet),
      tonBalanceNano: controls.tonBalanceNano,
    });
  }

  private async placeBet(round: GhostRound, userId: string, amountInput: unknown, autoInput: unknown): Promise<{ state: GhostPublicState; bet: ReturnType<typeof publicGhostBet>; tonBalanceNano: number }> {
    if (round.phase !== 'betting' || Date.now() >= round.runningStartedAt) throw new Error('Betting is closed for this round.');
    const amountNano = normalizeGhostBetAmount(amountInput);
    const autoCashout = normalizeAutoCashout(autoInput);

    const controls = await getUserControls(this.env, userId);
    if (controls.banned) throw new Error('Your access to games is blocked.');
    if (controls.blockedSections.includes('ghostrun')) throw new Error('Ghost Run is blocked for this account.');
    if (!isMiniAppAdmin(this.env, userId)) {
      const locks = await getSectionAccess(this.env);
      if (locks.some((lock) => lock.sectionId === 'ghostrun')) throw new Error('Ghost Run is temporarily locked.');
    }

    await this.ensureTables();
    const existing = await this.readBet(round.roundId, userId);
    if (existing) {
      const history = await this.history();
      const latestControls = await getUserControls(this.env, userId);
      return { state: ghostPublicState(round, history, Date.now()), bet: publicGhostBet(existing), tonBalanceNano: latestControls.tonBalanceNano };
    }

    await this.env.DB.prepare(`INSERT INTO app_users (telegram_user_id, current_section, ton_balance_nano, last_seen_at, updated_at)
      VALUES (?, 'ghostrun', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO NOTHING`).bind(userId).run();

    const betTxnId = ghostTransactionId('bet', round.roundId, userId);
    const metadata = JSON.stringify({ section: 'ghostrun', action: 'bet', roundId: round.roundId });
    await this.env.DB.batch([
      this.env.DB.prepare(`INSERT INTO ghost_run_bets
        (round_id, user_id, amount_nano, auto_cashout, status, debited, credited, payout_nano, cashout_multiplier, created_at, updated_at)
        SELECT ?, ?, ?, ?, 'placed', 0, 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM app_users
        WHERE telegram_user_id = ? AND ton_balance_nano >= ?
        ON CONFLICT(round_id, user_id) DO NOTHING`)
        .bind(round.roundId, userId, amountNano, autoCashout, userId, amountNano),
      this.env.DB.prepare(`UPDATE app_users
        SET ton_balance_nano = ton_balance_nano - ?, current_section = 'ghostrun', updated_at = CURRENT_TIMESTAMP
        WHERE telegram_user_id = ?
          AND EXISTS (
            SELECT 1 FROM ghost_run_bets
            WHERE round_id = ? AND user_id = ? AND debited = 0
          )`).bind(amountNano, userId, round.roundId, userId),
      this.env.DB.prepare(`UPDATE ghost_run_bets
        SET debited = 1, updated_at = CURRENT_TIMESTAMP
        WHERE round_id = ? AND user_id = ? AND debited = 0`).bind(round.roundId, userId),
      this.env.DB.prepare(`INSERT OR IGNORE INTO ton_transactions
        (id, user_id, kind, title, description, amount_nano, balance_after_nano, status, reference_id, reference_type, metadata_json, created_at)
        SELECT ?, b.user_id, 'game', 'Ghost Run bet', NULL, -b.amount_nano, u.ton_balance_nano, 'completed',
               CAST(b.round_id AS TEXT), 'ghost_run', ?, CURRENT_TIMESTAMP
        FROM ghost_run_bets b
        JOIN app_users u ON u.telegram_user_id = b.user_id
        WHERE b.round_id = ? AND b.user_id = ? AND b.debited = 1`)
        .bind(betTxnId, metadata, round.roundId, userId),
    ]);

    const bet = await this.readBet(round.roundId, userId);
    if (!bet || bet.debited !== 1) throw new Error('Not enough TON balance.');

    if (!round.hasBets) {
      round.hasBets = true;
      await this.state.storage.put(GHOST_ROUND_KEY, round);
    }

    const [history, latestControls] = await Promise.all([this.history(), getUserControls(this.env, userId)]);
    return { state: ghostPublicState(round, history, Date.now()), bet: publicGhostBet(bet), tonBalanceNano: latestControls.tonBalanceNano };
  }

  private async cashOut(round: GhostRound, userId: string): Promise<{ state: GhostPublicState; bet: ReturnType<typeof publicGhostBet>; tonBalanceNano: number }> {
    await this.ensureTables();
    let bet = await this.readBet(round.roundId, userId);
    if (!bet) throw new Error('No active bet for this round.');

    if (bet.status === 'cashed') {
      const [history, controls] = await Promise.all([this.history(), getUserControls(this.env, userId)]);
      return { state: ghostPublicState(round, history, Date.now()), bet: publicGhostBet(bet), tonBalanceNano: controls.tonBalanceNano };
    }
    if (bet.status === 'lost') throw new Error('This round has already crashed.');

    const now = Date.now();
    let cashoutMultiplier = 0;
    if (round.phase === 'running' && now < round.crashAt) {
      const liveMultiplier = ghostDisplayMultiplier(round, now);
      cashoutMultiplier = bet.auto_cashout >= 1.01 && liveMultiplier >= bet.auto_cashout ? bet.auto_cashout : liveMultiplier;
    } else if (round.phase === 'ended' && bet.auto_cashout >= 1.01 && bet.auto_cashout < round.crashPoint) {
      cashoutMultiplier = bet.auto_cashout;
    } else {
      throw new Error('Cash out is no longer available.');
    }

    cashoutMultiplier = Math.max(1, floorGhostMultiplier(cashoutMultiplier));
    const payoutNano = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(bet.amount_nano * cashoutMultiplier));
    const payoutTxnId = ghostTransactionId('payout', round.roundId, userId);
    const metadata = JSON.stringify({ section: 'ghostrun', action: 'cashout', roundId: round.roundId, multiplier: cashoutMultiplier });

    await this.env.DB.batch([
      this.env.DB.prepare(`UPDATE ghost_run_bets
        SET status = 'cashed', payout_nano = ?, cashout_multiplier = ?, updated_at = CURRENT_TIMESTAMP
        WHERE round_id = ? AND user_id = ? AND status = 'placed' AND debited = 1 AND credited = 0`)
        .bind(payoutNano, cashoutMultiplier, round.roundId, userId),
      this.env.DB.prepare(`UPDATE app_users
        SET ton_balance_nano = ton_balance_nano + ?, updated_at = CURRENT_TIMESTAMP
        WHERE telegram_user_id = ?
          AND EXISTS (
            SELECT 1 FROM ghost_run_bets
            WHERE round_id = ? AND user_id = ? AND status = 'cashed' AND credited = 0
          )`).bind(payoutNano, userId, round.roundId, userId),
      this.env.DB.prepare(`UPDATE ghost_run_bets
        SET credited = 1, updated_at = CURRENT_TIMESTAMP
        WHERE round_id = ? AND user_id = ? AND status = 'cashed' AND credited = 0`)
        .bind(round.roundId, userId),
      this.env.DB.prepare(`INSERT OR IGNORE INTO ton_transactions
        (id, user_id, kind, title, description, amount_nano, balance_after_nano, status, reference_id, reference_type, metadata_json, created_at)
        SELECT ?, b.user_id, 'game', 'Ghost Run cash out', NULL, b.payout_nano, u.ton_balance_nano, 'completed',
               CAST(b.round_id AS TEXT), 'ghost_run', ?, CURRENT_TIMESTAMP
        FROM ghost_run_bets b
        JOIN app_users u ON u.telegram_user_id = b.user_id
        WHERE b.round_id = ? AND b.user_id = ? AND b.status = 'cashed' AND b.credited = 1`)
        .bind(payoutTxnId, metadata, round.roundId, userId),
    ]);

    bet = await this.readBet(round.roundId, userId);
    if (!bet || bet.status !== 'cashed' || bet.credited !== 1) throw new Error('Cash out could not be completed.');
    const [history, controls] = await Promise.all([this.history(), getUserControls(this.env, userId)]);
    return { state: ghostPublicState(round, history, Date.now()), bet: publicGhostBet(bet), tonBalanceNano: controls.tonBalanceNano };
  }

  private async advance(now: number): Promise<GhostRound> {
    let round = await this.state.storage.get<GhostRound>(GHOST_ROUND_KEY).catch(() => null);
    if (!round) round = await this.createRound(now);

    for (let step = 0; step < 4; step += 1) {
      if (round.phase === 'betting' && now >= round.runningStartedAt) {
        round = { ...round, phase: 'running' };
        await this.state.storage.put(GHOST_ROUND_KEY, round);
        await this.publishState(round, now);
        continue;
      }

      if (round.phase === 'running' && now >= round.crashAt) {
        if (round.hasBets) await this.settleRoundAtCrash(round);
        round = { ...round, phase: 'ended' };
        await this.state.storage.put(GHOST_ROUND_KEY, round);
        await this.pushHistory(round.crashPoint);
        await this.publishState(round, now);
        continue;
      }

      if (round.phase === 'ended' && now >= round.nextRoundAt) {
        const startAt = now - round.nextRoundAt > 60_000 ? now : round.nextRoundAt;
        round = await this.createRound(startAt);
        await this.publishState(round, now);
        continue;
      }

      break;
    }

    await this.scheduleAlarm(round, now);
    return round;
  }

  private async createRound(startAt: number): Promise<GhostRound> {
    const previous = Number(await this.state.storage.get<number>(GHOST_ROUND_SEQUENCE_KEY).catch(() => 0)) || 0;
    const roundId = previous + 1;
    const crashPoint = secureGhostCrashPoint();
    const runningStartedAt = startAt + GHOST_BETTING_MS;
    const crashAt = runningStartedAt + ghostCrashTimeMs(crashPoint);
    const round: GhostRound = {
      roundId,
      phase: 'betting',
      bettingStartedAt: startAt,
      runningStartedAt,
      crashAt,
      nextRoundAt: crashAt + GHOST_RESTART_MS,
      crashPoint,
      hasBets: false,
    };
    await this.state.storage.put(GHOST_ROUND_SEQUENCE_KEY, roundId);
    await this.state.storage.put(GHOST_ROUND_KEY, round);
    return round;
  }

  private async settleRoundAtCrash(round: GhostRound): Promise<void> {
    await this.ensureTables();
    const payoutMetadata = JSON.stringify({ section: 'ghostrun', action: 'auto_cashout', roundId: round.roundId });
    await this.env.DB.batch([
      this.env.DB.prepare(`UPDATE app_users
        SET ton_balance_nano = ton_balance_nano + COALESCE((
          SELECT CAST(b.amount_nano * b.auto_cashout AS INTEGER)
          FROM ghost_run_bets b
          WHERE b.round_id = ? AND b.user_id = app_users.telegram_user_id
            AND b.status = 'placed' AND b.debited = 1 AND b.credited = 0
            AND b.auto_cashout >= 1.01 AND b.auto_cashout < ?
        ), 0), updated_at = CURRENT_TIMESTAMP
        WHERE telegram_user_id IN (
          SELECT user_id FROM ghost_run_bets
          WHERE round_id = ? AND status = 'placed' AND debited = 1 AND credited = 0
            AND auto_cashout >= 1.01 AND auto_cashout < ?
        )`).bind(round.roundId, round.crashPoint, round.roundId, round.crashPoint),
      this.env.DB.prepare(`UPDATE ghost_run_bets
        SET status = 'cashed',
            payout_nano = CAST(amount_nano * auto_cashout AS INTEGER),
            cashout_multiplier = auto_cashout,
            credited = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE round_id = ? AND status = 'placed' AND debited = 1 AND credited = 0
          AND auto_cashout >= 1.01 AND auto_cashout < ?`)
        .bind(round.roundId, round.crashPoint),
      this.env.DB.prepare(`INSERT OR IGNORE INTO ton_transactions
        (id, user_id, kind, title, description, amount_nano, balance_after_nano, status, reference_id, reference_type, metadata_json, created_at)
        SELECT 'ghostpayout_' || b.round_id || '_' || b.user_id, b.user_id, 'game', 'Ghost Run auto cash out', NULL,
               b.payout_nano, u.ton_balance_nano, 'completed', CAST(b.round_id AS TEXT), 'ghost_run', ?, CURRENT_TIMESTAMP
        FROM ghost_run_bets b
        JOIN app_users u ON u.telegram_user_id = b.user_id
        WHERE b.round_id = ? AND b.status = 'cashed' AND b.credited = 1`)
        .bind(payoutMetadata, round.roundId),
      this.env.DB.prepare(`UPDATE ghost_run_bets
        SET status = 'lost', updated_at = CURRENT_TIMESTAMP
        WHERE round_id = ? AND status = 'placed'`).bind(round.roundId),
    ]);
  }

  private async publishState(round: GhostRound, now: number): Promise<void> {
    const history = await this.history();
    const payload = { type: 'ghost-state', state: ghostPublicState(round, history, now) };
    for (const socket of this.sockets.keys()) safeGhostSend(socket, payload);
  }

  private async scheduleAlarm(round: GhostRound, now: number): Promise<void> {
    const next = round.phase === 'betting' ? round.runningStartedAt : round.phase === 'running' ? round.crashAt : round.nextRoundAt;
    await this.state.storage.setAlarm(Math.max(now + 25, next + 10)).catch(() => undefined);
  }

  private async history(): Promise<number[]> {
    const saved = await this.state.storage.get<number[]>(GHOST_HISTORY_KEY).catch(() => null);
    return Array.isArray(saved) ? saved.filter((value) => Number.isFinite(value)).slice(0, GHOST_HISTORY_LIMIT) : [];
  }

  private async pushHistory(multiplier: number): Promise<void> {
    const history = await this.history();
    const next = [floorGhostMultiplier(multiplier), ...history].slice(0, GHOST_HISTORY_LIMIT);
    await this.state.storage.put(GHOST_HISTORY_KEY, next);
  }

  private async readBet(roundId: number, userId: string): Promise<GhostBetRow | null> {
    return this.env.DB.prepare(`SELECT round_id, user_id, amount_nano, auto_cashout, status, debited, credited, payout_nano, cashout_multiplier
      FROM ghost_run_bets WHERE round_id = ? AND user_id = ?`)
      .bind(roundId, userId)
      .first<GhostBetRow>()
      .catch(() => null);
  }

  private async ensureTables(): Promise<void> {
    if (!this.tablesReady) {
      this.tablesReady = (async () => {
        await ensureTonBalanceColumn(this.env);
        await ensureTonTransactionsTable(this.env);
        await this.env.DB.prepare(`CREATE TABLE IF NOT EXISTS ghost_run_bets (
          round_id INTEGER NOT NULL,
          user_id TEXT NOT NULL,
          amount_nano INTEGER NOT NULL,
          auto_cashout REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'placed',
          debited INTEGER NOT NULL DEFAULT 0,
          credited INTEGER NOT NULL DEFAULT 0,
          payout_nano INTEGER NOT NULL DEFAULT 0,
          cashout_multiplier REAL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (round_id, user_id)
        )`).run();
        await this.env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_ghost_run_bets_user_round ON ghost_run_bets(user_id, round_id)').run();
      })().catch((error) => {
        this.tablesReady = null;
        throw error;
      });
    }
    await this.tablesReady;
  }
}

function ghostPublicState(round: GhostRound, history: number[], now: number): GhostPublicState {
  return {
    roundId: round.roundId,
    phase: round.phase,
    serverNow: now,
    bettingStartedAt: round.bettingStartedAt,
    runningStartedAt: round.runningStartedAt,
    nextRoundAt: round.nextRoundAt,
    bettingMs: GHOST_BETTING_MS,
    restartMs: GHOST_RESTART_MS,
    multiplier: round.phase === 'running' ? ghostDisplayMultiplier(round, now) : round.phase === 'ended' ? floorGhostMultiplier(round.crashPoint) : 1,
    crashMultiplier: round.phase === 'ended' ? floorGhostMultiplier(round.crashPoint) : null,
    history,
  };
}

function publicGhostBet(bet: GhostBetRow | null): null | {
  roundId: number;
  amountNano: number;
  autoCashout: number;
  status: string;
  payoutNano: number;
  cashoutMultiplier: number | null;
} {
  if (!bet) return null;
  return {
    roundId: Number(bet.round_id),
    amountNano: Number(bet.amount_nano),
    autoCashout: Number(bet.auto_cashout || 0),
    status: String(bet.status || 'placed'),
    payoutNano: Number(bet.payout_nano || 0),
    cashoutMultiplier: bet.cashout_multiplier == null ? null : Number(bet.cashout_multiplier),
  };
}

function normalizeGhostBetAmount(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isSafeInteger(amount) || amount < GHOST_MIN_BET_NANO || amount > GHOST_MAX_BET_NANO) throw new Error('Invalid bet amount.');
  return amount;
}

function normalizeAutoCashout(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1.01) return 0;
  return Math.min(100, Math.floor(n * 100) / 100);
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

function ghostDisplayMultiplier(round: GhostRound, now: number): number {
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

function cleanGhostUserId(value: unknown): string {
  return String(value || '').replace(/[^0-9]/g, '').slice(0, 32);
}

function ghostTransactionId(kind: 'bet' | 'payout', roundId: number, userId: string): string {
  return `ghost${kind}_${roundId}_${userId}`;
}

function safeGhostSend(socket: WebSocket, payload: unknown): void {
  try { socket.send(JSON.stringify(payload)); } catch {}
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
    if (url.pathname === '/app/api/ghost-run/live') {
      if (request.method !== 'GET' || request.headers.get('Upgrade') !== 'websocket') {
        return Response.json({ error: 'Expected websocket.' }, { status: 426, headers: { 'cache-control': 'no-store' } });
      }
      try {
        const userId = await validateTelegramInitData(url.searchParams.get('initData') || '', gameBotToken(runtimeEnv));
        const headers = new Headers(request.headers);
        headers.set('x-ghost-user-id', userId);
        const id = runtimeEnv.GHOST_RUN_LIVE.idFromName(GHOST_ROOM_NAME);
        return runtimeEnv.GHOST_RUN_LIVE.get(id).fetch(new Request('https://ghost-run-live/connect', { headers }));
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

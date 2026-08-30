import app from './index';
import type { Env } from './types';
import { getCrashVirtualUsers, type CrashVirtualUser } from './crash-virtual-users-config';
import { applyGameTonBalanceDelta, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';
import { addUserXp, getUserLevel } from './levels';
import { gameBotToken, validateTelegramInitData } from './utils';

const CACHE_NONE = 'no-store';
const NANO = 1_000_000_000;
const MIN_BET_NANO = 10_000_000;
const BETTING_MS = 8_000;
const CRASH_HOLD_MS = 2_200;
const MAX_MULTIPLIER = 50;
const MULTIPLIER_RATE = 0.112;
const STALE_ROUND_MS = 60_000;
let crashSchemaReady = false;

type CrashPhase = 'betting' | 'running' | 'ended';
type CrashRound = {
  round_id: number;
  betting_started_ms: number;
  running_started_ms: number;
  crash_at_ms: number;
  next_round_at_ms: number;
  crash_point: number;
  settled: number;
};
type CrashPublicState = {
  id: number;
  phase: CrashPhase;
  serverNow: number;
  bettingStartedAt: number;
  runningStartedAt: number;
  bettingMs: number;
  crashHoldMs: number;
  current: number;
  crashMultiplier: number | null;
  running: boolean;
  waiting: boolean;
  inCrashHold: boolean;
  history: number[];
};
type Row = {
  round_id: number;
  user_id: string;
  username: string;
  amount_nano: number;
  status: string;
  cashout_multiplier: number | null;
  payout_nano: number;
  is_virtual?: number;
  target_cashout_multiplier?: number | null;
  virtual_reveal_at_ms?: number;
  virtual_order?: number;
  created_at: string;
  updated_at: string;
};

type VirtualJson = ReturnType<typeof virtualBetJson>;

app.get('/app/api/crash-live/events', async (c) => {
  try {
    await validateTelegramInitData(c.req.query('initData') || '', gameBotToken(c.env));
    return crashEventStream(c.req.raw, c.env);
  } catch (error) {
    return crashError(error);
  }
});

app.get('/app/api/crash-live', async (c) => {
  try {
    await validateTelegramInitData(c.req.query('initData') || '', gameBotToken(c.env));
    return liveBetsResponse(new URL(c.req.url), c.env);
  } catch (error) {
    return crashError(error);
  }
});

app.post('/app/api/crash-live/bet', async (c) => {
  try {
    return await placeBet(c.req.raw, c.env);
  } catch (error) {
    return crashError(error);
  }
});

app.post('/app/api/crash-live/cashout', async (c) => {
  try {
    return await cashOut(c.req.raw, c.env);
  } catch (error) {
    return crashError(error);
  }
});

function crashError(error: unknown): Response {
  return Response.json(
    { ok: false, error: error instanceof Error ? error.message : 'Crash request failed' },
    { status: 400, headers: { 'cache-control': CACHE_NONE } },
  );
}

function crashEventStream(request: Request, env: Env): Response {
  const encoder = new TextEncoder();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (state: CrashPublicState) => {
        if (cancelled) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
      };
      const pump = async () => {
        try {
          while (!cancelled) {
            const now = Date.now();
            const round = await ensureCurrentRound(env, now);
            const state = await publicState(env, round, now);
            send(state);
            const delay = Math.max(40, (await nextServerEventAt(env, round, now)) - Date.now() + 12);
            await sleep(delay);
          }
        } catch (error) {
          console.warn('crash event stream failed', error);
        } finally {
          if (!cancelled) {
            try { controller.close(); } catch {}
          }
        }
      };
      void pump();
    },
    cancel() {
      cancelled = true;
    },
  });

  request.signal.addEventListener('abort', () => { cancelled = true; }, { once: true });
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store, no-transform',
      'x-accel-buffering': 'no',
      'connection': 'keep-alive',
    },
  });
}

async function liveBetsResponse(url: URL, env: Env): Promise<Response> {
  const now = Date.now();
  const currentRound = await ensureCurrentRound(env, now);
  const requested = Number(url.searchParams.get('roundId'));
  const round = Number.isSafeInteger(requested) && requested > 0
    ? await readRound(env.DB, requested) || currentRound
    : currentRound;
  const state = await publicState(env, round, now);
  const [realRows, virtualUsers] = await Promise.all([
    readRealLiveRows(env.DB, round.round_id),
    getCrashVirtualUsers(env).then((config) => config.users).catch(() => [] as CrashVirtualUser[]),
  ]);
  const virtualRows = virtualUsers.map((user, index) => buildVirtualBet(user, index, round, state));
  const bets = [...realRows.map(realBetJson), ...virtualRows]
    .sort((a, b) => Number(b.amountNano || 0) - Number(a.amountNano || 0) || Number(a.virtualOrder || 0) - Number(b.virtualOrder || 0))
    .slice(0, 120);
  return Response.json({ ok: true, roundId: round.round_id, state, bets }, { headers: { 'cache-control': CACHE_NONE } });
}

async function placeBet(request: Request, env: Env): Promise<Response> {
  const receivedAt = Date.now();
  await ensureCrashSchema(env.DB);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const userId = String(await validateTelegramInitData(body.initData, gameBotToken(env)));
  const roundId = cleanRoundId(body.roundId);
  const existing = await env.DB.prepare(
    'SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0',
  ).bind(roundId, userId).first<Row>();
  if (existing) {
    const [controls, level] = await Promise.all([getUserControls(env, userId), getUserLevel(env, userId)]);
    return Response.json({ ok: true, roundId, duplicate: true, tonBalanceNano: controls.tonBalanceNano, level }, { headers: { 'cache-control': CACHE_NONE } });
  }

  const round = await ensureCurrentRound(env, receivedAt);
  if (phaseOf(round, receivedAt) !== 'betting' || roundId !== round.round_id) throw new Error('Betting is closed for this round');
  const username = cleanName(body.username, userId);
  const amountNano = cleanAmount(body.amountNano);
  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO crash_live_bets(round_id,user_id,username,amount_nano,status,cashout_multiplier,payout_nano,is_virtual,created_at,updated_at) VALUES(?,?,?,?, 'bet', NULL, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
  ).bind(roundId, userId, username, amountNano).run();
  if ((inserted.meta?.changes || 0) <= 0) {
    const [controls, level] = await Promise.all([getUserControls(env, userId), getUserLevel(env, userId)]);
    return Response.json({ ok: true, roundId, duplicate: true, tonBalanceNano: controls.tonBalanceNano, level }, { headers: { 'cache-control': CACHE_NONE } });
  }

  try {
    const controls = await debitUserTonBalanceIfEnough(env, userId, amountNano, {
      kind: 'game',
      title: 'Crash bet',
      roundId: String(roundId),
      referenceType: 'crash',
      referenceId: `crash:${roundId}:${userId}`,
      metadata: { section: 'crash' },
    });
    const xp = await addUserXp(env, userId, 2, 'game-start', { section: 'crash', event: 'place-bet', roundId }, `crash_bet_${roundId}_${userId}`);
    return Response.json({ ok: true, roundId, tonBalanceNano: controls.tonBalanceNano, level: xp.profile }, { headers: { 'cache-control': CACHE_NONE } });
  } catch (error) {
    await env.DB.prepare(
      "DELETE FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0 AND status='bet'",
    ).bind(roundId, userId).run().catch(() => undefined);
    const controls = await getUserControls(env, userId).catch(() => null);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Bet failed', tonBalanceNano: controls?.tonBalanceNano },
      { status: 400, headers: { 'cache-control': CACHE_NONE } },
    );
  }
}

async function cashOut(request: Request, env: Env): Promise<Response> {
  const receivedAt = Date.now();
  await ensureCrashSchema(env.DB);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const userId = String(await validateTelegramInitData(body.initData, gameBotToken(env)));
  const roundId = cleanRoundId(body.roundId);
  await ensureCurrentRound(env, receivedAt);

  const row = await env.DB.prepare(
    'SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0',
  ).bind(roundId, userId).first<Row>();
  if (!row) return Response.json({ ok: false, error: 'Bet not found' }, { status: 404, headers: { 'cache-control': CACHE_NONE } });
  if (row.status === 'cashout') {
    const [controls, level] = await Promise.all([getUserControls(env, userId), getUserLevel(env, userId)]);
    const payout = Math.max(0, Math.floor(Number(row.payout_nano) || 0));
    return Response.json({
      ok: true,
      roundId,
      duplicate: true,
      multiplier: Number(row.cashout_multiplier || 1),
      payoutNano: payout,
      payoutTon: ton(payout),
      tonBalanceNano: controls.tonBalanceNano,
      level,
    }, { headers: { 'cache-control': CACHE_NONE } });
  }
  if (row.status !== 'bet') return Response.json({ ok: false, error: 'Bet is already settled' }, { status: 409, headers: { 'cache-control': CACHE_NONE } });

  const round = await readRound(env.DB, roundId);
  if (!round || phaseOf(round, receivedAt) !== 'running' || receivedAt >= round.crash_at_ms) {
    return Response.json({ ok: false, error: 'Round already crashed' }, { status: 409, headers: { 'cache-control': CACHE_NONE } });
  }

  const multiplier = multiplierAt(round, receivedAt);
  const payout = Math.max(0, Math.floor(Number(row.amount_nano || 0) * multiplier));
  const updated = await env.DB.prepare(
    "UPDATE crash_live_bets SET status='cashout', cashout_multiplier=?, payout_nano=?, updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND is_virtual=0 AND status='bet'",
  ).bind(multiplier, payout, roundId, userId).run();
  if ((updated.meta?.changes || 0) <= 0) {
    const fresh = await env.DB.prepare(
      'SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0',
    ).bind(roundId, userId).first<Row>();
    if (fresh?.status === 'cashout') {
      const [controls, level] = await Promise.all([getUserControls(env, userId), getUserLevel(env, userId)]);
      const savedPayout = Math.max(0, Math.floor(Number(fresh.payout_nano) || 0));
      return Response.json({
        ok: true,
        roundId,
        duplicate: true,
        multiplier: Number(fresh.cashout_multiplier || 1),
        payoutNano: savedPayout,
        payoutTon: ton(savedPayout),
        tonBalanceNano: controls.tonBalanceNano,
        level,
      }, { headers: { 'cache-control': CACHE_NONE } });
    }
    return Response.json({ ok: false, error: 'Cashout was too late' }, { status: 409, headers: { 'cache-control': CACHE_NONE } });
  }

  try {
    const controls = await applyGameTonBalanceDelta(env, userId, payout, {
      kind: 'game',
      title: 'Crash cashout',
      roundId: String(roundId),
      referenceType: 'crash',
      referenceId: `crash:${roundId}:${userId}:cashout`,
      metadata: { section: 'crash', multiplier },
    });
    const xpAmount = multiplier >= 5 ? 70 : multiplier >= 2 ? 30 : 15;
    const xp = await addUserXp(
      env,
      userId,
      xpAmount,
      'game-win',
      { section: 'crash', event: 'cashout', roundId, multiplier, payoutNano: payout },
      `crash_cashout_${roundId}_${userId}`,
    );
    return Response.json({
      ok: true,
      roundId,
      multiplier,
      payoutNano: payout,
      payoutTon: ton(payout),
      tonBalanceNano: controls.tonBalanceNano,
      level: xp.profile,
    }, { headers: { 'cache-control': CACHE_NONE } });
  } catch (error) {
    await env.DB.prepare(
      "UPDATE crash_live_bets SET status='bet', cashout_multiplier=NULL, payout_nano=0, updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND is_virtual=0 AND status='cashout'",
    ).bind(roundId, userId).run().catch(() => undefined);
    const controls = await getUserControls(env, userId).catch(() => null);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Cashout failed', tonBalanceNano: controls?.tonBalanceNano },
      { status: 500, headers: { 'cache-control': CACHE_NONE } },
    );
  }
}

async function ensureCurrentRound(env: Env, now: number): Promise<CrashRound> {
  await ensureCrashSchema(env.DB);
  let round = await latestRound(env.DB);
  if (!round) round = await createRound(env.DB, 1, now);

  for (let step = 0; step < 6; step += 1) {
    if (now >= round.crash_at_ms) await settleCrashedRound(env, round);
    if (now < round.next_round_at_ms) return round;
    const stale = now - round.next_round_at_ms > STALE_ROUND_MS;
    const startAt = stale ? now : round.next_round_at_ms;
    round = await createRound(env.DB, round.round_id + 1, startAt);
  }

  const fresh = await latestRound(env.DB);
  if (!fresh) throw new Error('Crash round is not ready');
  return fresh;
}

async function createRound(db: D1Database, roundId: number, bettingStartedAt: number): Promise<CrashRound> {
  const crashPoint = secureCrashPoint();
  const runningStartedAt = Math.floor(bettingStartedAt + BETTING_MS);
  const crashAt = runningStartedAt + crashTimeMs(crashPoint);
  const nextRoundAt = crashAt + CRASH_HOLD_MS;
  await db.prepare(
    'INSERT OR IGNORE INTO crash_rounds(round_id,betting_started_ms,running_started_ms,crash_at_ms,next_round_at_ms,crash_point,settled) VALUES(?,?,?,?,?,?,0)',
  ).bind(roundId, bettingStartedAt, runningStartedAt, crashAt, nextRoundAt, crashPoint).run();
  const saved = await readRound(db, roundId);
  if (!saved) throw new Error('Could not create Crash round');
  return saved;
}

async function settleCrashedRound(env: Env, round: CrashRound): Promise<void> {
  if (round.settled) return;
  const pending = await env.DB.prepare(
    "SELECT user_id FROM crash_live_bets WHERE round_id=? AND status='bet' AND is_virtual=0",
  ).bind(round.round_id).all<{ user_id: string }>().catch(() => ({ results: [] as { user_id: string }[] }));
  await env.DB.prepare(
    "UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND status='bet' AND is_virtual=0",
  ).bind(round.round_id).run().catch(() => undefined);
  await Promise.all((pending.results || []).map((item) => addUserXp(
    env,
    String(item.user_id),
    5,
    'game-lose',
    { section: 'crash', event: 'crash', roundId: round.round_id },
    `crash_loss_${round.round_id}_${item.user_id}`,
  ).catch(() => undefined)));
  await env.DB.prepare('UPDATE crash_rounds SET settled=1 WHERE round_id=? AND settled=0').bind(round.round_id).run().catch(() => undefined);
  round.settled = 1;
}

async function publicState(env: Env, round: CrashRound, now: number): Promise<CrashPublicState> {
  const phase = phaseOf(round, now);
  const crashMultiplier = phase === 'ended' ? floor2(round.crash_point) : null;
  const historyRows = await env.DB.prepare(
    'SELECT crash_point FROM crash_rounds WHERE crash_at_ms<=? ORDER BY round_id DESC LIMIT 12',
  ).bind(now).all<{ crash_point: number }>().catch(() => ({ results: [] as { crash_point: number }[] }));
  return {
    id: round.round_id,
    phase,
    serverNow: now,
    bettingStartedAt: round.betting_started_ms,
    runningStartedAt: round.running_started_ms,
    bettingMs: BETTING_MS,
    crashHoldMs: CRASH_HOLD_MS,
    current: phase === 'running' ? multiplierAt(round, now) : phase === 'ended' ? floor2(round.crash_point) : 1,
    crashMultiplier,
    running: phase === 'running',
    waiting: phase !== 'running',
    inCrashHold: phase === 'ended',
    history: (historyRows.results || []).map((item) => floor2(item.crash_point)),
  };
}

function phaseOf(round: CrashRound, now: number): CrashPhase {
  if (now < round.running_started_ms) return 'betting';
  if (now < round.crash_at_ms) return 'running';
  return 'ended';
}

async function nextServerEventAt(env: Env, round: CrashRound, now: number): Promise<number> {
  const boundary = nextBoundaryAt(round, now);
  if (phaseOf(round, now) !== 'running') return boundary;
  const current = multiplierAt(round, now);
  const config = await getCrashVirtualUsers(env).catch(() => ({ users: [] as CrashVirtualUser[] }));
  let next = boundary;
  for (let index = 0; index < config.users.length; index += 1) {
    const target = virtualTargetForUser(config.users[index], index, round.round_id);
    if (target <= current || target >= round.crash_point) continue;
    const targetAt = round.running_started_ms + crashTimeMs(target);
    if (targetAt > now && targetAt < next) next = targetAt;
  }
  return next;
}

function nextBoundaryAt(round: CrashRound, now: number): number {
  const phase = phaseOf(round, now);
  return phase === 'betting' ? round.running_started_ms : phase === 'running' ? round.crash_at_ms : round.next_round_at_ms;
}

function multiplierAt(round: CrashRound, now: number): number {
  if (now <= round.running_started_ms) return 1;
  if (now >= round.crash_at_ms) return floor2(round.crash_point);
  const seconds = Math.max(0, (now - round.running_started_ms) / 1000);
  return floor2(Math.min(round.crash_point, Math.exp(MULTIPLIER_RATE * seconds)));
}

function crashTimeMs(crashPoint: number): number {
  if (crashPoint <= 1) return 0;
  return Math.max(1, Math.ceil((Math.log(crashPoint) / MULTIPLIER_RATE) * 1000));
}

function secureCrashPoint(): number {
  const band = secureRandomUnit();
  const position = secureRandomUnit();
  if (band < 0.0005) return 50;
  if (band < 0.01) return sampleBand(20, 49.99, position);
  if (band < 0.04) return sampleBand(10, 19.99, position);
  if (band < 0.11) return sampleBand(5, 9.99, position);
  if (band < 0.22) return sampleBand(3, 4.99, position);
  if (band < 0.40) return sampleBand(2, 2.99, position);
  if (band < 0.62) return sampleBand(1.5, 1.99, position);
  return sampleBand(1, 1.49, position);
}

function sampleBand(min: number, max: number, unit: number): number {
  const shaped = Math.pow(Math.max(0, Math.min(1, unit)), 1.35);
  return floor2(min + (max - min) * shaped);
}

function secureRandomUnit(): number {
  const values = new Uint32Array(2);
  crypto.getRandomValues(values);
  return (values[0] * 2_097_152 + (values[1] >>> 11)) / 9_007_199_254_740_992;
}

function virtualTargetForUser(user: CrashVirtualUser, index: number, roundId: number): number {
  const options = Array.isArray(user.bets) ? user.bets : [];
  const option = options.length ? options[displayChoice(roundId, index, options.length)] : { amount: 1, cashoutMultiplier: 1.5 };
  return Math.max(1.01, Math.min(MAX_MULTIPLIER, floor2(Number(option.cashoutMultiplier || 1.5))));
}

function buildVirtualBet(user: CrashVirtualUser, index: number, round: CrashRound, state: CrashPublicState): VirtualJson {
  const options = Array.isArray(user.bets) ? user.bets : [];
  const option = options.length ? options[displayChoice(round.round_id, index, options.length)] : { amount: 1, cashoutMultiplier: 1.5 };
  const amountNano = Math.max(1, Math.floor(Number(option.amount || 1) * NANO));
  const target = virtualTargetForUser(user, index, round.round_id);
  const revealAt = Math.min(round.running_started_ms, round.betting_started_ms + Math.max(0, Math.min(8, Number(user.betSecond) || 0)) * 1000);
  let status = 'bet';
  let cashoutMultiplier: number | null = null;
  if (state.phase === 'running' && target <= state.current) {
    status = 'cashout';
    cashoutMultiplier = target;
  } else if (state.phase === 'ended') {
    if (target < Number(state.crashMultiplier || 1)) {
      status = 'cashout';
      cashoutMultiplier = target;
    } else {
      status = 'crashed';
    }
  }
  return virtualBetJson(round.round_id, index, user.name, amountNano, target, revealAt, status, cashoutMultiplier);
}

function virtualBetJson(roundId: number, index: number, username: string, amountNano: number, target: number, revealAt: number, status: string, cashoutMultiplier: number | null) {
  const payoutNano = cashoutMultiplier ? Math.max(0, Math.floor(amountNano * cashoutMultiplier)) : 0;
  return {
    roundId,
    userId: `virtual_${roundId}_${index}`,
    user: cleanName(username, `Player ${index + 1}`),
    amountNano,
    amountTon: ton(amountNano),
    status,
    cashoutMultiplier,
    targetCashoutMultiplier: target,
    payoutNano,
    payoutTon: ton(payoutNano),
    isVirtual: true,
    virtualRevealAtMs: Math.floor(revealAt),
    virtualOrder: index + 1,
    createdAt: new Date(revealAt).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function realBetJson(row: Row) {
  return {
    roundId: Number(row.round_id),
    userId: row.user_id,
    user: row.username,
    amountNano: Number(row.amount_nano || 0),
    amountTon: ton(row.amount_nano),
    status: row.status,
    cashoutMultiplier: row.cashout_multiplier == null ? null : Number(row.cashout_multiplier),
    targetCashoutMultiplier: null,
    payoutNano: Number(row.payout_nano || 0),
    payoutTon: ton(row.payout_nano),
    isVirtual: false,
    virtualRevealAtMs: 0,
    virtualOrder: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function readRealLiveRows(db: D1Database, roundId: number): Promise<Row[]> {
  const rows = await db.prepare(
    'SELECT * FROM crash_live_bets WHERE round_id=? AND is_virtual=0 ORDER BY amount_nano DESC, datetime(created_at) ASC LIMIT 120',
  ).bind(roundId).all<Row>().catch(() => ({ results: [] as Row[] }));
  return rows.results || [];
}

async function latestRound(db: D1Database): Promise<CrashRound | null> {
  return db.prepare('SELECT * FROM crash_rounds ORDER BY round_id DESC LIMIT 1').first<CrashRound>().catch(() => null);
}

async function readRound(db: D1Database, roundId: number): Promise<CrashRound | null> {
  return db.prepare('SELECT * FROM crash_rounds WHERE round_id=?').bind(roundId).first<CrashRound>().catch(() => null);
}

async function ensureCrashSchema(db: D1Database): Promise<void> {
  if (crashSchemaReady) return;
  await db.prepare("CREATE TABLE IF NOT EXISTS crash_live_bets(round_id INTEGER NOT NULL,user_id TEXT NOT NULL,username TEXT NOT NULL,amount_nano INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'bet',cashout_multiplier REAL,payout_nano INTEGER NOT NULL DEFAULT 0,is_virtual INTEGER NOT NULL DEFAULT 0,target_cashout_multiplier REAL,virtual_reveal_at_ms INTEGER NOT NULL DEFAULT 0,virtual_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(round_id,user_id))").run();
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN is_virtual INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN target_cashout_multiplier REAL').run().catch(() => undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN virtual_reveal_at_ms INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN virtual_order INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_crash_live_bets_round ON crash_live_bets(round_id,created_at)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS crash_rounds(round_id INTEGER PRIMARY KEY,betting_started_ms INTEGER NOT NULL,running_started_ms INTEGER NOT NULL,crash_at_ms INTEGER NOT NULL,next_round_at_ms INTEGER NOT NULL,crash_point REAL NOT NULL,settled INTEGER NOT NULL DEFAULT 0)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_crash_rounds_crash_at ON crash_rounds(crash_at_ms)').run();
  crashSchemaReady = true;
}

function displayChoice(roundId: number, index: number, length: number): number {
  if (length <= 1) return 0;
  let x = (Math.floor(roundId % 2_147_483_647) ^ Math.imul(index + 1, 1_103_515_245)) | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return Math.abs(x) % length;
}

function cleanRoundId(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isSafeInteger(n) || n < 1) throw new Error('Round is not ready');
  return n;
}

function cleanAmount(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < MIN_BET_NANO) throw new Error('Minimum bet is 0.01 TON');
  return n;
}

function cleanName(value: unknown, fallback: string): string {
  let name = String(value || fallback || 'User').replace(/[<>]/g, '').trim();
  if (name.startsWith('@')) name = name.slice(1);
  if (name.includes(' ')) name = name.split(' ')[0];
  return name.slice(0, 80) || 'User';
}

function floor2(value: number): number {
  return Math.max(1, Math.min(MAX_MULTIPLIER, Math.floor((Number(value) || 1) * 100) / 100));
}

function ton(value: unknown): string {
  return (Math.max(0, Math.floor(Number(value) || 0)) / NANO).toFixed(4).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export default app;

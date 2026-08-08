import type { Hono } from 'hono';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';

type App = Hono<{ Bindings: Env }>;
type Difficulty = 'easy' | 'medium' | 'hard' | 'hardcore';
type RoundStatus = 'active' | 'lost' | 'cashed';

type RoundRow = {
  id: string;
  user_id: string;
  amount_nano: number;
  difficulty: Difficulty;
  current_step: number;
  max_steps: number;
  status: RoundStatus;
  multiplier: number;
  payout_nano: number;
  server_seed: string;
  seed_hash: string;
  created_at: string;
  updated_at: string;
};

const HOUSE_RETURN = 0.96;
const MAX_BET_NANO = Math.floor(Number.MAX_SAFE_INTEGER / 10_000);
const ROUND_TTL_MS = 30 * 60 * 1000;
const DIFFICULTIES: Record<Difficulty, { steps: number; survival: number }> = {
  easy: { steps: 24, survival: 0.96 },
  medium: { steps: 20, survival: 0.91 },
  hard: { steps: 17, survival: 0.84 },
  hardcore: { steps: 15, survival: 0.72 },
};

export function registerChickenCrossRoutes(app: App): void {
  app.post('/app/api/chicken-cross/start', async (c) => {
    let userId = '';
    let amountNano = 0;
    let debited = false;
    try {
      const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
      userId = cleanUserId(body.userId);
      amountNano = cleanAmount(body.amountNano);
      const difficulty = cleanDifficulty(body.difficulty);
      const controls = await getUserControls(c.env, userId);
      if (controls.banned) throw new Error('Your access to all sections is blocked.');
      if (controls.blockedSections.includes('hilo')) throw new Error('Chicken Cross is blocked for this account.');
      await ensureTable(c.env);
      await expireOldRounds(c.env, userId);
      const active = await activeRound(c.env, userId);
      if (active) return c.json({ ok: true, resumed: true, round: publicRound(active) }, 200, noStore());

      const afterBet = await debitUserTonBalanceIfEnough(c.env, userId, amountNano, {
        kind: 'game',
        title: 'Chicken Cross bet',
        metadata: { section: 'hilo', difficulty },
      });
      debited = true;

      const id = 'cc_' + randomHex(24);
      const serverSeed = randomHex(64);
      const seedHash = await sha256Hex(serverSeed);
      const config = DIFFICULTIES[difficulty];
      await c.env.DB.prepare(`INSERT INTO chicken_cross_rounds
        (id,user_id,amount_nano,difficulty,current_step,max_steps,status,multiplier,payout_nano,server_seed,seed_hash,created_at,updated_at)
        VALUES (?,?,?,?,0,?,'active',1,0,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`)
        .bind(id, userId, amountNano, difficulty, config.steps, serverSeed, seedHash)
        .run();
      const round = await getRound(c.env, id, userId);
      if (!round) throw new Error('Round could not be created');
      return c.json({ ok: true, round: publicRound(round), tonBalanceNano: afterBet.tonBalanceNano }, 200, noStore());
    } catch (error) {
      if (debited && userId && amountNano > 0) {
        await adjustUserTonBalance(c.env, userId, amountNano, {
          kind: 'adjustment', title: 'Chicken Cross refund', metadata: { section: 'hilo', reason: 'start-failed' },
        }).catch(() => undefined);
      }
      return c.json({ error: message(error, 'Could not start Chicken Cross') }, 400, noStore());
    }
  });

  app.post('/app/api/chicken-cross/cross', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
      const userId = cleanUserId(body.userId);
      const roundId = cleanRoundId(body.roundId);
      await ensureTable(c.env);
      const round = await getRound(c.env, roundId, userId);
      if (!round) throw new Error('Round not found');
      if (round.status !== 'active') return c.json({ ok: true, round: publicRound(round) }, 200, noStore());
      const controls = await getUserControls(c.env, userId);
      if (controls.banned || controls.blockedSections.includes('hilo')) throw new Error('Chicken Cross is blocked for this account.');

      const nextStep = round.current_step + 1;
      const config = DIFFICULTIES[round.difficulty];
      const safe = await safeStep(round.server_seed, nextStep, config.survival);
      if (!safe) {
        const changed = await c.env.DB.prepare(`UPDATE chicken_cross_rounds
          SET status='lost',updated_at=CURRENT_TIMESTAMP
          WHERE id=? AND user_id=? AND status='active' AND current_step=?`)
          .bind(round.id, userId, round.current_step).run();
        const latest = await getRound(c.env, round.id, userId);
        if (!latest) throw new Error('Round not found');
        return c.json({ ok: true, event: Number(changed.meta.changes || 0) > 0 ? 'hit' : 'sync', round: publicRound(latest) }, 200, noStore());
      }

      const multiplier = multiplierAt(round.difficulty, nextStep);
      const reachedEnd = nextStep >= round.max_steps;
      const payoutNano = reachedEnd ? Math.floor(round.amount_nano * multiplier) : 0;
      const changed = await c.env.DB.prepare(`UPDATE chicken_cross_rounds
        SET current_step=?,multiplier=?,status=?,payout_nano=?,updated_at=CURRENT_TIMESTAMP
        WHERE id=? AND user_id=? AND status='active' AND current_step=?`)
        .bind(nextStep, multiplier, reachedEnd ? 'cashed' : 'active', payoutNano, round.id, userId, round.current_step)
        .run();

      let balance: number | undefined;
      if (reachedEnd && Number(changed.meta.changes || 0) > 0) {
        const result = await adjustUserTonBalance(c.env, userId, payoutNano, {
          kind: 'game', title: 'Chicken Cross reward',
          metadata: { section: 'hilo', difficulty: round.difficulty, step: nextStep, multiplier, result: 'finish' },
        });
        balance = result.tonBalanceNano;
      }
      const latest = await getRound(c.env, round.id, userId);
      if (!latest) throw new Error('Round not found');
      return c.json({ ok: true, event: reachedEnd ? 'finish' : 'safe', round: publicRound(latest), tonBalanceNano: balance }, 200, noStore());
    } catch (error) {
      return c.json({ error: message(error, 'Could not cross') }, 400, noStore());
    }
  });

  app.post('/app/api/chicken-cross/cashout', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
      const userId = cleanUserId(body.userId);
      const roundId = cleanRoundId(body.roundId);
      await ensureTable(c.env);
      const round = await getRound(c.env, roundId, userId);
      if (!round) throw new Error('Round not found');
      if (round.status !== 'active') return c.json({ ok: true, round: publicRound(round) }, 200, noStore());
      if (round.current_step < 1) throw new Error('Cross at least one lane before cashing out');
      const payoutNano = Math.floor(round.amount_nano * round.multiplier);
      const changed = await c.env.DB.prepare(`UPDATE chicken_cross_rounds
        SET status='cashed',payout_nano=?,updated_at=CURRENT_TIMESTAMP
        WHERE id=? AND user_id=? AND status='active'`)
        .bind(payoutNano, round.id, userId).run();
      if (Number(changed.meta.changes || 0) <= 0) {
        const latest = await getRound(c.env, round.id, userId);
        return c.json({ ok: true, round: latest ? publicRound(latest) : null }, 200, noStore());
      }
      const controls = await adjustUserTonBalance(c.env, userId, payoutNano, {
        kind: 'game', title: 'Chicken Cross cash out',
        metadata: { section: 'hilo', difficulty: round.difficulty, step: round.current_step, multiplier: round.multiplier, result: 'cashout' },
      });
      const latest = await getRound(c.env, round.id, userId);
      if (!latest) throw new Error('Round not found');
      return c.json({ ok: true, event: 'cashout', round: publicRound(latest), tonBalanceNano: controls.tonBalanceNano }, 200, noStore());
    } catch (error) {
      return c.json({ error: message(error, 'Could not cash out') }, 400, noStore());
    }
  });

  app.get('/app/api/chicken-cross/state', async (c) => {
    try {
      const userId = cleanUserId(c.req.query('userId'));
      await ensureTable(c.env);
      await expireOldRounds(c.env, userId);
      const round = await activeRound(c.env, userId);
      return c.json({ ok: true, round: round ? publicRound(round) : null }, 200, noStore());
    } catch (error) {
      return c.json({ error: message(error, 'Could not load round') }, 400, noStore());
    }
  });
}

async function ensureTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS chicken_cross_rounds (
    id TEXT PRIMARY KEY,user_id TEXT NOT NULL,amount_nano INTEGER NOT NULL,difficulty TEXT NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 0,max_steps INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'active',
    multiplier REAL NOT NULL DEFAULT 1,payout_nano INTEGER NOT NULL DEFAULT 0,server_seed TEXT NOT NULL,
    seed_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_chicken_cross_user_status ON chicken_cross_rounds(user_id,status,created_at)').run();
}

async function expireOldRounds(env: Env, userId: string): Promise<void> {
  const cutoff = new Date(Date.now() - ROUND_TTL_MS).toISOString();
  await env.DB.prepare("UPDATE chicken_cross_rounds SET status='lost',updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND status='active' AND created_at<?")
    .bind(userId, cutoff).run();
}

async function activeRound(env: Env, userId: string): Promise<RoundRow | null> {
  return env.DB.prepare("SELECT * FROM chicken_cross_rounds WHERE user_id=? AND status='active' ORDER BY created_at DESC LIMIT 1")
    .bind(userId).first<RoundRow>();
}

async function getRound(env: Env, id: string, userId: string): Promise<RoundRow | null> {
  return env.DB.prepare('SELECT * FROM chicken_cross_rounds WHERE id=? AND user_id=?').bind(id, userId).first<RoundRow>();
}

function publicRound(round: RoundRow) {
  const ended = round.status !== 'active';
  return {
    id: round.id,
    amountNano: Number(round.amount_nano),
    difficulty: round.difficulty,
    currentStep: Number(round.current_step),
    maxSteps: Number(round.max_steps),
    status: round.status,
    multiplier: Number(round.multiplier),
    nextMultiplier: round.status === 'active' && round.current_step < round.max_steps
      ? multiplierAt(round.difficulty, round.current_step + 1) : null,
    payoutNano: Number(round.payout_nano),
    seedHash: round.seed_hash,
    serverSeed: ended ? round.server_seed : null,
  };
}

function multiplierAt(difficulty: Difficulty, step: number): number {
  const survival = DIFFICULTIES[difficulty].survival;
  return Math.max(1.01, Math.floor((HOUSE_RETURN / Math.pow(survival, Math.max(1, step))) * 100) / 100);
}

async function safeStep(seed: string, step: number, survival: number): Promise<boolean> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed + ':' + step));
  const bytes = new Uint8Array(digest);
  const value = ((bytes[0] * 0x1000000) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3]) >>> 0;
  return value / 4294967296 < survival;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, length);
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!id) throw new Error('Missing Telegram user');
  return id;
}

function cleanRoundId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!id.startsWith('cc_')) throw new Error('Invalid round');
  return id;
}

function cleanAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_BET_NANO) throw new Error('Invalid bet amount');
  return amount;
}

function cleanDifficulty(value: unknown): Difficulty {
  const difficulty = String(value || '').toLowerCase() as Difficulty;
  if (!Object.prototype.hasOwnProperty.call(DIFFICULTIES, difficulty)) throw new Error('Invalid difficulty');
  return difficulty;
}

function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function noStore(): Record<string, string> {
  return { 'cache-control': 'no-store' };
}

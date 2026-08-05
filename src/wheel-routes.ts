import type { Hono } from 'hono';
import type { Env } from './types';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough } from './user-controls';
import { isWheelFillReady, pickWheelFillEntries } from './wheel-fill-entries';
import { id } from './utils';

type App = Hono<{ Bindings: Env }>;

type WheelRoundRow = {
  id: string;
  status: 'open' | 'closed';
  total_amount_nano: number;
  winner_user_id: string | null;
  selected_ticket: number | null;
  created_at: string;
  closed_at: string | null;
};

type WheelEntryRow = {
  id: string;
  round_id: string;
  user_id: string;
  username: string;
  first_name: string | null;
  amount_nano: number;
  ticket_start: number;
  ticket_end: number;
  created_at: string;
};

const WHEEL_MAX_PLAYERS = 5;
const WHEEL_MIN_ENTRY_NANO = 10_000_000;

export function registerWheelRoutes(app: App): void {
  app.get('/app/api/wheel-round', async (c) => {
    try {
      await ensureWheelTables(c.env);
      const round = await fillWheelRoundIfReady(c.env, await currentWheelRound(c.env));
      return c.json(await wheelState(c.env, round), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not load wheel round' }, 400, { 'cache-control': 'no-store' });
    }
  });

  app.post('/app/api/wheel-round/join', async (c) => {
    try {
      await ensureWheelTables(c.env);
      const body = await c.req.json().catch(() => ({})) as {
        userId?: unknown;
        username?: unknown;
        firstName?: unknown;
        amountNano?: unknown;
      };
      const userId = cleanWheelUserId(body.userId);
      const amountNano = cleanWheelAmount(body.amountNano);
      let round = await currentWheelRound(c.env);
      let entries = await wheelEntries(c.env, round.id);
      if (entries.some((entry) => entry.user_id === userId)) {
        return c.json(await wheelState(c.env, round), 200, { 'cache-control': 'no-store' });
      }
      if (entries.length >= WHEEL_MAX_PLAYERS) {
        round = await createWheelRound(c.env);
        entries = [];
      }

      await debitUserTonBalanceIfEnough(c.env, userId, amountNano, {
        kind: 'game',
        title: 'Wheel entry',
        roundId: round.id,
      });
      try {
        const ticketStart = entries.reduce((max, entry) => Math.max(max, Number(entry.ticket_end || 0)), 0) + 1;
        const ticketEnd = ticketStart + amountNano - 1;
        await c.env.DB.prepare(
          'INSERT OR IGNORE INTO wheel_entries (id, round_id, user_id, username, first_name, amount_nano, ticket_start, ticket_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        ).bind(
          id('whent'),
          round.id,
          userId,
          cleanWheelName(body.username, userId),
          cleanWheelFirstName(body.firstName),
          amountNano,
          ticketStart,
          ticketEnd,
        ).run();
        await c.env.DB.prepare("UPDATE wheel_rounds SET total_amount_nano = total_amount_nano + ? WHERE id = ? AND status = 'open'")
          .bind(amountNano, round.id).run();
      } catch (error) {
        await adjustUserTonBalance(c.env, userId, amountNano, {
          kind: 'game',
          title: 'Wheel entry refund',
          roundId: round.id,
        }).catch(() => undefined);
        throw error;
      }

      round = await getWheelRound(c.env, round.id) ?? round;
      round = await fillWheelRoundIfReady(c.env, round);
      entries = await wheelEntries(c.env, round.id);
      if (entries.length >= WHEEL_MAX_PLAYERS && round.status === 'open') {
        round = await closeWheelRound(c.env, round, entries);
      }
      return c.json(await wheelState(c.env, round), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not join wheel round' }, 400, { 'cache-control': 'no-store' });
    }
  });
}

async function ensureWheelTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wheel_rounds (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'open',
    total_amount_nano INTEGER NOT NULL DEFAULT 0,
    winner_user_id TEXT,
    selected_ticket INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TEXT
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS wheel_entries (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    first_name TEXT,
    amount_nano INTEGER NOT NULL,
    ticket_start INTEGER NOT NULL,
    ticket_end INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(round_id, user_id)
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wheel_rounds_status_created ON wheel_rounds (status, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wheel_entries_round_ticket ON wheel_entries (round_id, ticket_start)').run();
}

async function currentWheelRound(env: Env): Promise<WheelRoundRow> {
  const open = await env.DB.prepare("SELECT * FROM wheel_rounds WHERE status = 'open' ORDER BY datetime(created_at) DESC LIMIT 1")
    .first<WheelRoundRow>();
  return open ?? createWheelRound(env);
}

async function createWheelRound(env: Env): Promise<WheelRoundRow> {
  const roundId = id('whrnd');
  await env.DB.prepare("INSERT INTO wheel_rounds (id, status, total_amount_nano, created_at) VALUES (?, 'open', 0, CURRENT_TIMESTAMP)")
    .bind(roundId).run();
  const round = await getWheelRound(env, roundId);
  if (!round) throw new Error('Could not create wheel round');
  return round;
}

async function getWheelRound(env: Env, roundId: string): Promise<WheelRoundRow | null> {
  return env.DB.prepare('SELECT * FROM wheel_rounds WHERE id = ?').bind(roundId).first<WheelRoundRow>();
}

async function wheelEntries(env: Env, roundId: string): Promise<WheelEntryRow[]> {
  const rows = await env.DB.prepare('SELECT * FROM wheel_entries WHERE round_id = ? ORDER BY ticket_start ASC')
    .bind(roundId).all<WheelEntryRow>();
  return rows.results ?? [];
}

async function fillWheelRoundIfReady(env: Env, round: WheelRoundRow): Promise<WheelRoundRow> {
  if (round.status !== 'open') return round;
  let entries = await wheelEntries(env, round.id);
  if (entries.length >= WHEEL_MAX_PLAYERS) return closeWheelRound(env, round, entries);
  if (!isWheelFillReady(round.created_at)) return round;

  const needed = WHEEL_MAX_PLAYERS - entries.length;
  let ticketStart = entries.reduce((max, entry) => Math.max(max, Number(entry.ticket_end || 0)), 0) + 1;
  let addedTotal = 0;
  for (const fillEntry of pickWheelFillEntries(round.id, entries.map((entry) => entry.user_id), needed)) {
    const amountNano = fillEntry.amountTon * 1_000_000_000;
    const ticketEnd = ticketStart + amountNano - 1;
    const result = await env.DB.prepare(
      'INSERT OR IGNORE INTO wheel_entries (id, round_id, user_id, username, first_name, amount_nano, ticket_start, ticket_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    ).bind(id('whent'), round.id, fillEntry.userId, fillEntry.name, fillEntry.name, amountNano, ticketStart, ticketEnd).run();
    if ((result.meta?.changes ?? 0) > 0) {
      ticketStart = ticketEnd + 1;
      addedTotal += amountNano;
    }
  }
  if (addedTotal > 0) {
    await env.DB.prepare("UPDATE wheel_rounds SET total_amount_nano = total_amount_nano + ? WHERE id = ? AND status = 'open'")
      .bind(addedTotal, round.id).run();
  }
  const nextRound = await getWheelRound(env, round.id) ?? round;
  entries = await wheelEntries(env, round.id);
  return entries.length >= WHEEL_MAX_PLAYERS ? closeWheelRound(env, nextRound, entries) : nextRound;
}

async function closeWheelRound(env: Env, round: WheelRoundRow, entries: WheelEntryRow[]): Promise<WheelRoundRow> {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, Math.floor(Number(entry.amount_nano) || 0)), 0);
  if (total <= 0) return round;
  const selectedTicket = secureTicket(total);
  const winner = entries.find((entry) => selectedTicket >= Number(entry.ticket_start) && selectedTicket <= Number(entry.ticket_end))
    ?? entries[entries.length - 1];
  const result = await env.DB.prepare(
    "UPDATE wheel_rounds SET status = 'closed', total_amount_nano = ?, winner_user_id = ?, selected_ticket = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'open'",
  ).bind(total, winner.user_id, selectedTicket, round.id).run();
  const closed = await getWheelRound(env, round.id) ?? round;
  if ((result.meta?.changes ?? 0) > 0) {
    await adjustUserTonBalance(env, winner.user_id, total, {
      kind: 'game',
      title: 'Wheel prize',
      roundId: round.id,
    });
  }
  return closed;
}

async function wheelState(env: Env, round: WheelRoundRow) {
  const entries = await wheelEntries(env, round.id);
  const winner = round.winner_user_id
    ? entries.find((entry) => entry.user_id === round.winner_user_id) ?? null
    : null;
  return {
    ok: true,
    maxPlayers: WHEEL_MAX_PLAYERS,
    round: {
      id: round.id,
      status: round.status,
      totalAmountNano: Number(round.total_amount_nano || 0),
      totalTon: formatTon(round.total_amount_nano),
      winnerUserId: round.winner_user_id,
      selectedTicket: round.selected_ticket == null ? null : Number(round.selected_ticket),
      winner: winner ? wheelEntryJson(winner) : null,
      createdAt: round.created_at,
      closedAt: round.closed_at,
    },
    entries: entries.map(wheelEntryJson),
  };
}

function wheelEntryJson(entry: WheelEntryRow) {
  return {
    id: entry.id,
    roundId: entry.round_id,
    userId: entry.user_id,
    username: entry.username,
    firstName: entry.first_name,
    amountNano: Number(entry.amount_nano || 0),
    amountTon: formatTon(entry.amount_nano),
    ticketStart: Number(entry.ticket_start || 0),
    ticketEnd: Number(entry.ticket_end || 0),
    createdAt: entry.created_at,
  };
}

function secureTicket(maxTicket: number): number {
  const max = BigInt(Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(maxTicket) || 1))));
  const space = 1n << 64n;
  const limit = space - (space % max);
  const values = new Uint32Array(2);
  let value = 0n;
  do {
    crypto.getRandomValues(values);
    value = (BigInt(values[0]) << 32n) + BigInt(values[1]);
  } while (value >= limit);
  return Number((value % max) + 1n);
}

function cleanWheelUserId(value: unknown): string {
  const userId = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!userId) throw new Error('Telegram user not found');
  return userId;
}

function cleanWheelName(value: unknown, fallback: string): string {
  let name = String(value || fallback || 'User').replace(/[<>]/g, '').trim();
  if (name.startsWith('@')) name = name.slice(1);
  if (name.includes(' ')) name = name.split(' ')[0];
  return name.slice(0, 80) || 'User';
}

function cleanWheelFirstName(value: unknown): string | null {
  const firstName = String(value || '').replace(/[<>]/g, '').trim().slice(0, 80);
  return firstName || null;
}

function cleanWheelAmount(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isFinite(amount) || amount < WHEEL_MIN_ENTRY_NANO) {
    throw new Error('Minimum wheel entry is 0.01 TON');
  }
  return amount;
}

function formatTon(value: unknown): string {
  return (Math.max(0, Math.floor(Number(value) || 0)) / 1_000_000_000)
    .toFixed(4)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}

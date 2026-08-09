import type { Env } from './types';
import { adjustUserTonBalance, assertUserNotBanned, debitUserTonBalanceIfEnough, getUserControls } from './user-controls';

export const LOTTERY_DEFAULT_TICKET_PRICE_NANO = 150_000_000;
export const LOTTERY_DEFAULT_DRAW_INTERVAL_MINUTES = 24 * 60;
export const LOTTERY_MAX_PURCHASE_QUANTITY = 20;

export type LotterySettings = {
  enabled: boolean;
  salesOpen: boolean;
  freeTicketEnabled: boolean;
  ticketPriceNano: number;
  maxTicketsPerUser: number;
  drawIntervalMinutes: number;
  nextDrawAt: string;
  updatedAt: string;
};

export type LotteryRound = {
  id: string;
  status: 'open' | 'closed';
  opensAt: string;
  drawAt: string;
  ticketPriceNano: number;
  createdAt: string;
  updatedAt: string;
};

export type LotteryTicket = {
  id: string;
  roundId: string;
  ticketNumber: string;
  priceNano: number;
  isFree: boolean;
  createdAt: string;
};

export type LotteryUserState = {
  settings: LotterySettings;
  round: LotteryRound | null;
  tickets: LotteryTicket[];
  ticketCount: number;
  freeTicketAvailable: boolean;
  gramBalanceNano: number;
  canBuy: boolean;
  reason: string | null;
};

type SettingsRow = {
  enabled: number;
  sales_open: number;
  free_ticket_enabled: number;
  ticket_price_nano: number;
  max_tickets_per_user: number;
  draw_interval_minutes: number;
  next_draw_at: string;
  updated_at: string;
};

type RoundRow = {
  id: string;
  status: 'open' | 'closed';
  opens_at: string;
  draw_at: string;
  ticket_price_nano: number;
  created_at: string;
  updated_at: string;
};

type TicketRow = {
  id: string;
  round_id: string;
  ticket_number: string;
  price_nano: number;
  is_free: number;
  created_at: string;
};

type AdminStatsRow = {
  ticket_count: number;
  player_count: number;
  paid_ticket_count: number;
  free_ticket_count: number;
  revenue_nano: number;
};

export async function ensureLotteryTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS lottery_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER NOT NULL DEFAULT 1,
    sales_open INTEGER NOT NULL DEFAULT 1,
    free_ticket_enabled INTEGER NOT NULL DEFAULT 1,
    ticket_price_nano INTEGER NOT NULL DEFAULT 150000000,
    max_tickets_per_user INTEGER NOT NULL DEFAULT 0,
    draw_interval_minutes INTEGER NOT NULL DEFAULT 1440,
    next_draw_at TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS lottery_rounds (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'open',
    opens_at TEXT NOT NULL,
    draw_at TEXT NOT NULL,
    ticket_price_nano INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS lottery_free_claims (
    user_id TEXT PRIMARY KEY,
    claim_request_id TEXT NOT NULL,
    ticket_id TEXT,
    claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS lottery_tickets (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    ticket_number TEXT NOT NULL UNIQUE,
    price_nano INTEGER NOT NULL DEFAULT 0,
    is_free INTEGER NOT NULL DEFAULT 0,
    purchase_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, purchase_id, id)
  )`).run();

  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_lottery_round_status ON lottery_rounds(status, draw_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user_round ON lottery_tickets(user_id, round_id, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_lottery_tickets_purchase ON lottery_tickets(user_id, purchase_id)').run();

  const existing = await env.DB.prepare('SELECT id FROM lottery_settings WHERE id = 1').first<{ id: number }>();
  if (!existing) {
    const nextDrawAt = new Date(Date.now() + LOTTERY_DEFAULT_DRAW_INTERVAL_MINUTES * 60_000).toISOString();
    await env.DB.prepare(`INSERT INTO lottery_settings
      (id,enabled,sales_open,free_ticket_enabled,ticket_price_nano,max_tickets_per_user,draw_interval_minutes,next_draw_at,updated_at)
      VALUES (1,1,1,1,150000000,0,1440,?,CURRENT_TIMESTAMP)`)
      .bind(nextDrawAt).run();
  }
}

export async function getLotterySettings(env: Env): Promise<LotterySettings> {
  await ensureLotteryTables(env);
  const row = await env.DB.prepare('SELECT * FROM lottery_settings WHERE id = 1').first<SettingsRow>();
  if (!row) throw new Error('Lottery settings are unavailable');
  return publicSettings(row);
}

export async function getCurrentLotteryRound(env: Env, createIfMissing = true): Promise<LotteryRound | null> {
  await ensureLotteryTables(env);
  let row = await env.DB.prepare("SELECT * FROM lottery_rounds WHERE status='open' ORDER BY datetime(created_at) DESC LIMIT 1").first<RoundRow>();
  if (row && Date.parse(row.draw_at) <= Date.now()) {
    await env.DB.prepare("UPDATE lottery_rounds SET status='closed',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'").bind(row.id).run();
    row = null;
  }
  if (!row && createIfMissing) {
    const latestClosed = await env.DB.prepare("SELECT * FROM lottery_rounds WHERE status='closed' ORDER BY datetime(created_at) DESC LIMIT 1").first<RoundRow>();
    if (latestClosed) return publicRound(latestClosed);
    const settings = await getLotterySettings(env);
    const id = roundId();
    const opensAt = new Date().toISOString();
    const drawAt = normalizeFutureDate(settings.nextDrawAt, settings.drawIntervalMinutes);
    await env.DB.prepare(`INSERT INTO lottery_rounds (id,status,opens_at,draw_at,ticket_price_nano,created_at,updated_at)
      VALUES (?,'open',?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`)
      .bind(id, opensAt, drawAt, settings.ticketPriceNano).run();
    row = await env.DB.prepare('SELECT * FROM lottery_rounds WHERE id=?').bind(id).first<RoundRow>();
  }
  return row ? publicRound(row) : null;
}

export async function getLotteryUserState(env: Env, userId: string): Promise<LotteryUserState> {
  const id = cleanUserId(userId);
  await assertUserNotBanned(env, id);
  const settings = await getLotterySettings(env);
  const round = await getCurrentLotteryRound(env, true);
  const openRound = round?.status === 'open' && Date.parse(round.drawAt) > Date.now() ? round : null;
  const tickets = openRound ? await listLotteryTickets(env, id, openRound.id, 100) : [];
  const freeTicketAvailable = settings.freeTicketEnabled && !(await hasClaimedFreeTicket(env, id));
  const controls = await getUserControls(env, id);
  const reason = !settings.enabled ? 'Lottery is disabled'
    : !settings.salesOpen ? 'Ticket sales are paused'
      : !openRound ? 'This round is closed'
        : null;
  return {
    settings,
    round,
    tickets,
    ticketCount: tickets.length,
    freeTicketAvailable,
    gramBalanceNano: controls.tonBalanceNano,
    canBuy: !reason,
    reason,
  };
}

export async function listLotteryTickets(env: Env, userId: string, roundId?: string, limit = 100): Promise<LotteryTicket[]> {
  await ensureLotteryTables(env);
  const id = cleanUserId(userId);
  const max = Math.max(1, Math.min(250, Math.floor(Number(limit) || 100)));
  const rows = roundId
    ? await env.DB.prepare(`SELECT id,round_id,ticket_number,price_nano,is_free,created_at FROM lottery_tickets
        WHERE user_id=? AND round_id=? ORDER BY datetime(created_at) DESC LIMIT ?`).bind(id, roundId, max).all<TicketRow>()
    : await env.DB.prepare(`SELECT id,round_id,ticket_number,price_nano,is_free,created_at FROM lottery_tickets
        WHERE user_id=? ORDER BY datetime(created_at) DESC LIMIT ?`).bind(id, max).all<TicketRow>();
  return (rows.results || []).map(publicTicket);
}

export async function buyLotteryTickets(env: Env, userId: string, quantityInput: unknown, purchaseIdInput: unknown): Promise<{
  tickets: LotteryTicket[];
  ticketCount: number;
  freeTicketAvailable: boolean;
  paidNano: number;
  gramBalanceNano: number;
  round: LotteryRound;
}> {
  const user = cleanUserId(userId);
  const quantity = cleanQuantity(quantityInput);
  const purchaseId = cleanPurchaseId(purchaseIdInput);
  await assertUserNotBanned(env, user);
  await ensureLotteryTables(env);

  const existing = await ticketsForPurchase(env, user, purchaseId);
  if (existing.length) {
    const current = await getCurrentLotteryRound(env, false);
    if (!current) throw new Error('Lottery round is unavailable');
    const all = await listLotteryTickets(env, user, current.id, 250);
    const controls = await getUserControls(env, user);
    return {
      tickets: existing,
      ticketCount: all.length,
      freeTicketAvailable: !(await hasClaimedFreeTicket(env, user)),
      paidNano: existing.reduce((sum, ticket) => sum + ticket.priceNano, 0),
      gramBalanceNano: controls.tonBalanceNano,
      round: current,
    };
  }

  const settings = await getLotterySettings(env);
  if (!settings.enabled) throw new Error('Lottery is disabled');
  if (!settings.salesOpen) throw new Error('Ticket sales are paused');
  const round = await getCurrentLotteryRound(env, true);
  if (!round || round.status !== 'open' || Date.parse(round.drawAt) <= Date.now()) throw new Error('This lottery round is closed');

  const currentCountRow = await env.DB.prepare('SELECT COUNT(*) AS count FROM lottery_tickets WHERE user_id=? AND round_id=?')
    .bind(user, round.id).first<{ count: number }>();
  const currentCount = Number(currentCountRow?.count || 0);
  if (settings.maxTicketsPerUser > 0 && currentCount + quantity > settings.maxTicketsPerUser) {
    throw new Error(`Maximum ${settings.maxTicketsPerUser} tickets per user for this round`);
  }

  let freeReserved = false;
  if (settings.freeTicketEnabled) {
    const claim = await env.DB.prepare(`INSERT OR IGNORE INTO lottery_free_claims (user_id,claim_request_id,ticket_id,claimed_at)
      VALUES (?,?,NULL,CURRENT_TIMESTAMP)`).bind(user, purchaseId).run();
    freeReserved = Number(claim.meta?.changes || 0) > 0;
  }

  const paidQuantity = Math.max(0, quantity - (freeReserved ? 1 : 0));
  const paidNano = paidQuantity * settings.ticketPriceNano;
  let debited = false;
  let balanceNano = (await getUserControls(env, user)).tonBalanceNano;

  try {
    if (paidNano > 0) {
      const balance = await debitUserTonBalanceIfEnough(env, user, paidNano, {
        kind: 'adjustment',
        title: `Lottery ticket${quantity === 1 ? '' : 's'}`,
        metadata: { section: 'home', feature: 'lottery', currency: 'GRAM', quantity, paidQuantity, roundId: round.id, purchaseId },
      });
      balanceNano = balance.tonBalanceNano;
      debited = true;
    }

    let inserted: LotteryTicket[] = [];
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 6 && !inserted.length; attempt += 1) {
      const drafts = Array.from({ length: quantity }, (_, index) => ({
        id: ticketId(),
        ticketNumber: ticketNumber(),
        isFree: freeReserved && index === 0,
        priceNano: freeReserved && index === 0 ? 0 : settings.ticketPriceNano,
      }));
      try {
        const statements = drafts.map((ticket) => env.DB.prepare(`INSERT INTO lottery_tickets
          (id,round_id,user_id,ticket_number,price_nano,is_free,purchase_id,created_at)
          VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
          .bind(ticket.id, round.id, user, ticket.ticketNumber, ticket.priceNano, ticket.isFree ? 1 : 0, purchaseId));
        await env.DB.batch(statements);
        inserted = await ticketsForPurchase(env, user, purchaseId);
        if (inserted.length !== quantity) throw new Error('Ticket purchase was not fully saved');
        if (freeReserved) {
          const freeTicket = inserted.find((ticket) => ticket.isFree);
          await env.DB.prepare('UPDATE lottery_free_claims SET ticket_id=? WHERE user_id=? AND claim_request_id=?')
            .bind(freeTicket?.id || null, user, purchaseId).run();
        }
      } catch (error) {
        lastError = error;
        await env.DB.prepare('DELETE FROM lottery_tickets WHERE user_id=? AND purchase_id=?').bind(user, purchaseId).run().catch(() => undefined);
      }
    }
    if (!inserted.length) throw (lastError instanceof Error ? lastError : new Error('Could not create lottery tickets'));

    const countRow = await env.DB.prepare('SELECT COUNT(*) AS count FROM lottery_tickets WHERE user_id=? AND round_id=?')
      .bind(user, round.id).first<{ count: number }>();
    return {
      tickets: inserted,
      ticketCount: Number(countRow?.count || 0),
      freeTicketAvailable: settings.freeTicketEnabled && !(await hasClaimedFreeTicket(env, user)),
      paidNano,
      gramBalanceNano: balanceNano,
      round,
    };
  } catch (error) {
    if (debited && paidNano > 0) {
      await adjustUserTonBalance(env, user, paidNano, {
        kind: 'adjustment', title: 'Lottery ticket refund',
        metadata: { section: 'home', feature: 'lottery', currency: 'GRAM', roundId: round.id, purchaseId },
      }).catch(() => undefined);
    }
    if (freeReserved) {
      await env.DB.prepare('DELETE FROM lottery_free_claims WHERE user_id=? AND claim_request_id=? AND ticket_id IS NULL')
        .bind(user, purchaseId).run().catch(() => undefined);
    }
    throw error;
  }
}

export async function getLotteryAdminOverview(env: Env): Promise<{
  settings: LotterySettings;
  round: LotteryRound | null;
  stats: { ticketCount: number; playerCount: number; paidTicketCount: number; freeTicketCount: number; revenueNano: number };
}> {
  const settings = await getLotterySettings(env);
  const round = await getCurrentLotteryRound(env, true);
  let row: AdminStatsRow | null = null;
  if (round) {
    row = await env.DB.prepare(`SELECT
      COUNT(*) AS ticket_count,
      COUNT(DISTINCT user_id) AS player_count,
      SUM(CASE WHEN is_free=0 THEN 1 ELSE 0 END) AS paid_ticket_count,
      SUM(CASE WHEN is_free=1 THEN 1 ELSE 0 END) AS free_ticket_count,
      COALESCE(SUM(price_nano),0) AS revenue_nano
      FROM lottery_tickets WHERE round_id=?`).bind(round.id).first<AdminStatsRow>();
  }
  return {
    settings,
    round,
    stats: {
      ticketCount: Number(row?.ticket_count || 0),
      playerCount: Number(row?.player_count || 0),
      paidTicketCount: Number(row?.paid_ticket_count || 0),
      freeTicketCount: Number(row?.free_ticket_count || 0),
      revenueNano: Number(row?.revenue_nano || 0),
    },
  };
}

export async function updateLotterySettings(env: Env, patch: Partial<{
  enabled: boolean;
  salesOpen: boolean;
  freeTicketEnabled: boolean;
  ticketPriceNano: number;
  maxTicketsPerUser: number;
  drawIntervalMinutes: number;
  nextDrawAt: string;
}>): Promise<LotterySettings> {
  const current = await getLotterySettings(env);
  const next: LotterySettings = {
    ...current,
    enabled: patch.enabled ?? current.enabled,
    salesOpen: patch.salesOpen ?? current.salesOpen,
    freeTicketEnabled: patch.freeTicketEnabled ?? current.freeTicketEnabled,
    ticketPriceNano: patch.ticketPriceNano === undefined ? current.ticketPriceNano : cleanPrice(patch.ticketPriceNano),
    maxTicketsPerUser: patch.maxTicketsPerUser === undefined ? current.maxTicketsPerUser : cleanMaxTickets(patch.maxTicketsPerUser),
    drawIntervalMinutes: patch.drawIntervalMinutes === undefined ? current.drawIntervalMinutes : cleanInterval(patch.drawIntervalMinutes),
    nextDrawAt: patch.nextDrawAt === undefined ? current.nextDrawAt : normalizeFutureDate(patch.nextDrawAt, current.drawIntervalMinutes),
    updatedAt: new Date().toISOString(),
  };
  await env.DB.prepare(`UPDATE lottery_settings SET
    enabled=?,sales_open=?,free_ticket_enabled=?,ticket_price_nano=?,max_tickets_per_user=?,draw_interval_minutes=?,next_draw_at=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=1`)
    .bind(next.enabled ? 1 : 0, next.salesOpen ? 1 : 0, next.freeTicketEnabled ? 1 : 0, next.ticketPriceNano, next.maxTicketsPerUser, next.drawIntervalMinutes, next.nextDrawAt)
    .run();
  if (patch.nextDrawAt !== undefined) {
    await env.DB.prepare("UPDATE lottery_rounds SET draw_at=?,updated_at=CURRENT_TIMESTAMP WHERE status='open'").bind(next.nextDrawAt).run();
  }
  return getLotterySettings(env);
}

export async function setLotteryDrawMinutesFromNow(env: Env, minutesInput: unknown): Promise<LotterySettings> {
  const minutes = cleanInterval(minutesInput);
  const nextDrawAt = new Date(Date.now() + minutes * 60_000).toISOString();
  return updateLotterySettings(env, { nextDrawAt });
}

async function hasClaimedFreeTicket(env: Env, userId: string): Promise<boolean> {
  const row = await env.DB.prepare('SELECT user_id FROM lottery_free_claims WHERE user_id=? LIMIT 1').bind(userId).first<{ user_id: string }>();
  return Boolean(row?.user_id);
}

async function ticketsForPurchase(env: Env, userId: string, purchaseId: string): Promise<LotteryTicket[]> {
  const rows = await env.DB.prepare(`SELECT id,round_id,ticket_number,price_nano,is_free,created_at FROM lottery_tickets
    WHERE user_id=? AND purchase_id=? ORDER BY datetime(created_at) ASC`).bind(userId, purchaseId).all<TicketRow>();
  return (rows.results || []).map(publicTicket);
}

function publicSettings(row: SettingsRow): LotterySettings {
  return {
    enabled: Number(row.enabled || 0) === 1,
    salesOpen: Number(row.sales_open || 0) === 1,
    freeTicketEnabled: Number(row.free_ticket_enabled || 0) === 1,
    ticketPriceNano: Math.max(0, Math.floor(Number(row.ticket_price_nano) || LOTTERY_DEFAULT_TICKET_PRICE_NANO)),
    maxTicketsPerUser: Math.max(0, Math.floor(Number(row.max_tickets_per_user) || 0)),
    drawIntervalMinutes: Math.max(1, Math.floor(Number(row.draw_interval_minutes) || LOTTERY_DEFAULT_DRAW_INTERVAL_MINUTES)),
    nextDrawAt: String(row.next_draw_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}

function publicRound(row: RoundRow): LotteryRound {
  return {
    id: row.id,
    status: row.status,
    opensAt: row.opens_at,
    drawAt: row.draw_at,
    ticketPriceNano: Math.max(0, Math.floor(Number(row.ticket_price_nano) || 0)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function publicTicket(row: TicketRow): LotteryTicket {
  return {
    id: row.id,
    roundId: row.round_id,
    ticketNumber: row.ticket_number,
    priceNano: Math.max(0, Math.floor(Number(row.price_nano) || 0)),
    isFree: Number(row.is_free || 0) === 1,
    createdAt: row.created_at,
  };
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing Telegram user');
  return id;
}

function cleanQuantity(value: unknown): number {
  const quantity = Math.floor(Number(value) || 1);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > LOTTERY_MAX_PURCHASE_QUANTITY) throw new Error(`Choose 1-${LOTTERY_MAX_PURCHASE_QUANTITY} tickets`);
  return quantity;
}

function cleanPurchaseId(value: unknown): string {
  const id = String(value || '').trim().replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!id) throw new Error('Missing purchase id');
  return id;
}

function cleanPrice(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000_000_000) throw new Error('Invalid ticket price');
  return amount;
}

function cleanMaxTickets(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 1_000_000) throw new Error('Invalid ticket limit');
  return amount;
}

function cleanInterval(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 525_600) throw new Error('Time must be between 1 minute and 1 year');
  return amount;
}

function normalizeFutureDate(value: unknown, fallbackMinutes: number): string {
  const parsed = new Date(String(value || ''));
  if (Number.isFinite(parsed.getTime()) && parsed.getTime() > Date.now() + 5_000) return parsed.toISOString();
  return new Date(Date.now() + Math.max(1, fallbackMinutes) * 60_000).toISOString();
}

function roundId(): string {
  return `lr_${Date.now().toString(36)}_${randomHex(8)}`;
}

function ticketId(): string {
  return `lt_${randomHex(24)}`;
}

function ticketNumber(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const value = (((bytes[0] << 24) >>> 0) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3]) % 100_000_000;
  return String(value).padStart(8, '0');
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, length);
}

import type { Env } from './types';
import { ensureLevelTables } from './levels';
import { ensureTonBalanceColumn } from './user-controls';
import { ensureTonTransactionsTable } from './ton-transactions';

export const LOTTERY_WINNER_COUNT = 10;
const MAX_PRIZE_NANO = 1_000_000_000_000;

type PrizeRow = { rank: number; prize_nano: number; updated_at: string };
type WinnerRow = {
  id: string;
  round_id: string;
  rank: number;
  user_id: string;
  ticket_id: string;
  ticket_code: string;
  prize_nano: number;
  payout_status: string;
  paid_at: string | null;
  created_at: string;
  username?: string | null;
  first_name?: string | null;
  level?: number | null;
};
type CandidateRow = { id: string; user_id: string; code: string };
type ExistingWinnerRow = { rank: number; user_id: string };

export type LotteryPrize = {
  rank: number;
  prizeNano: number;
  updatedAt: string;
};

export type LotteryWinner = {
  id: string;
  roundId: string;
  rank: number;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  ticketCode: string;
  prizeNano: number;
  paid: boolean;
  createdAt: string;
};

export async function ensureLotteryPrizeTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS lottery_prizes (
    rank INTEGER PRIMARY KEY,
    prize_nano INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  const seed = Array.from({ length: LOTTERY_WINNER_COUNT }, (_, index) =>
    env.DB.prepare(`INSERT OR IGNORE INTO lottery_prizes (rank,prize_nano,updated_at)
      VALUES (?,0,CURRENT_TIMESTAMP)`).bind(index + 1),
  );
  await env.DB.batch(seed);
  await env.DB.prepare('DELETE FROM lottery_prizes WHERE rank > ?').bind(LOTTERY_WINNER_COUNT).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS lottery_winners (
    id TEXT PRIMARY KEY,
    round_id TEXT NOT NULL,
    rank INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    ticket_code TEXT NOT NULL,
    prize_nano INTEGER NOT NULL DEFAULT 0,
    payout_status TEXT NOT NULL DEFAULT 'pending',
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(round_id, rank),
    UNIQUE(round_id, user_id)
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_lottery_winners_round_rank ON lottery_winners(round_id,rank)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_lottery_winners_user_round ON lottery_winners(user_id,round_id)').run();
}

export async function getLotteryPrizes(env: Env): Promise<LotteryPrize[]> {
  await ensureLotteryPrizeTables(env);
  const rows = await env.DB.prepare('SELECT rank,prize_nano,updated_at FROM lottery_prizes ORDER BY rank ASC')
    .all<PrizeRow>();
  return (rows.results || []).slice(0, LOTTERY_WINNER_COUNT).map((row) => ({
    rank: Math.max(1, Math.min(LOTTERY_WINNER_COUNT, Math.floor(Number(row.rank) || 1))),
    prizeNano: Math.max(0, Math.floor(Number(row.prize_nano) || 0)),
    updatedAt: String(row.updated_at || ''),
  }));
}

export async function setLotteryPrize(env: Env, rankInput: unknown, prizeNanoInput: unknown): Promise<LotteryPrize[]> {
  await ensureLotteryPrizeTables(env);
  const rank = cleanRank(rankInput);
  const prizeNano = cleanPrize(prizeNanoInput);
  await env.DB.prepare(`UPDATE lottery_prizes SET prize_nano=?,updated_at=CURRENT_TIMESTAMP WHERE rank=?`)
    .bind(prizeNano, rank).run();
  return getLotteryPrizes(env);
}

export async function getLotteryWinners(env: Env, roundIdInput?: unknown): Promise<LotteryWinner[]> {
  await ensureLotteryPrizeTables(env);
  await ensureLevelTables(env);
  let roundId = String(roundIdInput || '').trim();
  if (!roundId) {
    const latest = await env.DB.prepare(`SELECT round_id FROM lottery_winners
      ORDER BY datetime(created_at) DESC, rank ASC LIMIT 1`).first<{ round_id: string }>();
    roundId = String(latest?.round_id || '');
  }
  if (!roundId) return [];

  const rows = await env.DB.prepare(`SELECT w.*,u.username,u.first_name,l.level
    FROM lottery_winners w
    LEFT JOIN app_users u ON u.telegram_user_id=w.user_id
    LEFT JOIN user_levels l ON l.user_id=w.user_id
    WHERE w.round_id=?
    ORDER BY w.rank ASC
    LIMIT ?`).bind(roundId, LOTTERY_WINNER_COUNT).all<WinnerRow>();
  return (rows.results || []).map(publicWinner);
}

export async function userWonLotteryRound(env: Env, userIdInput: unknown, roundIdInput: unknown): Promise<boolean> {
  await ensureLotteryPrizeTables(env);
  const userId = String(userIdInput || '').trim();
  const roundId = String(roundIdInput || '').trim();
  if (!userId || !roundId) return false;
  const row = await env.DB.prepare('SELECT id FROM lottery_winners WHERE user_id=? AND round_id=? LIMIT 1')
    .bind(userId, roundId).first<{ id: string }>();
  return Boolean(row?.id);
}

export async function finalizeLotteryWinners(env: Env, roundIdInput: unknown): Promise<LotteryWinner[]> {
  await ensureLotteryPrizeTables(env);
  const roundId = String(roundIdInput || '').trim();
  if (!roundId) throw new Error('Missing Lottery round');

  const prizes = await getLotteryPrizes(env);
  const existingRows = await env.DB.prepare(`SELECT rank,user_id FROM lottery_winners
    WHERE round_id=? ORDER BY rank ASC`).bind(roundId).all<ExistingWinnerRow>();
  const existing = existingRows.results || [];
  const selectedUsers = existing.map((row) => String(row.user_id || '')).filter(Boolean);
  const occupiedRanks = new Set(existing.map((row) => Math.floor(Number(row.rank) || 0)));

  for (let rank = 1; rank <= LOTTERY_WINNER_COUNT; rank += 1) {
    if (occupiedRanks.has(rank)) continue;
    const candidate = await randomCandidate(env, roundId, selectedUsers);
    if (!candidate) break;
    const prizeNano = Math.max(0, Math.floor(Number(prizes[rank - 1]?.prizeNano) || 0));
    const winnerId = `lw_${randomHex(24)}`;
    const result = await env.DB.prepare(`INSERT OR IGNORE INTO lottery_winners
      (id,round_id,rank,user_id,ticket_id,ticket_code,prize_nano,payout_status,paid_at,created_at)
      VALUES (?,?,?,?,?,?,?,'pending',NULL,CURRENT_TIMESTAMP)`)
      .bind(winnerId, roundId, rank, candidate.user_id, candidate.id, candidate.code, prizeNano).run();
    if (Number(result.meta?.changes || 0) > 0) {
      selectedUsers.push(candidate.user_id);
      occupiedRanks.add(rank);
    } else {
      const saved = await env.DB.prepare('SELECT rank,user_id FROM lottery_winners WHERE round_id=? AND rank=? LIMIT 1')
        .bind(roundId, rank).first<ExistingWinnerRow>();
      if (saved?.user_id && !selectedUsers.includes(saved.user_id)) selectedUsers.push(saved.user_id);
      if (saved?.rank) occupiedRanks.add(Number(saved.rank));
    }
  }

  await payPendingLotteryWinners(env, roundId);
  return getLotteryWinners(env, roundId);
}

async function randomCandidate(env: Env, roundId: string, excludedUsers: string[]): Promise<CandidateRow | null> {
  const exclusion = excludedUsers.length ? ` AND user_id NOT IN (${excludedUsers.map(() => '?').join(',')})` : '';
  const countSql = `SELECT COUNT(*) AS count FROM lottery_tickets
    WHERE round_id=? AND COALESCE(NULLIF(ticket_code,''),substr(ticket_number,-5))!=''${exclusion}`;
  const countRow = await env.DB.prepare(countSql).bind(roundId, ...excludedUsers).first<{ count: number }>();
  const count = Math.max(0, Math.floor(Number(countRow?.count || 0)));
  if (!count) return null;

  const offset = secureRandomIndex(count);
  const rowSql = `SELECT id,user_id,COALESCE(NULLIF(ticket_code,''),substr(ticket_number,-5)) AS code
    FROM lottery_tickets
    WHERE round_id=? AND COALESCE(NULLIF(ticket_code,''),substr(ticket_number,-5))!=''${exclusion}
    ORDER BY datetime(created_at) ASC,id ASC LIMIT 1 OFFSET ?`;
  const row = await env.DB.prepare(rowSql).bind(roundId, ...excludedUsers, offset).first<CandidateRow>();
  if (!row) return null;
  const code = String(row.code || '').replace(/[^0-9]/g, '').slice(-5).padStart(5, '0');
  if (!/^\d{5}$/.test(code)) return null;
  return { id: row.id, user_id: row.user_id, code };
}

async function payPendingLotteryWinners(env: Env, roundId: string): Promise<void> {
  await ensureTonBalanceColumn(env);
  await ensureTonTransactionsTable(env);
  const rows = await env.DB.prepare(`SELECT * FROM lottery_winners
    WHERE round_id=? AND payout_status='pending' ORDER BY rank ASC`)
    .bind(roundId).all<WinnerRow>();

  for (const row of rows.results || []) {
    const amount = Math.max(0, Math.floor(Number(row.prize_nano) || 0));
    if (amount <= 0) {
      await env.DB.prepare(`UPDATE lottery_winners SET payout_status='paid',paid_at=CURRENT_TIMESTAMP
        WHERE id=? AND payout_status='pending'`).bind(row.id).run();
      continue;
    }

    const txnId = `txn_${randomHex(22)}`;
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO app_users (telegram_user_id,current_section,ton_balance_nano,last_seen_at,updated_at)
        VALUES (?,'home',0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        ON CONFLICT(telegram_user_id) DO NOTHING`).bind(row.user_id),
      env.DB.prepare(`UPDATE app_users SET ton_balance_nano=ton_balance_nano+?,updated_at=CURRENT_TIMESTAMP
        WHERE telegram_user_id=? AND EXISTS (
          SELECT 1 FROM lottery_winners WHERE id=? AND payout_status='pending'
        )`).bind(amount, row.user_id, row.id),
      env.DB.prepare(`INSERT INTO ton_transactions
        (id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at)
        SELECT ?,?,'adjustment',?,NULL,?,u.ton_balance_nano,'completed',?,'lottery_prize',?,CURRENT_TIMESTAMP
        FROM app_users u
        WHERE u.telegram_user_id=? AND EXISTS (
          SELECT 1 FROM lottery_winners WHERE id=? AND payout_status='pending'
        )`).bind(
          txnId,
          row.user_id,
          `Lottery prize #${row.rank}`,
          amount,
          row.id,
          JSON.stringify({ section: 'home', feature: 'lottery', currency: 'GRAM', roundId, rank: row.rank, ticketCode: row.ticket_code }),
          row.user_id,
          row.id,
        ),
      env.DB.prepare(`UPDATE lottery_winners SET payout_status='paid',paid_at=CURRENT_TIMESTAMP
        WHERE id=? AND payout_status='pending'`).bind(row.id),
    ]);
  }
}

function publicWinner(row: WinnerRow): LotteryWinner {
  const username = cleanUsername(row.username);
  const firstName = String(row.first_name || '').trim().slice(0, 80);
  const suffix = String(row.user_id || '').slice(-4);
  const displayName = firstName || (username ? `@${username}` : `Player ${suffix || '—'}`);
  const code = String(row.ticket_code || '').replace(/[^0-9]/g, '').slice(-5).padStart(5, '0');
  return {
    id: row.id,
    roundId: row.round_id,
    rank: Math.max(1, Math.min(LOTTERY_WINNER_COUNT, Math.floor(Number(row.rank) || 1))),
    displayName,
    username: username || null,
    avatarUrl: username ? `https://t.me/i/userpic/320/${encodeURIComponent(username)}.jpg` : null,
    level: Math.max(1, Math.floor(Number(row.level) || 1)),
    ticketCode: code,
    prizeNano: Math.max(0, Math.floor(Number(row.prize_nano) || 0)),
    paid: String(row.payout_status || '') === 'paid',
    createdAt: String(row.created_at || ''),
  };
}

function cleanRank(value: unknown): number {
  const rank = Math.floor(Number(value));
  if (!Number.isSafeInteger(rank) || rank < 1 || rank > LOTTERY_WINNER_COUNT) throw new Error(`Rank must be 1-${LOTTERY_WINNER_COUNT}`);
  return rank;
}

function cleanPrize(value: unknown): number {
  const amount = Math.floor(Number(value));
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_PRIZE_NANO) throw new Error('Invalid Lottery prize');
  return amount;
}

function cleanUsername(value: unknown): string {
  return String(value || '').replace(/^@+/, '').replace(/[^0-9A-Za-z_]/g, '').slice(0, 64);
}

function secureRandomIndex(maxExclusive: number): number {
  const maxValue = Math.floor(Number(maxExclusive));
  if (!Number.isSafeInteger(maxValue) || maxValue <= 0 || maxValue > 0x1_0000_0000) throw new Error('Invalid random range');
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / maxValue) * maxValue;
  const bytes = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= limit);
  return value % maxValue;
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, length);
}

import type { Env } from './types';
import { recordTonTransaction, type TonTransactionMeta } from './ton-transactions';

export type UserSectionBlock = {
  sectionId: string;
  blocked: boolean;
  expiresAt: string | null;
  remainingMs: number | null;
};

export type UserControls = {
  userId: string;
  banned: boolean;
  tonBalanceNano: number;
  winChancePercent: number;
  blockedSections: string[];
  sectionBlocks: UserSectionBlock[];
};

const VALID_SECTIONS = new Set(['home', 'plinko', 'playzone', 'mines', 'crash', 'wheel', 'dice', 'tower', 'slot', 'coinflip', 'hilo', 'ghostrun']);

type StoredUserControls = {
  userId?: string;
  blockedSections?: unknown;
  winChancePercent?: unknown;
  banned?: boolean;
};

type StoredSectionBlock = { sectionId?: unknown; blocked?: unknown; expiresAt?: unknown };
type UserControlRow = { blocked_sections_json: string; win_chance_percent?: number | null; banned?: number | null };

export async function getUserControls(env: Env, userId: string): Promise<UserControls> {
  const id = cleanUserId(userId);
  const saved = await readSectionControls(env, id);
  const sectionBlocks = normalizeSectionBlocks(saved?.blockedSections);
  return {
    userId: id,
    banned: saved?.banned === true,
    tonBalanceNano: await readUserTonBalance(env, id),
    winChancePercent: normalizeWinChance(saved?.winChancePercent),
    blockedSections: sectionBlocks.filter((item) => item.blocked).map((item) => item.sectionId),
    sectionBlocks,
  };
}

export async function setUserTonBalance(env: Env, userId: string, tonBalanceNano: number, meta: TonTransactionMeta = {}): Promise<UserControls> {
  const id = cleanUserId(userId);
  const before = await readUserTonBalance(env, id);
  await writeUserTonBalance(env, id, tonBalanceNano);
  const after = await readUserTonBalance(env, id);
  await recordTonTransaction(env, id, after - before, after, { kind: 'admin', title: 'Admin balance update', ...meta });
  return getUserControls(env, id);
}

export async function adjustUserTonBalance(env: Env, userId: string, deltaNano: number, meta: TonTransactionMeta = {}): Promise<UserControls> {
  const id = cleanUserId(userId);
  const before = await readUserTonBalance(env, id);
  await addUserTonBalance(env, id, deltaNano);
  const after = await readUserTonBalance(env, id);
  await recordTonTransaction(env, id, after - before, after, meta);
  return getUserControls(env, id);
}

export async function applyGameTonBalanceDelta(env: Env, userId: string, deltaNano: number, meta: TonTransactionMeta = {}): Promise<UserControls> {
  const id = cleanUserId(userId);
  if ((await getUserControls(env, id)).banned) throw new Error('Your access to all sections is blocked.');
  const baseDelta = Math.floor(Number(deltaNano) || 0);
  const before = await readUserTonBalance(env, id);
  await addUserTonBalance(env, id, baseDelta);
  const after = await readUserTonBalance(env, id);
  await recordTonTransaction(env, id, after - before, after, { kind: 'game', title: baseDelta >= 0 ? 'Game reward' : 'Game bet', ...meta, metadata: { ...(meta.metadata || {}), requestedDeltaNano: baseDelta } });
  return getUserControls(env, id);
}

export async function debitUserTonBalanceIfEnough(env: Env, userId: string, amountNano: number, meta: TonTransactionMeta = {}): Promise<UserControls> {
  const id = cleanUserId(userId);
  if ((await getUserControls(env, id)).banned) throw new Error('Your access to all sections is blocked.');
  const amount = normalizeNano(amountNano);
  if (amount <= 0) throw new Error('Invalid purchase amount');
  await ensureTonBalanceColumn(env);
  await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, current_section, ton_balance_nano, last_seen_at, updated_at)
    VALUES (?, 'home', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_user_id) DO NOTHING`).bind(id).run();
  const result = await env.DB.prepare(`UPDATE app_users
    SET ton_balance_nano = ton_balance_nano - ?, updated_at = CURRENT_TIMESTAMP
    WHERE telegram_user_id = ? AND ton_balance_nano >= ?`).bind(amount, id, amount).run();
  if ((result.meta?.changes || 0) <= 0) throw new Error('Insufficient balance');
  const after = await readUserTonBalance(env, id);
  await recordTonTransaction(env, id, -amount, after, { kind: 'adjustment', title: 'TON debit', ...meta });
  return getUserControls(env, id);
}

export async function setUserSectionBlocked(env: Env, userId: string, sectionId: string, blocked: boolean, expiresAtInput: unknown = null): Promise<UserControls> {
  const id = cleanUserId(userId);
  const section = cleanSection(sectionId);
  if (!VALID_SECTIONS.has(section)) throw new Error('Unknown section');
  const current = await getUserControls(env, id);
  const expiresAt = blocked ? normalizeExpiresAt(expiresAtInput) : null;
  const next = current.sectionBlocks.filter((item) => item.sectionId !== section);
  if (blocked) next.push({ sectionId: section, blocked: true, expiresAt, remainingMs: expiresAt ? Math.max(0, Date.parse(expiresAt) - Date.now()) : null });
  await saveControls(env, id, next, current.winChancePercent, current.banned);
  return getUserControls(env, id);
}

export async function setUserBanned(env: Env, userId: string, banned: boolean): Promise<UserControls> {
  const id = cleanUserId(userId);
  const current = await getUserControls(env, id);
  await saveControls(env, id, current.sectionBlocks, current.winChancePercent, banned);
  return getUserControls(env, id);
}

export async function setUserWinChance(env: Env, userId: string, winChancePercent: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  const current = await getUserControls(env, id);
  await saveControls(env, id, current.sectionBlocks, normalizeWinChance(winChancePercent), current.banned);
  return getUserControls(env, id);
}

export async function assertUserNotBanned(env: Env, userId: string): Promise<void> {
  const controls = await getUserControls(env, userId);
  if (controls.banned) throw new Error('Your access to all sections is blocked.');
}

export async function publicUserControls(env: Env, userId: string): Promise<{ userId: string; banned: boolean; tonBalanceNano: number; winChancePercent: number; blockedSections: string[]; sectionBlocks: UserSectionBlock[] }> {
  const controls = await getUserControls(env, userId);
  return { userId: controls.userId, banned: controls.banned, tonBalanceNano: controls.tonBalanceNano, winChancePercent: controls.winChancePercent, blockedSections: controls.blockedSections, sectionBlocks: controls.sectionBlocks };
}

async function readSectionControls(env: Env, userId: string): Promise<StoredUserControls | null> {
  try {
    await ensureUserControlsTable(env);
    const row = await env.DB.prepare('SELECT blocked_sections_json, win_chance_percent, banned FROM user_controls WHERE user_id = ?').bind(userId).first<UserControlRow>();
    if (row) return { userId, blockedSections: row.blocked_sections_json ? JSON.parse(row.blocked_sections_json) : [], winChancePercent: row.win_chance_percent, banned: Number(row.banned || 0) === 1 };
  } catch (error) {
    console.warn('read user section controls from D1 failed', error);
  }
  return env.BOT_CACHE.get(key(userId), 'json').catch(() => null) as Promise<StoredUserControls | null>;
}

async function saveControls(env: Env, userId: string, sectionBlocks: UserSectionBlock[], winChancePercent: number, banned = false): Promise<void> {
  await ensureUserControlsTable(env);
  await env.DB.prepare(`INSERT INTO user_controls (user_id, blocked_sections_json, win_chance_percent, banned, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      blocked_sections_json = excluded.blocked_sections_json,
      win_chance_percent = excluded.win_chance_percent,
      banned = excluded.banned,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, JSON.stringify(normalizeSectionBlocks(sectionBlocks)), normalizeWinChance(winChancePercent), banned ? 1 : 0)
    .run();
}

async function ensureUserControlsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_controls (
    user_id TEXT PRIMARY KEY,
    blocked_sections_json TEXT NOT NULL DEFAULT '[]',
    win_chance_percent INTEGER NOT NULL DEFAULT 50,
    banned INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('ALTER TABLE user_controls ADD COLUMN win_chance_percent INTEGER NOT NULL DEFAULT 50').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE user_controls ADD COLUMN banned INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
}

export async function ensureTonBalanceColumn(env: Env): Promise<void> {
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN ton_balance_nano INTEGER NOT NULL DEFAULT 0').run().catch(() => undefined);
}

async function readUserTonBalance(env: Env, userId: string): Promise<number> {
  await ensureTonBalanceColumn(env);
  const app = await env.DB.prepare('SELECT ton_balance_nano FROM app_users WHERE telegram_user_id = ?').bind(userId).first<{ ton_balance_nano: number }>().catch(() => null);
  return normalizeNano(app?.ton_balance_nano ?? 0);
}

async function writeUserTonBalance(env: Env, userId: string, tonBalanceNano: number): Promise<void> {
  await ensureTonBalanceColumn(env);
  const value = normalizeNano(tonBalanceNano);
  await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, current_section, ton_balance_nano, last_seen_at, updated_at)
    VALUES (?, 'home', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_user_id) DO UPDATE SET
      ton_balance_nano = excluded.ton_balance_nano,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, value)
    .run();
}

async function addUserTonBalance(env: Env, userId: string, deltaNano: number): Promise<void> {
  await ensureTonBalanceColumn(env);
  const value = Math.floor(Number(deltaNano) || 0);
  await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, current_section, ton_balance_nano, last_seen_at, updated_at)
    VALUES (?, 'home', max(0, ?), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_user_id) DO UPDATE SET
      ton_balance_nano = max(0, ton_balance_nano + ?),
      updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, value, value)
    .run();
}

function normalizeSectionBlocks(value: unknown): UserSectionBlock[] {
  const now = Date.now();
  const raw = Array.isArray(value) ? value : [];
  const entries = raw.map((item): StoredSectionBlock => typeof item === 'string' ? { sectionId: item, blocked: true } : (item ?? {}) as StoredSectionBlock);
  const map = new Map<string, UserSectionBlock>();
  for (const item of entries) {
    const sectionId = cleanSection(item.sectionId);
    if (!VALID_SECTIONS.has(sectionId)) continue;
    const expiresAt = normalizeExpiresAt(item.expiresAt);
    if (expiresAt && Date.parse(expiresAt) <= now) continue;
    const blocked = item.blocked !== false;
    if (!blocked) continue;
    map.set(sectionId, { sectionId, blocked: true, expiresAt, remainingMs: expiresAt ? Math.max(0, Date.parse(expiresAt) - now) : null });
  }
  return Array.from(map.values()).sort((a, b) => a.sectionId.localeCompare(b.sectionId));
}

function normalizeExpiresAt(value: unknown): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function normalizeNano(value: unknown): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function normalizeWinChance(value: unknown): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

function cleanGameSection(value: unknown): string {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
}

function key(userId: string): string {
  return 'admin:user-controls:' + userId;
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function cleanSection(value: unknown): string {
  return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 40);
}

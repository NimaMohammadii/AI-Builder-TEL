import type { Env } from './types';

export type UserControls = {
  userId: string;
  tonBalanceNano: number;
  blockedSections: string[];
};

const VALID_SECTIONS = new Set(['home', 'connect', 'flow', 'plinko', 'playzone', 'mines']);

type StoredUserControls = {
  userId?: string;
  blockedSections?: unknown;
};

type UserControlRow = { blocked_sections_json: string };

export async function getUserControls(env: Env, userId: string): Promise<UserControls> {
  const id = cleanUserId(userId);
  const saved = await readSectionControls(env, id);
  return {
    userId: id,
    tonBalanceNano: await readUserTonBalance(env, id),
    blockedSections: normalizeBlockedSections(saved?.blockedSections),
  };
}

export async function setUserTonBalance(env: Env, userId: string, tonBalanceNano: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  await writeUserTonBalance(env, id, tonBalanceNano);
  return getUserControls(env, id);
}

export async function adjustUserTonBalance(env: Env, userId: string, deltaNano: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  await addUserTonBalance(env, id, deltaNano);
  return getUserControls(env, id);
}

export async function applyGameTonBalanceDelta(env: Env, userId: string, deltaNano: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  await addUserTonBalance(env, id, deltaNano);
  return getUserControls(env, id);
}

export async function setUserSectionBlocked(env: Env, userId: string, sectionId: string, blocked: boolean): Promise<UserControls> {
  const id = cleanUserId(userId);
  const section = cleanSection(sectionId);
  if (!VALID_SECTIONS.has(section)) throw new Error('Unknown section');
  const current = await getUserControls(env, id);
  const set = new Set(current.blockedSections);
  if (blocked) set.add(section); else set.delete(section);
  await saveSectionControls(env, id, Array.from(set));
  return getUserControls(env, id);
}

export async function publicUserControls(env: Env, userId: string): Promise<{ userId: string; tonBalanceNano: number; blockedSections: string[] }> {
  const controls = await getUserControls(env, userId);
  return { userId: controls.userId, tonBalanceNano: controls.tonBalanceNano, blockedSections: controls.blockedSections };
}

async function readSectionControls(env: Env, userId: string): Promise<StoredUserControls | null> {
  try {
    await ensureUserControlsTable(env);
    const row = await env.DB.prepare('SELECT blocked_sections_json FROM user_controls WHERE user_id = ?').bind(userId).first<UserControlRow>();
    if (row?.blocked_sections_json) return { userId, blockedSections: JSON.parse(row.blocked_sections_json) };
  } catch (error) {
    console.warn('read user section controls from D1 failed', error);
  }
  return env.BOT_CACHE.get(key(userId), 'json').catch(() => null) as Promise<StoredUserControls | null>;
}

async function saveSectionControls(env: Env, userId: string, blockedSections: string[]): Promise<void> {
  await ensureUserControlsTable(env);
  await env.DB.prepare(`INSERT INTO user_controls (user_id, blocked_sections_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      blocked_sections_json = excluded.blocked_sections_json,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, JSON.stringify(normalizeBlockedSections(blockedSections)))
    .run();
}

async function ensureUserControlsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_controls (
    user_id TEXT PRIMARY KEY,
    blocked_sections_json TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
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

function normalizeBlockedSections(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((section): section is string => typeof section === 'string' && VALID_SECTIONS.has(section)) : [];
}

function normalizeNano(value: unknown): number {
  return Math.max(0, Math.floor(Number(value) || 0));
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

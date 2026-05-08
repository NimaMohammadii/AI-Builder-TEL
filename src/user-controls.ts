import type { Env } from './types';

export type UserControls = {
  userId: string;
  credit: number | null;
  blockedSections: string[];
};

const DEFAULT_CREDIT = 1000;
const VALID_SECTIONS = new Set(['home', 'connect', 'flow', 'plinko']);

type StoredUserControls = {
  userId?: string;
  blockedSections?: unknown;
};

export async function getUserControls(env: Env, userId: string): Promise<UserControls> {
  const id = cleanUserId(userId);
  const saved = await env.BOT_CACHE.get(key(id), 'json').catch(() => null) as StoredUserControls | null;
  return {
    userId: id,
    credit: await readAppUserCredit(env, id),
    blockedSections: Array.isArray(saved?.blockedSections) ? saved.blockedSections.filter((section): section is string => typeof section === 'string' && VALID_SECTIONS.has(section)) : [],
  };
}

export async function setUserCredit(env: Env, userId: string, credit: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  await writeAppUserCredit(env, id, credit);
  return getUserControls(env, id);
}

export async function adjustUserCredit(env: Env, userId: string, delta: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  const existing = await readAppUserCredit(env, id);
  await writeAppUserCredit(env, id, Math.max(0, existing + Math.floor(Number(delta) || 0)));
  return getUserControls(env, id);
}

export async function applyGameCreditDelta(env: Env, userId: string, delta: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  const existing = await readAppUserCredit(env, id);
  await writeAppUserCredit(env, id, Math.max(0, existing + Math.floor(Number(delta) || 0)));
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

export async function publicUserControls(env: Env, userId: string): Promise<{ userId: string; credit: number | null; blockedSections: string[] }> {
  const controls = await getUserControls(env, userId);
  return { userId: controls.userId, credit: controls.credit, blockedSections: controls.blockedSections };
}

async function saveSectionControls(env: Env, userId: string, blockedSections: string[]): Promise<void> {
  await env.BOT_CACHE.put(key(userId), JSON.stringify({ userId, blockedSections }));
}

async function readAppUserCredit(env: Env, userId: string): Promise<number> {
  const app = await env.DB.prepare('SELECT credit FROM app_users WHERE telegram_user_id = ?').bind(userId).first<{ credit: number }>().catch(() => null);
  return normalizeCredit(app?.credit ?? DEFAULT_CREDIT);
}

async function writeAppUserCredit(env: Env, userId: string, credit: number): Promise<void> {
  const value = normalizeCredit(credit);
  await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, current_section, credit, last_seen_at, updated_at)
    VALUES (?, 'home', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_user_id) DO UPDATE SET
      credit = excluded.credit,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(userId, value)
    .run();
}

function normalizeCredit(value: unknown): number {
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

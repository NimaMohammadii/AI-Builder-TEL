import type { Env } from './types';

export type UserControls = {
  userId: string;
  credit: number | null;
  blockedSections: string[];
  creditSource?: 'admin' | 'game' | 'system';
  creditUpdatedAt?: number;
};

const VALID_SECTIONS = new Set(['home', 'connect', 'flow', 'plinko']);

export async function getUserControls(env: Env, userId: string): Promise<UserControls> {
  const id = cleanUserId(userId);
  const saved = await env.BOT_CACHE.get(key(id), 'json').catch(() => null) as Partial<UserControls> | null;
  return {
    userId: id,
    credit: typeof saved?.credit === 'number' ? normalizeCredit(saved.credit) : await readKnownUserCredit(env, id),
    blockedSections: Array.isArray(saved?.blockedSections) ? saved.blockedSections.filter((section) => VALID_SECTIONS.has(section)) : [],
    creditSource: saved?.creditSource === 'admin' || saved?.creditSource === 'game' || saved?.creditSource === 'system' ? saved.creditSource : undefined,
    creditUpdatedAt: typeof saved?.creditUpdatedAt === 'number' ? saved.creditUpdatedAt : undefined,
  };
}

export async function setUserCredit(env: Env, userId: string, credit: number): Promise<UserControls> {
  return writeUserCredit(env, userId, credit, 'admin');
}

export async function adjustUserCredit(env: Env, userId: string, delta: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  const current = await getUserControls(env, id);
  const existing = typeof current.credit === 'number' ? current.credit : await readKnownUserCredit(env, id);
  return writeUserCredit(env, id, Math.max(0, existing + Math.floor(Number(delta) || 0)), 'admin');
}

export async function syncActivityCredit(env: Env, userId: string, credit: number, creditChanged = false): Promise<number> {
  const id = cleanUserId(userId);
  const current = await getUserControls(env, id);

  if (!creditChanged) {
    const serverCredit = typeof current.credit === 'number' ? current.credit : await readKnownUserCredit(env, id);
    return normalizeCredit(serverCredit);
  }

  const next = await writeUserCredit(env, id, credit, 'game');
  return normalizeCredit(next.credit ?? 0);
}

export async function setUserSectionBlocked(env: Env, userId: string, sectionId: string, blocked: boolean): Promise<UserControls> {
  const id = cleanUserId(userId);
  const section = cleanSection(sectionId);
  if (!VALID_SECTIONS.has(section)) throw new Error('Unknown section');
  const current = await getUserControls(env, id);
  const set = new Set(current.blockedSections);
  if (blocked) set.add(section); else set.delete(section);
  const next: UserControls = { ...current, blockedSections: Array.from(set) };
  await save(env, next);
  return next;
}

export async function publicUserControls(env: Env, userId: string): Promise<{ userId: string; credit: number | null; blockedSections: string[] }> {
  const controls = await getUserControls(env, userId);
  return { userId: controls.userId, credit: controls.credit, blockedSections: controls.blockedSections };
}

async function writeUserCredit(env: Env, userId: string, credit: number, source: 'admin' | 'game' | 'system'): Promise<UserControls> {
  const id = cleanUserId(userId);
  const current = await getUserControls(env, id);
  const next: UserControls = {
    ...current,
    userId: id,
    credit: normalizeCredit(credit),
    creditSource: source,
    creditUpdatedAt: Date.now(),
  };
  await save(env, next);
  await updateKnownUserCredit(env, id, next.credit ?? 0);
  return next;
}

async function save(env: Env, controls: UserControls): Promise<void> {
  await env.BOT_CACHE.put(key(controls.userId), JSON.stringify(controls));
}

async function readKnownUserCredit(env: Env, userId: string): Promise<number> {
  const app = await env.DB.prepare('SELECT credit FROM app_users WHERE telegram_user_id = ?').bind(userId).first<{ credit: number }>().catch(() => null);
  if (app?.credit !== undefined) return normalizeCredit(app.credit);
  const bot = await env.DB.prepare('SELECT credit FROM bot_users WHERE telegram_user_id = ? ORDER BY datetime(COALESCE(last_seen_at, updated_at, created_at)) DESC LIMIT 1').bind(userId).first<{ credit: number }>().catch(() => null);
  return normalizeCredit(bot?.credit ?? 0);
}

async function updateKnownUserCredit(env: Env, userId: string, credit: number): Promise<void> {
  const value = normalizeCredit(credit);
  await env.DB.prepare('UPDATE app_users SET credit = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_user_id = ?').bind(value, userId).run().catch(() => null);
  await env.DB.prepare('UPDATE bot_users SET credit = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_user_id = ?').bind(value, userId).run().catch(() => null);
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

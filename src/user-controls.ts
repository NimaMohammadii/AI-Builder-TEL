import type { Env } from './types';

export type UserControls = {
  userId: string;
  credit: number | null;
  blockedSections: string[];
  creditSource?: 'admin' | 'activity';
  creditUpdatedAt?: number;
};

const VALID_SECTIONS = new Set(['home', 'connect', 'flow', 'plinko']);

export async function getUserControls(env: Env, userId: string): Promise<UserControls> {
  const id = cleanUserId(userId);
  const saved = await env.BOT_CACHE.get(key(id), 'json').catch(() => null) as Partial<UserControls> | null;
  return {
    userId: id,
    credit: typeof saved?.credit === 'number' ? Math.max(0, Math.floor(saved.credit)) : await readKnownUserCredit(env, id),
    blockedSections: Array.isArray(saved?.blockedSections) ? saved.blockedSections.filter((section) => VALID_SECTIONS.has(section)) : [],
    creditSource: saved?.creditSource === 'admin' || saved?.creditSource === 'activity' ? saved.creditSource : undefined,
    creditUpdatedAt: typeof saved?.creditUpdatedAt === 'number' ? saved.creditUpdatedAt : undefined,
  };
}

export async function setUserCredit(env: Env, userId: string, credit: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  const current = await getUserControls(env, id);
  const next: UserControls = {
    ...current,
    credit: normalizeCredit(credit),
    creditSource: 'admin',
    creditUpdatedAt: Date.now(),
  };
  await save(env, next);
  await updateKnownUserCredit(env, id, next.credit ?? 0);
  return next;
}

export async function adjustUserCredit(env: Env, userId: string, delta: number): Promise<UserControls> {
  const id = cleanUserId(userId);
  const current = await getUserControls(env, id);
  const existing = typeof current.credit === 'number' ? current.credit : await readKnownUserCredit(env, id);
  return setUserCredit(env, id, Math.max(0, existing + Math.floor(Number(delta) || 0)));
}

export async function syncActivityCredit(env: Env, userId: string, credit: number, creditChanged = false): Promise<number> {
  const id = cleanUserId(userId);
  const incoming = normalizeCredit(credit);
  const current = await getUserControls(env, id);

  if (current.creditSource === 'admin' && typeof current.credit === 'number' && !creditChanged) {
    const delivered: UserControls = {
      ...current,
      credit: current.credit,
      creditSource: 'activity',
      creditUpdatedAt: Date.now(),
    };
    await save(env, delivered);
    await updateKnownUserCredit(env, id, current.credit);
    return current.credit;
  }

  const next: UserControls = {
    ...current,
    credit: incoming,
    creditSource: 'activity',
    creditUpdatedAt: Date.now(),
  };
  await save(env, next);
  await updateKnownUserCredit(env, id, incoming);
  return incoming;
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

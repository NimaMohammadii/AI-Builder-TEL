import type { Env } from './types';

export type PlinkoVirtualUser = { name: string; amount: number };
export type PlinkoVirtualUsersConfig = { users: PlinkoVirtualUser[]; updatedAt?: string };

type AdminSettingRow = { value_json: string };

const KEY = 'admin:plinko-virtual-users';
const MIN_USERS = 1;
const MAX_USERS = 80;

export const DEFAULT_PLINKO_VIRTUAL_USERS: PlinkoVirtualUsersConfig = {
  users: [
    { name: 'Ari Stone @northdesk', amount: 5 }, { name: 'Maya Chen · London', amount: 10 },
    { name: 'Leo Novak @chainpilot', amount: 15 }, { name: 'Sofia Reed · Lisbon', amount: 7.5 },
    { name: 'Noah Brooks @tonlane', amount: 20 }, { name: 'Eva Morgan · Berlin', amount: 12 },
    { name: 'Lucas Gray @dropclub', amount: 25 }, { name: 'Nina Park · Seoul', amount: 3 },
    { name: 'Owen Blake @risklow', amount: 2 }, { name: 'Lara Quinn · Dubai', amount: 30 },
    { name: 'Milo Grant @plinko24', amount: 50 }, { name: 'Iris Hale · Toronto', amount: 1 },
    { name: 'Ryan Cole @fastbin', amount: 12.5 }, { name: 'Emma Fox · Sydney', amount: 8 },
    { name: 'Max Ward @whalechip', amount: 35 }, { name: 'Zara Mills · Paris', amount: 18 },
    { name: 'آراد نوا @aradton', amount: 6 }, { name: 'نیلا راد · تهران', amount: 4 },
    { name: 'کیان مهر @kianrush', amount: 9 }, { name: 'رها سام · شیراز', amount: 14 },
    { name: 'ماهان بیت @mahanbet', amount: 22 }, { name: 'الینا جم · تبریز', amount: 11 },
    { name: 'پارسا وین @parsawin', amount: 16 }, { name: 'سینا جت · کرج', amount: 28 },
  ],
};

export async function getPlinkoVirtualUsers(env: Env): Promise<PlinkoVirtualUsersConfig> {
  const saved = await readConfig(env);
  return saved ? normalizePlinkoVirtualUsers(saved) : cloneDefault();
}

export async function savePlinkoVirtualUsers(env: Env, value: unknown): Promise<PlinkoVirtualUsersConfig> {
  const config = normalizePlinkoVirtualUsers(value);
  config.updatedAt = new Date().toISOString();
  await writeConfig(env, config);
  return config;
}

export async function resetPlinkoVirtualUsers(env: Env): Promise<PlinkoVirtualUsersConfig> {
  const config = { ...cloneDefault(), updatedAt: new Date().toISOString() };
  await writeConfig(env, config);
  return config;
}

async function readConfig(env: Env): Promise<unknown | null> {
  try {
    await ensureAdminSettingsTable(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(KEY).first<AdminSettingRow>();
    if (row?.value_json) return JSON.parse(row.value_json);
  } catch (error) {
    console.warn('read plinko virtual users from D1 failed', error);
  }
  const raw = await env.BOT_CACHE.get(KEY).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function writeConfig(env: Env, config: PlinkoVirtualUsersConfig): Promise<void> {
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(KEY, JSON.stringify(config))
    .run();
  await env.BOT_CACHE.put(KEY, JSON.stringify(config)).catch(() => undefined);
}

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function normalizePlinkoVirtualUsers(input: any): PlinkoVirtualUsersConfig {
  const source = Array.isArray(input?.users) ? input.users : Array.isArray(input) ? input : DEFAULT_PLINKO_VIRTUAL_USERS.users;
  const users = source.map(normalizeUser).filter(Boolean).slice(0, MAX_USERS) as PlinkoVirtualUser[];
  return {
    users: users.length >= MIN_USERS ? users : cloneDefault().users,
    updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : undefined,
  };
}

function normalizeUser(value: any): PlinkoVirtualUser | null {
  const name = String(value?.name ?? '').replace(/[<>]/g, '').trim().slice(0, 80);
  const amount = roundAmount(value?.amount);
  if (!name || amount <= 0) return null;
  return { name, amount };
}

function roundAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.min(1_000_000, Math.round((amount + Number.EPSILON) * 100) / 100);
}

function cloneDefault(): PlinkoVirtualUsersConfig {
  return JSON.parse(JSON.stringify(DEFAULT_PLINKO_VIRTUAL_USERS)) as PlinkoVirtualUsersConfig;
}

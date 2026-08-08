import type { Env } from './types';

export type GhostRunVirtualBetOption = { amount: number; cashoutMultiplier: number };
export type GhostRunVirtualUser = { name: string; betSecond: number; bets: GhostRunVirtualBetOption[] };
export type GhostRunVirtualUsersConfig = { users: GhostRunVirtualUser[]; updatedAt?: string };

type AdminSettingRow = { value_json: string };

const KEY = 'admin:ghost-run-virtual-users';
const MIN_USERS = 1;
const MAX_USERS = 100;
const MAX_OPTIONS = 12;

export const DEFAULT_GHOST_RUN_VIRTUAL_USERS: GhostRunVirtualUsersConfig = {
  users: [
    { name: 'NightFox', betSecond: 0.4, bets: [{ amount: 0.35, cashoutMultiplier: 1.18 }, { amount: 0.8, cashoutMultiplier: 1.42 }, { amount: 1.6, cashoutMultiplier: 1.9 }] },
    { name: 'MiraShade', betSecond: 1.1, bets: [{ amount: 0.5, cashoutMultiplier: 1.26 }, { amount: 1.25, cashoutMultiplier: 1.68 }, { amount: 2.4, cashoutMultiplier: 2.35 }] },
    { name: 'GhostWalker', betSecond: 1.8, bets: [{ amount: 0.2, cashoutMultiplier: 1.34 }, { amount: 0.9, cashoutMultiplier: 1.82 }, { amount: 3.1, cashoutMultiplier: 2.8 }] },
    { name: 'NoirRun', betSecond: 2.5, bets: [{ amount: 0.65, cashoutMultiplier: 1.22 }, { amount: 1.8, cashoutMultiplier: 1.55 }, { amount: 4.2, cashoutMultiplier: 3.15 }] },
    { name: 'RavenX', betSecond: 3.2, bets: [{ amount: 0.4, cashoutMultiplier: 1.4 }, { amount: 1.4, cashoutMultiplier: 2.05 }, { amount: 2.8, cashoutMultiplier: 3.6 }] },
    { name: 'سایه شب', betSecond: 3.9, bets: [{ amount: 0.3, cashoutMultiplier: 1.31 }, { amount: 1.1, cashoutMultiplier: 1.76 }, { amount: 2.2, cashoutMultiplier: 2.65 }] },
    { name: 'روح سرخ', betSecond: 4.6, bets: [{ amount: 0.75, cashoutMultiplier: 1.16 }, { amount: 1.9, cashoutMultiplier: 1.48 }, { amount: 5, cashoutMultiplier: 3.9 }] },
    { name: 'Midnight99', betSecond: 5.3, bets: [{ amount: 0.25, cashoutMultiplier: 1.52 }, { amount: 0.7, cashoutMultiplier: 2.15 }, { amount: 1.7, cashoutMultiplier: 4.2 }] },
  ],
};

export async function getGhostRunVirtualUsers(env: Env): Promise<GhostRunVirtualUsersConfig> {
  const saved = await readConfig(env);
  return saved ? normalizeGhostRunVirtualUsers(saved) : cloneDefault();
}

export async function saveGhostRunVirtualUsers(env: Env, value: unknown): Promise<GhostRunVirtualUsersConfig> {
  const config = normalizeGhostRunVirtualUsers(value);
  config.updatedAt = new Date().toISOString();
  await writeConfig(env, config);
  return config;
}

export async function resetGhostRunVirtualUsers(env: Env): Promise<GhostRunVirtualUsersConfig> {
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
    console.warn('read ghost run virtual users from D1 failed', error);
  }
  const raw = await env.BOT_CACHE.get(KEY).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function writeConfig(env: Env, config: GhostRunVirtualUsersConfig): Promise<void> {
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

function normalizeGhostRunVirtualUsers(input: any): GhostRunVirtualUsersConfig {
  const source = Array.isArray(input?.users) ? input.users : Array.isArray(input) ? input : DEFAULT_GHOST_RUN_VIRTUAL_USERS.users;
  const users = source.map(normalizeUser).filter(Boolean).slice(0, MAX_USERS) as GhostRunVirtualUser[];
  return { users: users.length >= MIN_USERS ? users : cloneDefault().users, updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : undefined };
}

function normalizeUser(value: any): GhostRunVirtualUser | null {
  const name = String(value?.name ?? '').replace(/[<>]/g, '').trim().slice(0, 80);
  const sourceOptions = Array.isArray(value?.bets) ? value.bets : Array.isArray(value?.options) ? value.options : [];
  const betSecond = normalizeBetSecond(value?.betSecond ?? value?.delaySecond);
  const bets = sourceOptions.map(normalizeBet).filter(Boolean).slice(0, MAX_OPTIONS) as GhostRunVirtualBetOption[];
  if (!name || bets.length < 1) return null;
  return { name, betSecond, bets };
}

function normalizeBet(value: any): GhostRunVirtualBetOption | null {
  const amount = roundAmount(value?.amount);
  const cashoutMultiplier = roundMultiplier(value?.cashoutMultiplier ?? value?.multiplier);
  if (amount <= 0 || cashoutMultiplier < 1.01) return null;
  return { amount, cashoutMultiplier };
}

function normalizeBetSecond(value: unknown): number {
  const second = Number(value);
  if (!Number.isFinite(second) || second < 0) return 0;
  return Math.min(6.5, Math.round((second + Number.EPSILON) * 10) / 10);
}

function roundAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.min(1_000_000, Math.round((amount + Number.EPSILON) * 100) / 100);
}

function roundMultiplier(value: unknown): number {
  const multiplier = Number(value);
  if (!Number.isFinite(multiplier) || multiplier < 1.01) return 0;
  return Math.min(60, Math.round((multiplier + Number.EPSILON) * 100) / 100);
}

function cloneDefault(): GhostRunVirtualUsersConfig {
  return JSON.parse(JSON.stringify(DEFAULT_GHOST_RUN_VIRTUAL_USERS)) as GhostRunVirtualUsersConfig;
}

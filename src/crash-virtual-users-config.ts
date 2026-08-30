import './crash-routes';
import type { Env } from './types';

export type CrashVirtualBetOption = { amount: number; cashoutMultiplier: number };
export type CrashVirtualUser = { name: string; betSecond: number; bets: CrashVirtualBetOption[] };
export type CrashVirtualUsersConfig = { users: CrashVirtualUser[]; updatedAt?: string };

type AdminSettingRow = { value_json: string };

const KEY = 'admin:crash-virtual-users';
const MIN_USERS = 1;
const MAX_USERS = 100;
const MAX_OPTIONS = 12;

export const DEFAULT_CRASH_VIRTUAL_USERS: CrashVirtualUsersConfig = {
  users: [
    { name: 'Ari Stone @crashdesk', betSecond: 1, bets: [{ amount: 5, cashoutMultiplier: 1.35 }, { amount: 12, cashoutMultiplier: 1.85 }, { amount: 25, cashoutMultiplier: 2.4 }] },
    { name: 'Maya Chen · London', betSecond: 2, bets: [{ amount: 8, cashoutMultiplier: 1.22 }, { amount: 18, cashoutMultiplier: 2.1 }, { amount: 35, cashoutMultiplier: 3.2 }] },
    { name: 'Leo Novak @rocketton', betSecond: 3, bets: [{ amount: 3, cashoutMultiplier: 1.55 }, { amount: 10, cashoutMultiplier: 2.75 }, { amount: 20, cashoutMultiplier: 4.5 }] },
    { name: 'Sofia Reed · Lisbon', betSecond: 4, bets: [{ amount: 7.5, cashoutMultiplier: 1.42 }, { amount: 14, cashoutMultiplier: 2.25 }, { amount: 30, cashoutMultiplier: 5.1 }] },
    { name: 'Noah Brooks @xpilot', betSecond: 5, bets: [{ amount: 20, cashoutMultiplier: 1.18 }, { amount: 45, cashoutMultiplier: 1.9 }, { amount: 80, cashoutMultiplier: 2.8 }] },
    { name: 'Eva Morgan · Berlin', betSecond: 6, bets: [{ amount: 2, cashoutMultiplier: 1.7 }, { amount: 9, cashoutMultiplier: 2.6 }, { amount: 16, cashoutMultiplier: 6.4 }] },
    { name: 'کیان مهر @kianrush', betSecond: 2, bets: [{ amount: 6, cashoutMultiplier: 1.28 }, { amount: 15, cashoutMultiplier: 2.2 }, { amount: 28, cashoutMultiplier: 3.75 }] },
    { name: 'رها سام · شیراز', betSecond: 4, bets: [{ amount: 4, cashoutMultiplier: 1.6 }, { amount: 11, cashoutMultiplier: 2.9 }, { amount: 22, cashoutMultiplier: 5.5 }] },
    { name: 'ماهان بیت @mahanbet', betSecond: 6, bets: [{ amount: 12, cashoutMultiplier: 1.32 }, { amount: 32, cashoutMultiplier: 2.05 }, { amount: 65, cashoutMultiplier: 3.4 }] },
    { name: 'نیلا راد · تهران', betSecond: 7, bets: [{ amount: 1.5, cashoutMultiplier: 1.95 }, { amount: 7, cashoutMultiplier: 3.1 }, { amount: 18, cashoutMultiplier: 7.2 }] },
  ],
};

export async function getCrashVirtualUsers(env: Env): Promise<CrashVirtualUsersConfig> {
  const saved = await readConfig(env);
  return saved ? normalizeCrashVirtualUsers(saved) : cloneDefault();
}

export async function saveCrashVirtualUsers(env: Env, value: unknown): Promise<CrashVirtualUsersConfig> {
  const config = normalizeCrashVirtualUsers(value);
  config.updatedAt = new Date().toISOString();
  await writeConfig(env, config);
  return config;
}

export async function resetCrashVirtualUsers(env: Env): Promise<CrashVirtualUsersConfig> {
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
    console.warn('read crash virtual users from D1 failed', error);
  }
  const raw = await env.BOT_CACHE.get(KEY).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function writeConfig(env: Env, config: CrashVirtualUsersConfig): Promise<void> {
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

function normalizeCrashVirtualUsers(input: any): CrashVirtualUsersConfig {
  const source = Array.isArray(input?.users) ? input.users : Array.isArray(input) ? input : DEFAULT_CRASH_VIRTUAL_USERS.users;
  const users = source.map(normalizeUser).filter(Boolean).slice(0, MAX_USERS) as CrashVirtualUser[];
  return { users: users.length >= MIN_USERS ? users : cloneDefault().users, updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : undefined };
}

function normalizeUser(value: any): CrashVirtualUser | null {
  const name = String(value?.name ?? '').replace(/[<>]/g, '').trim().slice(0, 80);
  const sourceOptions = Array.isArray(value?.bets) ? value.bets : Array.isArray(value?.options) ? value.options : [];
  const betSecond = normalizeBetSecond(value?.betSecond ?? value?.ghostBetSecond ?? value?.delaySecond);
  const bets = sourceOptions.map(normalizeBet).filter(Boolean).slice(0, MAX_OPTIONS) as CrashVirtualBetOption[];
  if (!name || bets.length < 1) return null;
  return { name, betSecond, bets };
}

function normalizeBet(value: any): CrashVirtualBetOption | null {
  const amount = roundAmount(value?.amount);
  const cashoutMultiplier = roundMultiplier(value?.cashoutMultiplier ?? value?.multiplier);
  if (amount <= 0 || cashoutMultiplier < 1.01) return null;
  return { amount, cashoutMultiplier };
}

function normalizeBetSecond(value: unknown): number {
  const second = Number(value);
  if (!Number.isFinite(second) || second < 0) return 0;
  return Math.min(8, Math.round((second + Number.EPSILON) * 10) / 10);
}

function roundAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.min(1_000_000, Math.round((amount + Number.EPSILON) * 100) / 100);
}

function roundMultiplier(value: unknown): number {
  const multiplier = Number(value);
  if (!Number.isFinite(multiplier) || multiplier < 1.01) return 0;
  return Math.min(50, Math.round((multiplier + Number.EPSILON) * 100) / 100);
}

function cloneDefault(): CrashVirtualUsersConfig {
  return JSON.parse(JSON.stringify(DEFAULT_CRASH_VIRTUAL_USERS)) as CrashVirtualUsersConfig;
}

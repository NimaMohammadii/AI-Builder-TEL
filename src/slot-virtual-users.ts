import type { Env } from './types';

export type SlotVirtualUser = { name: string; results: number[][] };
export type SlotVirtualUsersConfig = { users: SlotVirtualUser[]; updatedAt?: string };

type AdminSettingRow = { value_json: string };

const KEY = 'admin:slot-virtual-users';
const MIN_USERS = 1;
const MAX_USERS = 80;
const MAX_RESULTS_PER_USER = 12;
const REEL_COUNT = 3;
const SYMBOL_COUNT = 8;

export const DEFAULT_SLOT_VIRTUAL_USERS: SlotVirtualUsersConfig = {
  users: [
    { name: 'AriSpin', results: [[0, 0, 0], [1, 1, 0], [5, 5, 5]] },
    { name: 'MayaWin', results: [[1, 1, 1], [2, 2, 4], [6, 6, 6]] },
    { name: 'NimaLuck', results: [[2, 2, 2], [3, 3, 1], [7, 7, 7]] },
    { name: 'NoraLux', results: [[3, 3, 3], [4, 4, 0], [5, 5, 5]] },
    { name: 'KianRush', results: [[4, 4, 4], [0, 0, 2], [6, 6, 6]] },
    { name: 'ParsaKing', results: [[7, 7, 7], [5, 5, 5], [1, 1, 3]] },
    { name: 'سارا اسلات', results: [[0, 0, 0], [2, 2, 2], [6, 6, 6]] },
    { name: 'امیر وین', results: [[1, 1, 1], [4, 4, 3], [7, 7, 7]] },
  ],
};

export async function getSlotVirtualUsers(env: Env): Promise<SlotVirtualUsersConfig> {
  const saved = await readConfig(env);
  return saved ? normalizeSlotVirtualUsers(saved) : cloneDefault();
}

export async function saveSlotVirtualUsers(env: Env, value: unknown): Promise<SlotVirtualUsersConfig> {
  const config = normalizeSlotVirtualUsers(value);
  config.updatedAt = new Date().toISOString();
  await writeConfig(env, config);
  return config;
}

export async function resetSlotVirtualUsers(env: Env): Promise<SlotVirtualUsersConfig> {
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
    console.warn('read slot virtual users from D1 failed', error);
  }
  const raw = await env.BOT_CACHE.get(KEY).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function writeConfig(env: Env, config: SlotVirtualUsersConfig): Promise<void> {
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

function normalizeSlotVirtualUsers(input: any): SlotVirtualUsersConfig {
  const source = Array.isArray(input?.users) ? input.users : Array.isArray(input) ? input : DEFAULT_SLOT_VIRTUAL_USERS.users;
  const users = source.map(normalizeUser).filter(Boolean).slice(0, MAX_USERS) as SlotVirtualUser[];
  return {
    users: users.length >= MIN_USERS ? users : cloneDefault().users,
    updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : undefined,
  };
}

function normalizeUser(value: any): SlotVirtualUser | null {
  const name = String(value?.name ?? '').replace(/[<>]/g, '').trim().slice(0, 80);
  const rawResults = Array.isArray(value?.results) ? value.results : Array.isArray(value?.result) ? [value.result] : [];
  const results = rawResults.map(normalizeResult).filter(Boolean).slice(0, MAX_RESULTS_PER_USER) as number[][];
  if (!name || !results.length) return null;
  return { name, results };
}

function normalizeResult(value: any): number[] | null {
  const parts = Array.isArray(value) ? value : String(value ?? '').split(/[^0-9]+/);
  const result = parts.map((part: unknown) => clampSymbol(part)).filter((part: number | null): part is number => part !== null).slice(0, REEL_COUNT);
  return result.length === REEL_COUNT ? result : null;
}

function clampSymbol(value: unknown): number | null {
  const index = Math.floor(Number(value));
  if (!Number.isFinite(index)) return null;
  return Math.max(0, Math.min(SYMBOL_COUNT - 1, index));
}

function cloneDefault(): SlotVirtualUsersConfig {
  return JSON.parse(JSON.stringify(DEFAULT_SLOT_VIRTUAL_USERS)) as SlotVirtualUsersConfig;
}

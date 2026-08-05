import type { Env } from './types';

export type OnlineCountRange = { min: number; max: number };
export type OnlineCountSchedule = Record<string, OnlineCountRange[]>;
export type OnlineCountConfig = { schedule: OnlineCountSchedule; updatedAt?: string };

type AdminSettingRow = { value_json: string };

const KEY = 'admin:online-user-counts';
const SECTION_IDS = ['mines', 'plinko', 'wheel', 'dice', 'crash', 'hilo', 'coinflip', 'slot', 'ghostrun'];
const MAX_COUNT = 999_999;

export const ONLINE_COUNT_SECTIONS = SECTION_IDS.map((id) => ({ id, label: labelForSection(id) }));

export async function getOnlineUserCountConfig(env: Env): Promise<OnlineCountConfig> {
  const saved = await readConfig(env);
  return saved ? normalizeOnlineCountConfig(saved) : defaultOnlineCountConfig();
}

export async function saveOnlineUserCountConfig(env: Env, value: unknown): Promise<OnlineCountConfig> {
  const config = normalizeOnlineCountConfig(value);
  config.updatedAt = new Date().toISOString();
  await writeConfig(env, config);
  return config;
}

export async function resetOnlineUserCountConfig(env: Env): Promise<OnlineCountConfig> {
  const config = { ...defaultOnlineCountConfig(), updatedAt: new Date().toISOString() };
  await writeConfig(env, config);
  return config;
}

function defaultOnlineCountConfig(): OnlineCountConfig {
  const schedule: OnlineCountSchedule = {};
  for (const id of SECTION_IDS) schedule[id] = Array.from({ length: 24 }, (_, hour) => defaultCountFor(id, hour));
  return { schedule };
}

function defaultCountFor(id: string, hour: number): OnlineCountRange {
  const base = hour >= 5 && hour <= 11 ? [80, 220] : hour >= 12 && hour <= 16 ? [180, 360] : [500, 700];
  const hash = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const offset = ((hash + hour * 31) % 45);
  const min = Math.max(0, base[0] + offset);
  const max = Math.max(min, base[1] + offset);
  return { min, max };
}

async function readConfig(env: Env): Promise<unknown | null> {
  try {
    await ensureAdminSettingsTable(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(KEY).first<AdminSettingRow>();
    if (row?.value_json) return JSON.parse(row.value_json);
  } catch (error) {
    console.warn('read online user counts from admin_settings failed', error);
  }
  return null;
}

async function writeConfig(env: Env, config: OnlineCountConfig): Promise<void> {
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(KEY, JSON.stringify(config))
    .run();
}

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function normalizeOnlineCountConfig(input: any): OnlineCountConfig {
  const source = input && typeof input === 'object' ? input.schedule ?? input : {};
  const fallback = defaultOnlineCountConfig().schedule;
  const schedule: OnlineCountSchedule = {};
  for (const id of SECTION_IDS) {
    const values = Array.isArray(source?.[id]) ? source[id] : [];
    schedule[id] = Array.from({ length: 24 }, (_, hour) => normalizeRange(values[hour], fallback[id][hour]));
  }
  return { schedule, updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : undefined };
}

function normalizeRange(value: unknown, fallback: OnlineCountRange): OnlineCountRange {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const raw = value as { min?: unknown; max?: unknown };
    const min = normalizeCount(raw.min, fallback.min);
    const max = normalizeCount(raw.max, fallback.max);
    return min <= max ? { min, max } : { min: max, max: min };
  }
  const fixed = normalizeCount(value, fallback.min);
  return { min: fixed, max: fixed };
}

function normalizeCount(value: unknown, fallback: number): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? Math.max(0, Math.min(MAX_COUNT, n)) : fallback;
}

function labelForSection(id: string): string {
  const labels: Record<string, string> = { mines: 'Mines', plinko: 'Plinko', wheel: 'Wheel', dice: 'Dice', crash: 'Crash', hilo: 'Chicken Cross', coinflip: 'Pump', slot: 'Slot', ghostrun: 'Ghost Run' };
  return labels[id] || id;
}

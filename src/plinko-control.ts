import type { Env } from './types';

export type PlinkoRisk = 'low';
export type PlinkoMode = 'weighted';

export interface PlinkoRiskConfig {
  multipliers: number[];
  weights: number[];
}

export interface PlinkoRowsConfig {
  low: PlinkoRiskConfig;
}

export interface PlinkoControlConfig {
  enabled: boolean;
  mode: PlinkoMode;
  houseEdge: number;
  volatility: number;
  rows: Record<'13', PlinkoRowsConfig>;
  updatedAt?: string;
}

type AdminSettingRow = { value_json: string };

const KEY = 'admin:plinko-control';

export const DEFAULT_PLINKO_CONTROL: PlinkoControlConfig = {
  enabled: true,
  mode: 'weighted',
  houseEdge: 8,
  volatility: 50,
  rows: {
    '13': {
      low: {
        multipliers: [30, 5, 3.4, 2, 1.5, 1, 0.2, 0.2, 1, 1.5, 2, 3.4, 5, 30],
        weights: [1, 2, 3.5, 6, 9, 13, 15.5, 15.5, 13, 9, 6, 3.5, 2, 1],
      },
    },
  },
};

export async function getPlinkoControl(env: Env): Promise<PlinkoControlConfig> {
  const saved = await readConfig(env);
  return saved ? normalizePlinkoConfig(saved) : DEFAULT_PLINKO_CONTROL;
}

export async function savePlinkoControl(env: Env, value: unknown): Promise<PlinkoControlConfig> {
  const config = normalizePlinkoConfig(value);
  config.updatedAt = new Date().toISOString();
  await writeConfig(env, config);
  return config;
}

export async function resetPlinkoControl(env: Env): Promise<PlinkoControlConfig> {
  const config = { ...DEFAULT_PLINKO_CONTROL, updatedAt: new Date().toISOString() };
  await writeConfig(env, config);
  return config;
}

async function readConfig(env: Env): Promise<unknown | null> {
  try {
    await ensureAdminSettingsTable(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(KEY).first<AdminSettingRow>();
    if (row?.value_json) return JSON.parse(row.value_json);
  } catch (error) {
    console.warn('read plinko control from D1 failed', error);
  }
  const raw = await env.BOT_CACHE.get(KEY).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function writeConfig(env: Env, config: PlinkoControlConfig): Promise<void> {
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = CURRENT_TIMESTAMP`)
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

function normalizePlinkoConfig(input: any): PlinkoControlConfig {
  const base = JSON.parse(JSON.stringify(DEFAULT_PLINKO_CONTROL)) as PlinkoControlConfig;
  const out: PlinkoControlConfig = {
    enabled: input?.enabled !== false,
    mode: 'weighted',
    houseEdge: clampNumber(input?.houseEdge, 0, 60, base.houseEdge),
    volatility: clampNumber(input?.volatility, 0, 100, base.volatility),
    rows: base.rows,
    updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : undefined,
  };
  const expected = 14;
  const item = input?.rows?.['13']?.low ?? input?.rows?.['11']?.low ?? input?.rows?.['9']?.low ?? input?.rows?.['7']?.low;
  out.rows['13'].low = {
    multipliers: normalizeNumberArray(item?.multipliers, expected, base.rows['13'].low.multipliers, 0, 1000),
    weights: normalizeNumberArray(item?.weights, expected, base.rows['13'].low.weights, 0, 100000),
  };
  return out;
}

function normalizeNumberArray(value: unknown, expected: number, fallback: number[], min: number, max: number): number[] {
  const input = Array.isArray(value) ? value : String(value ?? '').split(',');
  const nums = input.map((v) => clampNumber(v, min, max, NaN)).filter((n) => Number.isFinite(n));
  if (nums.length !== expected) return fallback.slice(0, expected);
  return nums;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

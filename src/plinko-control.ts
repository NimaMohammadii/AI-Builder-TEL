import type { Env } from './types';

export type PlinkoRisk = 'low' | 'medium' | 'high';
export type PlinkoMode = 'fair' | 'weighted' | 'house';

export interface PlinkoRiskConfig {
  multipliers: number[];
  weights: number[];
}

export interface PlinkoRowsConfig {
  low: PlinkoRiskConfig;
  medium: PlinkoRiskConfig;
  high: PlinkoRiskConfig;
}

export interface PlinkoControlConfig {
  enabled: boolean;
  mode: PlinkoMode;
  houseEdge: number;
  volatility: number;
  rows: Record<'7' | '9' | '11', PlinkoRowsConfig>;
  updatedAt?: string;
}

type AdminSettingRow = { value_json: string };

const KEY = 'admin:plinko-control';

export const DEFAULT_PLINKO_CONTROL: PlinkoControlConfig = {
  enabled: true,
  mode: 'fair',
  houseEdge: 8,
  volatility: 50,
  rows: {
    '7': {
      low: { multipliers: [2, 1.4, 1.1, 0.9, 0.9, 0.9, 1.1, 1.4, 2], weights: [4, 7, 12, 18, 24, 18, 12, 7, 4] },
      medium: { multipliers: [5, 2, 1.2, 0.5, 0.5, 0.5, 1.2, 2, 5], weights: [2, 5, 12, 19, 24, 19, 12, 5, 2] },
      high: { multipliers: [12, 4, 1.5, 0.2, 0.2, 0.2, 1.5, 4, 12], weights: [1, 3, 8, 18, 40, 18, 8, 3, 1] },
    },
    '9': {
      low: { multipliers: [3, 1.6, 1.3, 1.1, 0.8, 0.8, 0.8, 1.1, 1.3, 1.6, 3], weights: [2, 4, 7, 11, 15, 22, 15, 11, 7, 4, 2] },
      medium: { multipliers: [8, 3, 1.6, 1.1, 0.4, 0.4, 0.4, 1.1, 1.6, 3, 8], weights: [1, 3, 6, 11, 17, 24, 17, 11, 6, 3, 1] },
      high: { multipliers: [25, 8, 3, 1.3, 0.2, 0.2, 0.2, 1.3, 3, 8, 25], weights: [0.5, 1.2, 3, 7, 15, 46.6, 15, 7, 3, 1.2, 0.5] },
    },
    '11': {
      low: { multipliers: [4, 1.8, 1.5, 1.2, 1, 0.85, 0.85, 0.85, 1, 1.2, 1.5, 1.8, 4], weights: [1, 2.5, 4, 6.5, 10, 14, 24, 14, 10, 6.5, 4, 2.5, 1] },
      medium: { multipliers: [14, 4, 2.2, 1.5, 1, 0.5, 0.5, 0.5, 1, 1.5, 2.2, 4, 14], weights: [0.5, 1, 2.5, 4.5, 8, 14, 39, 14, 8, 4.5, 2.5, 1, 0.5] },
      high: { multipliers: [60, 14, 6, 2.5, 1.2, 0.25, 0.25, 0.25, 1.2, 2.5, 6, 14, 60], weights: [0.2, 0.5, 1, 2.2, 4.8, 10, 62.6, 10, 4.8, 2.2, 1, 0.5, 0.2] },
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
  const mode: PlinkoMode = input?.mode === 'weighted' || input?.mode === 'house' || input?.mode === 'fair' ? input.mode : base.mode;
  const out: PlinkoControlConfig = {
    enabled: input?.enabled !== false,
    mode,
    houseEdge: clampNumber(input?.houseEdge, 0, 60, base.houseEdge),
    volatility: clampNumber(input?.volatility, 0, 100, base.volatility),
    rows: base.rows,
    updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : undefined,
  };
  (['7', '9', '11'] as const).forEach((rowKey) => {
    (['low', 'medium', 'high'] as const).forEach((risk) => {
      const expected = Number(rowKey) + 2;
      const item = input?.rows?.[rowKey]?.[risk] ?? input?.rows?.[rowKey]?.[risk.toString()];
      out.rows[rowKey][risk] = {
        multipliers: normalizeNumberArray(item?.multipliers, expected, base.rows[rowKey][risk].multipliers, 0, 1000),
        weights: normalizeNumberArray(item?.weights, expected, base.rows[rowKey][risk].weights, 0, 100000),
      };
    });
  });
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

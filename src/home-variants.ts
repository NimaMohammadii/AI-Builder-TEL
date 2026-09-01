import type { Env } from './types';

export type HomeVariant = 'one' | 'two';

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS miniapp_home_variant (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  active_variant TEXT NOT NULL CHECK (active_variant IN ('one', 'two')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export async function getActiveHomeVariant(env: Env): Promise<HomeVariant> {
  await env.DB.prepare(CREATE_TABLE).run();
  const row = await env.DB.prepare('SELECT active_variant FROM miniapp_home_variant WHERE singleton = 1')
    .first<{ active_variant: string }>();
  if (row?.active_variant === 'one' || row?.active_variant === 'two') return row.active_variant;
  await env.DB.prepare("INSERT OR IGNORE INTO miniapp_home_variant (singleton, active_variant) VALUES (1, 'one')").run();
  return 'one';
}

export async function setActiveHomeVariant(env: Env, variant: HomeVariant): Promise<void> {
  await env.DB.prepare(CREATE_TABLE).run();
  await env.DB.prepare(`INSERT INTO miniapp_home_variant (singleton, active_variant, updated_at)
    VALUES (1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(singleton) DO UPDATE SET active_variant = excluded.active_variant, updated_at = CURRENT_TIMESTAMP`)
    .bind(variant)
    .run();
}

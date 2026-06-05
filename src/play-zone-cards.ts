import type { Env } from './types';

export type PlayZoneCard = {
  id: string;
  label: string;
  hidden: boolean;
};

type AdminSettingRow = { value_json: string };

type SavedPlayZoneCards = {
  hidden?: string[];
};

const PLAY_ZONE_CARDS_KEY = 'admin:play-zone-cards';

export const PLAY_ZONE_CARD_DEFINITIONS = [
  { id: 'mines', label: 'Mines' },
  { id: 'plinko', label: 'Plinko' },
  { id: 'slot', label: 'Slot' },
  { id: 'rps', label: 'Rock Paper Scissors' },
  { id: 'wheel', label: 'Wheel' },
  { id: 'dice', label: 'Dice' },
  { id: 'crash', label: 'Crash' },
  { id: 'hilo', label: 'Chicken Cross' },
  { id: 'coinflip', label: 'Pump' },
] as const;

const PLAY_ZONE_CARD_IDS = new Set(PLAY_ZONE_CARD_DEFINITIONS.map((card) => card.id));

export async function getPlayZoneCards(env: Env): Promise<{ cards: PlayZoneCard[]; hidden: string[] }> {
  const saved = await readPlayZoneCardSettings(env);
  const hiddenSet = new Set((saved.hidden ?? []).map(normalizePlayZoneCardId).filter((id) => PLAY_ZONE_CARD_IDS.has(id)));
  const cards = PLAY_ZONE_CARD_DEFINITIONS.map((card) => ({ ...card, hidden: hiddenSet.has(card.id) }));
  return { cards, hidden: cards.filter((card) => card.hidden).map((card) => card.id) };
}

export async function setPlayZoneCardHidden(env: Env, cardId: unknown, hidden: unknown): Promise<{ cards: PlayZoneCard[]; hidden: string[] }> {
  const id = normalizeKnownPlayZoneCardId(cardId);
  const current = await getPlayZoneCards(env);
  const hiddenSet = new Set(current.hidden);
  if (Boolean(hidden)) hiddenSet.add(id);
  else hiddenSet.delete(id);
  await writePlayZoneCardSettings(env, { hidden: [...hiddenSet] });
  return getPlayZoneCards(env);
}

function normalizeKnownPlayZoneCardId(value: unknown): string {
  const id = normalizePlayZoneCardId(value);
  if (!PLAY_ZONE_CARD_IDS.has(id)) throw new Error('Unknown Play Zone card');
  return id;
}

function normalizePlayZoneCardId(value: unknown): string {
  return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').trim().toLowerCase().slice(0, 40);
}

async function readPlayZoneCardSettings(env: Env): Promise<SavedPlayZoneCards> {
  try {
    await ensureAdminSettingsTable(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(PLAY_ZONE_CARDS_KEY).first<AdminSettingRow>();
    if (row?.value_json) return JSON.parse(row.value_json) as SavedPlayZoneCards;
  } catch (error) {
    console.warn('read play zone cards from D1 failed', error);
  }
  return (await env.BOT_CACHE.get(PLAY_ZONE_CARDS_KEY, 'json').catch(() => null) as SavedPlayZoneCards | null) ?? {};
}

async function writePlayZoneCardSettings(env: Env, settings: SavedPlayZoneCards): Promise<void> {
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(PLAY_ZONE_CARDS_KEY, JSON.stringify(settings))
    .run();
  await env.BOT_CACHE.put(PLAY_ZONE_CARDS_KEY, JSON.stringify(settings)).catch(() => undefined);
}

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

import type { Env } from './types';

export type SectionLockMode = 'open' | 'locked' | 'code';
export type SectionLockImageKind = 'locked' | 'code';

export type SectionLock = {
  id: string;
  label: string;
  description: string;
  locked: boolean;
  mode: SectionLockMode;
  hasCode: boolean;
  hasImage: boolean;
  imageUrl: string | null;
  hasLockedImage: boolean;
  lockedImageUrl: string | null;
  hasCodeImage: boolean;
  codeImageUrl: string | null;
};

type SavedSectionLock = {
  locked?: boolean;
  mode?: SectionLockMode;
  code?: string;
};

type AdminSettingRow = { value_json: string };

const LOCKS_KEY = 'admin:section-locks';
export const SECTION_LOCK_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const DEFAULT_SECTIONS: Array<Omit<SectionLock, 'locked' | 'mode' | 'hasCode' | 'hasImage' | 'imageUrl' | 'hasLockedImage' | 'lockedImageUrl' | 'hasCodeImage' | 'codeImageUrl'>> = [
  { id: 'home', label: 'Home', description: 'Main landing section' },
  { id: 'connect', label: 'Connect', description: 'Bot connection section' },
  { id: 'playzone', label: 'Play Zone', description: 'Games hub section' },
  { id: 'flow', label: 'Text to Speech', description: 'TTS generator section' },
  { id: 'mines', label: 'Mines', description: 'Mines game card and access image' },
  { id: 'plinko', label: 'Plinko', description: 'Plinko game card and access image' },
  { id: 'crash', label: 'Crash', description: 'Crash game card image' },
  { id: 'wheel', label: 'Wheel', description: 'Wheel game card image' },
  { id: 'dice', label: 'Dice', description: 'Dice game card image' },
  { id: 'limbo', label: 'Limbo', description: 'Limbo game card image' },
  { id: 'tower', label: 'Tower', description: 'Tower game card image' },
  { id: 'coinflip', label: 'Coin Flip', description: 'Coin Flip game card image' },
  { id: 'hilo', label: 'Hi-Lo', description: 'Hi-Lo game card image' },
];

export async function getSectionLocks(env: Env): Promise<{ sections: SectionLock[] }> {
  const saved = await readLocks(env);
  const sections = await Promise.all(DEFAULT_SECTIONS.map(async (section) => {
    const item = saved[section.id];
    const mode = normalizeMode(item);
    const hasLockedImage = Boolean(await env.BOT_CACHE.get(sectionImageTypeKey(section.id, 'locked')).catch(() => null));
    const hasCodeImage = Boolean(await env.BOT_CACHE.get(sectionImageTypeKey(section.id, 'code')).catch(() => null));
    const legacyHasImage = Boolean(await env.BOT_CACHE.get(legacySectionImageTypeKey(section.id)).catch(() => null));
    const lockedVersion = await sectionImageVersion(env, section.id, 'locked');
    const codeVersion = await sectionImageVersion(env, section.id, 'code');
    const legacyVersion = await legacySectionImageVersion(env, section.id);
    const lockedImageUrl = hasLockedImage ? `/app/api/section-lock-image/${section.id}/locked.png?v=${lockedVersion}` : legacyHasImage ? `/app/api/section-lock-image/${section.id}.png?v=${legacyVersion}` : null;
    const codeImageUrl = hasCodeImage ? `/app/api/section-lock-image/${section.id}/code.png?v=${codeVersion}` : null;
    return {
      ...section,
      locked: mode !== 'open',
      mode,
      hasCode: Boolean(item?.code),
      hasImage: hasLockedImage || legacyHasImage,
      imageUrl: lockedImageUrl,
      hasLockedImage: hasLockedImage || legacyHasImage,
      lockedImageUrl,
      hasCodeImage,
      codeImageUrl,
    };
  }));
  return { sections };
}

export async function setSectionLock(env: Env, sectionId: string, locked: boolean): Promise<{ sections: SectionLock[] }> {
  const normalized = ensureSection(sectionId);
  const current = await readLocks(env);
  const existing = current[normalized] ?? {};
  current[normalized] = { ...existing, locked: Boolean(locked), mode: locked ? 'locked' : 'open' };
  await writeLocks(env, current);
  return getSectionLocks(env);
}

export async function setSectionCodeLock(env: Env, sectionId: string, code: string): Promise<{ sections: SectionLock[] }> {
  const normalized = ensureSection(sectionId);
  const cleaned = cleanCode(code);
  if (!cleaned) throw new Error('Enter an access code first');
  const current = await readLocks(env);
  current[normalized] = { ...(current[normalized] ?? {}), locked: true, mode: 'code', code: cleaned };
  await writeLocks(env, current);
  return getSectionLocks(env);
}

export async function verifySectionCode(env: Env, sectionId: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const normalized = ensureSection(sectionId);
  const current = await readLocks(env);
  const item = current[normalized];
  if (normalizeMode(item) !== 'code') return { ok: true };
  return cleanCode(code) === cleanCode(item?.code) ? { ok: true } : { ok: false, error: 'Wrong access code' };
}

export function normalizeSectionId(sectionId: string): string {
  return ensureSection(sectionId);
}

export function normalizeSectionImageKind(kind: string | null | undefined): SectionLockImageKind {
  return kind === 'code' ? 'code' : 'locked';
}

export function sectionImageKey(sectionId: string, kind: SectionLockImageKind = 'locked'): string {
  return `admin:section-lock-image:${ensureSection(sectionId)}:${normalizeSectionImageKind(kind)}`;
}

export function sectionImageTypeKey(sectionId: string, kind: SectionLockImageKind = 'locked'): string {
  return `admin:section-lock-image-type:${ensureSection(sectionId)}:${normalizeSectionImageKind(kind)}`;
}

export function sectionImageVersionKey(sectionId: string, kind: SectionLockImageKind = 'locked'): string {
  return `admin:section-lock-image-version:${ensureSection(sectionId)}:${normalizeSectionImageKind(kind)}`;
}

export function legacySectionImageKey(sectionId: string): string {
  return `admin:section-lock-image:${ensureSection(sectionId)}`;
}

export function legacySectionImageTypeKey(sectionId: string): string {
  return `admin:section-lock-image-type:${ensureSection(sectionId)}`;
}

export function legacySectionImageVersionKey(sectionId: string): string {
  return `admin:section-lock-image-version:${ensureSection(sectionId)}`;
}

async function sectionImageVersion(env: Env, sectionId: string, kind: SectionLockImageKind): Promise<string> {
  return (await env.BOT_CACHE.get(sectionImageVersionKey(sectionId, kind)).catch(() => null)) || '1';
}

async function legacySectionImageVersion(env: Env, sectionId: string): Promise<string> {
  return (await env.BOT_CACHE.get(legacySectionImageVersionKey(sectionId)).catch(() => null)) || '1';
}

async function readLocks(env: Env): Promise<Record<string, SavedSectionLock>> {
  const stored = await readSetting<Record<string, boolean | SavedSectionLock>>(env, LOCKS_KEY);
  return normalizeSavedLocks(stored ?? {});
}

async function writeLocks(env: Env, locks: Record<string, SavedSectionLock>): Promise<void> {
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(LOCKS_KEY, JSON.stringify(locks))
    .run();
}

async function readSetting<T>(env: Env, name: string): Promise<T | null> {
  try {
    await ensureAdminSettingsTable(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(name).first<AdminSettingRow>();
    if (row?.value_json) return JSON.parse(row.value_json) as T;
  } catch (error) {
    console.warn('read admin setting from D1 failed', error);
  }
  return env.BOT_CACHE.get(name, 'json').catch(() => null) as Promise<T | null>;
}

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function normalizeSavedLocks(raw: Record<string, boolean | SavedSectionLock>): Record<string, SavedSectionLock> {
  const out: Record<string, SavedSectionLock> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'boolean') out[key] = { locked: value, mode: value ? 'locked' : 'open' };
    else out[key] = value ?? {};
  }
  return out;
}

function normalizeMode(item: SavedSectionLock | undefined): SectionLockMode {
  if (item?.mode === 'code') return 'code';
  if (item?.mode === 'locked') return 'locked';
  return item?.locked ? 'locked' : 'open';
}

function ensureSection(value: unknown): string {
  const normalized = cleanSection(value);
  if (!DEFAULT_SECTIONS.some((section) => section.id === normalized)) throw new Error('Unknown section');
  return normalized;
}

function cleanSection(value: unknown): string {
  return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 40);
}

function cleanCode(value: unknown): string {
  return String(value ?? '').trim().slice(0, 80);
}

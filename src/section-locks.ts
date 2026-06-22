import app from './index';
import './user-access-override-routes';
import './section-loading-meta-routes';
import type { Env } from './types';

export type SectionLockMode = 'open' | 'locked' | 'code' | 'loading';
export type SectionLockImageKind = 'locked' | 'code';

export type SectionLock = {
  id: string;
  label: string;
  description: string;
  locked: boolean;
  mode: SectionLockMode;
  expiresAt: string | null;
  remainingMs: number | null;
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
  expiresAt?: string | null;
};

type AdminSettingRow = { value_json: string };
type SectionImageInfo = { url: string | null; hasImage: boolean };

const LOCKS_KEY = 'admin:section-locks';
const SHARED_LOCK_IMAGE_ID = 'shared';
export const SECTION_LOCK_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const DEFAULT_SECTIONS: Array<Omit<SectionLock, 'locked' | 'mode' | 'expiresAt' | 'remainingMs' | 'hasCode' | 'hasImage' | 'imageUrl' | 'hasLockedImage' | 'lockedImageUrl' | 'hasCodeImage' | 'codeUrl'>> = [
  { id: 'global-loading', label: 'Global Mini App Loading', description: 'Put the entire mini app into loading mode' },
  { id: 'home', label: 'Home', description: 'Main landing section' },
  { id: 'home-top-players-card', label: 'Home Top Card', description: 'Clickable top card on Home that opens the Top Players page' },
  { id: 'home-deposit-card', label: 'Home Deposit Card', description: 'Image used on the Home deposit action card' },
  { id: 'home-withdraw-card', label: 'Home Withdraw Card', description: 'Image used on the Home withdraw action card' },
  { id: 'home-referral-card', label: 'Home Referral Card', description: 'Image used on the Home referral action card' },
  { id: 'connect', label: 'Connect', description: 'Full connect section' },
  { id: 'connect-bot-card', label: 'Connect Bot Card', description: 'Only the BotFather token card inside Connect' },
  { id: 'ai-miniapp', label: 'AI Bot Mini App', description: 'Open Mini App button in the AI bot' },
  { id: 'ai-chat', label: 'AI Bot Chat', description: 'Chat with AI menu in the AI bot' },
  { id: 'ai-tts', label: 'AI Bot Text to Speech', description: 'Text to Speech menu in the AI bot' },
  { id: 'playzone', label: 'Play Zone', description: 'Games hub section' },
  { id: 'predict', label: 'Predict', description: 'Predict section access' },
  { id: 'market', label: 'Market', description: 'NFT market section' },
  { id: 'predict-zone-card', label: 'Predict Zone Card Image', description: 'Image shown on the Predict Zone glass card' },
  { id: 'playzone-row-ad-right', label: 'Play Zone Row Ad Right', description: 'Image shown between the first and second Play Zone rows' },
  { id: 'playzone-row-ad-left', label: 'Play Zone Row Ad Left', description: 'Image shown between the second and third Play Zone rows' },
  { id: 'flow', label: 'Text to Speech', description: 'TTS generator section' },
  { id: 'mines', label: 'Mines', description: 'Mines game card and access image' },
  { id: 'plinko', label: 'Plinko', description: 'Plinko game card and access image' },
  { id: 'crash', label: 'Crash', description: 'Crash game card image' },
  { id: 'wheel', label: 'Wheel', description: 'Wheel game card image' },
  { id: 'wheel-separator', label: 'Wheel Separator Rod', description: 'Image used as separator rods between Wheel slices' },
  { id: 'dice', label: 'Dice', description: 'Dice game card image' },
  { id: 'rps', label: 'Rock Paper Scissors', description: 'Rock Paper Scissors game card image' },
  { id: 'slot', label: 'Slot', description: 'Slot game card image' },
  { id: 'tower', label: 'Tower', description: 'Tower game card image' },
  { id: 'coinflip', label: 'Pump', description: 'Pump game card and access image' },
  { id: 'hilo', label: 'Hi-Lo', description: 'Hi-Lo game card image' },
  { id: 'ghostrun', label: 'Ghost Run', description: 'Ghost Run game card image' },
];

export async function getSectionLocks(env: Env): Promise<{ sections: SectionLock[] }> {
  const saved = await readLocks(env);
  const now = Date.now();
  let changed = false;
  for (const [id, item] of Object.entries(saved)) {
    if (item?.expiresAt && Date.parse(item.expiresAt) <= now) {
      saved[id] = { ...item, locked: false, mode: 'open', expiresAt: null };
      changed = true;
    }
  }
  if (changed) await writeLocks(env, saved).catch(() => undefined);

  const sharedLockedImage = await sectionImageInfo(env, SHARED_LOCK_IMAGE_ID, 'locked');
  const sharedCodeImage = await sectionImageInfo(env, SHARED_LOCK_IMAGE_ID, 'code');

  const sections = await Promise.all(DEFAULT_SECTIONS.map(async (section) => {
    const item = saved[section.id];
    const mode = normalizeMode(item);
    const isLocked = mode !== 'open';
    const expiresAt = mode === 'open' ? null : normalizeExpiresAt(item?.expiresAt);
    const ownLockedImage = await sectionImageInfo(env, section.id, 'locked');
    const ownCodeImage = await sectionImageInfo(env, section.id, 'code');
    const imageUrl = ownLockedImage.url;
    const useSharedLockedImage = section.id === 'coinflip' && Boolean(sharedLockedImage.url);
    const sectionLockedImageUrl = useSharedLockedImage ? sharedLockedImage.url : ownLockedImage.url;
    const lockedImageUrl = isLocked && mode !== 'loading' ? (sectionLockedImageUrl || sharedLockedImage.url) : imageUrl;
    const codeImageUrl = isLocked && mode !== 'loading' ? (ownCodeImage.url || sharedCodeImage.url) : ownCodeImage.url;
    return {
      ...section,
      locked: isLocked,
      mode,
      expiresAt,
      remainingMs: expiresAt ? Math.max(0, Date.parse(expiresAt) - now) : null,
      hasCode: Boolean(item?.code),
      hasImage: Boolean(imageUrl || lockedImageUrl),
      imageUrl,
      hasLockedImage: Boolean(lockedImageUrl),
      lockedImageUrl,
      hasCodeImage: Boolean(codeImageUrl),
      codeImageUrl,
    };
  }));
  return { sections };
}

export async function isSectionLocked(env: Env, sectionId: string): Promise<boolean> {
  const normalized = ensureSection(sectionId);
  const current = await readLocks(env);
  return normalizeMode(current[normalized]) !== 'open';
}

export async function setSectionLock(env: Env, sectionId: string, locked: boolean, expiresAtInput: unknown = null): Promise<{ sections: SectionLock[] }> {
  const normalized = ensureSection(sectionId);
  const current = await readLocks(env);
  const existing = current[normalized] ?? {};
  current[normalized] = { ...existing, locked: Boolean(locked), mode: locked ? 'locked' : 'open', expiresAt: locked ? normalizeExpiresAt(expiresAtInput) : null };
  await writeLocks(env, current);
  return getSectionLocks(env);
}

export async function setSectionLoadingLock(env: Env, sectionId: string, expiresAtInput: unknown = null): Promise<{ sections: SectionLock[] }> {
  const normalized = ensureSection(sectionId);
  const current = await readLocks(env);
  current[normalized] = { ...(current[normalized] ?? {}), locked: true, mode: 'loading', expiresAt: normalizeExpiresAt(expiresAtInput) };
  await writeLocks(env, current);
  return getSectionLocks(env);
}

export async function setSectionCodeLock(env: Env, sectionId: string, code: string, expiresAtInput: unknown = null): Promise<{ sections: SectionLock[] }> {
  const normalized = ensureSection(sectionId);
  const cleaned = cleanCode(code);
  if (!cleaned) throw new Error('Enter an access code first');
  const current = await readLocks(env);
  current[normalized] = { ...(current[normalized] ?? {}), locked: true, mode: 'code', code: cleaned, expiresAt: normalizeExpiresAt(expiresAtInput) };
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
  const cleaned = cleanSection(sectionId);
  return cleaned === SHARED_LOCK_IMAGE_ID ? SHARED_LOCK_IMAGE_ID : ensureSection(cleaned);
}

export function normalizeSectionImageKind(kind: string | null | undefined): SectionLockImageKind {
  return kind === 'code' ? 'code' : 'locked';
}

export function sectionImageKey(sectionId: string, kind: SectionLockImageKind = 'locked'): string {
  return `admin:section-lock-image:${cleanSection(sectionId)}:${normalizeSectionImageKind(kind)}`;
}

export function sectionImageTypeKey(sectionId: string, kind: SectionLockImageKind = 'locked'): string {
  return `admin:section-lock-image-type:${cleanSection(sectionId)}:${normalizeSectionImageKind(kind)}`;
}

export function sectionImageVersionKey(sectionId: string, kind: SectionLockImageKind = 'locked'): string {
  return `admin:section-lock-image-version:${cleanSection(sectionId)}:${normalizeSectionImageKind(kind)}`;
}

export function sectionImageR2Key(sectionId: string, kind: SectionLockImageKind = 'locked'): string {
  return `section-lock-image/${cleanSection(sectionId)}/${normalizeSectionImageKind(kind)}`;
}

export function legacySectionImageKey(sectionId: string): string {
  return `admin:section-lock-image:${cleanSection(sectionId)}`;
}

export function legacySectionImageTypeKey(sectionId: string): string {
  return `admin:section-lock-image-type:${cleanSection(sectionId)}`;
}

export function legacySectionImageVersionKey(sectionId: string): string {
  return `admin:section-lock-image-version:${cleanSection(sectionId)}`;
}

async function hasStoredSectionImage(env: Env, sectionId: string, kind: SectionLockImageKind): Promise<boolean> {
  const object = await env.ASSETS.head(sectionImageR2Key(sectionId, kind)).catch(() => null);
  if (object) return true;
  return Boolean(await env.BOT_CACHE.get(sectionImageTypeKey(sectionId, kind)).catch(() => null));
}

async function sectionImageVersion(env: Env, sectionId: string, kind: SectionLockImageKind): Promise<string> {
  const object = await env.ASSETS.head(sectionImageR2Key(sectionId, kind)).catch(() => null);
  return object?.customMetadata?.version || (await env.BOT_CACHE.get(sectionImageVersionKey(sectionId, kind)).catch(() => null)) || '1';
}

async function sectionImageInfo(env: Env, sectionId: string, kind: SectionLockImageKind): Promise<SectionImageInfo> {
  const hasImage = await hasStoredSectionImage(env, sectionId, kind);
  if (!hasImage) return { url: null, hasImage: false };
  const version = await sectionImageVersion(env, sectionId, kind);
  return { url: `/app/api/section-lock-image/${cleanSection(sectionId)}/${kind}.png?v=${version}`, hasImage: true };
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
  await ensureAdminSettingsTable(env);
  const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(name).first<AdminSettingRow>();
  if (!row?.value_json) return null;
  try { return JSON.parse(row.value_json) as T; } catch { return null; }
}

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function ensureSection(sectionId: string): string {
  const cleaned = cleanSection(sectionId);
  const exists = DEFAULT_SECTIONS.some((section) => section.id === cleaned);
  if (!exists) throw new Error('Unknown section');
  return cleaned;
}

function cleanSection(sectionId: string): string {
  return String(sectionId || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

function cleanCode(code: unknown): string {
  return String(code || '').trim();
}

function normalizeExpiresAt(input: unknown): string | null {
  const text = String(input || '').trim();
  if (!text) return null;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function normalizeMode(item: SavedSectionLock | undefined): SectionLockMode {
  if (!item) return 'open';
  if (item.mode === 'loading' || item.mode === 'code' || item.mode === 'locked') return item.mode;
  return item.locked ? 'locked' : 'open';
}

function normalizeSavedLocks(stored: Record<string, boolean | SavedSectionLock>): Record<string, SavedSectionLock> {
  const normalized: Record<string, SavedSectionLock> = {};
  for (const [id, value] of Object.entries(stored || {})) {
    if (typeof value === 'boolean') normalized[id] = { locked: value, mode: value ? 'locked' : 'open', expiresAt: null };
    else if (value && typeof value === 'object') normalized[id] = value;
  }
  return normalized;
}

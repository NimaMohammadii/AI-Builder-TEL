import type { Env } from './types';

export type SectionLockMode = 'open' | 'locked' | 'code';

export type SectionLock = {
  id: string;
  label: string;
  description: string;
  locked: boolean;
  mode: SectionLockMode;
  hasCode: boolean;
};

type SavedSectionLock = {
  locked?: boolean;
  mode?: SectionLockMode;
  code?: string;
};

const LOCKS_KEY = 'admin:section-locks';

const DEFAULT_SECTIONS: Array<Omit<SectionLock, 'locked' | 'mode' | 'hasCode'>> = [
  { id: 'home', label: 'Home', description: 'Main landing section' },
  { id: 'connect', label: 'Connect', description: 'Bot connection section' },
  { id: 'flow', label: 'Text to Speech', description: 'TTS generator section' },
  { id: 'plinko', label: 'Plinko', description: 'Plinko game section' },
];

export async function getSectionLocks(env: Env): Promise<{ sections: SectionLock[] }> {
  const saved = await readLocks(env);
  return { sections: DEFAULT_SECTIONS.map((section) => {
    const item = saved[section.id];
    const mode = normalizeMode(item);
    return { ...section, locked: mode !== 'open', mode, hasCode: Boolean(item?.code) };
  }) };
}

export async function setSectionLock(env: Env, sectionId: string, locked: boolean): Promise<{ sections: SectionLock[] }> {
  const normalized = ensureSection(sectionId);
  const current = await readLocks(env);
  const existing = current[normalized] ?? {};
  current[normalized] = { ...existing, locked: Boolean(locked), mode: locked ? 'locked' : 'open' };
  await env.BOT_CACHE.put(LOCKS_KEY, JSON.stringify(current));
  return getSectionLocks(env);
}

export async function setSectionCodeLock(env: Env, sectionId: string, code: string): Promise<{ sections: SectionLock[] }> {
  const normalized = ensureSection(sectionId);
  const cleaned = cleanCode(code);
  if (!cleaned) throw new Error('Enter an access code first');
  const current = await readLocks(env);
  current[normalized] = { ...(current[normalized] ?? {}), locked: true, mode: 'code', code: cleaned };
  await env.BOT_CACHE.put(LOCKS_KEY, JSON.stringify(current));
  return getSectionLocks(env);
}

export async function verifySectionCode(env: Env, sectionId: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const normalized = ensureSection(sectionId);
  const current = await readLocks(env);
  const item = current[normalized];
  if (normalizeMode(item) !== 'code') return { ok: true };
  return cleanCode(code) === cleanCode(item?.code) ? { ok: true } : { ok: false, error: 'Wrong access code' };
}

async function readLocks(env: Env): Promise<Record<string, SavedSectionLock>> {
  const raw = await env.BOT_CACHE.get(LOCKS_KEY, 'json').catch(() => null) as Record<string, boolean | SavedSectionLock> | null;
  const out: Record<string, SavedSectionLock> = {};
  for (const [key, value] of Object.entries(raw ?? {})) {
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

import type { Env } from './types';

export type SectionLock = {
  id: string;
  label: string;
  description: string;
  locked: boolean;
};

const LOCKS_KEY = 'admin:section-locks';

const DEFAULT_SECTIONS: Array<Omit<SectionLock, 'locked'>> = [
  { id: 'home', label: 'Home', description: 'Main landing section' },
  { id: 'connect', label: 'Connect', description: 'Bot connection section' },
  { id: 'flow', label: 'Text to Speech', description: 'TTS generator section' },
  { id: 'plinko', label: 'Plinko', description: 'Plinko game section' },
];

export async function getSectionLocks(env: Env): Promise<{ sections: SectionLock[] }> {
  const saved = await env.BOT_CACHE.get(LOCKS_KEY, 'json').catch(() => null) as Record<string, boolean> | null;
  const locks = saved ?? {};
  return { sections: DEFAULT_SECTIONS.map((section) => ({ ...section, locked: Boolean(locks[section.id]) })) };
}

export async function setSectionLock(env: Env, sectionId: string, locked: boolean): Promise<{ sections: SectionLock[] }> {
  const normalized = cleanSection(sectionId);
  if (!DEFAULT_SECTIONS.some((section) => section.id === normalized)) throw new Error('Unknown section');
  const current = await env.BOT_CACHE.get(LOCKS_KEY, 'json').catch(() => null) as Record<string, boolean> | null;
  const next = { ...(current ?? {}), [normalized]: Boolean(locked) };
  await env.BOT_CACHE.put(LOCKS_KEY, JSON.stringify(next));
  return getSectionLocks(env);
}

function cleanSection(value: unknown): string {
  return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 40);
}

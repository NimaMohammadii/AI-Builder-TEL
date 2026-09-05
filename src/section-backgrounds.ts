import type { Env } from './types';

export const SECTION_BACKGROUND_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const SECTION_BACKGROUND_PREFIX = 'section-background';

export type SectionBackground = {
  id: string;
  label: string;
  description: string;
  hasBackground: boolean;
  backgroundUrl: string | null;
};

export function sectionBackgroundR2Key(sectionId: string): string {
  return `${SECTION_BACKGROUND_PREFIX}/${cleanSectionId(sectionId)}`;
}

export function sectionBackgroundUrl(sectionId: string, version: string): string {
  return `/app/api/section-background/${cleanSectionId(sectionId)}.png?v=${encodeURIComponent(version)}`;
}

export async function sectionBackgroundInfo(env: Env, section: { id: string; label: string; description: string }): Promise<SectionBackground> {
  const object = await env.ASSETS.head(sectionBackgroundR2Key(section.id)).catch(() => null);
  const version = object?.customMetadata?.version || object?.uploaded?.getTime?.().toString() || '1';
  return {
    id: section.id,
    label: section.label,
    description: section.description,
    hasBackground: Boolean(object),
    backgroundUrl: object ? sectionBackgroundUrl(section.id, version) : null,
  };
}

export function cleanSectionId(value: unknown): string {
  const cleaned = String(value ?? '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60);
  if (!cleaned) throw new Error('Invalid section');
  if (/^home(?:-|$)/.test(cleaned)) throw new Error('Home does not use generic section backgrounds');
  return cleaned;
}
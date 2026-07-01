import type { Env } from './types';
import { safeParseJson } from './utils';

export type RegionConfig = { code: string; label: string; language: string; timezone: string };
export type RegionSelectionConfig = { selectionEnabled: boolean; defaultRegion: string };

export const REGIONS: RegionConfig[] = [
  { code: 'IR', label: '🇮🇷 Iran', language: 'fa', timezone: 'Asia/Tehran' },
  { code: 'TR', label: '🇹🇷 Turkey', language: 'tr', timezone: 'Europe/Istanbul' },
  { code: 'DE', label: '🇩🇪 Germany', language: 'de', timezone: 'Europe/Berlin' },
  { code: 'AE', label: '🇦🇪 UAE', language: 'ar', timezone: 'Asia/Dubai' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia', language: 'ar', timezone: 'Asia/Riyadh' },
  { code: 'RU', label: '🇷🇺 Russia', language: 'ru', timezone: 'Europe/Moscow' },
  { code: 'IN', label: '🇮🇳 India', language: 'en', timezone: 'Asia/Kolkata' },
  { code: 'BR', label: '🇧🇷 Brazil', language: 'pt', timezone: 'America/Sao_Paulo' },
  { code: 'US', label: '🇺🇸 United States', language: 'en', timezone: 'America/New_York' },
  { code: 'OTHER', label: '🌍 Other', language: 'en', timezone: 'UTC' },
];

const REGION_SELECTION_CONFIG_KEY = 'botadmin:region-selection-config';
const FALLBACK_REGION_CONFIG: RegionSelectionConfig = { selectionEnabled: true, defaultRegion: 'IR' };

export function regionByCode(code: string): RegionConfig | null {
  const cleaned = String(code || '').trim().toUpperCase();
  return REGIONS.find((region) => region.code === cleaned) ?? null;
}

export async function getRegionSelectionConfig(env: Env): Promise<RegionSelectionConfig> {
  try {
    const raw = await env.BOT_CACHE.get(REGION_SELECTION_CONFIG_KEY).catch(() => null);
    const parsed = safeParseJson<Partial<RegionSelectionConfig>>(raw || '{}', {});
    const defaultRegion = regionByCode(parsed.defaultRegion || '')?.code || FALLBACK_REGION_CONFIG.defaultRegion;
    return { selectionEnabled: parsed.selectionEnabled !== false, defaultRegion };
  } catch {
    return FALLBACK_REGION_CONFIG;
  }
}

export async function setRegionSelectionConfig(env: Env, config: Partial<RegionSelectionConfig>): Promise<RegionSelectionConfig> {
  const current = await getRegionSelectionConfig(env);
  const next: RegionSelectionConfig = {
    selectionEnabled: config.selectionEnabled ?? current.selectionEnabled,
    defaultRegion: regionByCode(config.defaultRegion || '')?.code || current.defaultRegion,
  };
  await env.BOT_CACHE.put(REGION_SELECTION_CONFIG_KEY, JSON.stringify(next));
  return next;
}

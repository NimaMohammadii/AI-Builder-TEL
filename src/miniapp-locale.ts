import app from './index';
import type { Env } from './types';

type RegionRow = { region_code: string | null; language_code: string | null; timezone: string | null };
type LocaleRegion = { code: string; label: string; languageCode: string; timezone: string };

const REGIONS: Record<string, LocaleRegion> = {
  US: { code: 'US', label: '🇺🇸 United States', languageCode: 'en', timezone: 'America/New_York' },
  RU: { code: 'RU', label: '🇷🇺 Russia', languageCode: 'ru', timezone: 'Europe/Moscow' },
  UA: { code: 'UA', label: '🇺🇦 Ukraine', languageCode: 'uk', timezone: 'Europe/Kyiv' },
  CN: { code: 'CN', label: '🇨🇳 China', languageCode: 'zh', timezone: 'Asia/Shanghai' },
  GB: { code: 'GB', label: '🇬🇧 United Kingdom', languageCode: 'en', timezone: 'Europe/London' },
  DE: { code: 'DE', label: '🇩🇪 Germany', languageCode: 'de', timezone: 'Europe/Berlin' },
  IR: { code: 'IR', label: '🇮🇷 Iran', languageCode: 'fa', timezone: 'Asia/Tehran' },
  AU: { code: 'AU', label: '🇦🇺 Australia', languageCode: 'en', timezone: 'Australia/Sydney' },
  JP: { code: 'JP', label: '🇯🇵 Japan', languageCode: 'ja', timezone: 'Asia/Tokyo' },
  KR: { code: 'KR', label: '🇰🇷 South Korea', languageCode: 'ko', timezone: 'Asia/Seoul' },
  BR: { code: 'BR', label: '🇧🇷 Brazil', languageCode: 'pt', timezone: 'America/Sao_Paulo' },
  AE: { code: 'AE', label: '🇦🇪 Middle East', languageCode: 'ar', timezone: 'Asia/Dubai' },
  TR: { code: 'TR', label: '🇹🇷 Turkey', languageCode: 'tr', timezone: 'Europe/Istanbul' },
  IN: { code: 'IN', label: '🇮🇳 India', languageCode: 'en', timezone: 'Asia/Kolkata' },
  ID: { code: 'ID', label: '🇮🇩 Indonesia', languageCode: 'id', timezone: 'Asia/Jakarta' },
  EU: { code: 'EU', label: '🇪🇺 Europe', languageCode: 'en', timezone: 'Europe/Berlin' },
  ASIA: { code: 'ASIA', label: '🌏 Asia', languageCode: 'en', timezone: 'Asia/Singapore' },
  AM: { code: 'AM', label: '🌎 Americas', languageCode: 'en', timezone: 'America/New_York' },
  AF: { code: 'AF', label: '🌍 Africa', languageCode: 'en', timezone: 'Africa/Lagos' },
  OTHER: { code: 'OTHER', label: '🌐 Other', languageCode: 'en', timezone: 'UTC' },
};

app.post('/app/api/locale', async (c) => {
  const env = c.env as Env;
  const body = await c.req.json().catch(() => ({})) as { initData?: unknown };
  const userId = readUserId(String(body.initData || ''));
  if (!userId) return c.json({ error: 'Telegram user not found' }, 401, { 'cache-control': 'no-store' });

  const row = await env.DB.prepare('SELECT region_code, language_code, timezone FROM app_users WHERE telegram_user_id = ?')
    .bind(userId)
    .first<RegionRow>()
    .catch(() => null);

  const regionCode = cleanRegion(row?.region_code) || 'OTHER';
  const region = REGIONS[regionCode] || REGIONS.OTHER;
  const languageCode = cleanLanguage(row?.language_code) || region.languageCode;
  const timezone = cleanTimezone(row?.timezone) || region.timezone;
  return c.json({ regionCode, label: region.label, languageCode, timezone }, 200, { 'cache-control': 'no-store' });
});

function readUserId(initData: string): string {
  try {
    const raw = new URLSearchParams(initData).get('user') || '';
    const user = JSON.parse(raw) as { id?: number | string };
    const id = String(user.id || '').trim();
    return /^\d+$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

function cleanRegion(value: unknown): string {
  const code = String(value || '').trim().toUpperCase();
  return REGIONS[code] ? code : '';
}

function cleanLanguage(value: unknown): string {
  const code = String(value || '').trim().toLowerCase();
  return /^[a-z]{2,3}$/.test(code) ? code : '';
}

function cleanTimezone(value: unknown): string {
  const text = String(value || '').trim();
  return /^[A-Za-z_]+\/[A-Za-z0-9_+\/-]+$|^UTC$/.test(text) ? text : '';
}

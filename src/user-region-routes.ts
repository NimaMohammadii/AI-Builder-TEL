import app from './index';
import type { Env } from './types';

type RegionRow = {
  region_code: string | null;
  language_code: string | null;
  timezone: string | null;
};

const KNOWN_REGIONS: Record<string, { label: string; language: string; timezone: string }> = {
  US: { label: '🇺🇸 United States', language: 'en', timezone: 'America/New_York' },
  RU: { label: '🇷🇺 Russia', language: 'ru', timezone: 'Europe/Moscow' },
  UA: { label: '🇺🇦 Ukraine', language: 'uk', timezone: 'Europe/Kyiv' },
  CN: { label: '🇨🇳 China', language: 'zh', timezone: 'Asia/Shanghai' },
  GB: { label: '🇬🇧 United Kingdom', language: 'en', timezone: 'Europe/London' },
  DE: { label: '🇩🇪 Germany', language: 'de', timezone: 'Europe/Berlin' },
  IR: { label: '🇮🇷 Iran', language: 'fa', timezone: 'Asia/Tehran' },
  AU: { label: '🇦🇺 Australia', language: 'en', timezone: 'Australia/Sydney' },
  JP: { label: '🇯🇵 Japan', language: 'ja', timezone: 'Asia/Tokyo' },
  KR: { label: '🇰🇷 South Korea', language: 'ko', timezone: 'Asia/Seoul' },
  BR: { label: '🇧🇷 Brazil', language: 'pt', timezone: 'America/Sao_Paulo' },
  AE: { label: '🇦🇪 Middle East', language: 'ar', timezone: 'Asia/Dubai' },
  TR: { label: '🇹🇷 Turkey', language: 'tr', timezone: 'Europe/Istanbul' },
  IN: { label: '🇮🇳 India', language: 'en', timezone: 'Asia/Kolkata' },
  ID: { label: '🇮🇩 Indonesia', language: 'id', timezone: 'Asia/Jakarta' },
  EU: { label: '🇪🇺 Europe', language: 'en', timezone: 'Europe/Berlin' },
  ASIA: { label: '🌏 Asia', language: 'en', timezone: 'Asia/Singapore' },
  AM: { label: '🌎 Americas', language: 'en', timezone: 'America/New_York' },
  AF: { label: '🌍 Africa', language: 'en', timezone: 'Africa/Lagos' },
  OTHER: { label: '🌐 Other', language: 'en', timezone: 'UTC' },
};

app.post('/app/api/user-region', async (c) => {
  const env = c.env as Env;
  const body = await c.req.json().catch(() => ({})) as { initData?: unknown };
  const userId = readTelegramUserId(String(body.initData || ''));

  if (!userId) {
    return c.json({ error: 'Telegram user not found' }, 401, { 'cache-control': 'no-store' });
  }

  await ensureColumns(env);
  const row = await env.DB.prepare('SELECT region_code, language_code, timezone FROM app_users WHERE telegram_user_id = ?')
    .bind(userId)
    .first<RegionRow>()
    .catch(() => null);

  const regionCode = cleanRegionCode(row?.region_code) || 'OTHER';
  const region = KNOWN_REGIONS[regionCode] || KNOWN_REGIONS.OTHER;
  const languageCode = cleanLanguageCode(row?.language_code) || region.language || 'en';
  const timezone = cleanTimezone(row?.timezone) || region.timezone || 'UTC';

  return c.json({ regionCode, label: region.label, languageCode, timezone }, 200, { 'cache-control': 'no-store' });
});

async function ensureColumns(env: Env): Promise<void> {
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN region_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN language_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN timezone TEXT').run().catch(() => undefined);
}

function readTelegramUserId(initData: string): string {
  if (!initData) return '';
  try {
    const params = new URLSearchParams(initData);
    const rawUser = params.get('user') || '';
    if (!rawUser) return '';
    const user = JSON.parse(rawUser) as { id?: number | string };
    const id = String(user.id || '').trim();
    return /^\d+$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

function cleanRegionCode(value: unknown): string {
  const text = String(value || '').trim().toUpperCase();
  return /^[A-Z]{2,8}$/.test(text) && KNOWN_REGIONS[text] ? text : '';
}

function cleanLanguageCode(value: unknown): string {
  const text = String(value || '').trim().toLowerCase();
  return /^[a-z]{2,3}$/.test(text) ? text : '';
}

function cleanTimezone(value: unknown): string {
  const text = String(value || '').trim();
  return /^[A-Za-z_]+\/[A-Za-z0-9_+\/-]+$|^UTC$/.test(text) ? text : '';
}

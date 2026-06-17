import type { Hono } from 'hono';
import { claimDailyRewardMission, claimWeeklyDailyReward, getDailyRewardsForUser } from './daily-rewards-claims';
import { getDailyRewardsAdminPayload, getDailyRewardsPublicPayload, saveDailyRewardsSettings } from './daily-rewards-missions';
import type { Env } from './types';

type RegionLocaleRow = { region_code: string | null; language_code: string | null; timezone: string | null };

type RegionLocale = { regionCode: string; languageCode: string; timezone: string };

const REGION_LOCALES: Record<string, RegionLocale> = {
  US: { regionCode: 'US', languageCode: 'en', timezone: 'America/New_York' },
  RU: { regionCode: 'RU', languageCode: 'ru', timezone: 'Europe/Moscow' },
  UA: { regionCode: 'UA', languageCode: 'uk', timezone: 'Europe/Kyiv' },
  CN: { regionCode: 'CN', languageCode: 'zh', timezone: 'Asia/Shanghai' },
  GB: { regionCode: 'GB', languageCode: 'en', timezone: 'Europe/London' },
  DE: { regionCode: 'DE', languageCode: 'de', timezone: 'Europe/Berlin' },
  IR: { regionCode: 'IR', languageCode: 'fa', timezone: 'Asia/Tehran' },
  AU: { regionCode: 'AU', languageCode: 'en', timezone: 'Australia/Sydney' },
  JP: { regionCode: 'JP', languageCode: 'ja', timezone: 'Asia/Tokyo' },
  KR: { regionCode: 'KR', languageCode: 'ko', timezone: 'Asia/Seoul' },
  BR: { regionCode: 'BR', languageCode: 'pt', timezone: 'America/Sao_Paulo' },
  AE: { regionCode: 'AE', languageCode: 'ar', timezone: 'Asia/Dubai' },
  TR: { regionCode: 'TR', languageCode: 'tr', timezone: 'Europe/Istanbul' },
  IN: { regionCode: 'IN', languageCode: 'en', timezone: 'Asia/Kolkata' },
  ID: { regionCode: 'ID', languageCode: 'id', timezone: 'Asia/Jakarta' },
  EU: { regionCode: 'EU', languageCode: 'en', timezone: 'Europe/Berlin' },
  ASIA: { regionCode: 'ASIA', languageCode: 'en', timezone: 'Asia/Singapore' },
  AM: { regionCode: 'AM', languageCode: 'en', timezone: 'America/New_York' },
  AF: { regionCode: 'AF', languageCode: 'en', timezone: 'Africa/Lagos' },
  OTHER: { regionCode: 'OTHER', languageCode: 'en', timezone: 'UTC' },
};

export function registerDailyRewardsAdminRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/daily-rewards', async (c) => {
    try {
      const userId = c.req.query('userId') || '';
      if (userId) {
        const payload = await getDailyRewardsForUser(c.env, userId);
        const locale = await getUserRegionLocale(c.env, userId);
        return c.json({ ...payload, locale }, 200, { 'cache-control': 'no-store' });
      }
      return c.json(await getDailyRewardsPublicPayload(c.env), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not load Daily Rewards' }, 400, { 'cache-control': 'no-store' });
    }
  });

  app.post('/app/api/daily-rewards/claim', async (c) => {
    try {
      const body = await c.req.json() as { userId?: unknown; missionId?: unknown; rewardId?: unknown; day?: unknown };
      if (body.rewardId) return c.json(await claimWeeklyDailyReward(c.env, body), 200, { 'cache-control': 'no-store' });
      return c.json(await claimDailyRewardMission(c.env, body), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not claim Daily Reward' }, 400, { 'cache-control': 'no-store' });
    }
  });

  app.get('/admin/api/daily-rewards/missions', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    return c.json(await getDailyRewardsAdminPayload(c.env), 200, { 'cache-control': 'no-store' });
  });

  app.post('/admin/api/daily-rewards/settings', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json();
      return c.json({ ok: true, settings: await saveDailyRewardsSettings(c.env, body) }, 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not save Daily Rewards settings' }, 400);
    }
  });
}

async function getUserRegionLocale(env: Env, userId: string): Promise<RegionLocale> {
  const cleanUserId = String(userId || '').trim();
  if (!/^\d+$/.test(cleanUserId)) return REGION_LOCALES.OTHER;

  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN region_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN language_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN timezone TEXT').run().catch(() => undefined);

  const row = await env.DB.prepare('SELECT region_code, language_code, timezone FROM app_users WHERE telegram_user_id = ?')
    .bind(cleanUserId)
    .first<RegionLocaleRow>()
    .catch(() => null);

  const regionCode = cleanRegionCode(row?.region_code) || 'OTHER';
  const base = REGION_LOCALES[regionCode] || REGION_LOCALES.OTHER;
  return {
    regionCode,
    languageCode: cleanLanguageCode(row?.language_code) || base.languageCode,
    timezone: cleanTimezone(row?.timezone) || base.timezone,
  };
}

function cleanRegionCode(value: unknown): string {
  const text = String(value || '').trim().toUpperCase();
  return REGION_LOCALES[text] ? text : '';
}

function cleanLanguageCode(value: unknown): string {
  const text = String(value || '').trim().toLowerCase();
  return /^[a-z]{2,3}$/.test(text) ? text : '';
}

function cleanTimezone(value: unknown): string {
  const text = String(value || '').trim();
  return /^[A-Za-z_]+\/[A-Za-z0-9_+\/-]+$|^UTC$/.test(text) ? text : '';
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): boolean {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean {
  return isAdmin(c.env, adminCookieValue(c.req.header('cookie')));
}

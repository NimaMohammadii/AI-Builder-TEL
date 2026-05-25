import app from './index';
import type { Env } from './types';

const CACHE_NONE = 'no-store';
const THEME_KEY = 'miniapp_theme';

const THEMES = {
  burgundy: {
    id: 'burgundy',
    label: 'Dark Burgundy',
    accent: '#23020b',
    accentSoft: 'rgba(48, 3, 15, .28)',
    accentShadow: 'rgba(88, 7, 27, .18)',
  },
  green: {
    id: 'green',
    label: 'Dark Green',
    accent: '#021f12',
    accentSoft: 'rgba(3, 48, 26, .28)',
    accentShadow: 'rgba(7, 88, 45, .18)',
  },
  purple: {
    id: 'purple',
    label: 'Dark Purple',
    accent: '#170225',
    accentSoft: 'rgba(36, 3, 58, .28)',
    accentShadow: 'rgba(70, 10, 110, .18)',
  },
  sky: {
    id: 'sky',
    label: 'Dark Sky Blue',
    accent: '#021827',
    accentSoft: 'rgba(3, 39, 62, .28)',
    accentShadow: 'rgba(9, 76, 118, .18)',
  },
} as const;

type ThemeId = keyof typeof THEMES;

type ThemeView = typeof THEMES[ThemeId];

app.get('/app/api/miniapp-theme', async (c) => {
  return c.json(await getMiniAppTheme(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.get('/admin/api/miniapp-theme', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await getMiniAppTheme(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/miniapp-theme', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const body = await c.req.json().catch(() => ({})) as { theme?: unknown };
    const theme = normalizeThemeId(body.theme);
    if (!theme) return c.json({ error: 'Unknown theme' }, 400, { 'cache-control': CACHE_NONE });
    await setThemeId(c.env, theme);
    return c.json(themePayload(theme), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save theme' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function getMiniAppTheme(env: Env): Promise<{ theme: ThemeView; themes: ThemeView[] }> {
  const theme = await getThemeId(env);
  return themePayload(theme);
}

function themePayload(theme: ThemeId): { theme: ThemeView; themes: ThemeView[] } {
  return { theme: THEMES[theme], themes: Object.values(THEMES) };
}

async function ensureAppSettings(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getThemeId(env: Env): Promise<ThemeId> {
  await ensureAppSettings(env);
  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind(THEME_KEY).first<{ value: string }>().catch(() => null);
  return normalizeThemeId(row?.value) || 'burgundy';
}

async function setThemeId(env: Env, theme: ThemeId): Promise<void> {
  await ensureAppSettings(env);
  await env.DB.prepare(`INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`).bind(THEME_KEY, theme).run();
}

function normalizeThemeId(value: unknown): ThemeId | null {
  const theme = String(value || '').trim().toLowerCase();
  return theme === 'burgundy' || theme === 'green' || theme === 'purple' || theme === 'sky' ? theme : null;
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

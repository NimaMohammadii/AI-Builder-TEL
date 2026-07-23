import app from './index';
import './football-routes';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

const CACHE_NONE = 'no-store';
const PREDICT_SETTINGS_KEY = 'predict/settings';
const PREDICT_CARD_VISIBILITY_MARKETS = ['bitcoin', 'solana', 'ethereum', 'gold', 'oil'] as const;
const PREDICT_LOCKABLE_MARKETS = ['politics', 'fun'] as const;
type PredictCardVisibilityMarket = typeof PREDICT_CARD_VISIBILITY_MARKETS[number];
type PredictLockableMarket = typeof PREDICT_LOCKABLE_MARKETS[number];

type PredictSettings = {
  liveBetsEnabled: boolean;
  hiddenCards: Record<PredictCardVisibilityMarket, boolean>;
  lockedMarkets: Record<PredictLockableMarket, boolean>;
};

app.get('/app/api/predict-settings', async (c) => {
  const settings = await getPredictSettings(c.env);
  return c.json(settings, 200, { 'cache-control': CACHE_NONE });
});


app.get('/admin/api/predict-settings', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await getPredictSettings(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/predict-settings', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const current = await getPredictSettings(c.env);
    const settings: PredictSettings = {
      liveBetsEnabled: body.liveBetsEnabled !== false,
      hiddenCards: normalizeHiddenCards((body.hiddenCards as Record<string, unknown> | undefined) ?? current.hiddenCards),
      lockedMarkets: normalizeLockedMarkets((body.lockedMarkets as Record<string, unknown> | undefined) ?? current.lockedMarkets),
    };
    await c.env.ASSETS.put(PREDICT_SETTINGS_KEY, JSON.stringify(settings), {
      httpMetadata: { contentType: 'application/json' },
      customMetadata: { version: String(Date.now()) },
    });
    return c.json(settings, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save Predict settings' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function getPredictSettings(env: Env): Promise<PredictSettings> {
  const object = await env.ASSETS.get(PREDICT_SETTINGS_KEY).catch(() => null);
  if (!object) return defaultPredictSettings();
  try {
    const json = JSON.parse(await object.text()) as Partial<PredictSettings>;
    return {
      liveBetsEnabled: json.liveBetsEnabled !== false,
      hiddenCards: normalizeHiddenCards(json.hiddenCards),
      lockedMarkets: json.lockedMarkets ? normalizeLockedMarkets(json.lockedMarkets) : defaultLockedPredictMarkets(),
    };
  } catch {
    return defaultPredictSettings();
  }
}

function defaultPredictSettings(): PredictSettings {
  return { liveBetsEnabled: true, hiddenCards: visiblePredictCards(), lockedMarkets: defaultLockedPredictMarkets() };
}

function visiblePredictCards(): Record<PredictCardVisibilityMarket, boolean> {
  return normalizeHiddenCards({});
}

function defaultLockedPredictMarkets(): Record<PredictLockableMarket, boolean> {
  return normalizeLockedMarkets({ politics: true, fun: true });
}

function unlockedPredictMarkets(): Record<PredictLockableMarket, boolean> {
  return normalizeLockedMarkets({});
}

function normalizeHiddenCards(value: unknown): Record<PredictCardVisibilityMarket, boolean> {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(PREDICT_CARD_VISIBILITY_MARKETS.map((market) => [market, input[market] === true])) as Record<PredictCardVisibilityMarket, boolean>;
}


function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): Promise<boolean> {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

async function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<boolean> {
  return isAdminSession(c.env, c.req.header('cookie'));
}
function normalizeLockedMarkets(value: unknown): Record<PredictLockableMarket, boolean> {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(PREDICT_LOCKABLE_MARKETS.map((market) => [market, input[market] === true])) as Record<PredictLockableMarket, boolean>;
}

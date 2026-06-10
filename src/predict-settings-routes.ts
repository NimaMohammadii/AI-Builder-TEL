import app from './index';
import './football-routes';
import { hasAccessOverride } from './user-access-override-routes';
import type { Env } from './types';

const CACHE_NONE = 'no-store';
const PREDICT_SETTINGS_KEY = 'predict/settings';
const PREDICT_CARD_VISIBILITY_MARKETS = ['bitcoin', 'solana', 'ethereum', 'gold', 'oil'] as const;
type PredictCardVisibilityMarket = typeof PREDICT_CARD_VISIBILITY_MARKETS[number];

type PredictSettings = {
  liveBetsEnabled: boolean;
  hiddenCards: Record<PredictCardVisibilityMarket, boolean>;
};

app.get('/app/api/predict-settings', async (c) => {
  const settings = await getPredictSettings(c.env);
  if (await hasAccessOverride(c.env, c.req.query('userId'))) {
    return c.json({ ...settings, trustedAccess: true, hiddenCards: visiblePredictCards() }, 200, { 'cache-control': CACHE_NONE });
  }
  return c.json(settings, 200, { 'cache-control': CACHE_NONE });
});

app.get('/app/api/predict-oil-price', async (c) => {
  try {
    return c.json({ ok: true, market: 'oil', price: await fetchOilPrice() }, 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not load Oil price' }, 400, { 'cache-control': CACHE_NONE });
  }
});

app.get('/admin/api/predict-settings', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await getPredictSettings(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/predict-settings', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const current = await getPredictSettings(c.env);
    const settings: PredictSettings = {
      liveBetsEnabled: body.liveBetsEnabled !== false,
      hiddenCards: normalizeHiddenCards((body.hiddenCards as Record<string, unknown> | undefined) ?? current.hiddenCards),
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
    };
  } catch {
    return defaultPredictSettings();
  }
}

function defaultPredictSettings(): PredictSettings {
  return { liveBetsEnabled: true, hiddenCards: visiblePredictCards() };
}

function visiblePredictCards(): Record<PredictCardVisibilityMarket, boolean> {
  return normalizeHiddenCards({});
}

function normalizeHiddenCards(value: unknown): Record<PredictCardVisibilityMarket, boolean> {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(PREDICT_CARD_VISIBILITY_MARKETS.map((market) => [market, input[market] === true])) as Record<PredictCardVisibilityMarket, boolean>;
}

async function fetchOilPrice(): Promise<number> {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?range=1d&interval=1m';
  const response = await fetch(url, { cf: { cacheTtl: 5, cacheEverything: false }, headers: { 'user-agent': 'Mozilla/5.0' } } as RequestInit);
  if (!response.ok) throw new Error('Oil price is unavailable');
  const data = await response.json() as { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number }, indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> } };
  const result = data.chart?.result?.[0];
  const close = result?.indicators?.quote?.[0]?.close || [];
  const latest = [...close].reverse().find((value) => Number.isFinite(Number(value)) && Number(value) > 0);
  const price = Number(latest || result?.meta?.regularMarketPrice);
  if (!Number.isFinite(price) || price <= 0) throw new Error('Invalid Oil price');
  return price;
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
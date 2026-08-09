import app from './index';
import './football-routes';
import type { Env } from './types';

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


function normalizeLockedMarkets(value: unknown): Record<PredictLockableMarket, boolean> {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(PREDICT_LOCKABLE_MARKETS.map((market) => [market, input[market] === true])) as Record<PredictLockableMarket, boolean>;
}

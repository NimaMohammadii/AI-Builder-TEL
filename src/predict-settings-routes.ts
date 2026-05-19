import app from './index';
import type { Env } from './types';

const CACHE_NONE = 'no-store';
const PREDICT_SETTINGS_KEY = 'predict/settings';

type PredictSettings = {
  liveBetsEnabled: boolean;
};

app.get('/app/api/predict-settings', async (c) => {
  return c.json(await getPredictSettings(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.get('/admin/api/predict-settings', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await getPredictSettings(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/predict-settings', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const settings: PredictSettings = { liveBetsEnabled: body.liveBetsEnabled !== false };
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
  if (!object) return { liveBetsEnabled: true };
  try {
    const json = JSON.parse(await object.text()) as Partial<PredictSettings>;
    return { liveBetsEnabled: json.liveBetsEnabled !== false };
  } catch {
    return { liveBetsEnabled: true };
  }
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

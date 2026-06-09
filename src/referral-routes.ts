import type { Hono } from 'hono';
import type { Env } from './types';
import { getReferralDashboard, registerReferral } from './referrals';

export function registerReferralRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/referral', async (c) => {
    try {
      const userId = c.req.query('userId') || '';
      return c.json(await getReferralDashboard(c.env, userId), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not load referral data' }, 400, { 'cache-control': 'no-store' });
    }
  });

  app.post('/app/api/referral/claim', async (c) => {
    try {
      const body = await c.req.json() as { userId?: unknown; ref?: unknown; referrerId?: unknown };
      const referrerId = body.referrerId ?? body.ref;
      return c.json(await registerReferral(c.env, body.userId, referrerId), 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not register referral' }, 400, { 'cache-control': 'no-store' });
    }
  });
}

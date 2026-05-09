import app from './index-admin';
import { getPlinkoControl, resetPlinkoControl, savePlinkoControl } from './plinko-control';
import { createStarsDeposit, listUserStarsDeposits } from './stars-deposits';
import { createTonDeposit, getTonDeposit, listUserTonDeposits, verifyTonDeposit } from './ton-deposits';
import type { Env } from './types';

app.get('/app/api/plinko-control', async (c) => c.json(await getPlinkoControl(c.env)));

app.post('/app/api/stars/deposits', async (c) => {
  try {
    const body = await c.req.json() as { userId?: string; stars?: unknown };
    return c.json(await createStarsDeposit(c.env, String(body.userId || ''), body.stars));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not create Stars deposit' }, 400);
  }
});

app.get('/app/api/stars/deposits', async (c) => {
  try {
    return c.json(await listUserStarsDeposits(c.env, String(c.req.query('userId') || '')));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load Stars deposits' }, 400);
  }
});

app.post('/app/api/ton/deposits', async (c) => {
  try {
    const body = await c.req.json() as { userId?: string; amountTon?: unknown };
    return c.json(await createTonDeposit(c.env, String(body.userId || ''), body.amountTon));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not create TON deposit' }, 400);
  }
});

app.get('/app/api/ton/deposits', async (c) => {
  try {
    return c.json(await listUserTonDeposits(c.env, String(c.req.query('userId') || '')));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load TON deposits' }, 400);
  }
});

app.get('/app/api/ton/deposits/:id', async (c) => {
  try {
    const deposit = await getTonDeposit(c.env, c.req.param('id'));
    return deposit ? c.json(deposit) : c.json({ error: 'Deposit not found' }, 404);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load TON deposit' }, 400);
  }
});

app.post('/app/api/ton/deposits/:id/verify', async (c) => {
  try {
    return c.json(await verifyTonDeposit(c.env, c.req.param('id')));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not verify TON deposit' }, 400);
  }
});

app.get('/admin/api/plinko-control', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getPlinkoControl(c.env));
});

app.post('/admin/api/plinko-control', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await savePlinkoControl(c.env, await c.req.json()));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not save Plinko control' }, 400);
  }
});

app.post('/admin/api/plinko-control/reset', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await resetPlinkoControl(c.env));
});

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

export default app;

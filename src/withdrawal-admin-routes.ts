import app from './index';
import { approveTonWithdrawal, listAdminTonWithdrawals, rejectTonWithdrawal } from './ton-withdrawals';

app.get('/admin/api/ton/withdrawals', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    return c.json(await listAdminTonWithdrawals(c.env, c.req.query('status') || 'pending'), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load withdrawals' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/admin/api/ton/withdrawals/:id/approve', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    return c.json(await approveTonWithdrawal(c.env, c.req.param('id')), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not approve withdrawal' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/admin/api/ton/withdrawals/:id/reject', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const body = await c.req.json().catch(() => ({})) as { reason?: unknown };
    return c.json(await rejectTonWithdrawal(c.env, c.req.param('id'), body.reason), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not reject withdrawal' }, 400, { 'cache-control': 'no-store' });
  }
});

function isAdminRequest(c: { env: { ADMIN_KEY?: string }; req: { header: (name: string) => string | undefined } }): boolean {
  const key = c.env.ADMIN_KEY;
  const cookie = c.req.header('cookie') || '';
  return Boolean(key && cookie.includes('vexa_admin=' + encodeURIComponent(key)));
}

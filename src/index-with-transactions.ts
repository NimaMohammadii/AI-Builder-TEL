import app from './index-admin-plinko';
import { listUserTonTransactions } from './ton-transactions';

app.get('/app/api/ton/history', async (c) => {
  try {
    const userId = String(c.req.query('userId') || '');
    const limit = Number(c.req.query('limit') || 50);
    return c.json(await listUserTonTransactions(c.env, userId, limit));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load history' }, 400);
  }
});

export default app;

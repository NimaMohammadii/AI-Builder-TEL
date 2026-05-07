import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import app from './index';
import { adminUsersJson, trackAppUser } from './admin-users';
import { getSectionLocks, setSectionLock } from './section-locks';
import type { Env } from './types';

const activitySchema = z.object({
  userId: z.string().min(1).max(64),
  username: z.string().max(80).nullable().optional(),
  firstName: z.string().max(120).nullable().optional(),
  section: z.string().max(40).nullable().optional(),
  credit: z.number().int().nonnegative().nullable().optional(),
});

const lockSchema = z.object({
  sectionId: z.string().min(1).max(40),
  locked: z.boolean(),
});

app.post('/app/api/activity', zValidator('json', activitySchema), async (c) => {
  return c.json(await trackAppUser(c.env, c.req.valid('json')));
});

app.get('/app/api/section-locks', async (c) => c.json(await getSectionLocks(c.env)));

app.get('/admin/api/users', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    return c.json(await adminUsersJson(c.env));
  } catch (error) {
    console.error('load admin users failed', error);
    return c.json({ users: [], stats: { total: 0, online: 0, inactive: 0, totalCredit: 0 }, error: 'Database is not ready. Run migrations.' }, 500);
  }
});

app.get('/admin/api/section-locks', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getSectionLocks(c.env));
});

app.post('/admin/api/section-locks', zValidator('json', lockSchema), async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = c.req.valid('json');
  try {
    return c.json(await setSectionLock(c.env, body.sectionId, body.locked));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not update lock' }, 400);
  }
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

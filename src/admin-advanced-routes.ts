import { setGroupAiDisabled, setUserGroupAiDisabled, listUserGroups } from './group-ai-access';
import { setSectionCodeLock, setSectionLock } from './section-locks';
import { setUserSectionBlocked } from './user-controls';
import type { Env } from './types';

type AppLike = {
  get: (path: string, handler: (c: HandlerContext) => Promise<Response> | Response) => unknown;
  post: (path: string, handler: (c: HandlerContext) => Promise<Response> | Response) => unknown;
};

type HandlerContext = {
  env: Env;
  req: {
    header: (name: string) => string | undefined;
    json: () => Promise<unknown>;
    query: (name: string) => string | undefined;
    param: (name: string) => string;
  };
  json: (data: unknown, status?: number) => Response;
};

export function registerAdvancedAdminRoutes(app: AppLike): void {
  app.post('/admin/api/users/section-block-timed', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json() as { userId?: unknown; sectionId?: unknown; blocked?: unknown; expiresAt?: unknown };
      return c.json(await setUserSectionBlocked(c.env, String(body.userId || ''), String(body.sectionId || ''), Boolean(body.blocked), body.expiresAt));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not update access' }, 400);
    }
  });

  app.post('/admin/api/section-locks-timed', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json() as { sectionId?: unknown; locked?: unknown; expiresAt?: unknown };
      return c.json(await setSectionLock(c.env, String(body.sectionId || ''), Boolean(body.locked), body.expiresAt));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not update lock' }, 400);
    }
  });

  app.post('/admin/api/section-locks/code-timed', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json() as { sectionId?: unknown; code?: unknown; expiresAt?: unknown };
      return c.json(await setSectionCodeLock(c.env, String(body.sectionId || ''), String(body.code || ''), body.expiresAt));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not save code lock' }, 400);
    }
  });

  app.get('/admin/api/user-groups', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      return c.json(await listUserGroups(c.env, String(c.req.query('userId') || '')));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not load user groups' }, 400);
    }
  });

  app.post('/admin/api/users/group-ai-disabled', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json() as { userId?: unknown; disabled?: unknown };
      const userId = cleanUserId(body.userId);
      await setUserGroupAiDisabled(c.env, userId, Boolean(body.disabled));
      return c.json(await listUserGroups(c.env, userId));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not update user group AI access' }, 400);
    }
  });

  app.post('/admin/api/groups/:chatId/ai-disabled', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const body = await c.req.json() as { disabled?: unknown; userId?: unknown };
      await setGroupAiDisabled(c.env, c.req.param('chatId'), Boolean(body.disabled));
      return body.userId ? c.json(await listUserGroups(c.env, String(body.userId))) : c.json({ ok: true });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not update group AI access' }, 400);
    }
  });
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
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

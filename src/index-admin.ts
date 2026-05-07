import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import app from './index';
import { adminUsersJson, trackAppUser } from './admin-users';
import { getSectionLocks, legacySectionImageKey, legacySectionImageTypeKey, normalizeSectionId, normalizeSectionImageKind, SECTION_LOCK_IMAGE_TYPES, sectionImageKey, sectionImageTypeKey, setSectionCodeLock, setSectionLock, verifySectionCode } from './section-locks';
import { adjustUserCredit, getUserControls, publicUserControls, setUserCredit, setUserSectionBlocked } from './user-controls';
import type { Env } from './types';

const activitySchema = z.object({
  userId: z.string().min(1).max(64),
  username: z.string().max(80).nullable().optional(),
  firstName: z.string().max(120).nullable().optional(),
  section: z.string().max(40).nullable().optional(),
  credit: z.number().int().nonnegative().nullable().optional(),
});

const lockSchema = z.object({ sectionId: z.string().min(1).max(40), locked: z.boolean() });
const codeLockSchema = z.object({ sectionId: z.string().min(1).max(40), code: z.string().min(1).max(80) });
const userIdSchema = z.object({ userId: z.string().min(1).max(80) });
const userCreditSchema = z.object({ userId: z.string().min(1).max(80), credit: z.number().int().nonnegative() });
const userCreditAdjustSchema = z.object({ userId: z.string().min(1).max(80), delta: z.number().int() });
const userSectionBlockSchema = z.object({ userId: z.string().min(1).max(80), sectionId: z.string().min(1).max(40), blocked: z.boolean() });

app.post('/app/api/activity', zValidator('json', activitySchema), async (c) => c.json(await trackAppUser(c.env, c.req.valid('json'))));
app.get('/app/api/section-locks', async (c) => c.json(await getSectionLocks(c.env)));

app.get('/app/api/section-lock-image/:section/:kind', async (c) => {
  try {
    const section = normalizeSectionId(c.req.param('section'));
    const kind = normalizeSectionImageKind(c.req.param('kind').replace(/\.png$/i, ''));
    const data = await c.env.BOT_CACHE.get(sectionImageKey(section, kind), 'arrayBuffer').catch(() => null);
    const type = await c.env.BOT_CACHE.get(sectionImageTypeKey(section, kind)).catch(() => null);
    if (!data) return c.text('Not found', 404);
    return new Response(data, { headers: { 'content-type': type || 'image/png', 'cache-control': 'no-store' } });
  } catch { return c.text('Not found', 404); }
});

app.get('/app/api/section-lock-image/:section', async (c) => {
  try {
    const section = normalizeSectionId(c.req.param('section').replace(/\.png$/i, ''));
    const data = await c.env.BOT_CACHE.get(legacySectionImageKey(section), 'arrayBuffer').catch(() => null);
    const type = await c.env.BOT_CACHE.get(legacySectionImageTypeKey(section)).catch(() => null);
    if (!data) return c.text('Not found', 404);
    return new Response(data, { headers: { 'content-type': type || 'image/png', 'cache-control': 'no-store' } });
  } catch { return c.text('Not found', 404); }
});

app.get('/app/api/user-controls', zValidator('query', userIdSchema), async (c) => c.json(await publicUserControls(c.env, c.req.valid('query').userId)));
app.post('/app/api/section-locks/verify', zValidator('json', codeLockSchema), async (c) => {
  const body = c.req.valid('json');
  try { return c.json(await verifySectionCode(c.env, body.sectionId, body.code)); }
  catch (error) { return c.json({ ok: false, error: error instanceof Error ? error.message : 'Could not verify code' }, 400); }
});

app.get('/admin/api/users', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try { return c.json(await adminUsersJson(c.env)); }
  catch (error) {
    console.error('load admin users failed', error);
    return c.json({ users: [], stats: { total: 0, online: 0, inactive: 0, totalCredit: 0 }, error: 'Database is not ready. Run migrations.' }, 500);
  }
});

app.get('/admin/api/user-controls', zValidator('query', userIdSchema), async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getUserControls(c.env, c.req.valid('query').userId));
});

app.post('/admin/api/users/credit', zValidator('json', userCreditSchema), async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = c.req.valid('json');
  try { return c.json(await setUserCredit(c.env, body.userId, body.credit)); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Could not update credit' }, 400); }
});

app.post('/admin/api/users/credit-adjust', zValidator('json', userCreditAdjustSchema), async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = c.req.valid('json');
  try { return c.json(await adjustUserCredit(c.env, body.userId, body.delta)); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Could not adjust credit' }, 400); }
});

app.post('/admin/api/users/section-block', zValidator('json', userSectionBlockSchema), async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = c.req.valid('json');
  try { return c.json(await setUserSectionBlocked(c.env, body.userId, body.sectionId, body.blocked)); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Could not update access' }, 400); }
});

app.get('/admin/api/section-locks', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  return c.json(await getSectionLocks(c.env));
});

app.post('/admin/api/section-lock-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    const form = await c.req.formData();
    const section = normalizeSectionId(String(form.get('sectionId') || ''));
    const kind = normalizeSectionImageKind(String(form.get('kind') || 'locked'));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!SECTION_LOCK_IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
    await c.env.BOT_CACHE.put(sectionImageKey(section, kind), await file.arrayBuffer(), { expirationTtl: 60 * 60 * 24 * 365 });
    await c.env.BOT_CACHE.put(sectionImageTypeKey(section, kind), file.type, { expirationTtl: 60 * 60 * 24 * 365 });
    return c.json(await getSectionLocks(c.env));
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Could not upload image' }, 400); }
});

app.post('/admin/api/section-locks', zValidator('json', lockSchema), async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = c.req.valid('json');
  try { return c.json(await setSectionLock(c.env, body.sectionId, body.locked)); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Could not update lock' }, 400); }
});

app.post('/admin/api/section-locks/code', zValidator('json', codeLockSchema), async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = c.req.valid('json');
  try { return c.json(await setSectionCodeLock(c.env, body.sectionId, body.code)); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Could not save code lock' }, 400); }
});

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }
export default app;

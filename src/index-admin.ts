import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import app from './index';
import { adminUsersJson, trackAppUser } from './admin-users';
import { getSectionLocks, legacySectionImageKey, legacySectionImageTypeKey, normalizeSectionId, normalizeSectionImageKind, SECTION_LOCK_IMAGE_TYPES, sectionImageKey, sectionImageTypeKey, sectionImageVersionKey, setSectionCodeLock, setSectionLock, verifySectionCode } from './section-locks';
import { adjustUserCredit, getUserControls, publicUserControls, setUserCredit, setUserSectionBlocked } from './user-controls';
import { setTelegramWebhook } from './telegram-agent-safe';
import { PUBLIC_BASE_URL } from './utils';
import type { Env } from './types';

const CREDIT_ICON_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const activitySchema = z.object({
  userId: z.string().min(1).max(64),
  username: z.string().max(80).nullable().optional(),
  firstName: z.string().max(120).nullable().optional(),
  section: z.string().max(40).nullable().optional(),
  credit: z.number().int().nonnegative().nullable().optional(),
  creditChanged: z.boolean().optional(),
  creditVersion: z.number().int().nonnegative().optional(),
});

const lockSchema = z.object({ sectionId: z.string().min(1).max(40), locked: z.boolean() });
const codeLockSchema = z.object({ sectionId: z.string().min(1).max(40), code: z.string().min(1).max(80) });
const userIdSchema = z.object({ userId: z.string().min(1).max(80) });
const userCreditSchema = z.object({ userId: z.string().min(1).max(80), credit: z.number().int().nonnegative() });
const userCreditAdjustSchema = z.object({ userId: z.string().min(1).max(80), delta: z.number().int() });
const userSectionBlockSchema = z.object({ userId: z.string().min(1).max(80), sectionId: z.string().min(1).max(40), blocked: z.boolean() });

app.get('/setup-webhook', async (c) => {
  const result = await setTelegramWebhook(c.env);
  const menu = await setBuilderMenuButton(c.env.TELEGRAM_BOT_TOKEN, `${PUBLIC_BASE_URL}/app`);
  const payload = { ...result, menu, webhookUrl: `${PUBLIC_BASE_URL}/telegram/webhook`, miniApp: `${PUBLIC_BASE_URL}/app` };
  const ok = Boolean((payload as { ok?: boolean }).ok);
  return new Response(`<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Setup Webhook</title><style>body{margin:0;background:#000;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:22px}main{max-width:520px;margin:auto}h1{font-size:28px;margin:0 0 10px}.box{border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:16px;background:#080808}pre{white-space:pre-wrap;word-break:break-word;color:#ddd;font-size:12px}.ok{color:#7CFFB2}.bad{color:#FF8A8A}</style></head><body><main><h1 class="${ok ? 'ok' : 'bad'}">${ok ? 'Webhook updated' : 'Webhook failed'}</h1><div class="box"><p>Webhook URL:</p><pre>${escapeHtml(`${PUBLIC_BASE_URL}/telegram/webhook`)}</pre><p>Mini app:</p><pre>${escapeHtml(`${PUBLIC_BASE_URL}/app`)}</pre><p>Telegram response:</p><pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre></div></main></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
});

app.post('/app/api/activity', zValidator('json', activitySchema), async (c) => c.json(await trackAppUser(c.env, c.req.valid('json'))));

app.get('/app/api/uploaded-images', async (c) => {
  const version = (await c.env.BOT_CACHE.get('admin:credit-icon-version').catch(() => null)) || '1';
  const hasCreditIcon = Boolean(await c.env.BOT_CACHE.get('admin:credit-icon-type').catch(() => null));
  const creditIconUrl = hasCreditIcon ? `/app/api/uploaded-image/credit-icon.png?v=${version}` : `/app/api/credit-icon.png?v=${version}`;
  const locks = await getSectionLocks(c.env);
  const preload = [creditIconUrl];
  for (const section of locks.sections) {
    if (section.lockedImageUrl) preload.push(section.lockedImageUrl);
    if (section.codeImageUrl) preload.push(section.codeImageUrl);
  }
  return c.json({ creditIconUrl, preload });
});

app.get('/app/api/uploaded-image/credit-icon.png', async (c) => {
  const data = await c.env.BOT_CACHE.get('admin:credit-icon', 'arrayBuffer').catch(() => null);
  const type = await c.env.BOT_CACHE.get('admin:credit-icon-type').catch(() => null);
  if (!data) return c.redirect('/app/api/credit-icon.png');
  return new Response(data, { headers: { 'content-type': type || 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
});

app.get('/app/api/section-locks', async (c) => c.json(await getSectionLocks(c.env)));

app.get('/app/api/section-lock-image/:section/:kind', async (c) => {
  try {
    const section = normalizeSectionId(c.req.param('section'));
    const kind = normalizeSectionImageKind(c.req.param('kind').replace(/\.png$/i, ''));
    const data = await c.env.BOT_CACHE.get(sectionImageKey(section, kind), 'arrayBuffer').catch(() => null);
    const type = await c.env.BOT_CACHE.get(sectionImageTypeKey(section, kind)).catch(() => null);
    if (!data) return c.text('Not found', 404);
    return new Response(data, { headers: { 'content-type': type || 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
  } catch { return c.text('Not found', 404); }
});

app.get('/app/api/section-lock-image/:section', async (c) => {
  try {
    const section = normalizeSectionId(c.req.param('section').replace(/\.png$/i, ''));
    const data = await c.env.BOT_CACHE.get(legacySectionImageKey(section), 'arrayBuffer').catch(() => null);
    const type = await c.env.BOT_CACHE.get(legacySectionImageTypeKey(section)).catch(() => null);
    if (!data) return c.text('Not found', 404);
    return new Response(data, { headers: { 'content-type': type || 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
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

app.post('/admin/api/upload-credit-icon', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const form = await c.req.formData();
  const file = form.get('icon');
  if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
  if (!CREDIT_ICON_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
  if (file.size > 2_000_000) return c.json({ error: 'Image must be under 2MB.' }, 400);
  const data = await file.arrayBuffer();
  const version = String(Date.now());
  await c.env.BOT_CACHE.put('admin:credit-icon', data, { expirationTtl: 60 * 60 * 24 * 365 });
  await c.env.BOT_CACHE.put('admin:credit-icon-type', file.type, { expirationTtl: 60 * 60 * 24 * 365 });
  await c.env.BOT_CACHE.put('admin:credit-icon-version', version, { expirationTtl: 60 * 60 * 24 * 365 });
  try { await c.env.ASSETS.put('credit-icon', new Blob([data]).stream(), { httpMetadata: { contentType: file.type } }); } catch (error) { console.warn('R2 credit icon save skipped', error); }
  return c.json({ ok: true, size: file.size, type: file.type, creditIconUrl: `/app/api/uploaded-image/credit-icon.png?v=${version}` });
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
    await c.env.BOT_CACHE.put(sectionImageVersionKey(section, kind), String(Date.now()), { expirationTtl: 60 * 60 * 24 * 365 });
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

async function setBuilderMenuButton(token: string, url: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ menu_button: { type: 'web_app', text: 'AI Builder TEL', web_app: { url } } }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

function escapeHtml(value: string): string { return value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char] ?? char)); }
function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }
export default app;

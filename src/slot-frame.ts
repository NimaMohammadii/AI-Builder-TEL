import app from './index';
import type { Env } from './types';

const KEY = 'slot-frame';
const TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_SIZE = 2_000_000;

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

app.get('/app/api/slot-frame', async (c) => {
  const head = await c.env.ASSETS.head(KEY).catch(() => null);
  const version = head?.customMetadata?.version || '1';
  return c.json({ ok: true, hasFrame: Boolean(head), slotFrameUrl: head ? `/app/api/uploaded-image/slot-frame.png?v=${version}` : null, version }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/uploaded-image/slot-frame.png', async (c) => {
  const head = await c.env.ASSETS.head(KEY).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const object = await c.env.ASSETS.get(KEY).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || head.httpMetadata?.contentType || 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-length': String(head.size),
    },
  });
});

app.post('/admin/api/upload-slot-frame', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    if (file.size > MAX_SIZE) return c.json({ error: 'Image must be under 2MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, slotFrameUrl: `/app/api/uploaded-image/slot-frame.png?v=${version}`, version }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload slot frame' }, 400, { 'cache-control': 'no-store' });
  }
});

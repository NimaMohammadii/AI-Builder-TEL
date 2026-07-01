import app from './index';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const PREDICT_LOADING_IMAGE_KEY = 'predict/loading-entry-image';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

app.get('/app/api/predict-loading-image.png', async (c) => getPredictLoadingImage(c.env));

app.get('/admin/api/predict-loading-image', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await predictLoadingImageJson(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/predict-loading-image', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400, { 'cache-control': CACHE_NONE });
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400, { 'cache-control': CACHE_NONE });
    if (file.size > 3_000_000) return c.json({ error: 'Image must be under 3MB.' }, 400, { 'cache-control': CACHE_NONE });
    const version = String(Date.now());
    await c.env.ASSETS.put(PREDICT_LOADING_IMAGE_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json(await predictLoadingImageJson(c.env), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload predict loading image' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function predictLoadingImageJson(env: Env): Promise<{ ok: boolean; hasImage: boolean; imageUrl: string }> {
  const head = await env.ASSETS.head(PREDICT_LOADING_IMAGE_KEY).catch(() => null);
  const version = head?.customMetadata?.version || '1';
  return { ok: true, hasImage: Boolean(head), imageUrl: head ? `/app/api/predict-loading-image.png?v=${version}` : '' };
}

async function getPredictLoadingImage(env: Env): Promise<Response> {
  const object = await env.ASSETS.get(PREDICT_LOADING_IMAGE_KEY).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', CACHE_LONG);
  if (!headers.get('content-type')) headers.set('content-type', object.customMetadata?.contentType || 'image/png');
  return new Response(object.body, { headers });
}

function adminCookieValue(cookie: string | undefined): string {
  const parts = String(cookie || '').split(';');
  for (const part of parts) {
    const item = part.trim();
    if (item.startsWith('vexa_admin=')) return decodeURIComponent(item.slice('vexa_admin='.length));
  }
  return '';
}
function isAdmin(env: Env, key: string): Promise<boolean> { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
async function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<boolean> { return isAdminSession(c.env, c.req.header('cookie')); }

import app from './index';

const okImages = new Set(['image/png', 'image/jpeg', 'image/webp']);
const iconCache = 'public, max-age=31536000, immutable';

app.get('/app/api/deposit-method-icon/:method', async (c) => {
  const url = new URL(c.req.url);
  if (url.search) {
    url.search = '';
    return Response.redirect(url.toString(), 302);
  }
  const method = cleanMethod(c.req.param('method'));
  const object = await c.env.ASSETS.get(`deposit-method/${method}`).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': iconCache } });
});

app.post('/admin/api/upload-deposit-method-icon', async (c) => {
  const cookie = c.req.header('cookie') || '';
  if (!c.env.ADMIN_KEY || !cookie.includes('vexa_admin=' + encodeURIComponent(c.env.ADMIN_KEY))) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const form = await c.req.formData();
  const method = cleanMethod(String(form.get('method') || 'stars'));
  const file = form.get('image');
  if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
  if (!okImages.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
  const version = String(Date.now());
  await c.env.ASSETS.put(`deposit-method/${method}`, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
  return c.json({ ok: true, method, url: `/app/api/deposit-method-icon/${method}.png?v=${version}` });
});

function cleanMethod(value: string): 'stars' | 'nft' {
  return String(value || '').replace(/\.png$/i, '').toLowerCase() === 'nft' ? 'nft' : 'stars';
}

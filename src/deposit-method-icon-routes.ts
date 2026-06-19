import app from './index';

app.get('/app/api/deposit-method-icon/:method', async (c) => {
  const method = String(c.req.param('method') || '').replace(/\.png$/i, '').toLowerCase() === 'nft' ? 'nft' : 'stars';
  const object = await c.env.ASSETS.get(`deposit-method/${method}`).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } });
});

const WHEEL_ASSET_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const WHEEL_ASSET_KINDS = new Set(['ring', 'center', 'pointer']);
const WHEEL_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';

function wheelAssetKind(value: unknown): 'ring' | 'center' | 'pointer' {
  const clean = String(value ?? '').replace(/\.png$/i, '').replace(/[^a-z]/g, '');
  if (clean === 'ring' || clean === 'center' || clean === 'pointer') return clean;
  throw new Error('Unknown wheel asset');
}

function wheelAssetKey(kind: string): string {
  return `wheel/${kind}`;
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdminRequest(c: { env: { ADMIN_KEY?: string }; req: { header: (name: string) => string | undefined } }): boolean {
  const key = adminCookieValue(c.req.header('cookie'));
  return Boolean(c.env.ADMIN_KEY && key && key === c.env.ADMIN_KEY);
}

export function registerWheelAssetRoutes(app: any): void {
  app.get('/app/api/wheel-asset/:kind', async (c: any) => {
    try {
      const kind = wheelAssetKind(c.req.param('kind'));
      const object = await c.env.ASSETS.get(wheelAssetKey(kind)).catch(() => null);
      if (!object) return c.text('Not found', 404, { 'cache-control': 'no-store' });
      return new Response(object.body, {
        headers: {
          'content-type': object.httpMetadata?.contentType || 'image/png',
          'cache-control': WHEEL_ASSET_CACHE_CONTROL,
        },
      });
    } catch {
      return c.text('Not found', 404, { 'cache-control': 'no-store' });
    }
  });

  app.post('/admin/api/upload-wheel-asset/:kind', async (c: any) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    try {
      const kind = wheelAssetKind(c.req.param('kind'));
      if (!WHEEL_ASSET_KINDS.has(kind)) return c.json({ error: 'Unknown wheel asset' }, 400);
      const form = await c.req.formData();
      const file = form.get('image');
      if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
      if (!WHEEL_ASSET_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
      if (file.size > 3_000_000) return c.json({ error: 'Image must be under 3MB.' }, 400);
      const version = String(Date.now());
      await c.env.ASSETS.put(wheelAssetKey(kind), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
      return c.json({ ok: true, kind, url: `/app/api/wheel-asset/${kind}.png?v=${version}` });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not upload wheel asset' }, 400);
    }
  });
}

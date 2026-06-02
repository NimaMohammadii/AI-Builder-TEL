const WHEEL_ASSET_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const WHEEL_ASSET_KINDS = new Set(['ring', 'center', 'pointer']);
const WHEEL_ASSET_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0';

type WheelAssetKind = 'ring' | 'center' | 'pointer';

function wheelAssetKind(value: unknown): WheelAssetKind {
  const clean = String(value ?? '').replace(/\.png$/i, '').replace(/[^a-z]/g, '');
  if (clean === 'ring' || clean === 'center' || clean === 'pointer') return clean;
  throw new Error('Unknown wheel asset');
}

function wheelAssetKey(kind: string): string {
  return `wheel/${kind}`;
}

function legacyKeys(kind: WheelAssetKind): string[] {
  if (kind === 'ring') return ['section-lock-image/wheel/locked', 'section-lock-image/wheel'];
  if (kind === 'center') return ['section-lock-image/wheel/code'];
  return [];
}

async function getWheelObject(env: { ASSETS: R2Bucket }, kind: WheelAssetKind): Promise<R2ObjectBody | null> {
  const keys = [wheelAssetKey(kind), ...legacyKeys(kind)];
  for (const key of keys) {
    const object = await env.ASSETS.get(key).catch(() => null);
    if (object) return object;
  }
  return null;
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdminRequest(c: { env: { ADMIN_KEY?: string }; req: { header: (name: string) => string | undefined } }): boolean {
  const key = adminCookieValue(c.req.header('cookie'));
  return Boolean(c.env.ADMIN_KEY && key && key === c.env.ADMIN_KEY);
}

function imageResponse(object: R2ObjectBody): Response {
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': WHEEL_ASSET_CACHE_CONTROL,
    },
  });
}

export function registerWheelAssetRoutes(app: any): void {
  app.get('/app/api/wheel-ring.png', async (c: any) => {
    const object = await getWheelObject(c.env, 'ring');
    if (!object) return c.text('Not found', 404, { 'cache-control': 'no-store' });
    return imageResponse(object);
  });

  app.get('/app/api/wheel-center.png', async (c: any) => {
    const object = await getWheelObject(c.env, 'center');
    if (!object) return c.text('Not found', 404, { 'cache-control': 'no-store' });
    return imageResponse(object);
  });

  app.get('/app/api/wheel-asset/:kind', async (c: any) => {
    try {
      const kind = wheelAssetKind(c.req.param('kind'));
      const object = await getWheelObject(c.env, kind);
      if (!object) return c.text('Not found', 404, { 'cache-control': 'no-store' });
      return imageResponse(object);
    } catch {
      return c.text('Not found', 404, { 'cache-control': 'no-store' });
    }
  });

  app.post('/admin/api/upload-wheel-ring', async (c: any) => uploadWheelAsset(c, 'ring'));
  app.post('/admin/api/upload-wheel-center', async (c: any) => uploadWheelAsset(c, 'center'));

  app.post('/admin/api/upload-wheel-asset/:kind', async (c: any) => {
    try {
      return uploadWheelAsset(c, wheelAssetKind(c.req.param('kind')));
    } catch {
      return c.json({ error: 'Unknown wheel asset' }, 400);
    }
  });
}

async function uploadWheelAsset(c: any, kind: WheelAssetKind): Promise<Response> {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  try {
    if (!WHEEL_ASSET_KINDS.has(kind)) return c.json({ error: 'Unknown wheel asset' }, 400);
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!WHEEL_ASSET_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG, SVG or WebP files are allowed.' }, 400);
    if (file.size > 3_000_000) return c.json({ error: 'Image must be under 3MB.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(wheelAssetKey(kind), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, kind, url: `/app/api/wheel-${kind === 'ring' ? 'ring' : 'center'}.png?v=${version}` });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload wheel asset' }, 400);
  }
}

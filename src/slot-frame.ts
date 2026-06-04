import app from './index';
import type { Env } from './types';

const KEY = 'slot-frame';
const SYMBOL_PREFIX = 'slot-symbol/';
const TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const SLOT_SYMBOLS = [
  { id: 'cherry', label: 'Cherry / گیلاس' },
  { id: 'lemon', label: 'Lemon / لیمو' },
  { id: 'orange', label: 'Orange / پرتقال' },
  { id: 'grape', label: 'Grape / انگور' },
  { id: 'watermelon', label: 'Watermelon / هندوانه' },
  { id: 'diamond', label: 'Diamond / الماس' },
  { id: 'gold', label: 'Gold Star/Bell / ستاره یا زنگ طلایی' },
  { id: 'lucky7', label: 'Lucky 7 / عدد ۷ قرمز یا طلایی' },
] as const;

const SLOT_SYMBOL_IDS = new Set(SLOT_SYMBOLS.map((symbol) => symbol.id));

type SlotSymbolId = typeof SLOT_SYMBOLS[number]['id'];

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

function slotSymbolKey(id: SlotSymbolId): string {
  return `${SYMBOL_PREFIX}${id}`;
}

function cleanSlotSymbolId(value: string): SlotSymbolId | null {
  const id = value.replace(/\.png$/i, '') as SlotSymbolId;
  return SLOT_SYMBOL_IDS.has(id) ? id : null;
}

function slotSymbolUrl(id: SlotSymbolId, version: string): string {
  return `/app/api/uploaded-image/slot-symbols/${id}.png?v=${version}`;
}

async function symbolPayload(env: Env) {
  const symbols = await Promise.all(SLOT_SYMBOLS.map(async (symbol) => {
    const head = await env.ASSETS.head(slotSymbolKey(symbol.id)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return {
      id: symbol.id,
      label: symbol.label,
      hasImage: Boolean(head),
      imageUrl: head ? slotSymbolUrl(symbol.id, version) : null,
      version,
    };
  }));
  return symbols;
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

app.get('/app/api/slot-symbols', async (c) => {
  return c.json({ ok: true, symbols: await symbolPayload(c.env) }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/uploaded-image/slot-symbols/:id.png', async (c) => {
  const id = cleanSlotSymbolId(c.req.param('id'));
  if (!id) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const key = slotSymbolKey(id);
  const head = await c.env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const object = await c.env.ASSETS.get(key).catch(() => null);
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
    const version = String(Date.now());
    await c.env.ASSETS.put(KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, slotFrameUrl: `/app/api/uploaded-image/slot-frame.png?v=${version}`, version }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload slot frame' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/admin/api/upload-slot-symbol', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const id = String(form.get('id') || '') as SlotSymbolId;
    const file = form.get('image');
    if (!SLOT_SYMBOL_IDS.has(id)) return c.json({ error: 'Choose a valid Slot symbol.' }, 400);
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(slotSymbolKey(id), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, id, imageUrl: slotSymbolUrl(id, version), version, symbols: await symbolPayload(c.env) }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Slot symbol' }, 400, { 'cache-control': 'no-store' });
  }
});
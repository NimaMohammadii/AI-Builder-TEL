import type { Hono } from 'hono';
import type { Env } from './types';

const FRAME_KEY = 'slot-frame';
const SPIN_AUDIO_KEY = 'slot-spin-audio';
const CONTROL_PREFIX = 'slot-control/';
const SYMBOL_PREFIX = 'slot-symbol/';
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';

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

const SLOT_CONTROLS = [
  { id: 'spin', label: 'Spin button / دکمه اسپین' },
  { id: 'input', label: 'Input button / دکمه اینپوت' },
] as const;

const SLOT_SYMBOL_IDS = new Set(SLOT_SYMBOLS.map((symbol) => symbol.id));
const SLOT_CONTROL_IDS = new Set(SLOT_CONTROLS.map((control) => control.id));

type SlotSymbolId = typeof SLOT_SYMBOLS[number]['id'];
type SlotControlId = typeof SLOT_CONTROLS[number]['id'];

export function registerSlotAssetRoutes(app: Hono<{ Bindings: Env }>): void {
  app.get('/app/api/slot-frame', async (c) => {
    const head = await c.env.ASSETS.head(FRAME_KEY).catch(() => null);
    const version = assetVersion(head);
    return c.json(
      {
        ok: true,
        hasFrame: Boolean(head),
        slotFrameUrl: head ? `/app/api/uploaded-image/slot-frame.png?v=${encodeURIComponent(version)}` : null,
        version,
      },
      200,
      { 'cache-control': 'no-store' },
    );
  });

  app.get('/app/api/uploaded-image/slot-frame.png', async (c) => {
    return imageResponse(c.env, FRAME_KEY);
  });

  app.get('/app/api/slot-symbols', async (c) => {
    const symbols = await Promise.all(SLOT_SYMBOLS.map(async (symbol) => {
      const head = await c.env.ASSETS.head(symbolKey(symbol.id)).catch(() => null);
      const version = assetVersion(head);
      return {
        id: symbol.id,
        label: symbol.label,
        hasImage: Boolean(head),
        imageUrl: head
          ? `/app/api/uploaded-image/slot-symbols/${symbol.id}?v=${encodeURIComponent(version)}`
          : null,
        version,
      };
    }));
    return c.json({ ok: true, symbols }, 200, { 'cache-control': 'no-store' });
  });

  app.get('/app/api/uploaded-image/slot-symbols/:id', async (c) => {
    const id = cleanSymbolId(c.req.param('id'));
    if (!id) return notFound();
    return imageResponse(c.env, symbolKey(id));
  });

  app.get('/app/api/slot-controls', async (c) => {
    const controls = await Promise.all(SLOT_CONTROLS.map(async (control) => {
      const head = await c.env.ASSETS.head(controlKey(control.id)).catch(() => null);
      const version = assetVersion(head);
      return {
        id: control.id,
        label: control.label,
        hasImage: Boolean(head),
        imageUrl: head
          ? `/app/api/uploaded-image/slot-controls/${control.id}?v=${encodeURIComponent(version)}`
          : null,
        version,
      };
    }));
    return c.json({ ok: true, controls }, 200, { 'cache-control': 'no-store' });
  });

  app.get('/app/api/uploaded-image/slot-controls/:id', async (c) => {
    const id = cleanControlId(c.req.param('id'));
    if (!id) return notFound();
    return imageResponse(c.env, controlKey(id));
  });

  app.get('/app/api/slot-spin-audio', async (c) => {
    const head = await c.env.ASSETS.head(SPIN_AUDIO_KEY).catch(() => null);
    const version = assetVersion(head);
    return c.json(
      {
        ok: true,
        hasAudio: Boolean(head),
        audioUrl: head ? `/app/api/uploaded-audio/slot-spin?v=${encodeURIComponent(version)}` : null,
        version,
      },
      200,
      { 'cache-control': 'no-store' },
    );
  });

  app.get('/app/api/uploaded-audio/slot-spin', async (c) => {
    const object = await c.env.ASSETS.get(SPIN_AUDIO_KEY).catch(() => null);
    if (!object) return notFound();
    return new Response(object.body, {
      headers: {
        'content-type': object.httpMetadata?.contentType || 'audio/mpeg',
        'cache-control': IMMUTABLE_CACHE,
      },
    });
  });
}

function symbolKey(id: SlotSymbolId): string {
  return `${SYMBOL_PREFIX}${id}`;
}

function controlKey(id: SlotControlId): string {
  return `${CONTROL_PREFIX}${id}`;
}

function cleanSymbolId(value: string): SlotSymbolId | null {
  const id = String(value || '').replace(/\.png$/i, '') as SlotSymbolId;
  return SLOT_SYMBOL_IDS.has(id) ? id : null;
}

function cleanControlId(value: string): SlotControlId | null {
  const id = String(value || '').replace(/\.png$/i, '') as SlotControlId;
  return SLOT_CONTROL_IDS.has(id) ? id : null;
}

function assetVersion(head: { customMetadata?: Record<string, string>; uploaded?: Date } | null): string {
  return String(head?.customMetadata?.version || head?.uploaded?.getTime?.() || '1');
}

async function imageResponse(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return notFound();
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': IMMUTABLE_CACHE,
    },
  });
}

function notFound(): Response {
  return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
}

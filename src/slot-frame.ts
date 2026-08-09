import app from './index';
import type { Env } from './types';

const KEY = 'slot-frame';
const SLOT_SPIN_AUDIO_KEY = 'slot-spin-audio';
const HOME_LOTTERY_SLOT_KEY = 'home-lottery-slot';
const CONTROL_PREFIX = 'slot-control/';
const SYMBOL_PREFIX = 'slot-symbol/';
const DICE_ASSET_PREFIX = 'dice-asset/';
const TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const AUDIO_TYPES = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'application/ogg', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/x-m4a', 'audio/m4a']);

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

const SLOT_CONTROLS = [
  { id: 'spin', label: 'Spin button / دکمه اسپین' },
  { id: 'input', label: 'Input button / دکمه اینپوت' },
] as const;

const SLOT_CONTROL_IDS = new Set(SLOT_CONTROLS.map((control) => control.id));

const DICE_ASSETS = [
  { id: 'roll', label: 'Roll Dice button / دکمه رول دایس', hint: 'Replaces the main Roll Dice button.' },
  { id: 'bet', label: 'Bet input row / اینپوت و دو دکمه عددی', hint: 'Replaces the visual row that contains 1/2, amount input, and 2x together.' },
  { id: 'slider', label: 'Number bar button / دکمه نوار عددی تاس', hint: 'Replaces the draggable button on the Dice number bar.' },
  { id: 'stats', label: 'Bottom stats row / تصویر جایگزین کارت‌های پایین', hint: 'Replaces the BET, LAST WIN, and BALANCE cards together.' },
] as const;

const DICE_ASSET_IDS = new Set(DICE_ASSETS.map((asset) => asset.id));

type SlotControlId = typeof SLOT_CONTROLS[number]['id'];

type SlotSymbolId = typeof SLOT_SYMBOLS[number]['id'];

type DiceAssetId = typeof DICE_ASSETS[number]['id'];

function slotSymbolKey(id: SlotSymbolId): string {
  return `${SYMBOL_PREFIX}${id}`;
}

function slotControlKey(id: SlotControlId): string {
  return `${CONTROL_PREFIX}${id}`;
}

function diceAssetKey(id: DiceAssetId): string {
  return `${DICE_ASSET_PREFIX}${id}`;
}

function cleanSlotSymbolId(value: string): SlotSymbolId | null {
  const id = value.replace(/\.png$/i, '') as SlotSymbolId;
  return SLOT_SYMBOL_IDS.has(id) ? id : null;
}

function cleanSlotControlId(value: string): SlotControlId | null {
  const id = value.replace(/\.png$/i, '') as SlotControlId;
  return SLOT_CONTROL_IDS.has(id) ? id : null;
}

function cleanDiceAssetId(value: string): DiceAssetId | null {
  const id = value.replace(/\.png$/i, '') as DiceAssetId;
  return DICE_ASSET_IDS.has(id) ? id : null;
}

function slotSymbolUrl(id: SlotSymbolId, version: string): string {
  return `/app/api/uploaded-image/slot-symbols/${id}?v=${version}`;
}

function slotSpinAudioUrl(version: string): string {
  return `/app/api/uploaded-audio/slot-spin?v=${version}`;
}

function homeLotterySlotUrl(version: string): string {
  return `/app/api/home-lottery-slot.png?v=${version}`;
}

function slotControlUrl(id: SlotControlId, version: string): string {
  return `/app/api/uploaded-image/slot-controls/${id}?v=${version}`;
}

function diceAssetUrl(id: DiceAssetId, version: string): string {
  return `/app/api/uploaded-image/dice-assets/${id}?v=${version}`;
}

async function controlPayload(env: Env) {
  const controls = await Promise.all(SLOT_CONTROLS.map(async (control) => {
    const head = await env.ASSETS.head(slotControlKey(control.id)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return {
      id: control.id,
      label: control.label,
      hasImage: Boolean(head),
      imageUrl: head ? slotControlUrl(control.id, version) : null,
      version,
    };
  }));
  return controls;
}

async function diceAssetPayload(env: Env) {
  const assets = await Promise.all(DICE_ASSETS.map(async (asset) => {
    const head = await env.ASSETS.head(diceAssetKey(asset.id)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return {
      id: asset.id,
      label: asset.label,
      hint: asset.hint,
      hasImage: Boolean(head),
      imageUrl: head ? diceAssetUrl(asset.id, version) : null,
      version,
    };
  }));
  return assets;
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

async function slotControlResponse(env: Env, value: string): Promise<Response> {
  const id = cleanSlotControlId(value);
  if (!id) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const key = slotControlKey(id);
  const head = await env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || head.httpMetadata?.contentType || 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-length': String(head.size),
    },
  });
}

async function diceAssetResponse(env: Env, value: string): Promise<Response> {
  const id = cleanDiceAssetId(value);
  if (!id) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const key = diceAssetKey(id);
  const head = await env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || head.httpMetadata?.contentType || 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-length': String(head.size),
    },
  });
}

async function slotSymbolResponse(env: Env, value: string): Promise<Response> {
  const id = cleanSlotSymbolId(value);
  if (!id) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const key = slotSymbolKey(id);
  const head = await env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || head.httpMetadata?.contentType || 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-length': String(head.size),
    },
  });
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


app.get('/app/api/home-lottery-slot-meta', async (c) => {
  const head = await c.env.ASSETS.head(HOME_LOTTERY_SLOT_KEY).catch(() => null);
  const version = head?.customMetadata?.version || '1';
  return c.json({ ok: true, hasImage: Boolean(head), url: homeLotterySlotUrl(version), version }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/home-lottery-slot.png', async (c) => {
  const head = await c.env.ASSETS.head(HOME_LOTTERY_SLOT_KEY).catch(() => null);
  if (!head) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  const object = await c.env.ASSETS.get(HOME_LOTTERY_SLOT_KEY).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
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


app.get('/app/api/slot-controls', async (c) => {
  return c.json({ ok: true, controls: await controlPayload(c.env) }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/uploaded-image/slot-controls/:id', async (c) => {
  return slotControlResponse(c.env, c.req.param('id'));
});

app.get('/app/api/uploaded-image/slot-controls/:id.png', async (c) => {
  return slotControlResponse(c.env, c.req.param('id'));
});

app.get('/app/api/uploaded-image/slot-symbols/:id', async (c) => {
  return slotSymbolResponse(c.env, c.req.param('id'));
});



app.get('/app/api/uploaded-image/slot-symbols/:id.png', async (c) => {
  return slotSymbolResponse(c.env, c.req.param('id'));
});

app.get('/app/api/slot-spin-audio', async (c) => {
  const head = await c.env.ASSETS.head(SLOT_SPIN_AUDIO_KEY).catch(() => null);
  const version = head?.customMetadata?.version || '1';
  return c.json({ ok: true, hasAudio: Boolean(head), audioUrl: head ? slotSpinAudioUrl(version) : null, version }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/uploaded-audio/slot-spin', async (c) => {
  const head = await c.env.ASSETS.head(SLOT_SPIN_AUDIO_KEY).catch(() => null);
  if (!head) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const object = await c.env.ASSETS.get(SLOT_SPIN_AUDIO_KEY).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || head.httpMetadata?.contentType || 'audio/mpeg',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-length': String(head.size),
    },
  });
});

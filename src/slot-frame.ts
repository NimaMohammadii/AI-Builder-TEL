import app from './index';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

const KEY = 'slot-frame';
const SLOT_SPIN_AUDIO_KEY = 'slot-spin-audio';
const HOME_LOTTERY_SLOT_KEY = 'home-lottery-slot';
const HOME_SLOT_DIGIT_PREFIX = 'home-slot-digit/';
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

const HOME_SLOT_DIGITS = Array.from({ length: 10 }, (_, digit) => ({ digit, label: `Digit ${digit} / عدد ${digit}` }));

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

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): Promise<boolean> {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

async function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<boolean> {
  return isAdminSession(c.env, c.req.header('cookie'));
}

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

function homeSlotDigitKey(digit: number): string {
  return `${HOME_SLOT_DIGIT_PREFIX}${digit}`;
}

function homeSlotDigitUrl(digit: number, version: string): string {
  return `/app/api/home-slot-digit/${digit}.png?v=${version}`;
}

function cleanHomeSlotDigit(value: string): number | null {
  const digit = Number(value.replace(/\.png$/i, ''));
  return Number.isInteger(digit) && digit >= 0 && digit <= 9 ? digit : null;
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

async function homeSlotDigitPayload(env: Env) {
  const digits = await Promise.all(HOME_SLOT_DIGITS.map(async (item) => {
    const head = await env.ASSETS.head(homeSlotDigitKey(item.digit)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return {
      digit: item.digit,
      label: item.label,
      hasImage: Boolean(head),
      imageUrl: head ? homeSlotDigitUrl(item.digit, version) : null,
      version,
    };
  }));
  return digits;
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

async function homeSlotDigitResponse(env: Env, value: string): Promise<Response> {
  const digit = cleanHomeSlotDigit(value);
  if (digit === null) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const key = homeSlotDigitKey(digit);
  const head = await env.ASSETS.head(key).catch(() => null);
  if (!head) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('', { status: 204, headers: { 'cache-control': 'no-store' } });
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

app.post('/admin/api/upload-home-lottery-slot', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(HOME_LOTTERY_SLOT_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, url: homeLotterySlotUrl(version), version }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload lottery slot image' }, 400, { 'cache-control': 'no-store' });
  }
});


app.get('/app/api/home-slot-digits', async (c) => {
  return c.json({ ok: true, digits: await homeSlotDigitPayload(c.env) }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/home-slot-digit/:digit', async (c) => {
  return homeSlotDigitResponse(c.env, c.req.param('digit'));
});

app.get('/app/api/home-slot-digit/:digit.png', async (c) => {
  return homeSlotDigitResponse(c.env, c.req.param('digit'));
});

app.post('/admin/api/upload-home-slot-digit/:digit', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  const digit = cleanHomeSlotDigit(c.req.param('digit'));
  if (digit === null) return c.json({ error: 'Invalid digit.' }, 400, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(homeSlotDigitKey(digit), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, digit, url: homeSlotDigitUrl(digit, version), version }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload slot digit image' }, 400, { 'cache-control': 'no-store' });
  }
});

app.get('/app/api/slot-symbols', async (c) => {
  return c.json({ ok: true, symbols: await symbolPayload(c.env) }, 200, { 'cache-control': 'no-store' });
});

app.get('/app/api/dice-assets', async (c) => {
  return c.json({ ok: true, assets: await diceAssetPayload(c.env) }, 200, { 'cache-control': 'no-store' });
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

app.get('/app/api/uploaded-image/dice-assets/:id', async (c) => {
  return diceAssetResponse(c.env, c.req.param('id'));
});

app.get('/app/api/uploaded-image/dice-assets/:id.png', async (c) => {
  return diceAssetResponse(c.env, c.req.param('id'));
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

app.post('/admin/api/upload-slot-frame', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
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

app.post('/admin/api/upload-slot-control', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const id = String(form.get('id') || '') as SlotControlId;
    const file = form.get('image');
    if (!SLOT_CONTROL_IDS.has(id)) return c.json({ error: 'Choose a valid Slot control image.' }, 400);
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(slotControlKey(id), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, id, imageUrl: slotControlUrl(id, version), version, controls: await controlPayload(c.env) }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Slot control image' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/admin/api/upload-dice-asset', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const id = String(form.get('id') || '') as DiceAssetId;
    const file = form.get('image');
    if (!DICE_ASSET_IDS.has(id)) return c.json({ error: 'Choose a valid Dice image slot.' }, 400);
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400);
    if (!TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(diceAssetKey(id), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, id, imageUrl: diceAssetUrl(id, version), version, assets: await diceAssetPayload(c.env) }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Dice image' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/admin/api/upload-slot-symbol', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
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

app.post('/admin/api/upload-slot-spin-audio', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const form = await c.req.formData();
    const file = form.get('audio');
    if (!(file instanceof File)) return c.json({ error: 'Choose an audio file.' }, 400);
    if (!AUDIO_TYPES.has(file.type)) return c.json({ error: 'Only MP3, WAV, OGG, WebM, M4A or AAC audio files are allowed.' }, 400);
    const version = String(Date.now());
    await c.env.ASSETS.put(SLOT_SPIN_AUDIO_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json({ ok: true, audioUrl: slotSpinAudioUrl(version), version }, 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload Slot spin audio' }, 400, { 'cache-control': 'no-store' });
  }
});
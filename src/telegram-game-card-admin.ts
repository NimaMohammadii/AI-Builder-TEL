import type { Env } from './types';
import { sendAdminHome as sendCurrentAdminHome } from './telegram-section-access-admin';
import { PUBLIC_BASE_URL } from './utils';
import { setSpecialWheelEnabled } from './special-wheel-mode';
import { sectionBackgroundR2Key } from './section-backgrounds';

type Photo = { file_id: string; file_size?: number };
type Document = { file_id: string; file_size?: number; mime_type?: string; file_name?: string };
type Message = { chat: { id: number }; from?: { id: number }; text?: string; photo?: Photo[]; document?: Document };
type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { message?: Message; callback_query?: Callback };
type Button = { text: string; callback_data: string };
type Keyboard = Button[][];
type UploadSource = { fileId: string; size?: number; type: string; via: 'photo' | 'document' };

type UploadTarget = { kind: 'game'; game: string } | { kind: 'background'; game: string } | { kind: 'crash-stage'; slot: number } | { kind: 'ton' };

const GAMES = [
  ['mines', 'Mines'], ['plinko', 'Plinko'], ['slot', 'Slot'],
  ['wheel', 'Wheel'], ['dice', 'Dice'], ['crash', 'Crash'], ['hilo', 'Chicken Cross'],
  ['coinflip', 'Pump'], ['ghostrun', 'Ghost Run'],
] as const;
const GAME_IDS = new Set(GAMES.map(([id]) => id));
const BACKGROUND_GAMES = [
  ['ghostrun', 'Ghost Run'],
  ['coinflip', 'Pump'],
] as const;
const BACKGROUND_GAME_IDS = new Set(BACKGROUND_GAMES.map(([id]) => id));
const STATE_PREFIX = 'admin:game-card-upload:';
const BACKGROUND_STATE_PREFIX = 'background:';
const CRASH_STAGE_STATE_PREFIX = 'crash-stage:';
const TON_STATE = 'ton-icon';
const MAX_BYTES = 10_000_000;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function handleGameCardAdminRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const image = url.pathname.match(/^\/app\/api\/game-card-image\/([^/]+)$/);
  if (request.method === 'GET' && image) return serveImage(request, env, image[1]);
  const crashStageImage = url.pathname.match(/^\/app\/api\/crash-stage-image\/(\d+)(?:\.png)?$/);
  if (request.method === 'GET' && crashStageImage) return serveCrashStageImage(request, env, crashStageImage[1]);
  if (request.method === 'GET' && url.pathname === '/app/api/crash-stage-images') return serveCrashStageManifest(env);
  if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') return null;
  const update = await request.clone().json().catch(() => null) as Update | null;
  if (!update) return null;
  return handleUpdate(env, update);
}

async function serveImage(request: Request, env: Env, raw: string): Promise<Response> {
  const game = normalizeGame(raw.replace(/\.png$/i, ''));
  if (!game) return new Response('Not found', { status: 404 });
  const object = await env.ASSETS.get(gameKey(game)).catch(() => null);
  if (!object) {
    return Response.redirect(new URL(`/app/api/section-lock-image/${game}/locked.png?v=1`, request.url).toString(), 302);
  }
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/jpeg',
      'cache-control': 'no-store, max-age=0',
      'x-content-type-options': 'nosniff',
    },
  });
}

async function serveCrashStageImage(request: Request, env: Env, raw: string): Promise<Response> {
  const slot = normalizeCrashStageSlot(raw);
  if (!slot) return new Response('Not found', { status: 404 });
  const object = await env.ASSETS.get(crashStageKey(slot)).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const versioned = Boolean(new URL(request.url).searchParams.get('v'));
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/jpeg',
      'cache-control': versioned ? 'public, max-age=31536000, immutable' : 'no-store, max-age=0',
      'x-content-type-options': 'nosniff',
    },
  });
}

async function serveCrashStageManifest(env: Env): Promise<Response> {
  const images: Record<string, string | null> = {};
  const preload: string[] = [];
  await Promise.all(Array.from({ length: 10 }, async (_, index) => {
    const slot = index + 1;
    const object = await env.ASSETS.head(crashStageKey(slot)).catch(() => null);
    if (!object) { images[String(slot)] = null; return; }
    const version = String(object.customMetadata?.version || object.uploaded?.getTime?.() || '1');
    const url = `/app/api/crash-stage-image/${slot}.png?v=${encodeURIComponent(version)}`;
    images[String(slot)] = url;
    preload.push(url);
  }));
  return Response.json({ images, preload }, { headers: { 'cache-control': 'no-store' } });
}

async function handleUpdate(env: Env, update: Update): Promise<Response | null> {
  const token = env.BOT_TOKEN;
  if (!token) return null;

  const callback = update.callback_query;
  if (callback) {
    const data = callback.data || '';
    const ours = data === 'botadmin:home'
      || data === 'botadmin:imagesmenu'
      || data === 'botadmin:gameimages'
      || data === 'botadmin:gamebackgrounds'
      || data === 'botadmin:crashstage'
      || data === 'botadmin:tonlogo'
      || data.startsWith('botadmin:gameimage:')
      || data.startsWith('botadmin:gamebackground:')
      || data.startsWith('botadmin:crashstage:')
      || data.startsWith('botadmin:specialwheel:');
    if (!ours) return null;
    if (!isAdmin(env, callback.from.id)) return ok();
    await tg(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
    const chatId = callback.message?.chat.id ?? callback.from.id;
    const messageId = callback.message?.message_id;

    if (data === 'botadmin:home') {
      await clearState(env, callback.from.id);
      await sendHome(env, token, chatId, messageId);
    } else if (data.startsWith('botadmin:specialwheel:')) {
      const enabled = data.endsWith(':on');
      await clearState(env, callback.from.id);
      await setSpecialWheelEnabled(env, enabled);
      await sendHome(env, token, chatId, messageId);
    } else if (data === 'botadmin:imagesmenu') {
      await clearState(env, callback.from.id);
      await sendImagesMenu(token, chatId, messageId);
    } else if (data === 'botadmin:gameimages') {
      await clearState(env, callback.from.id);
      await sendGameMenu(token, chatId, messageId);
    } else if (data === 'botadmin:gamebackgrounds') {
      await clearState(env, callback.from.id);
      await sendBackgroundMenu(token, chatId, messageId);
    } else if (data === 'botadmin:crashstage') {
      await clearState(env, callback.from.id);
      await sendCrashStageMenu(env, token, chatId, messageId);
    } else if (data === 'botadmin:tonlogo') {
      await env.BOT_CACHE.put(stateKey(callback.from.id), TON_STATE, { expirationTtl: 900 });
      await upsert(token, chatId, messageId, '💎 لوگوی TON\n\nبرای حفظ فرمت و شفافیت، تصویر PNG را حتماً به‌صورت File/Document بفرستید.', [
        [{ text: '⬅️ تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }],
      ]);
    } else if (data.startsWith('botadmin:gamebackground:')) {
      const game = normalizeBackgroundGame(data.slice('botadmin:gamebackground:'.length));
      if (game) {
        await env.BOT_CACHE.put(stateKey(callback.from.id), `${BACKGROUND_STATE_PREFIX}${game}`, { expirationTtl: 900 });
        await upsert(token, chatId, messageId, `🌄 بک‌گراند ${backgroundLabel(game)}\n\nتصویر را به‌صورت عکس معمولی یا File/Document بفرستید. PNG، JPG و WebP پشتیبانی می‌شوند.`, [
          [{ text: '⬅️ بازگشت', callback_data: 'botadmin:gamebackgrounds' }],
        ]);
      }
    } else if (data.startsWith('botadmin:crashstage:')) {
      const slot = normalizeCrashStageSlot(data.slice('botadmin:crashstage:'.length));
      if (slot) {
        await env.BOT_CACHE.put(stateKey(callback.from.id), `${CRASH_STAGE_STATE_PREFIX}${slot}`, { expirationTtl: 900 });
        await upsert(token, chatId, messageId, `🚀 تصویر ${slot} از 10 داخل کادر Crash\n\nتصویر ${slot === 1 ? 'شروع/پایین‌ترین بخش' : slot === 10 ? 'آخر/بالاترین بخش' : `مرحله ${slot}`} است. برای حفظ کیفیت، تصویر را به‌صورت File/Document بفرستید. PNG، JPG و WebP پشتیبانی می‌شوند.`, [
          [{ text: '⬅️ بازگشت', callback_data: 'botadmin:crashstage' }],
        ]);
      }
    } else {
      const game = normalizeGame(data.slice('botadmin:gameimage:'.length));
      if (game) {
        await env.BOT_CACHE.put(stateKey(callback.from.id), game, { expirationTtl: 900 });
        await upsert(token, chatId, messageId, `🖼 تصویر کارت ${label(game)}\n\nتصویر را به‌صورت عکس معمولی یا File/Document بفرستید. نسبت پیشنهادی ۴:۵ است.`, [
          [{ text: '⬅️ بازگشت', callback_data: 'botadmin:gameimages' }],
        ]);
      }
    }
    return ok();
  }

  const message = update.message;
  if (!message?.from?.id) return null;
  const text = message.text?.trim() || '';
  if (isAdminCommand(text)) {
    if (!env.BOT_ADMIN) {
      await tg(token, 'sendMessage', { chat_id: message.chat.id, text: `BOT_ADMIN تنظیم نشده.\nآیدی عددی شما: ${message.from.id}` }).catch(() => undefined);
      return ok();
    }
    if (!isAdmin(env, message.from.id)) {
      await tg(token, 'sendMessage', { chat_id: message.chat.id, text: `دسترسی ادمین ندارید.\nآیدی عددی شما: ${message.from.id}` }).catch(() => undefined);
      return ok();
    }
    await clearState(env, message.from.id);
    await sendHome(env, token, message.chat.id);
    return ok();
  }
  if (!isAdmin(env, message.from.id)) return null;

  const target = normalizeTarget(await env.BOT_CACHE.get(stateKey(message.from.id)).catch(() => null));
  if (!target) return null;
  if (text === '/cancel' || text === 'لغو') {
    await clearState(env, message.from.id);
    if (target.kind === 'game') await sendGameMenu(token, message.chat.id);
    else if (target.kind === 'background') await sendBackgroundMenu(token, message.chat.id);
    else if (target.kind === 'crash-stage') await sendCrashStageMenu(env, token, message.chat.id);
    else await sendImagesMenu(token, message.chat.id);
    return ok();
  }

  const source = imageFromMessage(message);
  if (!source) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: 'یک فایل PNG، JPG یا WebP بفرستید یا /cancel را بزنید.' }).catch(() => undefined);
    return ok();
  }
  if (target.kind === 'ton' && source.via !== 'document') {
    await tg(token, 'sendMessage', {
      chat_id: message.chat.id,
      text: 'برای اینکه PNG تبدیل به JPG نشود و شفافیتش حفظ شود، تصویر را از بخش File به‌صورت Document بفرستید؛ عکس معمولی پذیرفته نمی‌شود.',
    }).catch(() => undefined);
    return ok();
  }
  if (target.kind === 'crash-stage' && source.via !== 'document') {
    await tg(token, 'sendMessage', {
      chat_id: message.chat.id,
      text: 'برای اینکه تصویرهای متصل Crash فشرده و تار نشوند، تصویر را از بخش File به‌صورت Document بفرستید؛ عکس معمولی پذیرفته نمی‌شود.',
    }).catch(() => undefined);
    return ok();
  }

  try {
    await saveImage(env, token, target, source);
    await clearState(env, message.from.id);

    if (target.kind === 'ton') {
      const successText = `✅ لوگوی TON با فرمت ${source.type === 'image/png' ? 'PNG' : source.type === 'image/webp' ? 'WebP' : 'JPG'} ذخیره شد.`;
      await tg(token, 'sendPhoto', {
        chat_id: message.chat.id,
        photo: `${PUBLIC_BASE_URL}/app/api/uploaded-image/ton-icon.png?v=${Date.now()}`,
        caption: successText,
        reply_markup: { inline_keyboard: [[{ text: '💎 تغییر لوگوی TON', callback_data: 'botadmin:tonlogo' }], [{ text: '🖼 تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }]] },
      }).catch(() => tg(token, 'sendMessage', { chat_id: message.chat.id, text: successText }));
    } else if (target.kind === 'background') {
      const successText = `✅ بک‌گراند ${backgroundLabel(target.game)} ذخیره شد.`;
      await tg(token, 'sendPhoto', {
        chat_id: message.chat.id,
        photo: `${PUBLIC_BASE_URL}/app/api/section-background/${target.game}.png?v=${Date.now()}`,
        caption: successText,
        reply_markup: { inline_keyboard: [[{ text: '🌄 بک‌گراند بازی‌ها', callback_data: 'botadmin:gamebackgrounds' }], [{ text: '🖼 تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }]] },
      }).catch(() => tg(token, 'sendMessage', { chat_id: message.chat.id, text: successText }));
    } else if (target.kind === 'crash-stage') {
      const successText = `✅ تصویر ${target.slot} از 10 کادر Crash ذخیره شد.`;
      await tg(token, 'sendPhoto', {
        chat_id: message.chat.id,
        photo: `${PUBLIC_BASE_URL}/app/api/crash-stage-image/${target.slot}.png?v=${Date.now()}`,
        caption: successText,
        reply_markup: { inline_keyboard: [[{ text: '🚀 تصاویر داخل Crash', callback_data: 'botadmin:crashstage' }], [{ text: '🖼 تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }]] },
      }).catch(() => tg(token, 'sendMessage', { chat_id: message.chat.id, text: successText, reply_markup: { inline_keyboard: [[{ text: '🚀 تصاویر داخل Crash', callback_data: 'botadmin:crashstage' }]] } }));
    } else {
      await tg(token, 'sendPhoto', {
        chat_id: message.chat.id,
        photo: `${PUBLIC_BASE_URL}/app/api/game-card-image/${target.game}.png?v=${Date.now()}`,
        caption: `✅ تصویر کارت ${label(target.game)} ذخیره شد.`,
        reply_markup: { inline_keyboard: [[{ text: '🎮 تصاویر بازی‌ها', callback_data: 'botadmin:gameimages' }], [{ text: '🖼 تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }]] },
      }).catch(() => tg(token, 'sendMessage', { chat_id: message.chat.id, text: `✅ تصویر کارت ${label(target.game)} ذخیره شد.` }));
    }
  } catch (error) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: `❌ ${error instanceof Error ? error.message : 'آپلود انجام نشد.'}` }).catch(() => undefined);
  }
  return ok();
}

async function sendHome(env: Env, token: string, chatId: number, messageId?: number): Promise<void> {
  await sendCurrentAdminHome(env, token, chatId, messageId);
}

async function sendImagesMenu(token: string, chatId: number, messageId?: number): Promise<void> {
  await upsert(token, chatId, messageId, '🖼 تصاویر و ظاهر\n\nبخش تصویری موردنظر را انتخاب کنید.', [
    [
      { text: '🎮 کارت بازی‌ها', callback_data: 'botadmin:gameimages' },
      { text: '🌄 بک‌گراندها', callback_data: 'botadmin:gamebackgrounds' },
    ],
    [
      { text: '🚀 تصاویر Crash', callback_data: 'botadmin:crashstage' },
      { text: '🏁 خانه‌های Plinko', callback_data: 'botadmin:plinko:image:house' },
    ],
    [{ text: '💎 لوگوی TON', callback_data: 'botadmin:tonlogo' }],
    [{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }],
  ]);
}

async function sendGameMenu(token: string, chatId: number, messageId?: number): Promise<void> {
  const rows: Keyboard = [];
  for (let i = 0; i < GAMES.length; i += 2) {
    rows.push(GAMES.slice(i, i + 2).map(([id, name]) => ({ text: name, callback_data: `botadmin:gameimage:${id}` })));
  }
  rows.push([{ text: '⬅️ تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }]);
  await upsert(token, chatId, messageId, '🎮 تصاویر کارت بازی‌ها\n\nیک بازی را انتخاب کنید. تصویر را می‌توانید عادی یا به‌صورت فایل بفرستید.', rows);
}

async function sendBackgroundMenu(token: string, chatId: number, messageId?: number): Promise<void> {
  const rows: Keyboard = [
    BACKGROUND_GAMES.map(([id, name]) => ({ text: name, callback_data: `botadmin:gamebackground:${id}` })),
    [{ text: '⬅️ تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }],
  ];
  await upsert(token, chatId, messageId, '🌄 بک‌گراند بازی‌ها\n\nGhost Run یا Pump را انتخاب کنید و تصویر بک‌گراند را بفرستید.', rows);
}

async function sendCrashStageMenu(env: Env, token: string, chatId: number, messageId?: number): Promise<void> {
  const present = await Promise.all(Array.from({ length: 10 }, (_, index) => env.ASSETS.head(crashStageKey(index + 1)).then((object) => Boolean(object)).catch(() => false)));
  const rows: Keyboard = [];
  for (let i = 1; i <= 10; i += 2) {
    rows.push([i, i + 1].map((slot) => ({ text: `${present[slot - 1] ? '✅ ' : ''}Image ${slot}`, callback_data: `botadmin:crashstage:${slot}` })));
  }
  rows.push([{ text: '⬅️ تصاویر و ظاهر', callback_data: 'botadmin:imagesmenu' }]);
  await upsert(token, chatId, messageId, '🚀 تصاویر عمودی داخل کادر Crash\n\nImage 1 پایین‌ترین/شروع مسیر است و Image 10 بالاترین/آخر مسیر. هر 10 تصویر به‌ترتیب عمودی به هم وصل می‌شوند.', rows);
}

async function saveImage(env: Env, token: string, target: UploadTarget, source: UploadSource): Promise<void> {
  if (source.size && source.size > MAX_BYTES) throw new Error('حجم تصویر باید کمتر از ۱۰ مگابایت باشد.');
  const file = await tg<{ file_path?: string }>(token, 'getFile', { file_id: source.fileId });
  if (!file.file_path) throw new Error('فایل از تلگرام دریافت نشد.');
  const response = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
  if (!response.ok) throw new Error('دانلود تصویر ناموفق بود.');
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) throw new Error('حجم تصویر باید کمتر از ۱۰ مگابایت باشد.');
  const responseType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const contentType = source.via === 'document' ? source.type : (TYPES.has(responseType) ? responseType : source.type);
  const version = String(Date.now());
  const assetKey = target.kind === 'ton' ? 'ton-icon' : target.kind === 'background' ? sectionBackgroundR2Key(target.game) : target.kind === 'crash-stage' ? crashStageKey(target.slot) : gameKey(target.game);
  const metadata = target.kind === 'ton'
    ? { version, assetId: 'ton-icon', contentType, uploadedVia: `telegram-admin-${source.via}` }
    : target.kind === 'background'
      ? { version, sectionId: target.game, contentType, uploadedVia: `telegram-admin-${source.via}` }
      : target.kind === 'crash-stage'
        ? { version, assetId: `crash-stage-${target.slot}`, slot: String(target.slot), contentType, uploadedVia: `telegram-admin-${source.via}` }
        : { version, gameId: target.game, contentType, uploadedVia: `telegram-admin-${source.via}` };
  await env.ASSETS.put(assetKey, bytes, {
    httpMetadata: { contentType },
    customMetadata: metadata,
  });
}

function imageFromMessage(message: Message): UploadSource | null {
  const photo = message.photo?.at(-1);
  if (photo?.file_id) {
    return { fileId: photo.file_id, size: photo.file_size, type: 'image/jpeg', via: 'photo' };
  }
  const doc = message.document;
  if (!doc?.file_id) return null;
  const mime = String(doc.mime_type || '').split(';')[0].trim().toLowerCase();
  const ext = String(doc.file_name || '').split('.').pop()?.toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : TYPES.has(mime) ? mime : '';
  return type ? { fileId: doc.file_id, size: doc.file_size, type, via: 'document' } : null;
}

async function upsert(token: string, chatId: number, messageId: number | undefined, text: string, keyboard: Keyboard): Promise<void> {
  const payload = { chat_id: chatId, text, reply_markup: { inline_keyboard: keyboard }, disable_web_page_preview: true };
  if (messageId) {
    const edited = await tg(token, 'editMessageText', { ...payload, message_id: messageId }).then(() => true).catch(() => false);
    if (edited) return;
  }
  await tg(token, 'sendMessage', payload);
}

async function tg<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result as T;
}

function normalizeGame(value: unknown): string | null {
  const game = String(value || '').replace(/\.png$/i, '').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  return GAME_IDS.has(game as never) ? game : null;
}
function normalizeBackgroundGame(value: unknown): string | null {
  const game = String(value || '').replace(/\.png$/i, '').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  return BACKGROUND_GAME_IDS.has(game as never) ? game : null;
}
function normalizeCrashStageSlot(value: unknown): number | null {
  const slot = Number(String(value || '').replace(/[^0-9]/g, ''));
  return Number.isInteger(slot) && slot >= 1 && slot <= 10 ? slot : null;
}
function normalizeTarget(value: unknown): UploadTarget | null {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === TON_STATE) return { kind: 'ton' };
  if (raw.startsWith(BACKGROUND_STATE_PREFIX)) {
    const game = normalizeBackgroundGame(raw.slice(BACKGROUND_STATE_PREFIX.length));
    return game ? { kind: 'background', game } : null;
  }
  if (raw.startsWith(CRASH_STAGE_STATE_PREFIX)) {
    const slot = normalizeCrashStageSlot(raw.slice(CRASH_STAGE_STATE_PREFIX.length));
    return slot ? { kind: 'crash-stage', slot } : null;
  }
  const game = normalizeGame(raw);
  return game ? { kind: 'game', game } : null;
}
function label(game: string): string { return GAMES.find(([id]) => id === game)?.[1] || game; }
function backgroundLabel(game: string): string { return BACKGROUND_GAMES.find(([id]) => id === game)?.[1] || game; }
function gameKey(game: string): string { return `game-card-images/${game}`; }
function crashStageKey(slot: number): string { return `crash-stage-images/${slot}`; }
function stateKey(id: number): string { return `${STATE_PREFIX}${id}`; }
function clearState(env: Env, id: number): Promise<void> { return env.BOT_CACHE.delete(stateKey(id)).catch(() => undefined); }
function isAdmin(env: Env, id: unknown): boolean { return String(env.BOT_ADMIN || '').split(/[\s,;]+/).includes(String(id || '')); }
function isAdminCommand(text: string): boolean { const value = text.toLowerCase(); return value === 'admin' || value === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(value); }
function ok(): Response { return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } }); }

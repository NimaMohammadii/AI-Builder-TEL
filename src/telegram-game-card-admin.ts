import type { Env } from './types';
import { PUBLIC_BASE_URL } from './utils';

type Photo = { file_id: string; file_size?: number };
type Document = { file_id: string; file_size?: number; mime_type?: string; file_name?: string };
type Message = { chat: { id: number }; from?: { id: number }; text?: string; photo?: Photo[]; document?: Document };
type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { message?: Message; callback_query?: Callback };
type Button = { text: string; callback_data: string };
type Keyboard = Button[][];

const GAMES = [
  ['mines', 'Mines'], ['plinko', 'Plinko'], ['slot', 'Slot'], ['rps', 'Rock Paper Scissors'],
  ['wheel', 'Wheel'], ['dice', 'Dice'], ['crash', 'Crash'], ['hilo', 'Chicken Cross'],
  ['coinflip', 'Pump'], ['ghostrun', 'Ghost Run'],
] as const;
const GAME_IDS = new Set(GAMES.map(([id]) => id));
const STATE_PREFIX = 'admin:game-card-upload:';
const MAX_BYTES = 10_000_000;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function handleGameCardAdminRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const image = url.pathname.match(/^\/app\/api\/game-card-image\/([^/]+)$/);
  if (request.method === 'GET' && image) return serveImage(request, env, image[1]);
  if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') return null;
  const update = await request.clone().json().catch(() => null) as Update | null;
  if (!update) return null;
  return handleUpdate(env, update);
}

async function serveImage(request: Request, env: Env, raw: string): Promise<Response> {
  const game = normalizeGame(raw.replace(/\.png$/i, ''));
  if (!game) return new Response('Not found', { status: 404 });
  const object = await env.ASSETS.get(key(game)).catch(() => null);
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

async function handleUpdate(env: Env, update: Update): Promise<Response | null> {
  const token = env.BOT_TOKEN;
  if (!token) return null;

  const callback = update.callback_query;
  if (callback) {
    const data = callback.data || '';
    const ours = data === 'botadmin:home' || data === 'botadmin:gameimages' || data.startsWith('botadmin:gameimage:');
    if (!ours) return null;
    if (!isAdmin(env, callback.from.id)) return ok();
    await tg(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
    const chatId = callback.message?.chat.id ?? callback.from.id;
    const messageId = callback.message?.message_id;
    if (data === 'botadmin:home') {
      await clearState(env, callback.from.id);
      await sendHome(token, chatId, messageId);
    } else if (data === 'botadmin:gameimages') {
      await clearState(env, callback.from.id);
      await sendGameMenu(token, chatId, messageId);
    } else {
      const game = normalizeGame(data.slice('botadmin:gameimage:'.length));
      if (game) {
        await env.BOT_CACHE.put(stateKey(callback.from.id), game, { expirationTtl: 900 });
        await upsert(token, chatId, messageId, `🖼 تصویر کارت ${label(game)}\n\nتصویر PNG، JPG یا WebP با نسبت ۴:۵ را بفرستید.`, [
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
    await sendHome(token, message.chat.id);
    return ok();
  }
  if (!isAdmin(env, message.from.id)) return null;

  const game = normalizeGame(await env.BOT_CACHE.get(stateKey(message.from.id)).catch(() => null));
  if (!game) return null;
  if (text === '/cancel' || text === 'لغو') {
    await clearState(env, message.from.id);
    await sendGameMenu(token, message.chat.id);
    return ok();
  }
  const source = imageFromMessage(message);
  if (!source) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: 'تصویر PNG، JPG یا WebP بفرستید یا /cancel را بزنید.' }).catch(() => undefined);
    return ok();
  }

  try {
    await saveImage(env, token, game, source);
    await clearState(env, message.from.id);
    await tg(token, 'sendPhoto', {
      chat_id: message.chat.id,
      photo: `${PUBLIC_BASE_URL}/app/api/game-card-image/${game}.png?v=${Date.now()}`,
      caption: `✅ تصویر کارت ${label(game)} ذخیره شد.`,
      reply_markup: { inline_keyboard: [[{ text: '🎮 تصاویر بازی‌ها', callback_data: 'botadmin:gameimages' }], [{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }]] },
    }).catch(() => tg(token, 'sendMessage', { chat_id: message.chat.id, text: `✅ تصویر کارت ${label(game)} ذخیره شد.` }));
  } catch (error) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: `❌ ${error instanceof Error ? error.message : 'آپلود انجام نشد.'}` }).catch(() => undefined);
  }
  return ok();
}

async function sendHome(token: string, chatId: number, messageId?: number): Promise<void> {
  await upsert(token, chatId, messageId, '🛡 پنل مدیریت ربات گیم\n\nبخش موردنظر را انتخاب کنید.', [
    [{ text: '🎮 تصاویر کارت بازی‌ها', callback_data: 'botadmin:gameimages' }],
    [{ text: '👥 لیست کاربران', callback_data: 'botadmin:users:0' }],
    [{ text: '↩️ کاربران برگشتی', callback_data: 'botadmin:returns' }],
    [{ text: '📊 آمار مالی و آنلاین', callback_data: 'botadmin:financestats' }],
    [{ text: '⚙️ حدود واریز/برداشت', callback_data: 'botadmin:financelimits' }],
    [{ text: '🌍 تنظیمات رجین', callback_data: 'botadmin:regionsettings' }],
    [{ text: '📣 پیام همگانی', callback_data: 'botadmin:askbroadcast' }],
  ]);
}

async function sendGameMenu(token: string, chatId: number, messageId?: number): Promise<void> {
  const rows: Keyboard = [];
  for (let i = 0; i < GAMES.length; i += 2) {
    rows.push(GAMES.slice(i, i + 2).map(([id, name]) => ({ text: name, callback_data: `botadmin:gameimage:${id}` })));
  }
  rows.push([{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }]);
  await upsert(token, chatId, messageId, '🎮 تصاویر کارت بازی‌ها\n\nیک بازی را انتخاب کنید. نسبت تصویر ۴:۵ است.', rows);
}

async function saveImage(env: Env, token: string, game: string, source: { fileId: string; size?: number; type: string }): Promise<void> {
  if (source.size && source.size > MAX_BYTES) throw new Error('حجم تصویر باید کمتر از ۱۰ مگابایت باشد.');
  const file = await tg<{ file_path?: string }>(token, 'getFile', { file_id: source.fileId });
  if (!file.file_path) throw new Error('فایل از تلگرام دریافت نشد.');
  const response = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
  if (!response.ok) throw new Error('دانلود تصویر ناموفق بود.');
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) throw new Error('حجم تصویر باید کمتر از ۱۰ مگابایت باشد.');
  const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const contentType = TYPES.has(type) ? type : source.type;
  await env.ASSETS.put(key(game), bytes, {
    httpMetadata: { contentType },
    customMetadata: { version: String(Date.now()), gameId: game, uploadedVia: 'telegram-admin' },
  });
}

function imageFromMessage(message: Message): { fileId: string; size?: number; type: string } | null {
  const photo = message.photo?.at(-1);
  if (photo?.file_id) return { fileId: photo.file_id, size: photo.file_size, type: 'image/jpeg' };
  const doc = message.document;
  if (!doc?.file_id) return null;
  const mime = String(doc.mime_type || '').toLowerCase();
  const ext = String(doc.file_name || '').split('.').pop()?.toLowerCase();
  const type = TYPES.has(mime) ? mime : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : '';
  return type ? { fileId: doc.file_id, size: doc.file_size, type } : null;
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
function label(game: string): string { return GAMES.find(([id]) => id === game)?.[1] || game; }
function key(game: string): string { return `game-card-images/${game}`; }
function stateKey(id: number): string { return `${STATE_PREFIX}${id}`; }
function clearState(env: Env, id: number): Promise<void> { return env.BOT_CACHE.delete(stateKey(id)).catch(() => undefined); }
function isAdmin(env: Env, id: unknown): boolean { return String(env.BOT_ADMIN || '').split(/[\s,;]+/).includes(String(id || '')); }
function isAdminCommand(text: string): boolean { const value = text.toLowerCase(); return value === 'admin' || value === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(value); }
function ok(): Response { return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } }); }

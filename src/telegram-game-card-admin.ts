import { adminUsersJson } from './admin-users';
import type { Env } from './types';
import { PUBLIC_BASE_URL } from './utils';

type TelegramPhoto = { file_id: string; file_size?: number; width?: number; height?: number };
type TelegramDocument = { file_id: string; file_size?: number; mime_type?: string; file_name?: string };
type TelegramAdminMessage = {
  message_id: number;
  chat: { id: number };
  from?: { id: number };
  text?: string;
  photo?: TelegramPhoto[];
  document?: TelegramDocument;
};
type TelegramAdminCallback = {
  id: string;
  data?: string;
  from: { id: number };
  message?: { message_id: number; chat: { id: number } };
};
type TelegramAdminUpdate = { message?: TelegramAdminMessage; callback_query?: TelegramAdminCallback };
type TelegramFile = { file_id: string; file_path?: string; file_size?: number };
type InlineButton = { text: string; callback_data: string };
type InlineKeyboard = InlineButton[][];

type GameCard = { id: string; label: string };

const GAME_CARDS: GameCard[] = [
  { id: 'mines', label: 'Mines' },
  { id: 'plinko', label: 'Plinko' },
  { id: 'slot', label: 'Slot' },
  { id: 'rps', label: 'Rock Paper Scissors' },
  { id: 'wheel', label: 'Wheel' },
  { id: 'dice', label: 'Dice' },
  { id: 'crash', label: 'Crash' },
  { id: 'hilo', label: 'Chicken Cross' },
  { id: 'coinflip', label: 'Pump' },
  { id: 'ghostrun', label: 'Ghost Run' },
];
const GAME_CARD_IDS = new Set(GAME_CARDS.map((game) => game.id));
const STATE_PREFIX = 'admin:game-card-upload:';
const MAX_IMAGE_BYTES = 10_000_000;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function handleGameCardAdminRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const imageMatch = url.pathname.match(/^\/app\/api\/game-card-image\/([^/]+)$/);
  if (request.method === 'GET' && imageMatch) return serveGameCardImage(request, env, imageMatch[1]);
  if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') return null;

  const update = await request.clone().json().catch(() => null) as TelegramAdminUpdate | null;
  if (!update) return null;
  return handleTelegramAdminUpdate(env, update);
}

async function serveGameCardImage(request: Request, env: Env, rawGame: string): Promise<Response> {
  const game = normalizeGame(rawGame.replace(/\.png$/i, ''));
  if (!game) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  const object = await env.ASSETS.get(gameCardKey(game)).catch(() => null);
  if (!object) {
    const fallback = new URL(`/app/api/section-lock-image/${encodeURIComponent(game)}/locked.png?v=1`, request.url);
    return Response.redirect(fallback.toString(), 302);
  }
  const headers = new Headers();
  headers.set('content-type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('cache-control', 'no-store, max-age=0');
  headers.set('x-content-type-options', 'nosniff');
  const version = object.customMetadata?.version;
  if (version) headers.set('etag', `"${version}"`);
  return new Response(object.body, { headers });
}

async function handleTelegramAdminUpdate(env: Env, update: TelegramAdminUpdate): Promise<Response | null> {
  // /telegram/webhook is registered for TELEGRAM_BOT_TOKEN. Replies must use the
  // same bot token; using GAME_BOT_TOKEN here causes Telegram "chat not found"
  // whenever the game bot is a separate bot.
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  const callback = update.callback_query;
  if (callback) {
    const data = callback.data || '';
    const isOurCallback = data === 'botadmin:home' || data === 'botadmin:gameimages' || data.startsWith('botadmin:gameimage:');
    if (!isOurCallback) return null;
    if (!isBotAdmin(env, callback.from.id)) return telegramOk();

    await telegram(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
    const chatId = callback.message?.chat.id ?? callback.from.id;
    const messageId = callback.message?.message_id;

    if (data === 'botadmin:home') {
      await clearUploadState(env, callback.from.id);
      await sendAdminHome(env, token, chatId, messageId);
      return telegramOk();
    }
    if (data === 'botadmin:gameimages') {
      await clearUploadState(env, callback.from.id);
      await sendGameImageMenu(token, chatId, messageId);
      return telegramOk();
    }

    const game = normalizeGame(data.slice('botadmin:gameimage:'.length));
    if (!game) return telegramOk();
    await env.BOT_CACHE.put(uploadStateKey(callback.from.id), game, { expirationTtl: 15 * 60 });
    await sendUploadPrompt(token, chatId, messageId, game);
    return telegramOk();
  }

  const message = update.message;
  if (!message?.from?.id || !isBotAdmin(env, message.from.id)) return null;
  const text = message.text?.trim() || '';
  if (isAdminCommand(text)) {
    await clearUploadState(env, message.from.id);
    await sendAdminHome(env, token, message.chat.id);
    return telegramOk();
  }

  const pendingGame = normalizeGame(await env.BOT_CACHE.get(uploadStateKey(message.from.id)).catch(() => null));
  if (!pendingGame) return null;

  if (text === '/cancel' || text === 'لغو') {
    await clearUploadState(env, message.from.id);
    await sendGameImageMenu(token, message.chat.id);
    return telegramOk();
  }

  const image = imageFileFromMessage(message);
  if (!image) {
    await telegram(token, 'sendMessage', {
      chat_id: message.chat.id,
      text: 'لطفاً تصویر را به‌صورت عکس یا فایل PNG، JPG یا WebP بفرستید. برای لغو /cancel را بفرستید.',
      reply_markup: { inline_keyboard: [[{ text: '⬅️ بازگشت', callback_data: 'botadmin:gameimages' }]] },
    }).catch(() => undefined);
    return telegramOk();
  }

  try {
    await saveTelegramImage(env, token, pendingGame, image);
    await clearUploadState(env, message.from.id);
    const game = gameInfo(pendingGame);
    const previewUrl = `${PUBLIC_BASE_URL}/app/api/game-card-image/${pendingGame}.png?v=${Date.now()}`;
    const keyboard: InlineKeyboard = [
      [{ text: '🖼 تصاویر بازی‌ها', callback_data: 'botadmin:gameimages' }],
      [{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }],
    ];
    await telegram(token, 'sendPhoto', {
      chat_id: message.chat.id,
      photo: previewUrl,
      caption: `✅ تصویر کارت ${game.label} ذخیره شد و در Play Hub نمایش داده می‌شود.`,
      reply_markup: { inline_keyboard: keyboard },
    }).catch(async () => {
      await telegram(token, 'sendMessage', {
        chat_id: message.chat.id,
        text: `✅ تصویر کارت ${game.label} ذخیره شد و در Play Hub نمایش داده می‌شود.`,
        reply_markup: { inline_keyboard: keyboard },
      });
    });
  } catch (error) {
    await telegram(token, 'sendMessage', {
      chat_id: message.chat.id,
      text: `❌ ${error instanceof Error ? error.message : 'آپلود تصویر انجام نشد.'}`,
      reply_markup: { inline_keyboard: [[{ text: 'تلاش دوباره', callback_data: `botadmin:gameimage:${pendingGame}` }], [{ text: '⬅️ بازگشت', callback_data: 'botadmin:gameimages' }]] },
    }).catch(() => undefined);
  }
  return telegramOk();
}

async function sendAdminHome(env: Env, token: string, chatId: number, messageId?: number): Promise<void> {
  let text = '🛡 پنل مدیریت ربات گیم\n\nاز منوی زیر بخش موردنظر را انتخاب کنید.';
  try {
    const data = await adminUsersJson(env) as { stats?: Record<string, unknown>; users?: unknown[] };
    const stats = data.stats || {};
    const totalUsers = Number(stats.total ?? data.users?.length ?? 0);
    const onlineUsers = Number(stats.online ?? 0);
    const inactiveUsers = Number(stats.inactive ?? 0);
    const totalTon = formatNanoAsTon(stats.totalTonBalanceNano);
    text = [
      '🛡 پنل مدیریت ربات گیم',
      '',
      `👥 تعداد کل کاربران: ${totalUsers}`,
      `🟢 آنلاین: ${onlineUsers}   ⚪️ غیرفعال: ${inactiveUsers}`,
      `💎 مجموع موجودی: ${totalTon} TON`,
      '',
      'از منوی زیر بخش موردنظر را انتخاب کنید.',
    ].join('\n');
  } catch {
    // Keep the compact fallback menu if stats are temporarily unavailable.
  }

  const keyboard: InlineKeyboard = [
    [{ text: '🎮 تصاویر کارت بازی‌ها', callback_data: 'botadmin:gameimages' }],
    [{ text: '👥 لیست کاربران', callback_data: 'botadmin:users:0' }],
    [{ text: '↩️ بخش کاربران برگشتی', callback_data: 'botadmin:returns' }],
    [{ text: '📊 آمار مالی و آنلاین', callback_data: 'botadmin:financestats' }],
    [{ text: '⚙️ حدود واریز/برداشت', callback_data: 'botadmin:financelimits' }],
    [{ text: '🌍 تنظیمات رجین', callback_data: 'botadmin:regionsettings' }],
    [{ text: '📣 پیام همگانی در چت ربات', callback_data: 'botadmin:askbroadcast' }],
  ];
  await upsertTelegramMessage(token, chatId, messageId, text, keyboard);
}

async function sendGameImageMenu(token: string, chatId: number, messageId?: number): Promise<void> {
  const rows: InlineKeyboard = [];
  for (let index = 0; index < GAME_CARDS.length; index += 2) {
    rows.push(GAME_CARDS.slice(index, index + 2).map((game) => ({ text: game.label, callback_data: `botadmin:gameimage:${game.id}` })));
  }
  rows.push([{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }]);
  await upsertTelegramMessage(
    token,
    chatId,
    messageId,
    '🎮 تصاویر کارت بازی‌ها\n\nیک بازی را انتخاب کنید و تصویر عمودی آن را بفرستید. نسبت پیشنهادی تصویر ۴:۵ است.',
    rows,
  );
}

async function sendUploadPrompt(token: string, chatId: number, messageId: number | undefined, gameId: string): Promise<void> {
  const game = gameInfo(gameId);
  const keyboard: InlineKeyboard = [[{ text: '⬅️ بازگشت به تصاویر', callback_data: 'botadmin:gameimages' }]];
  await upsertTelegramMessage(
    token,
    chatId,
    messageId,
    `🖼 تصویر کارت ${game.label}\n\nحالا تصویر را به‌صورت عکس یا فایل PNG، JPG یا WebP بفرستید. بهترین اندازه عمودی با نسبت ۴:۵ است.`,
    keyboard,
  );
}

async function saveTelegramImage(env: Env, token: string, gameId: string, source: { fileId: string; size?: number; type?: string }): Promise<void> {
  if (source.size && source.size > MAX_IMAGE_BYTES) throw new Error('حجم تصویر باید کمتر از ۱۰ مگابایت باشد.');
  const file = await telegram<TelegramFile>(token, 'getFile', { file_id: source.fileId });
  if (!file.file_path) throw new Error('فایل تصویر از تلگرام دریافت نشد.');
  const response = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
  if (!response.ok) throw new Error('دانلود تصویر از تلگرام ناموفق بود.');
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_IMAGE_BYTES) throw new Error('حجم تصویر باید کمتر از ۱۰ مگابایت باشد.');
  const responseType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const contentType = ALLOWED_IMAGE_TYPES.has(responseType) ? responseType : (ALLOWED_IMAGE_TYPES.has(source.type || '') ? source.type! : 'image/jpeg');
  const version = String(Date.now());
  await env.ASSETS.put(gameCardKey(gameId), bytes, {
    httpMetadata: { contentType },
    customMetadata: { version, gameId, uploadedVia: 'telegram-admin' },
  });
}

function imageFileFromMessage(message: TelegramAdminMessage): { fileId: string; size?: number; type?: string } | null {
  const photo = message.photo?.length ? message.photo[message.photo.length - 1] : null;
  if (photo?.file_id) return { fileId: photo.file_id, size: photo.file_size, type: 'image/jpeg' };
  const document = message.document;
  if (!document?.file_id) return null;
  const type = String(document.mime_type || '').toLowerCase();
  const extension = String(document.file_name || '').split('.').pop()?.toLowerCase();
  const extensionType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : (extension === 'jpg' || extension === 'jpeg') ? 'image/jpeg' : '';
  const resolvedType = ALLOWED_IMAGE_TYPES.has(type) ? type : extensionType;
  return resolvedType ? { fileId: document.file_id, size: document.file_size, type: resolvedType } : null;
}

async function upsertTelegramMessage(token: string, chatId: number, messageId: number | undefined, text: string, keyboard: InlineKeyboard): Promise<void> {
  const payload = { chat_id: chatId, text, reply_markup: { inline_keyboard: keyboard }, disable_web_page_preview: true };
  if (messageId) {
    const edited = await telegram(token, 'editMessageText', { ...payload, message_id: messageId }).then(() => true).catch(() => false);
    if (edited) return;
  }
  await telegram(token, 'sendMessage', payload);
}

async function telegram<T = unknown>(token: string, method: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result as T;
}

function telegramOk(): Response {
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}

function isAdminCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === 'admin' || normalized === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(normalized);
}

function isBotAdmin(env: Env, userId: unknown): boolean {
  const admins = String(env.BOT_ADMIN || '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
  return admins.includes(String(userId || ''));
}

function normalizeGame(value: unknown): string | null {
  const game = String(value || '').replace(/\.png$/i, '').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  return GAME_CARD_IDS.has(game) ? game : null;
}

function gameInfo(gameId: string): GameCard {
  return GAME_CARDS.find((game) => game.id === gameId) || { id: gameId, label: gameId };
}

function gameCardKey(gameId: string): string {
  return `game-card-images/${gameId}`;
}

function uploadStateKey(adminId: number): string {
  return `${STATE_PREFIX}${adminId}`;
}

async function clearUploadState(env: Env, adminId: number): Promise<void> {
  await env.BOT_CACHE.delete(uploadStateKey(adminId)).catch(() => undefined);
}

function formatNanoAsTon(value: unknown): string {
  const amount = Number(value || 0) / 1_000_000_000;
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

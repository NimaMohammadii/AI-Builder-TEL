import type { Env } from './types';
import { ACCESS_SECTIONS, clearSectionLock, getSectionAccess, setSectionLock } from './section-access';
import { isSpecialWheelEnabled, setSpecialWheelEnabled } from './special-wheel-mode';
import { getSpecialWheelPriceStars } from './special-wheel-engine';

type Message = { chat: { id: number }; from?: { id: number }; text?: string };
type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { message?: Message; callback_query?: Callback };
type Button = { text: string; callback_data: string };
type Keyboard = Button[][];

const LOCK_STATE_PREFIX = 'admin:section-access-input:';
const LEGACY_ADMIN_STATE_PREFIX = 'admin:game-card-upload:';

export async function handleSectionAccessAdminRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') return null;

  const update = await request.clone().json().catch(() => null) as Update | null;
  if (!update || !env.BOT_TOKEN) return null;

  if (update.callback_query) return handleCallback(env, env.BOT_TOKEN, update.callback_query);
  if (update.message) return handleMessage(env, env.BOT_TOKEN, update.message);
  return null;
}

async function handleCallback(env: Env, token: string, callback: Callback): Promise<Response | null> {
  const data = String(callback.data || '');
  const ours = data === 'botadmin:home'
    || data === 'botadmin:access:list'
    || data === 'botadmin:access:refresh'
    || data.startsWith('botadmin:access:select:')
    || data.startsWith('botadmin:access:unlock:')
    || data.startsWith('botadmin:specialwheel:');
  if (!ours) return null;
  if (!isAdmin(env, callback.from.id)) return ok();

  await tg(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const messageId = callback.message?.message_id;

  if (data === 'botadmin:home') {
    await clearAdminInputStates(env, callback.from.id);
    await sendHome(env, token, chatId, messageId);
    return ok();
  }

  if (data.startsWith('botadmin:specialwheel:')) {
    await clearAdminInputStates(env, callback.from.id);
    await setSpecialWheelEnabled(env, data.endsWith(':on'));
    await sendHome(env, token, chatId, messageId);
    return ok();
  }

  if (data === 'botadmin:access:list' || data === 'botadmin:access:refresh') {
    await clearLockState(env, callback.from.id);
    await sendAccessMenu(env, token, chatId, messageId);
    return ok();
  }

  if (data.startsWith('botadmin:access:select:')) {
    const sectionId = normalizeSectionId(data.slice('botadmin:access:select:'.length));
    if (!sectionId) return ok();
    await clearLegacyAdminState(env, callback.from.id);
    await env.BOT_CACHE.put(lockStateKey(callback.from.id), sectionId, { expirationTtl: 900 });
    const label = sectionLabel(sectionId);
    await upsert(token, chatId, messageId,
      `🔒 قفل ${label}\n\nمدت قفل را به دقیقه بفرستید.\nمثال: 30 یا 120\n\nحداقل 1 دقیقه و حداکثر 43200 دقیقه.`,
      [[{ text: '⬅️ بازگشت', callback_data: 'botadmin:access:list' }]],
    );
    return ok();
  }

  if (data.startsWith('botadmin:access:unlock:')) {
    const sectionId = normalizeSectionId(data.slice('botadmin:access:unlock:'.length));
    if (!sectionId) return ok();
    try {
      await clearSectionLock(env, sectionId);
      await sendAccessMenu(env, token, chatId, messageId, `✅ ${sectionLabel(sectionId)} باز شد.`);
    } catch (error) {
      await sendAccessMenu(env, token, chatId, messageId, `❌ ${error instanceof Error ? error.message : 'باز کردن بخش ناموفق بود.'}`);
    }
    return ok();
  }

  return ok();
}

async function handleMessage(env: Env, token: string, message: Message): Promise<Response | null> {
  const userId = message.from?.id;
  if (!userId) return null;
  const text = String(message.text || '').trim();

  if (isAdminCommand(text)) {
    if (!isAdmin(env, userId)) return null;
    await clearAdminInputStates(env, userId);
    await sendHome(env, token, message.chat.id);
    return ok();
  }

  if (!isAdmin(env, userId)) return null;
  const sectionId = normalizeSectionId(await env.BOT_CACHE.get(lockStateKey(userId)).catch(() => null));
  if (!sectionId) return null;

  if (text === '/cancel' || text === 'لغو') {
    await clearLockState(env, userId);
    await sendAccessMenu(env, token, message.chat.id);
    return ok();
  }

  if (!/^\d+$/.test(text)) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: 'فقط تعداد دقیقه را به‌صورت عدد صحیح بفرستید. مثال: 60' }).catch(() => undefined);
    return ok();
  }

  const minutes = Number(text);
  if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 43_200) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: 'مدت قفل باید بین 1 تا 43200 دقیقه باشد.' }).catch(() => undefined);
    return ok();
  }

  try {
    await setSectionLock(env, sectionId, minutes);
    await clearLockState(env, userId);
    await sendAccessMenu(env, token, message.chat.id, undefined, `✅ ${sectionLabel(sectionId)} برای ${formatMinutes(minutes)} قفل شد.`);
  } catch (error) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: `❌ ${error instanceof Error ? error.message : 'قفل کردن بخش ناموفق بود.'}` }).catch(() => undefined);
  }
  return ok();
}

async function sendHome(env: Env, token: string, chatId: number, messageId?: number): Promise<void> {
  const [wheelEnabled, wheelPrice] = await Promise.all([
    isSpecialWheelEnabled(env),
    getSpecialWheelPriceStars(env),
  ]);
  await upsert(token, chatId, messageId,
    `🛡 پنل مدیریت ربات گیم\n\n🎡 صفحه موقت گردونه: ${wheelEnabled ? 'فعال ✅' : 'غیرفعال ❌'}\n⭐️ قیمت اسپین‌های بعدی: ${wheelPrice === 0 ? 'رایگان' : `${wheelPrice} Stars`}\n\nبخش موردنظر را انتخاب کنید.`,
    [
      [{ text: '🔐 قفل بخش‌ها', callback_data: 'botadmin:access:list' }],
      [{ text: '🎮 تصاویر کارت بازی‌ها', callback_data: 'botadmin:gameimages' }],
      [{ text: '🌄 بک‌گراند بازی‌ها', callback_data: 'botadmin:gamebackgrounds' }],
      [{ text: '🚀 10 تصویر داخل Crash', callback_data: 'botadmin:crashstage' }],
      [{ text: '💎 لوگوی TON', callback_data: 'botadmin:tonlogo' }],
      [{ text: wheelEnabled ? '❌ غیرفعال کردن صفحه گردونه' : '✅ فعال کردن صفحه گردونه', callback_data: `botadmin:specialwheel:${wheelEnabled ? 'off' : 'on'}` }],
      [{ text: `⭐️ قیمت اسپین بعدی: ${wheelPrice === 0 ? 'رایگان' : wheelPrice}`, callback_data: 'botadmin:specialwheelprice' }],
      [{ text: '👥 لیست کاربران', callback_data: 'botadmin:users:0' }],
      [{ text: '↩️ کاربران برگشتی', callback_data: 'botadmin:returns' }],
      [{ text: '📊 آمار مالی و آنلاین', callback_data: 'botadmin:financestats' }],
      [{ text: '⚙️ حدود واریز/برداشت', callback_data: 'botadmin:financelimits' }],
      [{ text: '🌍 تنظیمات رجین', callback_data: 'botadmin:regionsettings' }],
      [{ text: '📣 پیام همگانی', callback_data: 'botadmin:askbroadcast' }],
    ],
  );
}

async function sendAccessMenu(env: Env, token: string, chatId: number, messageId?: number, notice = ''): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const locks = await getSectionAccess(env);
  const lockMap = new Map(locks.map((lock) => [lock.sectionId, lock] as const));
  const textLines = ACCESS_SECTIONS.map(([id, label]) => {
    const lock = lockMap.get(id);
    return lock ? `🔒 ${label} — ${formatSeconds(lock.lockedUntil - now)} باقی‌مانده` : `🔓 ${label}`;
  });
  const rows: Keyboard = [];
  for (const [id, label] of ACCESS_SECTIONS) {
    const lock = lockMap.get(id);
    if (lock) {
      rows.push([
        { text: `⏱ تمدید ${label}`, callback_data: `botadmin:access:select:${id}` },
        { text: '🔓 باز کردن', callback_data: `botadmin:access:unlock:${id}` },
      ]);
    } else {
      rows.push([{ text: `🔒 قفل ${label}`, callback_data: `botadmin:access:select:${id}` }]);
    }
  }
  rows.push([
    { text: '🔄 بروزرسانی', callback_data: 'botadmin:access:refresh' },
    { text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' },
  ]);
  await upsert(token, chatId, messageId,
    `${notice ? notice + '\n\n' : ''}🔐 قفل بخش‌های مینی‌اپ\n\n${textLines.join('\n')}\n\nبرای قفل یا تمدید، بخش را انتخاب کنید و مدت را به دقیقه بفرستید. قفل‌ها در پایان زمان خودکار باز می‌شوند.`,
    rows,
  );
}

function normalizeSectionId(value: unknown): string | null {
  const id = String(value || '').trim().toLowerCase();
  return ACCESS_SECTIONS.some(([sectionId]) => sectionId === id) ? id : null;
}

function sectionLabel(id: string): string {
  return ACCESS_SECTIONS.find(([sectionId]) => sectionId === id)?.[1] || id;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} ساعت و ${rest} دقیقه` : `${hours} ساعت`;
}

function formatSeconds(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(Math.max(0, seconds) / 60));
  return formatMinutes(minutes);
}

async function clearAdminInputStates(env: Env, userId: number): Promise<void> {
  await Promise.all([clearLockState(env, userId), clearLegacyAdminState(env, userId)]);
}

function clearLockState(env: Env, userId: number): Promise<void> {
  return env.BOT_CACHE.delete(lockStateKey(userId)).catch(() => undefined);
}

function clearLegacyAdminState(env: Env, userId: number): Promise<void> {
  return env.BOT_CACHE.delete(`${LEGACY_ADMIN_STATE_PREFIX}${userId}`).catch(() => undefined);
}

function lockStateKey(userId: number): string {
  return `${LOCK_STATE_PREFIX}${userId}`;
}

function isAdmin(env: Env, userId: unknown): boolean {
  return String(env.BOT_ADMIN || '').split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean).includes(String(userId || ''));
}

function isAdminCommand(text: string): boolean {
  const value = text.trim().toLowerCase();
  return value === 'admin' || value === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(value);
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
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result as T;
}

function ok(): Response {
  return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}

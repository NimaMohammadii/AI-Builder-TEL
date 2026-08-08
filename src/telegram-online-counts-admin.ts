import type { Env } from './types';
import {
  ONLINE_COUNT_SECTIONS,
  getOnlineUserCountConfig,
  resetOnlineUserCountConfig,
  saveOnlineUserCountConfig,
  type OnlineCountRange,
} from './online-user-counts';

type Message = { chat: { id: number }; from?: { id: number }; text?: string };
type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { message?: Message; callback_query?: Callback };
type Button = { text: string; callback_data: string };
type Keyboard = Button[][];
type OnlineState =
  | { mode: 'hour'; sectionId: string; hour: number }
  | { mode: 'bulk'; sectionId: string };

const STATE_PREFIX = 'admin:online-count-input:';
const MAX_COUNT = 999_999;

export async function handleOnlineCountsAdminRequest(request: Request, env: Env): Promise<Response | null> {
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
  if (!data.startsWith('botadmin:online:')) {
    if (data.startsWith('botadmin:')) await clearState(env, callback.from.id);
    return null;
  }
  if (!isAdmin(env, callback.from.id)) return ok();

  await clearOtherAdminStates(env, callback.from.id);
  await tg(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const messageId = callback.message?.message_id;

  if (data === 'botadmin:online:list' || data === 'botadmin:online:refresh') {
    await clearState(env, callback.from.id);
    await sendMainMenu(env, token, chatId, messageId);
    return ok();
  }

  if (data === 'botadmin:online:copyfirst') {
    await clearState(env, callback.from.id);
    try {
      const config = await getOnlineUserCountConfig(env);
      for (const section of ONLINE_COUNT_SECTIONS) {
        const first = normalizeRange(config.schedule[section.id]?.[0]);
        config.schedule[section.id] = Array.from({ length: 24 }, () => ({ ...first }));
      }
      await saveOnlineUserCountConfig(env, config);
      await sendMainMenu(env, token, chatId, messageId, '✅ ساعت 00:00 هر بازی روی تمام ۲۴ ساعت همان بازی کپی شد.');
    } catch (error) {
      await sendMainMenu(env, token, chatId, messageId, errorText(error));
    }
    return ok();
  }

  if (data === 'botadmin:online:reset:ask') {
    await clearState(env, callback.from.id);
    await upsert(token, chatId, messageId,
      '♻️ بازگردانی Online Counts\n\nتمام تنظیمات ساعتی همه بازی‌ها به مقادیر پیش‌فرض برمی‌گردد. مطمئن هستید؟',
      [
        [{ text: '✅ بله، ریست کن', callback_data: 'botadmin:online:reset:confirm' }],
        [{ text: '⬅️ انصراف', callback_data: 'botadmin:online:list' }],
      ],
    );
    return ok();
  }

  if (data === 'botadmin:online:reset:confirm') {
    await clearState(env, callback.from.id);
    try {
      await resetOnlineUserCountConfig(env);
      await sendMainMenu(env, token, chatId, messageId, '✅ مقادیر پیش‌فرض Online Counts بازیابی شد.');
    } catch (error) {
      await sendMainMenu(env, token, chatId, messageId, errorText(error));
    }
    return ok();
  }

  if (data.startsWith('botadmin:online:section:')) {
    await clearState(env, callback.from.id);
    const sectionId = normalizeSectionId(data.slice('botadmin:online:section:'.length));
    if (sectionId) await sendSectionMenu(env, token, chatId, sectionId, messageId);
    return ok();
  }

  if (data.startsWith('botadmin:online:hour:')) {
    const raw = data.slice('botadmin:online:hour:'.length).split(':');
    const sectionId = normalizeSectionId(raw[0]);
    const hour = normalizeHour(raw[1]);
    if (!sectionId || hour === null) return ok();

    await setState(env, callback.from.id, { mode: 'hour', sectionId, hour });
    const config = await getOnlineUserCountConfig(env);
    const current = normalizeRange(config.schedule[sectionId]?.[hour]);
    await upsert(token, chatId, messageId,
      `✏️ ${sectionLabel(sectionId)} — ${hourLabel(hour)}\n\nمقدار فعلی: ${current.min} تا ${current.max}\n\nحداقل و حداکثر را در یک پیام بفرستید.\nمثال: 120 280\nیا: 120-280\n\nمحدوده مجاز: 0 تا ${MAX_COUNT}`,
      [[{ text: '⬅️ لغو', callback_data: `botadmin:online:section:${sectionId}` }]],
    );
    return ok();
  }

  if (data.startsWith('botadmin:online:bulk:')) {
    const sectionId = normalizeSectionId(data.slice('botadmin:online:bulk:'.length));
    if (!sectionId) return ok();
    await setState(env, callback.from.id, { mode: 'bulk', sectionId });
    const config = await getOnlineUserCountConfig(env);
    const lines = Array.from({ length: 24 }, (_, hour) => {
      const range = normalizeRange(config.schedule[sectionId]?.[hour]);
      return `${String(hour).padStart(2, '0')} ${range.min} ${range.max}`;
    }).join('\n');
    await upsert(token, chatId, messageId,
      `📝 ویرایش ۲۴ ساعت ${sectionLabel(sectionId)}\n\n۲۴ خط زیر را تغییر دهید و همان ساختار را بفرستید:\n\n${lines}\n\nهر خط: ساعت  حداقل  حداکثر`,
      [[{ text: '⬅️ لغو', callback_data: `botadmin:online:section:${sectionId}` }]],
    );
    return ok();
  }

  return ok();
}

async function handleMessage(env: Env, token: string, message: Message): Promise<Response | null> {
  const userId = message.from?.id;
  if (!userId || !isAdmin(env, userId)) return null;
  const text = String(message.text || '').trim();

  if (isAdminCommand(text)) {
    await Promise.all([clearState(env, userId), clearOtherAdminStates(env, userId)]);
    return null;
  }

  const state = await getState(env, userId);
  if (!state) return null;

  if (text === '/cancel' || text === 'لغو') {
    await clearState(env, userId);
    await sendSectionMenu(env, token, message.chat.id, state.sectionId);
    return ok();
  }

  if (state.mode === 'hour') {
    const range = parseRange(text);
    if (!range) {
      await tg(token, 'sendMessage', {
        chat_id: message.chat.id,
        text: `دو عدد بین 0 تا ${MAX_COUNT} بفرستید. مثال: 120 280`,
      }).catch(() => undefined);
      return ok();
    }
    try {
      const config = await getOnlineUserCountConfig(env);
      config.schedule[state.sectionId][state.hour] = range;
      await saveOnlineUserCountConfig(env, config);
      await clearState(env, userId);
      await sendSectionMenu(env, token, message.chat.id, state.sectionId, undefined,
        `✅ ${hourLabel(state.hour)} روی ${range.min} تا ${range.max} ذخیره شد.`);
    } catch (error) {
      await tg(token, 'sendMessage', { chat_id: message.chat.id, text: errorText(error) }).catch(() => undefined);
    }
    return ok();
  }

  const ranges = parseBulkRanges(text);
  if (!ranges) {
    await tg(token, 'sendMessage', {
      chat_id: message.chat.id,
      text: 'فرمت درست نیست. دقیقاً ۲۴ خط بفرستید؛ هر خط به شکل «ساعت حداقل حداکثر». مثال: 00 120 280',
    }).catch(() => undefined);
    return ok();
  }
  try {
    const config = await getOnlineUserCountConfig(env);
    config.schedule[state.sectionId] = ranges;
    await saveOnlineUserCountConfig(env, config);
    await clearState(env, userId);
    await sendSectionMenu(env, token, message.chat.id, state.sectionId, undefined, '✅ هر ۲۴ ساعت ذخیره شد.');
  } catch (error) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: errorText(error) }).catch(() => undefined);
  }
  return ok();
}

async function sendMainMenu(env: Env, token: string, chatId: number, messageId?: number, notice = ''): Promise<void> {
  const config = await getOnlineUserCountConfig(env);
  const rows: Keyboard = [];
  for (let index = 0; index < ONLINE_COUNT_SECTIONS.length; index += 2) {
    rows.push(ONLINE_COUNT_SECTIONS.slice(index, index + 2).map((section) => ({
      text: section.label,
      callback_data: `botadmin:online:section:${section.id}`,
    })));
  }
  rows.push([{ text: '📋 کپی ساعت اول روی همه ساعت‌ها', callback_data: 'botadmin:online:copyfirst' }]);
  rows.push([{ text: '♻️ بازگردانی پیش‌فرض‌ها', callback_data: 'botadmin:online:reset:ask' }]);
  rows.push([
    { text: '🔄 بروزرسانی', callback_data: 'botadmin:online:refresh' },
    { text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' },
  ]);

  await upsert(token, chatId, messageId,
    `${notice ? notice + '\n\n' : ''}👥 Online Counts\n\nبرای هر بازی می‌توانید Min/Max تمام ۲۴ ساعت را تنظیم کنید. Mini App در ساعت فعلی دستگاه کاربر، عددی تصادفی داخل همان بازه نمایش می‌دهد.${config.updatedAt ? `\n\nآخرین ذخیره: ${formatUpdatedAt(config.updatedAt)}` : ''}`,
    rows,
  );
}

async function sendSectionMenu(env: Env, token: string, chatId: number, sectionId: string, messageId?: number, notice = ''): Promise<void> {
  const config = await getOnlineUserCountConfig(env);
  const values = config.schedule[sectionId];
  const lines = Array.from({ length: 24 }, (_, hour) => {
    const range = normalizeRange(values?.[hour]);
    return `${hourLabel(hour)}  ${range.min} – ${range.max}`;
  });

  const rows: Keyboard = [];
  for (let hour = 0; hour < 24; hour += 2) {
    rows.push([hour, hour + 1].map((item) => {
      const range = normalizeRange(values?.[item]);
      return {
        text: `${String(item).padStart(2, '0')} • ${range.min}-${range.max}`,
        callback_data: `botadmin:online:hour:${sectionId}:${item}`,
      };
    }));
  }
  rows.push([{ text: '📝 ویرایش ۲۴ ساعت یکجا', callback_data: `botadmin:online:bulk:${sectionId}` }]);
  rows.push([{ text: '⬅️ بازی‌ها', callback_data: 'botadmin:online:list' }]);

  await upsert(token, chatId, messageId,
    `${notice ? notice + '\n\n' : ''}👥 ${sectionLabel(sectionId)} — Online Counts\n\n${lines.join('\n')}\n\nروی هر ساعت بزنید تا Min/Max همان ساعت را عوض کنید.`,
    rows,
  );
}

function parseRange(text: string): OnlineCountRange | null {
  const match = text.trim().match(/^(\d{1,6})\s*(?:[-–—,:]\s*|\s+)(\d{1,6})$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (!validCount(a) || !validCount(b)) return null;
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

function parseBulkRanges(text: string): OnlineCountRange[] | null {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 24) return null;
  const ranges: OnlineCountRange[] = [];
  for (let index = 0; index < 24; index += 1) {
    const match = lines[index].match(/^(\d{1,2})\s+(\d{1,6})\s+(\d{1,6})$/);
    if (!match || Number(match[1]) !== index) return null;
    const min = Number(match[2]);
    const max = Number(match[3]);
    if (!validCount(min) || !validCount(max)) return null;
    ranges.push(min <= max ? { min, max } : { min: max, max: min });
  }
  return ranges;
}

function validCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= MAX_COUNT;
}

function normalizeRange(value: OnlineCountRange | undefined): OnlineCountRange {
  const min = Math.max(0, Math.min(MAX_COUNT, Math.floor(Number(value?.min) || 0)));
  const max = Math.max(0, Math.min(MAX_COUNT, Math.floor(Number(value?.max) || 0)));
  return min <= max ? { min, max } : { min: max, max: min };
}

function normalizeSectionId(value: unknown): string | null {
  const id = String(value || '').trim().toLowerCase();
  return ONLINE_COUNT_SECTIONS.some((section) => section.id === id) ? id : null;
}

function normalizeHour(value: unknown): number | null {
  const hour = Number(value);
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
}

function sectionLabel(id: string): string {
  return ONLINE_COUNT_SECTIONS.find((section) => section.id === id)?.label || id;
}

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

async function getState(env: Env, userId: number): Promise<OnlineState | null> {
  const raw = await env.BOT_CACHE.get(stateKey(userId)).catch(() => null);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as { mode?: string; sectionId?: string; hour?: number };
    const sectionId = normalizeSectionId(state.sectionId);
    if (!sectionId) return null;
    if (state.mode === 'bulk') return { mode: 'bulk', sectionId };
    const hour = normalizeHour(state.hour);
    return state.mode === 'hour' && hour !== null ? { mode: 'hour', sectionId, hour } : null;
  } catch {
    return null;
  }
}

function setState(env: Env, userId: number, state: OnlineState): Promise<void> {
  return env.BOT_CACHE.put(stateKey(userId), JSON.stringify(state), { expirationTtl: 900 });
}

function clearState(env: Env, userId: number): Promise<void> {
  return env.BOT_CACHE.delete(stateKey(userId)).catch(() => undefined);
}

async function clearOtherAdminStates(env: Env, userId: number): Promise<void> {
  await Promise.all([
    env.BOT_CACHE.delete(`admin:section-access-input:${userId}`).catch(() => undefined),
    env.BOT_CACHE.delete(`admin:game-card-upload:${userId}`).catch(() => undefined),
    env.BOT_CACHE.delete(`botadmin:state:${userId}`).catch(() => undefined),
  ]);
}

function stateKey(userId: number): string {
  return `${STATE_PREFIX}${userId}`;
}

function isAdmin(env: Env, userId: unknown): boolean {
  return String(env.BOT_ADMIN || '').split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean).includes(String(userId || ''));
}

function isAdminCommand(text: string): boolean {
  const value = text.trim().toLowerCase();
  return value === 'admin' || value === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(value);
}

function errorText(error: unknown): string {
  return `❌ ${error instanceof Error ? error.message : 'عملیات ناموفق بود.'}`;
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

import type { Env } from './types';
import { getLotteryAdminOverview, getLotterySettings, setLotteryDrawMinutesFromNow, updateLotterySettings } from './lottery';
import { getTelegramMenuMessageId, setTelegramMenuMessageId } from './telegram-menu-state';

type Message = { message_id: number; chat: { id: number }; from?: { id: number }; text?: string };
type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { message?: Message; callback_query?: Callback };
type Button = { text: string; callback_data: string };
type Keyboard = Button[][];
type InputMode = 'draw' | 'price' | 'limit' | 'interval';

const STATE_PREFIX = 'admin:lottery-input:';
const NANO = 1_000_000_000;

export async function handleLotteryAdminRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') return null;
  const update = await request.clone().json().catch(() => null) as Update | null;
  if (!update || !env.BOT_TOKEN) return null;

  if (update.callback_query) {
    const callback = update.callback_query;
    const data = String(callback.data || '');
    if (data === 'botadmin:home') {
      if (isAdmin(env, callback.from.id)) await clearState(env, callback.from.id);
      return null;
    }
    if (!data.startsWith('botadmin:lottery:')) return null;
    if (!isAdmin(env, callback.from.id)) return ok();
    await tg(env.BOT_TOKEN, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
    return handleCallback(env, callback);
  }

  if (update.message) {
    const message = update.message;
    const userId = message.from?.id;
    if (!userId || !isAdmin(env, userId)) return null;
    const mode = await getState(env, userId);
    if (!mode) return null;
    const text = String(message.text || '').trim();
    if (isAdminCommand(text)) {
      await clearState(env, userId);
      return null;
    }
    await handleInput(env, message, mode);
    return ok();
  }

  return null;
}

async function handleCallback(env: Env, callback: Callback): Promise<Response> {
  const data = String(callback.data || '');
  const parts = data.split(':');
  const action = parts[2] || 'menu';
  const arg = parts[3] || '';
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const messageId = callback.message?.message_id;
  await clearState(env, callback.from.id);

  try {
    if (action === 'menu' || action === 'refresh') {
      await sendLotteryMenu(env, chatId, messageId);
      return ok();
    }

    if (action === 'toggle') {
      const field = arg;
      const settings = await getLotterySettings(env);
      if (field === 'enabled') await updateLotterySettings(env, { enabled: !settings.enabled });
      else if (field === 'sales') await updateLotterySettings(env, { salesOpen: !settings.salesOpen });
      else if (field === 'free') await updateLotterySettings(env, { freeTicketEnabled: !settings.freeTicketEnabled });
      await sendLotteryMenu(env, chatId, messageId, '✅ تنظیمات ذخیره شد.');
      return ok();
    }

    if (action === 'draw') {
      const minutes = Number(arg);
      if (![60, 360, 720, 1440].includes(minutes)) throw new Error('Invalid draw time');
      await setLotteryDrawMinutesFromNow(env, minutes);
      await ensureOpenRound(env);
      await sendLotteryMenu(env, chatId, messageId, `✅ زمان Draw روی ${formatMinutes(minutes)} از الان تنظیم شد.`);
      return ok();
    }

    if (action === 'ask') {
      const mode = normalizeMode(arg);
      if (!mode) throw new Error('Unknown Lottery setting');
      await setState(env, callback.from.id, mode);
      await prompt(env, chatId, messageId, mode);
      return ok();
    }
  } catch (error) {
    await sendLotteryMenu(env, chatId, messageId, `❌ ${error instanceof Error ? error.message : 'عملیات ناموفق بود.'}`);
  }
  return ok();
}

async function handleInput(env: Env, message: Message, mode: InputMode): Promise<void> {
  const text = String(message.text || '').trim();
  const userId = message.from?.id as number;
  const menuMessageId = await getTelegramMenuMessageId(env, message.chat.id);
  try {
    if (text === '/cancel' || text === 'لغو') {
      await clearState(env, userId);
      await sendLotteryMenu(env, message.chat.id, menuMessageId);
      return;
    }

    if (mode === 'draw') {
      if (!/^\d+$/.test(text)) throw new Error('تعداد دقیقه را فقط به‌صورت عدد صحیح بفرستید.');
      const minutes = Number(text);
      await setLotteryDrawMinutesFromNow(env, minutes);
      await ensureOpenRound(env);
      await clearState(env, userId);
      await deleteIncoming(env.BOT_TOKEN, message);
      await sendLotteryMenu(env, message.chat.id, menuMessageId, `✅ Draw برای ${formatMinutes(minutes)} دیگر تنظیم شد.`);
      return;
    }

    if (mode === 'price') {
      const gram = Number(text.replace(',', '.'));
      if (!Number.isFinite(gram) || gram <= 0 || gram > 1000) throw new Error('قیمت معتبر GRAM بفرستید. مثال: 0.15');
      const nano = Math.round(gram * NANO);
      await updateLotterySettings(env, { ticketPriceNano: nano });
      await clearState(env, userId);
      await deleteIncoming(env.BOT_TOKEN, message);
      await sendLotteryMenu(env, message.chat.id, menuMessageId, `✅ قیمت هر تیکت روی ${formatGram(nano)} GRAM تنظیم شد.`);
      return;
    }

    if (mode === 'limit') {
      if (!/^\d+$/.test(text)) throw new Error('یک عدد صحیح بفرستید. 0 یعنی بدون محدودیت.');
      const limit = Number(text);
      await updateLotterySettings(env, { maxTicketsPerUser: limit });
      await clearState(env, userId);
      await deleteIncoming(env.BOT_TOKEN, message);
      await sendLotteryMenu(env, message.chat.id, menuMessageId, `✅ سقف تیکت هر کاربر ${limit === 0 ? 'برداشته شد' : `روی ${limit} قرار گرفت`}.`);
      return;
    }

    if (mode === 'interval') {
      if (!/^\d+$/.test(text)) throw new Error('فاصله Draw را به دقیقه بفرستید. مثال: 1440');
      const minutes = Number(text);
      await updateLotterySettings(env, { drawIntervalMinutes: minutes });
      await clearState(env, userId);
      await deleteIncoming(env.BOT_TOKEN, message);
      await sendLotteryMenu(env, message.chat.id, menuMessageId, `✅ فاصله پیش‌فرض Draw روی ${formatMinutes(minutes)} تنظیم شد.`);
    }
  } catch (error) {
    await tg(env.BOT_TOKEN, 'sendMessage', { chat_id: message.chat.id, text: `❌ ${error instanceof Error ? error.message : 'مقدار نامعتبر است.'}` }).catch(() => undefined);
  }
}

async function sendLotteryMenu(env: Env, chatId: number, messageId?: number, notice = ''): Promise<void> {
  await ensureOpenRound(env).catch(() => undefined);
  const overview = await getLotteryAdminOverview(env);
  const { settings, round, stats } = overview;
  const drawMs = round?.status === 'open' ? Date.parse(round.drawAt) - Date.now() : 0;
  const status = settings.enabled ? 'فعال ✅' : 'غیرفعال ❌';
  const sales = settings.salesOpen ? 'باز ✅' : 'بسته ❌';
  const free = settings.freeTicketEnabled ? 'فعال ✅' : 'غیرفعال ❌';
  const limit = settings.maxTicketsPerUser > 0 ? String(settings.maxTicketsPerUser) : 'بدون محدودیت';
  const text = [
    notice,
    '🎟 Lottery Control',
    '',
    `وضعیت Lottery: ${status}`,
    `فروش تیکت: ${sales}`,
    `تیکت اول رایگان: ${free}`,
    `قیمت هر تیکت: ${formatGram(settings.ticketPriceNano)} GRAM`,
    `سقف هر کاربر: ${limit}`,
    `فاصله پیش‌فرض Draw: ${formatMinutes(settings.drawIntervalMinutes)}`,
    '',
    `Round: ${round ? round.id : '—'}`,
    `Round status: ${round?.status || '—'}`,
    `Next Draw: ${round?.status === 'open' ? formatRemaining(drawMs) : 'Round closed'}`,
    '',
    `🎫 Tickets: ${stats.ticketCount.toLocaleString()}`,
    `👥 Players: ${stats.playerCount.toLocaleString()}`,
    `🆓 Free: ${stats.freeTicketCount.toLocaleString()}`,
    `💳 Paid: ${stats.paidTicketCount.toLocaleString()}`,
    `💰 Revenue: ${formatGram(stats.revenueNano)} GRAM`,
  ].filter(Boolean).join('\n');

  const rows: Keyboard = [
    [
      { text: settings.enabled ? '❌ خاموش کردن Lottery' : '✅ روشن کردن Lottery', callback_data: 'botadmin:lottery:toggle:enabled' },
    ],
    [
      { text: settings.salesOpen ? '⏸ توقف فروش' : '▶️ شروع فروش', callback_data: 'botadmin:lottery:toggle:sales' },
      { text: settings.freeTicketEnabled ? '🎁 حذف رایگان' : '🎁 فعال کردن رایگان', callback_data: 'botadmin:lottery:toggle:free' },
    ],
    [
      { text: '💎 قیمت تیکت', callback_data: 'botadmin:lottery:ask:price' },
      { text: '👤 سقف کاربر', callback_data: 'botadmin:lottery:ask:limit' },
    ],
    [
      { text: '⏱ +1h', callback_data: 'botadmin:lottery:draw:60' },
      { text: '⏱ +6h', callback_data: 'botadmin:lottery:draw:360' },
      { text: '⏱ +12h', callback_data: 'botadmin:lottery:draw:720' },
      { text: '⏱ +24h', callback_data: 'botadmin:lottery:draw:1440' },
    ],
    [
      { text: '🕒 زمان دلخواه Draw', callback_data: 'botadmin:lottery:ask:draw' },
      { text: '🔁 فاصله Draw', callback_data: 'botadmin:lottery:ask:interval' },
    ],
    [
      { text: '🔄 بروزرسانی', callback_data: 'botadmin:lottery:refresh' },
      { text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' },
    ],
  ];
  const tracked = messageId ?? await getTelegramMenuMessageId(env, chatId);
  const active = await upsert(env.BOT_TOKEN, chatId, tracked, text, rows);
  if (active) await setTelegramMenuMessageId(env, chatId, active);
}

async function prompt(env: Env, chatId: number, messageId: number | undefined, mode: InputMode): Promise<void> {
  const text = mode === 'draw'
    ? '🕒 زمان Draw\n\nتعداد دقیقه از الان را بفرستید.\nمثال: 90 یعنی یک ساعت و نیم دیگر.'
    : mode === 'price'
      ? '💎 قیمت تیکت\n\nقیمت هر تیکت را به GRAM بفرستید.\nمثال: 0.15'
      : mode === 'limit'
        ? '👤 سقف تیکت هر کاربر\n\nیک عدد صحیح بفرستید.\n0 یعنی بدون محدودیت.'
        : '🔁 فاصله پیش‌فرض Draw\n\nتعداد دقیقه را بفرستید.\nمثال: 1440 یعنی 24 ساعت.';
  const tracked = messageId ?? await getTelegramMenuMessageId(env, chatId);
  const active = await upsert(env.BOT_TOKEN, chatId, tracked, `${text}\n\n/cancel برای لغو`, [[{ text: '⬅️ بازگشت', callback_data: 'botadmin:lottery:menu' }]]);
  if (active) await setTelegramMenuMessageId(env, chatId, active);
}

async function ensureOpenRound(env: Env): Promise<void> {
  const open = await env.DB.prepare("SELECT id FROM lottery_rounds WHERE status='open' ORDER BY datetime(created_at) DESC LIMIT 1").first<{ id: string }>().catch(() => null);
  if (open?.id) return;
  const settings = await getLotterySettings(env);
  const id = `lr_${Date.now().toString(36)}_${randomHex(8)}`;
  const now = new Date().toISOString();
  const drawAt = Date.parse(settings.nextDrawAt) > Date.now() + 5_000
    ? settings.nextDrawAt
    : new Date(Date.now() + settings.drawIntervalMinutes * 60_000).toISOString();
  if (drawAt !== settings.nextDrawAt) await updateLotterySettings(env, { nextDrawAt: drawAt });
  await env.DB.prepare(`INSERT INTO lottery_rounds (id,status,opens_at,draw_at,ticket_price_nano,created_at,updated_at)
    VALUES (?,'open',?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`)
    .bind(id, now, drawAt, settings.ticketPriceNano).run();
}

function normalizeMode(value: string): InputMode | null {
  return value === 'draw' || value === 'price' || value === 'limit' || value === 'interval' ? value : null;
}

function stateKey(userId: number): string { return `${STATE_PREFIX}${userId}`; }
async function getState(env: Env, userId: number): Promise<InputMode | null> {
  const value = await env.BOT_CACHE.get(stateKey(userId)).catch(() => null);
  return normalizeMode(String(value || ''));
}
function setState(env: Env, userId: number, mode: InputMode): Promise<void> {
  return env.BOT_CACHE.put(stateKey(userId), mode, { expirationTtl: 900 });
}
function clearState(env: Env, userId: number): Promise<void> {
  return env.BOT_CACHE.delete(stateKey(userId)).catch(() => undefined);
}

function isAdmin(env: Env, userId: unknown): boolean {
  return String(env.BOT_ADMIN || '').split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean).includes(String(userId || ''));
}
function isAdminCommand(text: string): boolean {
  const value = text.trim().toLowerCase();
  return value === 'admin' || value === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(value);
}
function formatGram(nano: number): string {
  return (Math.max(0, Number(nano) || 0) / NANO).toFixed(4).replace(/0+$/,'').replace(/\.$/,'') || '0';
}
function formatMinutes(minutes: number): string {
  const value = Math.max(1, Math.floor(Number(minutes) || 1));
  if (value < 60) return `${value} دقیقه`;
  const hours = Math.floor(value / 60), rest = value % 60;
  if (hours < 24) return rest ? `${hours} ساعت و ${rest} دقیقه` : `${hours} ساعت`;
  const days = Math.floor(hours / 24), remainingHours = hours % 24;
  return remainingHours ? `${days} روز و ${remainingHours} ساعت` : `${days} روز`;
}
function formatRemaining(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return 'الان';
  return formatMinutes(Math.max(1, Math.ceil(ms / 60_000)));
}
function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));crypto.getRandomValues(bytes);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2,'0')).join('').slice(0,length);
}
async function deleteIncoming(token: string, message: Message): Promise<void> {
  await tg(token, 'deleteMessage', { chat_id: message.chat.id, message_id: message.message_id }).catch(() => undefined);
}
async function upsert(token: string, chatId: number, messageId: number | undefined, text: string, keyboard: Keyboard): Promise<number | undefined> {
  const payload = { chat_id: chatId, text, reply_markup: { inline_keyboard: keyboard }, disable_web_page_preview: true };
  if (messageId) {
    const edited = await tg(token, 'editMessageText', { ...payload, message_id: messageId }).then(() => true).catch(() => false);
    if (edited) return messageId;
    await tg(token, 'deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);
  }
  const sent = await tg<{ message_id?: number }>(token, 'sendMessage', payload);
  return sent?.message_id;
}
async function tg<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json().catch(() => ({})) as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result as T;
}
function ok(): Response { return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } }); }

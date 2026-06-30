import { adminUsersJson, resetUserEverywhere } from './admin-users';
import type { Env, TelegramCallbackQuery, TelegramMessage } from './types';
import { getUserControls, setUserSectionBlocked, setUserTonBalance, setUserWinChance } from './user-controls';

type TgApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type AdminUser = Record<string, unknown> & { id?: unknown; firstName?: unknown; username?: unknown; tonBalance?: unknown; tonBalanceNano?: unknown; currentSection?: unknown; status?: unknown; level?: unknown; xp?: unknown; rankName?: unknown };
type AdminState = { mode: 'win' | 'credit' | 'message' | 'broadcast'; userId?: string; page?: number };

const PAGE_SIZE = 8;
const NANO = 1_000_000_000;
const SECTIONS: Array<[string, string]> = [
  ['home', 'خانه'], ['connect', 'اتصال'], ['playzone', 'بازی‌ها'], ['plinko', 'پلینکو'], ['mines', 'ماینز'], ['crash', 'کرش'], ['wheel', 'ویل'], ['dice', 'تاس'], ['rps', 'سنگ کاغذ قیچی'], ['limbo', 'لیمبو'], ['slot', 'اسلات'], ['ghostrun', 'گوست ران'],
];

export async function handleBotAdminMessage(env: Env, token: string, message: TelegramMessage, tg: TgApi): Promise<boolean> {
  const text = message.text?.trim() ?? '';
  if (!env.BOT_ADMIN && isAdminCommand(text)) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: 'پنل ادمین هنوز تنظیم نشده است. مقدار BOT_ADMIN را برابر آیدی عددی تلگرام ادمین قرار بدهید.' }).catch(() => undefined);
    return true;
  }
  if (!isBotAdmin(env, message.from?.id)) return false;
  const state = await getAdminState(env, message.from?.id);
  if (state && !isAdminCommand(text)) return handleStateMessage(env, token, message, tg, state);
  if (!isAdminCommand(text)) return false;
  await clearAdminState(env, message.from?.id);
  await sendAdminHome(env, token, message.chat.id, tg);
  return true;
}

export async function handleBotAdminCallback(env: Env, token: string, q: TelegramCallbackQuery, tg: TgApi): Promise<boolean> {
  const data = q.data ?? '';
  if (!data.startsWith('botadmin:')) return false;
  if (!isBotAdmin(env, q.from.id)) return true;
  await tg(token, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);
  const chatId = q.message?.chat.id ?? q.from.id;
  const messageId = q.message?.message_id;
  const parts = data.split(':');
  const action = parts[1] || '';
  const id = parts[2] || '';
  const arg = parts[3] || '';
  const pageArg = Number(parts[4]) || 0;
  await clearAdminState(env, q.from.id);
  if (action === 'home') return sendAdminHome(env, token, chatId, tg, messageId);
  if (action === 'users') return sendUsersList(env, token, chatId, tg, Number(id) || 0, messageId);
  if (action === 'page') return sendUsersList(env, token, chatId, tg, Number(id) || 0, messageId);
  if (action === 'user') return sendUserPanel(env, token, chatId, tg, id, messageId, Number(arg) || 0);
  if (action === 'back') return sendUsersList(env, token, chatId, tg, Number(id) || 0, messageId);
  if (action === 'askwin') return promptAdminInput(env, token, chatId, tg, q.from.id, { mode: 'win', userId: id, page: Number(arg) || 0 }, 'درصد شانس برد را به عدد ۰ تا ۱۰۰ بفرستید.', messageId);
  if (action === 'askcredit') return promptAdminInput(env, token, chatId, tg, q.from.id, { mode: 'credit', userId: id, page: Number(arg) || 0 }, 'مقدار تغییر کردیت/TON را با علامت مثبت یا منفی بفرستید. مثال: +1.5 یا -0.25', messageId);
  if (action === 'askmsg') return promptAdminInput(env, token, chatId, tg, q.from.id, { mode: 'message', userId: id, page: Number(arg) || 0 }, 'پیام تکی کاربر را بفرستید: متن، عکس با کپشن، ویدیو، ویس/صوت یا فایل.', messageId);
  if (action === 'askbroadcast') return promptAdminInput(env, token, chatId, tg, q.from.id, { mode: 'broadcast' }, 'پیام همگانی را بفرستید: متن، عکس با کپشن، ویدیو، ویس/صوت یا فایل.', messageId);
  if (action === 'block') return toggleSection(env, token, chatId, tg, id, arg, messageId, pageArg);
  if (action === 'reset') return resetUser(env, token, chatId, tg, id, messageId);
  return true;
}

function isAdminCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === 'admin' || normalized === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(normalized);
}

function isBotAdmin(env: Env, userId: unknown): boolean {
  const admins = String(env.BOT_ADMIN ?? '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
  return admins.includes(String(userId ?? ''));
}

async function sendAdminHome(env: Env, token: string, chatId: number, tg: TgApi, messageId?: number): Promise<true> {
  const data = await adminUsersJson(env);
  const text = ['🛡 پنل مدیریت ربات گیم', '', `👥 تعداد کل کاربران: ${data.stats.total ?? (data.users as AdminUser[]).length}`, `🟢 آنلاین: ${data.stats.online ?? 0}   ⚪️ غیرفعال: ${data.stats.inactive ?? 0}`, `💎 مجموع موجودی: ${formatTon(data.stats.totalTonBalanceNano)} TON`, '', 'از منوی زیر بخش موردنظر را انتخاب کنید.'].join('\n');
  await upsertMessage(token, tg, chatId, messageId, text, [[{ text: '👥 لیست کاربران', callback_data: 'botadmin:users:0' }], [{ text: '📣 پیام همگانی در چت ربات', callback_data: 'botadmin:askbroadcast' }]]);
  return true;
}

async function sendUsersList(env: Env, token: string, chatId: number, tg: TgApi, page: number, messageId?: number): Promise<true> {
  const data = await adminUsersJson(env);
  const users = data.users as AdminUser[];
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), totalPages - 1);
  const rows = users.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE).map((u) => [{ text: userButtonText(u), callback_data: `botadmin:user:${cleanId(u.id)}:${current}` }]);
  const nav = [];
  if (current > 0) nav.push({ text: 'قبلی', callback_data: `botadmin:page:${current - 1}` });
  nav.push({ text: `${current + 1}/${totalPages}`, callback_data: `botadmin:page:${current}` });
  if (current < totalPages - 1) nav.push({ text: 'بعدی', callback_data: `botadmin:page:${current + 1}` });
  rows.push(nav, [{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }]);
  await upsertMessage(token, tg, chatId, messageId, '👥 لیست کاربران\nبرای مدیریت هر کاربر روی نام او بزنید.', rows);
  return true;
}

async function sendUserPanel(env: Env, token: string, chatId: number, tg: TgApi, userId: string, messageId?: number, page = 0): Promise<true> {
  const [data, controls] = await Promise.all([adminUsersJson(env), getUserControls(env, userId)]);
  const user = (data.users as AdminUser[]).find((item) => cleanId(item.id) === userId) || { id: userId };
  const blocked = new Set(controls.blockedSections || []);
  const sectionButtons = SECTIONS.map(([section, label]) => ({ text: `${blocked.has(section) ? '🔒' : '🔓'} ${label}`, callback_data: `botadmin:block:${userId}:${section}:${page}` }));
  const rows = [
    [{ text: '🎲 تنظیم شانس برد', callback_data: `botadmin:askwin:${userId}:${page}` }],
    [{ text: '💎 Change Credit', callback_data: `botadmin:askcredit:${userId}:${page}` }],
    [{ text: '✉️ پیام تکی در چت ربات', callback_data: `botadmin:askmsg:${userId}:${page}` }],
    ...chunk(sectionButtons, 3),
    [{ text: '🧹 ریست کامل کاربر', callback_data: `botadmin:reset:${userId}` }],
    [{ text: 'بازگشت به لیست کاربران', callback_data: `botadmin:back:${page}` }],
  ];
  const text = ['👤 مدیریت کاربر در پنل ربات گیم', '', `نام: ${cleanText(user.firstName, '—')}`, `یوزرنیم: ${cleanText(user.username, '—')}`, `آیدی: ${userId}`, `وضعیت: ${cleanText(user.status, '—')}`, `بخش فعلی: ${cleanText(user.currentSection, '—')}`, `موجودی: ${formatTon(controls.tonBalanceNano)} TON`, `شانس برد بازی: ${controls.winChancePercent}%`, `سطح: ${cleanText(user.level, '1')} - ${cleanText(user.rankName, 'Starter')} (${cleanText(user.xp, '0')} XP)`, '', 'قفل بخش‌ها سه‌تایی چیده شده‌اند؛ با هر کلیک قفل/باز می‌شوند.'].join('\n');
  await upsertMessage(token, tg, chatId, messageId, text, rows);
  return true;
}

async function promptAdminInput(env: Env, token: string, chatId: number, tg: TgApi, adminId: unknown, state: AdminState, text: string, messageId?: number): Promise<true> {
  await setAdminState(env, adminId, state);
  const back = state.userId ? `botadmin:user:${state.userId}:${state.page || 0}` : 'botadmin:home';
  await upsertMessage(token, tg, chatId, messageId, text, [[{ text: 'لغو و بازگشت', callback_data: back }]]);
  return true;
}

async function handleStateMessage(env: Env, token: string, message: TelegramMessage, tg: TgApi, state: AdminState): Promise<true> {
  if (state.mode === 'win' && state.userId) {
    const value = Number((message.text || '').replace(/[٪%]/g, '').trim());
    if (!Number.isFinite(value)) return sendStateError(token, tg, message, 'عدد شانس برد معتبر نیست.');
    await clearAdminState(env, message.from?.id);
    await setUserWinChance(env, state.userId, value);
    await cleanupAdminInput(token, tg, message);
    return sendUserPanel(env, token, message.chat.id, tg, state.userId, undefined, state.page || 0);
  }
  if (state.mode === 'credit' && state.userId) {
    const delta = parseTonDelta(message.text || '');
    if (delta === null) return sendStateError(token, tg, message, 'عدد تغییر کردیت معتبر نیست. مثال: +1 یا -0.25');
    await clearAdminState(env, message.from?.id);
    const controls = await getUserControls(env, state.userId);
    await setUserTonBalance(env, state.userId, Math.max(0, controls.tonBalanceNano + delta), { title: 'Telegram bot admin credit change', metadata: { source: 'telegram_bot_admin', deltaNano: delta } });
    await cleanupAdminInput(token, tg, message);
    return sendUserPanel(env, token, message.chat.id, tg, state.userId, undefined, state.page || 0);
  }
  if (state.mode === 'message' && state.userId) {
    await clearAdminState(env, message.from?.id);
    await copyAdminMessageToChat(token, tg, message, state.userId);
    await cleanupAdminInput(token, tg, message);
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: '✅ پیام تکی در چت ربات کاربر ارسال شد.' }).catch(() => undefined);
    return sendUserPanel(env, token, message.chat.id, tg, state.userId, undefined, state.page || 0);
  }
  if (state.mode === 'broadcast') {
    await clearAdminState(env, message.from?.id);
    const data = await adminUsersJson(env);
    let sent = 0;
    for (const user of data.users as AdminUser[]) {
      const id = cleanId(user.id);
      if (!id) continue;
      try { await copyAdminMessageToChat(token, tg, message, id); sent++; } catch (_) { /* ignore blocked users */ }
    }
    await cleanupAdminInput(token, tg, message);
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: `✅ پیام همگانی در چت ربات ${sent} کاربر ارسال شد.` }).catch(() => undefined);
    return sendAdminHome(env, token, message.chat.id, tg);
  }
  return true;
}

async function sendStateError(token: string, tg: TgApi, message: TelegramMessage, text: string): Promise<true> {
  await tg(token, 'sendMessage', { chat_id: message.chat.id, text }).catch(() => undefined);
  return true;
}

async function copyAdminMessageToChat(token: string, tg: TgApi, message: TelegramMessage, targetChatId: string): Promise<void> {
  await tg(token, 'copyMessage', { chat_id: targetChatId, from_chat_id: message.chat.id, message_id: message.message_id });
}

async function cleanupAdminInput(token: string, tg: TgApi, message: TelegramMessage): Promise<void> {
  await tg(token, 'deleteMessage', { chat_id: message.chat.id, message_id: message.message_id }).catch(() => undefined);
}

async function toggleSection(env: Env, token: string, chatId: number, tg: TgApi, userId: string, section: string, messageId?: number, page = 0): Promise<true> {
  const controls = await getUserControls(env, userId);
  await setUserSectionBlocked(env, userId, section, !controls.blockedSections.includes(section));
  return sendUserPanel(env, token, chatId, tg, userId, messageId, page);
}

async function resetUser(env: Env, token: string, chatId: number, tg: TgApi, userId: string, messageId?: number): Promise<true> {
  await resetUserEverywhere(env, userId);
  await upsertMessage(token, tg, chatId, messageId, `✅ کاربر ${userId} کامل ریست شد.`, [[{ text: 'بازگشت به لیست کاربران', callback_data: 'botadmin:back:0' }]]);
  return true;
}

async function upsertMessage(token: string, tg: TgApi, chatId: number, messageId: number | undefined, text: string, inline_keyboard: Array<Array<{ text: string; callback_data: string }>>): Promise<void> {
  const payload = { chat_id: chatId, text, reply_markup: { inline_keyboard } };
  if (messageId) {
    await tg(token, 'editMessageText', { ...payload, message_id: messageId }).catch(() => tg(token, 'sendMessage', payload));
    return;
  }
  await tg(token, 'sendMessage', payload);
}

async function getAdminState(env: Env, adminId: unknown): Promise<AdminState | null> { return env.BOT_CACHE.get(stateKey(adminId), 'json').catch(() => null) as Promise<AdminState | null>; }
async function setAdminState(env: Env, adminId: unknown, state: AdminState): Promise<void> { await env.BOT_CACHE.put(stateKey(adminId), JSON.stringify(state), { expirationTtl: 900 }); }
async function clearAdminState(env: Env, adminId: unknown): Promise<void> { await env.BOT_CACHE.delete(stateKey(adminId)).catch(() => undefined); }
function stateKey(adminId: unknown): string { return 'botadmin:state:' + String(adminId ?? ''); }

function parseTonDelta(value: string): number | null {
  const raw = value.trim().replace(/,/g, '.');
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(raw)) return null;
  const ton = Number(raw);
  if (!Number.isFinite(ton)) return null;
  return Math.trunc(ton * NANO);
}
function userButtonText(user: AdminUser): string { return `${cleanText(user.firstName, 'بی‌نام')} | ${cleanText(user.username, 'بدون یوزرنیم')} | ${formatTon(user.tonBalanceNano)} TON`; }
function chunk<T>(items: T[], size: number): T[][] { const rows: T[][] = []; for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size)); return rows; }
function cleanId(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80); }
function cleanText(value: unknown, fallback: string): string { const text = String(value ?? '').trim(); return text && text !== '—' ? text.slice(0, 80) : fallback; }
function formatTon(value: unknown): string { const n = Math.max(0, Math.floor(Number(value) || 0)); return (n / NANO).toLocaleString('en-US', { maximumFractionDigits: 6 }); }

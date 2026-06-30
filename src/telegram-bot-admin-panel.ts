import { adminUsersJson, resetUserEverywhere } from './admin-users';
import type { Env, TelegramCallbackQuery, TelegramMessage } from './types';
import { getUserControls, setUserSectionBlocked, setUserTonBalance, setUserWinChance } from './user-controls';

type TgApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type AdminUser = Record<string, unknown> & { id?: unknown; firstName?: unknown; username?: unknown; tonBalance?: unknown; tonBalanceNano?: unknown; currentSection?: unknown; status?: unknown; level?: unknown; xp?: unknown; rankName?: unknown };

const PAGE_SIZE = 8;
const NANO = 1_000_000_000;
const SECTIONS: Array<[string, string]> = [
  ['home', 'خانه'], ['connect', 'اتصال'], ['playzone', 'بازی‌ها'], ['plinko', 'پلینکو'], ['mines', 'ماینز'], ['crash', 'کرش'], ['wheel', 'ویل'], ['dice', 'تاس'], ['rps', 'سنگ کاغذ قیچی'], ['limbo', 'لیمبو'], ['slot', 'اسلات'], ['ghostrun', 'گوست ران'],
];

export async function handleBotAdminMessage(env: Env, token: string, message: TelegramMessage, tg: TgApi): Promise<boolean> {
  const text = message.text?.trim() ?? '';
  if (!isAdminCommand(text)) return false;
  if (!env.BOT_ADMIN) {
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: 'پنل ادمین هنوز تنظیم نشده است. مقدار BOT_ADMIN را برابر آیدی عددی تلگرام ادمین قرار بدهید.' }).catch(() => undefined);
    return true;
  }
  if (!isBotAdmin(env, message.from?.id)) {
    return true;
  }
  await sendAdminHome(env, token, message.chat.id, tg, 0);
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
  if (action === 'page') return sendAdminHome(env, token, chatId, tg, Number(id) || 0, messageId);
  if (action === 'user') return sendUserPanel(env, token, chatId, tg, id, messageId);
  if (action === 'back') return sendAdminHome(env, token, chatId, tg, Number(id) || 0, messageId);
  if (action === 'bal') return updateBalance(env, token, chatId, tg, id, Number(arg) || 0, messageId);
  if (action === 'win') return updateWinChance(env, token, chatId, tg, id, Number(arg) || 50, messageId);
  if (action === 'block') return toggleSection(env, token, chatId, tg, id, arg, messageId);
  if (action === 'reset') return resetUser(env, token, chatId, tg, id, messageId);
  return true;
}

function isAdminCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === 'admin' || normalized === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(normalized);
}

function isBotAdmin(env: Env, userId: unknown): boolean {
  const admins = String(env.BOT_ADMIN ?? '')
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const id = String(userId ?? '');
  return admins.includes(id);
}

async function sendAdminHome(env: Env, token: string, chatId: number, tg: TgApi, page: number, messageId?: number): Promise<true> {
  const data = await adminUsersJson(env);
  const users = data.users as AdminUser[];
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), totalPages - 1);
  const slice = users.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const rows = slice.map((u) => [{ text: userButtonText(u), callback_data: `botadmin:user:${cleanId(u.id)}` }]);
  const nav = [];
  if (current > 0) nav.push({ text: 'قبلی', callback_data: `botadmin:page:${current - 1}` });
  nav.push({ text: `${current + 1}/${totalPages}`, callback_data: `botadmin:page:${current}` });
  if (current < totalPages - 1) nav.push({ text: 'بعدی', callback_data: `botadmin:page:${current + 1}` });
  rows.push(nav);
  const text = [
    '🛡 پنل مدیریت ربات',
    '',
    `👥 تعداد کل کاربران: ${data.stats.total ?? users.length}`,
    `🟢 آنلاین: ${data.stats.online ?? 0}   ⚪️ غیرفعال: ${data.stats.inactive ?? 0}`,
    `💎 مجموع موجودی: ${formatTon(data.stats.totalTonBalanceNano)} TON`,
    '',
    'برای مدیریت هر کاربر، روی دکمه‌ی همان کاربر بزنید.',
  ].join('\n');
  await upsertMessage(token, tg, chatId, messageId, text, rows);
  return true;
}

async function sendUserPanel(env: Env, token: string, chatId: number, tg: TgApi, userId: string, messageId?: number): Promise<true> {
  const [data, controls] = await Promise.all([adminUsersJson(env), getUserControls(env, userId)]);
  const user = (data.users as AdminUser[]).find((item) => cleanId(item.id) === userId) || { id: userId };
  const blocked = new Set(controls.blockedSections || []);
  const rows = [
    [{ text: '+ 1 TON', callback_data: `botadmin:bal:${userId}:1000000000` }, { text: '- 1 TON', callback_data: `botadmin:bal:${userId}:-1000000000` }],
    [{ text: '+ 0.1 TON', callback_data: `botadmin:bal:${userId}:100000000` }, { text: '- 0.1 TON', callback_data: `botadmin:bal:${userId}:-100000000` }],
    [{ text: 'شانس برد ۰٪', callback_data: `botadmin:win:${userId}:0` }, { text: 'شانس برد ۵۰٪', callback_data: `botadmin:win:${userId}:50` }, { text: 'شانس برد ۱۰۰٪', callback_data: `botadmin:win:${userId}:100` }],
    ...SECTIONS.map(([section, label]) => [{ text: `${blocked.has(section) ? '🔒' : '🔓'} ${label}`, callback_data: `botadmin:block:${userId}:${section}` }]),
    [{ text: '🧹 ریست کامل کاربر', callback_data: `botadmin:reset:${userId}` }],
    [{ text: 'بازگشت به لیست کاربران', callback_data: 'botadmin:back:0' }],
  ];
  const text = [
    '👤 مدیریت کاربر در پنل ربات',
    '',
    `نام: ${cleanText(user.firstName, '—')}`,
    `یوزرنیم: ${cleanText(user.username, '—')}`,
    `آیدی: ${userId}`,
    `وضعیت: ${cleanText(user.status, '—')}`,
    `بخش فعلی: ${cleanText(user.currentSection, '—')}`,
    `موجودی: ${formatTon(controls.tonBalanceNano)} TON`,
    `شانس برد بازی: ${controls.winChancePercent}%`,
    `سطح: ${cleanText(user.level, '1')} - ${cleanText(user.rankName, 'Starter')} (${cleanText(user.xp, '0')} XP)`,
    '',
    'از دکمه‌های زیر برای تغییر موجودی، شانس برد، قفل بخش‌ها یا ریست کاربر استفاده کنید.',
  ].join('\n');
  await upsertMessage(token, tg, chatId, messageId, text, rows);
  return true;
}

async function updateBalance(env: Env, token: string, chatId: number, tg: TgApi, userId: string, delta: number, messageId?: number): Promise<true> {
  const controls = await getUserControls(env, userId);
  await setUserTonBalance(env, userId, Math.max(0, controls.tonBalanceNano + Math.floor(delta)), { title: 'Telegram bot admin balance update', metadata: { source: 'telegram_bot_admin' } });
  return sendUserPanel(env, token, chatId, tg, userId, messageId);
}

async function updateWinChance(env: Env, token: string, chatId: number, tg: TgApi, userId: string, value: number, messageId?: number): Promise<true> {
  await setUserWinChance(env, userId, value);
  return sendUserPanel(env, token, chatId, tg, userId, messageId);
}

async function toggleSection(env: Env, token: string, chatId: number, tg: TgApi, userId: string, section: string, messageId?: number): Promise<true> {
  const controls = await getUserControls(env, userId);
  await setUserSectionBlocked(env, userId, section, !controls.blockedSections.includes(section));
  return sendUserPanel(env, token, chatId, tg, userId, messageId);
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

function userButtonText(user: AdminUser): string {
  return `${cleanText(user.firstName, 'بی‌نام')} | ${cleanText(user.username, 'بدون یوزرنیم')} | ${formatTon(user.tonBalanceNano)} TON`;
}

function cleanId(value: unknown): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80); }
function cleanText(value: unknown, fallback: string): string { const text = String(value ?? '').trim(); return text && text !== '—' ? text.slice(0, 80) : fallback; }
function formatTon(value: unknown): string { const n = Math.max(0, Math.floor(Number(value) || 0)); return (n / NANO).toLocaleString('en-US', { maximumFractionDigits: 6 }); }

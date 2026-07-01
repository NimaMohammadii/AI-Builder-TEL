import { adminUsersJson, resetUserEverywhere } from './admin-users';
import { PUBLIC_BASE_URL } from './utils';
import type { Env, TelegramCallbackQuery, TelegramMessage } from './types';
import { getUserControls, setUserSectionBlocked, setUserTonBalance, setUserWinChance } from './user-controls';

type TgApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type AdminUser = Record<string, unknown> & { id?: unknown; firstName?: unknown; username?: unknown; tonBalance?: unknown; tonBalanceNano?: unknown; currentSection?: unknown; status?: unknown; level?: unknown; xp?: unknown; rankName?: unknown; regionCode?: unknown; regionLabel?: unknown };
type AdminState = { mode: 'win' | 'credit' | 'message' | 'broadcast'; userId?: string; page?: number; regions?: string[]; miniAppButton?: boolean };
type RegionConfig = { code: string; label: string; language: string; timezone: string };
type RegionSettings = { startPromptEnabled: boolean; commandEnabled: boolean; defaultRegionCode: string | null };

const PAGE_SIZE = 8;
const NANO = 1_000_000_000;
const REGION_SETTINGS_KEY = 'admin:bot-region-settings';
const REGIONS: RegionConfig[] = [
  { code: 'IR', label: '🇮🇷 Iran', language: 'fa', timezone: 'Asia/Tehran' },
  { code: 'TR', label: '🇹🇷 Turkey', language: 'tr', timezone: 'Europe/Istanbul' },
  { code: 'DE', label: '🇩🇪 Germany', language: 'de', timezone: 'Europe/Berlin' },
  { code: 'AE', label: '🇦🇪 UAE', language: 'ar', timezone: 'Asia/Dubai' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia', language: 'ar', timezone: 'Asia/Riyadh' },
  { code: 'RU', label: '🇷🇺 Russia', language: 'ru', timezone: 'Europe/Moscow' },
  { code: 'IN', label: '🇮🇳 India', language: 'en', timezone: 'Asia/Kolkata' },
  { code: 'BR', label: '🇧🇷 Brazil', language: 'pt', timezone: 'America/Sao_Paulo' },
  { code: 'US', label: '🇺🇸 United States', language: 'en', timezone: 'America/New_York' },
  { code: 'OTHER', label: '🌍 Other', language: 'en', timezone: 'UTC' },
];
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
  if (action === 'askbroadcast') return sendBroadcastOptions(env, token, chatId, tg, q.from.id, messageId);
  if (action === 'regionsettings') return sendRegionSettingsPanel(env, token, chatId, tg, messageId);
  if (action === 'togglestartregion') return updateRegionSettings(env, token, chatId, tg, messageId, { startPromptEnabled: id !== 'off' });
  if (action === 'toggleregioncmd') return updateRegionSettings(env, token, chatId, tg, messageId, { commandEnabled: id !== 'off' });
  if (action === 'setdefaultregion') return updateRegionSettings(env, token, chatId, tg, messageId, { defaultRegionCode: regionByCode(id)?.code ?? null });
  if (action === 'broadcastregion') return promptAdminInput(env, token, chatId, tg, q.from.id, { mode: 'broadcast', regions: normalizeRegions(id), miniAppButton: arg !== 'nobutton' }, broadcastPrompt(normalizeRegions(id), arg !== 'nobutton'), messageId);
  if (action === 'report') return sendUserReportPdf(env, token, chatId, tg, id);
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
  await upsertMessage(token, tg, chatId, messageId, text, [[{ text: '👥 لیست کاربران', callback_data: 'botadmin:users:0' }], [{ text: '🌍 تنظیمات رجین', callback_data: 'botadmin:regionsettings' }], [{ text: '📣 پیام همگانی در چت ربات', callback_data: 'botadmin:askbroadcast' }]]);
  return true;
}


async function sendRegionSettingsPanel(env: Env, token: string, chatId: number, tg: TgApi, messageId?: number): Promise<true> {
  const settings = await getRegionSettings(env);
  const defaultRegion = settings.defaultRegionCode ? regionByCode(settings.defaultRegionCode) : null;
  const text = [
    '🌍 Region Settings',
    '',
    `Start region prompt: ${settings.startPromptEnabled ? 'Enabled' : 'Disabled'}`,
    `Default direct region: ${defaultRegion ? defaultRegion.label : 'Not selected'}`,
    `/region command: ${settings.commandEnabled ? 'Enabled' : 'Disabled'}`,
    '',
    'If the prompt is disabled and a default region is selected, new users go directly to the bot menu with that region.',
  ].join('\n');
  const rows = [
    [{ text: `${settings.startPromptEnabled ? '❌' : '✅'} Show region prompt on /start`, callback_data: `botadmin:togglestartregion:${settings.startPromptEnabled ? 'off' : 'on'}` }],
    [{ text: `${settings.commandEnabled ? '✅' : '❌'} /region command`, callback_data: `botadmin:toggleregioncmd:${settings.commandEnabled ? 'off' : 'on'}` }],
    [{ text: `Default: ${defaultRegion ? defaultRegion.label : 'Not selected'}`, callback_data: 'botadmin:regionsettings' }],
    ...chunk(REGIONS.map((region) => ({ text: `${settings.defaultRegionCode === region.code ? '✔️ ' : ''}${region.label}`, callback_data: `botadmin:setdefaultregion:${region.code}` })), 2),
    [{ text: 'Clear default region', callback_data: 'botadmin:setdefaultregion:CLEAR' }],
    [{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }],
  ];
  await upsertMessage(token, tg, chatId, messageId, text, rows);
  return true;
}

async function updateRegionSettings(env: Env, token: string, chatId: number, tg: TgApi, messageId: number | undefined, patch: Partial<RegionSettings>): Promise<true> {
  const current = await getRegionSettings(env);
  const next = { ...current, ...patch };
  if (next.defaultRegionCode && !regionByCode(next.defaultRegionCode)) next.defaultRegionCode = null;
  await ensureAdminSettings(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(REGION_SETTINGS_KEY, JSON.stringify(next))
    .run();
  return sendRegionSettingsPanel(env, token, chatId, tg, messageId);
}

async function getRegionSettings(env: Env): Promise<RegionSettings> {
  const fallback: RegionSettings = { startPromptEnabled: true, commandEnabled: true, defaultRegionCode: null };
  try {
    await ensureAdminSettings(env);
    const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?').bind(REGION_SETTINGS_KEY).first<{ value_json: string }>();
    const parsed = JSON.parse(row?.value_json || '{}') as Partial<RegionSettings>;
    const defaultRegion = parsed.defaultRegionCode ? regionByCode(String(parsed.defaultRegionCode)) : null;
    return { startPromptEnabled: parsed.startPromptEnabled !== false, commandEnabled: parsed.commandEnabled !== false, defaultRegionCode: defaultRegion?.code ?? null };
  } catch { return fallback; }
}

async function ensureAdminSettings(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run().catch(() => undefined);
}

function regionByCode(code: string): RegionConfig | null {
  const cleaned = String(code || '').trim().toUpperCase();
  return REGIONS.find((region) => region.code === cleaned) ?? null;
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
    [{ text: '📄 دانلود PDF گزارش کامل کاربر', callback_data: `botadmin:report:${userId}` }],
    ...chunk(sectionButtons, 3),
    [{ text: '🧹 ریست کامل کاربر', callback_data: `botadmin:reset:${userId}` }],
    [{ text: 'بازگشت به لیست کاربران', callback_data: `botadmin:back:${page}` }],
  ];
  const text = ['👤 مدیریت کاربر در پنل ربات گیم', '', `نام: ${cleanText(user.firstName, '—')}`, `یوزرنیم: ${cleanText(user.username, '—')}`, `آیدی: ${userId}`, `رجین: ${cleanText(user.regionLabel, cleanText(user.regionCode, 'نامشخص'))}`, `وضعیت: ${cleanText(user.status, '—')}`, `بخش فعلی: ${cleanText(user.currentSection, '—')}`, `موجودی: ${formatTon(controls.tonBalanceNano)} TON`, `شانس برد بازی: ${controls.winChancePercent}%`, `سطح: ${cleanText(user.level, '1')} - ${cleanText(user.rankName, 'Starter')} (${cleanText(user.xp, '0')} XP)`, '', 'قفل بخش‌ها سه‌تایی چیده شده‌اند؛ با هر کلیک قفل/باز می‌شوند.'].join('\n');
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
    const regions = normalizeRegions(state.regions || 'ALL');
    let sent = 0;
    for (const user of (data.users as AdminUser[]).filter((item) => regionMatches(item, regions))) {
      const id = cleanId(user.id);
      if (!id) continue;
      try { await copyAdminMessageToChat(token, tg, message, id, state.miniAppButton !== false); sent++; } catch (_) { /* ignore blocked users */ }
    }
    await cleanupAdminInput(token, tg, message);
    await tg(token, 'sendMessage', { chat_id: message.chat.id, text: `✅ پیام همگانی در چت ربات برای ${sent} کاربر ارسال شد.\nرجین: ${regions.join(', ')}\nدکمه ورود به مینی‌اپ: ${state.miniAppButton !== false ? 'بله' : 'خیر'}` }).catch(() => undefined);
    return sendAdminHome(env, token, message.chat.id, tg);
  }
  return true;
}

async function sendStateError(token: string, tg: TgApi, message: TelegramMessage, text: string): Promise<true> {
  await tg(token, 'sendMessage', { chat_id: message.chat.id, text }).catch(() => undefined);
  return true;
}

async function copyAdminMessageToChat(token: string, tg: TgApi, message: TelegramMessage, targetChatId: string, miniAppButton = false): Promise<void> {
  const reply_markup = miniAppButton ? { inline_keyboard: [[{ text: 'ورود به مینی اپ', web_app: { url: `${PUBLIC_BASE_URL}/app` } }]] } : undefined;
  await tg(token, 'copyMessage', { chat_id: targetChatId, from_chat_id: message.chat.id, message_id: message.message_id, ...(reply_markup ? { reply_markup } : {}) });
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

async function sendBroadcastOptions(env: Env, token: string, chatId: number, tg: TgApi, adminId: unknown, messageId?: number): Promise<true> {
  await clearAdminState(env, adminId);
  const rows = [
    [{ text: '🌍 همه کاربران + دکمه مینی‌اپ', callback_data: 'botadmin:broadcastregion:ALL:button' }],
    [{ text: '🌍 همه کاربران بدون دکمه', callback_data: 'botadmin:broadcastregion:ALL:nobutton' }],
    [{ text: 'EN + دکمه', callback_data: 'botadmin:broadcastregion:EN:button' }, { text: 'EN بدون دکمه', callback_data: 'botadmin:broadcastregion:EN:nobutton' }],
    [{ text: 'IR + دکمه', callback_data: 'botadmin:broadcastregion:IR:button' }, { text: 'IR بدون دکمه', callback_data: 'botadmin:broadcastregion:IR:nobutton' }],
    [{ text: 'TR + دکمه', callback_data: 'botadmin:broadcastregion:TR:button' }, { text: 'TR بدون دکمه', callback_data: 'botadmin:broadcastregion:TR:nobutton' }],
    [{ text: 'RU + دکمه', callback_data: 'botadmin:broadcastregion:RU:button' }, { text: 'RU بدون دکمه', callback_data: 'botadmin:broadcastregion:RU:nobutton' }],
    [{ text: 'لغو و بازگشت', callback_data: 'botadmin:home' }],
  ];
  await upsertMessage(token, tg, chatId, messageId, '📣 تنظیمات پیام همگانی ربات گیم\n\nانتخاب کنید پیام برای همه ارسال شود یا فقط کاربران یک رجین، و اینکه زیر پیام دکمه ورود به مینی‌اپ باشد یا نه.', rows);
  return true;
}

function broadcastPrompt(regions: string[], miniAppButton: boolean): string {
  return `پیام همگانی را بفرستید: متن، عکس با کپشن، ویدیو، ویس/صوت یا فایل.\n\nهدف: ${regions.join(', ')}\nدکمه ورود به مینی‌اپ: ${miniAppButton ? 'بله' : 'خیر'}`;
}

function normalizeRegions(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : String(value || 'ALL').split(',');
  const allowed = new Set(['ALL', 'EN', 'IR', 'TR', 'RU']);
  const out = raw.map((item) => String(item || '').trim().toUpperCase()).filter((item) => allowed.has(item));
  return out.length ? Array.from(new Set(out)) : ['ALL'];
}

function regionMatches(user: AdminUser, regions: string[]): boolean {
  if (regions.includes('ALL')) return true;
  return regions.includes(regionKey(user.regionCode));
}

function regionKey(value: unknown): string {
  const code = String(value || '').trim().toUpperCase();
  return ['IR', 'TR', 'RU'].includes(code) ? code : 'EN';
}

async function sendUserReportPdf(env: Env, token: string, chatId: number, tg: TgApi, userId: string): Promise<true> {
  const report = await buildUserReport(env, userId);
  const pdf = makeSimplePdf(report.lines);
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('caption', `📄 گزارش کامل و به‌روز کاربر ${userId}`);
  form.append('document', new Blob([pdf], { type: 'application/pdf' }), `user-${userId}-report.pdf`);
  await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: form }).catch(() => tg(token, 'sendMessage', { chat_id: chatId, text: 'ارسال PDF ناموفق بود.' }));
  return true;
}

type ReportData = { lines: string[] };

async function buildUserReport(env: Env, userId: string): Promise<ReportData> {
  const [data, controls] = await Promise.all([adminUsersJson(env), getUserControls(env, userId)]);
  const user = (data.users as AdminUser[]).find((item) => cleanId(item.id) === userId) || { id: userId };
  const tx = await queryAll<Record<string, unknown>>(env, 'SELECT * FROM ton_transactions WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 200', userId);
  const deposits = await queryAll<Record<string, unknown>>(env, 'SELECT * FROM stars_deposits WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100', userId);
  const games = await gameRows(env, userId);
  const activities = await activityRows(env, userId);
  const spent = tx.filter((r) => Number(r.amount_nano || 0) < 0).reduce((s, r) => s + Math.abs(Number(r.amount_nano || 0)), 0);
  const chargeCount = tx.filter((r) => String(r.kind || '') === 'deposit' || Number(r.amount_nano || 0) > 0 && /deposit|charge|stars/i.test(String(r.title || r.kind || ''))).length + deposits.filter((r) => String(r.status || '') === 'completed').length;
  const wins = games.filter((g) => g.result === 'win');
  const losses = games.filter((g) => g.result === 'loss');
  const lines = [
    'Vexa Game Bot - Full User Report',
    `Generated at: ${new Date().toISOString()}`,
    `User ID: ${userId}`,
    `Name: ${ascii(user.firstName)}`,
    `Username: ${ascii(user.username)}`,
    `Region: ${ascii(user.regionLabel)} (${ascii(user.regionCode)})`,
    `Current section: ${ascii(user.currentSection)}`,
    `Status: ${ascii(user.status)}`,
    `Balance TON: ${formatTon(controls.tonBalanceNano)}`,
    `Win chance: ${controls.winChancePercent}%`,
    `Level: ${ascii(user.level)} / ${ascii(user.rankName)} / XP ${ascii(user.xp)}`,
    `Total spent credit/TON: ${formatTon(spent)} TON`,
    `Charge count: ${chargeCount}`,
    `Games played: ${games.length}; Wins: ${wins.length} (${formatTon(wins.reduce((s, g) => s + Math.max(0, g.amount), 0))} TON); Losses: ${losses.length} (${formatTon(losses.reduce((s, g) => s + Math.abs(Math.min(0, g.amount)), 0))} TON)`,
    '', 'Games:', ...games.slice(0, 120).map((g) => `${g.createdAt} | ${g.game} | ${g.result} | ${formatTon(g.amount)} TON | ${g.id}`),
    '', 'All transactions:', ...tx.map((r) => `${r.created_at || ''} | ${r.kind || ''} | ${r.title || ''} | ${formatTon(r.amount_nano)} TON | balance ${formatTon(r.balance_after_nano)} | ${r.status || ''}`),
    '', 'All activities:', ...activities.map((r) => `${r.created_at || r.updated_at || r.last_seen_at || ''} | ${r.type} | ${JSON.stringify(r).slice(0, 220)}`),
  ];
  return { lines };
}

async function queryAll<T>(env: Env, sql: string, ...binds: unknown[]): Promise<T[]> {
  try { const stmt = env.DB.prepare(sql); const rows = await (binds.length ? stmt.bind(...binds) : stmt).all<T>(); return rows.results || []; } catch { return []; }
}

async function gameRows(env: Env, userId: string): Promise<Array<{ game: string; id: string; result: string; amount: number; createdAt: string }>> {
  const tables = ['wheel_entries', 'crash_bets', 'plinko_rounds', 'mines_rounds', 'dice_rounds', 'rps_rounds', 'predict_bets', 'football_bets', 'football_live_question_bets'];
  const out: Array<{ game: string; id: string; result: string; amount: number; createdAt: string }> = [];
  for (const table of tables) {
    const rows = await queryAll<Record<string, unknown>>(env, `SELECT * FROM ${table} WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 80`, userId);
    for (const r of rows) {
      const amount = Number(r.payout_nano ?? r.profit_nano ?? r.reward_nano ?? r.amount_nano ?? 0) - Number(r.stake_nano ?? r.bet_nano ?? 0);
      const status = String(r.status ?? r.result ?? '').toLowerCase();
      out.push({ game: table.replace(/_(rounds|bets|entries)$/,''), id: String(r.id || r.round_id || ''), result: amount > 0 || /win|cashout|paid/.test(status) ? 'win' : amount < 0 || /loss|lost|bust/.test(status) ? 'loss' : status || 'played', amount, createdAt: String(r.created_at || r.updated_at || '') });
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function activityRows(env: Env, userId: string): Promise<Array<Record<string, unknown> & { type: string }>> {
  const sources: Array<[string, string]> = [['app_users','telegram_user_id'], ['xp_events','user_id'], ['daily_reward_events','user_id'], ['daily_rewards_events','user_id'], ['market_purchases','user_id'], ['nft_purchases','user_id'], ['ton_withdrawals','user_id']];
  const out: Array<Record<string, unknown> & { type: string }> = [];
  for (const [table, column] of sources) for (const row of await queryAll<Record<string, unknown>>(env, `SELECT * FROM ${table} WHERE ${column} = ? ORDER BY datetime(COALESCE(created_at, updated_at, last_seen_at)) DESC LIMIT 80`, userId)) out.push({ type: table, ...row });
  return out;
}

function makeSimplePdf(lines: string[]): Uint8Array {
  const safe = lines.flatMap((line) => ascii(line).match(/.{1,92}/g) || ['']).slice(0, 1200);
  const pages: string[][] = [];
  for (let i = 0; i < safe.length; i += 68) pages.push(safe.slice(i, i + 68));
  if (!pages.length) pages.push(['No data']);
  const objects: string[] = ['<< /Type /Catalog /Pages 2 0 R >>', ''];
  const pageObjectIds: number[] = [];
  for (const pageLines of pages) {
    const content = ['BT', '/F1 9 Tf', '36 806 Td', '11 TL', ...pageLines.map((line, i) => `${i ? 'T* ' : ''}(${pdfEscape(line)}) Tj`), 'ET'].join('\n');
    const pageId = objects.length + 1;
    const contentId = pageId + 1;
    pageObjectIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  }
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
  objects.splice(2, 0, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fixedPageIds = pageObjectIds.map((id) => id + 1);
  objects[1] = `<< /Type /Pages /Kids [${fixedPageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${fixedPageIds.length} >>`;
  for (let i = 3; i < objects.length; i += 2) objects[i] = objects[i].replace('/F1 3 0 R', '/F1 3 0 R').replace(/Contents (\d+) 0 R/, (_m, n) => `Contents ${Number(n) + 1} 0 R`);
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` + offsets.slice(1).map((o) => String(o).padStart(10, '0') + ' 00000 n ').join('\n') + `\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
function ascii(value: unknown): string { return String(value ?? '—').replace(/[^\x20-\x7E]/g, '?').slice(0, 500); }
function pdfEscape(value: string): string { return value.replace(/[\\()]/g, '\\$&'); }

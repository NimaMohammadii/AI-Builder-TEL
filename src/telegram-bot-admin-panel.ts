import { adminUsersJson } from './admin-users';
import { formatTonAmount } from './admin-finance-controls';
import { handleBotAdminCallback as handleCoreCallback, handleBotAdminMessage as handleCoreMessage } from './telegram-bot-admin-panel-core';
import { isSpecialWheelEnabled, setSpecialWheelEnabled } from './special-wheel-mode';
import type { Env, TelegramCallbackQuery, TelegramMessage } from './types';

type TgApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type AdminUser = Record<string, unknown>;

export async function handleBotAdminMessage(env: Env, token: string, message: TelegramMessage, tg: TgApi): Promise<boolean> {
  const text = message.text?.trim() ?? '';
  if (isAdminCommand(text) && isBotAdmin(env, message.from?.id)) {
    await sendAdminHome(env, token, message.chat.id, tg);
    return true;
  }
  return handleCoreMessage(env, token, message, tg);
}

export async function handleBotAdminCallback(env: Env, token: string, q: TelegramCallbackQuery, tg: TgApi): Promise<boolean> {
  const data = q.data ?? '';
  if (data === 'botadmin:home' || data.startsWith('botadmin:specialwheel:')) {
    if (!isBotAdmin(env, q.from.id)) return true;
    const chatId = q.message?.chat.id ?? q.from.id;
    const messageId = q.message?.message_id;
    if (data.startsWith('botadmin:specialwheel:')) {
      const enabled = data.endsWith(':on');
      await setSpecialWheelEnabled(env, enabled);
      await tg(token, 'answerCallbackQuery', {
        callback_query_id: q.id,
        text: enabled ? 'صفحه گردونه برای کاربران فعال شد.' : 'صفحه گردونه غیرفعال شد.',
      }).catch(() => undefined);
    } else {
      await tg(token, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);
    }
    await sendAdminHome(env, token, chatId, tg, messageId);
    return true;
  }
  return handleCoreCallback(env, token, q, tg);
}

function isAdminCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === 'admin' || normalized === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(normalized);
}

function isBotAdmin(env: Env, userId: unknown): boolean {
  const admins = String(env.BOT_ADMIN ?? '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
  return admins.includes(String(userId ?? ''));
}

async function sendAdminHome(env: Env, token: string, chatId: number, tg: TgApi, messageId?: number): Promise<void> {
  const [data, wheelEnabled] = await Promise.all([adminUsersJson(env), isSpecialWheelEnabled(env)]);
  const users = data.users as AdminUser[];
  const text = [
    '🛡 پنل مدیریت ربات گیم',
    '',
    `👥 تعداد کل کاربران: ${data.stats.total ?? users.length}`,
    `🟢 آنلاین: ${data.stats.online ?? 0}   ⚪️ غیرفعال: ${data.stats.inactive ?? 0}`,
    `💎 مجموع موجودی: ${formatTonAmount(data.stats.totalTonBalanceNano)} TON`,
    '',
    `🎡 صفحه موقت گردونه: ${wheelEnabled ? 'فعال ✅' : 'غیرفعال ❌'}`,
    '',
    'از منوی زیر بخش موردنظر را انتخاب کنید.',
  ].join('\n');
  const inline_keyboard = [
    [{ text: wheelEnabled ? '❌ غیرفعال کردن صفحه گردونه' : '✅ فعال کردن صفحه گردونه', callback_data: `botadmin:specialwheel:${wheelEnabled ? 'off' : 'on'}` }],
    [{ text: '👥 لیست کاربران', callback_data: 'botadmin:users:0' }],
    [{ text: '↩️ بخش کاربران برگشتی', callback_data: 'botadmin:returns' }],
    [{ text: '📊 آمار مالی و آنلاین', callback_data: 'botadmin:financestats' }],
    [{ text: '⚙️ حدود واریز/برداشت', callback_data: 'botadmin:financelimits' }],
    [{ text: '🌍 تنظیمات رجین', callback_data: 'botadmin:regionsettings' }],
    [{ text: '📣 پیام همگانی در چت ربات', callback_data: 'botadmin:askbroadcast' }],
  ];
  const payload = { chat_id: chatId, text, reply_markup: { inline_keyboard } };
  if (messageId) {
    await tg(token, 'editMessageText', { ...payload, message_id: messageId }).catch(() => tg(token, 'sendMessage', payload));
    return;
  }
  await tg(token, 'sendMessage', payload);
}

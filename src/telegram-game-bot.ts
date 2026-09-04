import { handleBotAdminCallback, handleBotAdminMessage } from './telegram-bot-admin-panel';
import { getUserRegionPreference, setUserRegionPreference } from './admin-users';
import { VEXA_LOCALE_LABELS } from './miniapp/i18n';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import type { Env, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL } from './utils';
import { getTelegramMenuMessageId, setTelegramMenuMessageId } from './telegram-menu-state';

type TelegramApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type TelegramEnvelope<T = unknown> = {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
};
type TelegramSentMessage = { message_id?: number };

const USER_REGION_OPTIONS = [
  ['US', '🇺🇸 United States'], ['IR', '🇮🇷 ایران'], ['RU', '🇷🇺 Россия'], ['TR', '🇹🇷 Türkiye'],
  ['AE', '🇦🇪 العربية'], ['ES', '🇪🇸 España'], ['BR', '🇧🇷 Brasil'], ['ID', '🇮🇩 Indonesia'],
  ['IN', '🇮🇳 India'], ['DE', '🇩🇪 Deutschland'], ['FR', '🇫🇷 France'], ['IT', '🇮🇹 Italia'],
  ['UA', '🇺🇦 Україна'], ['PL', '🇵🇱 Polska'], ['VN', '🇻🇳 Việt Nam'], ['TH', '🇹🇭 ไทย'],
  ['KR', '🇰🇷 한국'], ['JP', '🇯🇵 日本'], ['PK', '🇵🇰 پاکستان'], ['PH', '🇵🇭 Philippines'],
  ['MY', '🇲🇾 Malaysia'], ['TW', '🇹🇼 繁體中文'],
] as const;

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string; error_code?: number }> {
  const token = botToken(env);
  const invalid = botTokenError(token);
  if (invalid) return { ok: false, description: invalid };

  const data = await telegramRequest<boolean>(token, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query', 'pre_checkout_query', 'my_chat_member'],
    drop_pending_updates: true,
  });

  return { ok: data.ok, description: data.description, error_code: data.error_code };
}

export async function setGameMenuButton(env: Env): Promise<{ ok: boolean; description?: string; error_code?: number }> {
  const token = botToken(env);
  const invalid = botTokenError(token);
  if (invalid) return { ok: false, description: invalid };

  const data = await telegramRequest<boolean>(token, 'setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Open Mini App',
      web_app: { url: `${PUBLIC_BASE_URL}/app` },
    },
  });

  return { ok: data.ok, description: data.description, error_code: data.error_code };
}

export async function handleGameBotWebhook(env: Env, update: TelegramUpdate): Promise<void> {
  const token = botToken(env);
  const invalid = botTokenError(token);
  if (invalid) throw new Error(invalid);

  if (update.pre_checkout_query) {
    await handleStarsPreCheckout(env, update.pre_checkout_query);
    return;
  }

  const message = update.message;
  if (message?.successful_payment) {
    const userId = message.from?.id ?? message.chat.id;
    await handleStarsSuccessfulPayment(env, userId, message.successful_payment);
    return;
  }

  if (update.callback_query) {
    if (await handleBotAdminCallback(env, token, update.callback_query, telegram as TelegramApi)) return;
    if (await handleUserRegionCallback(env, token, update.callback_query)) return;
    await telegram(token, 'answerCallbackQuery', { callback_query_id: update.callback_query.id }).catch(() => undefined);
    return;
  }

  if (message) {
    const adminCommand = isAdminCommand(message.text);
    const adminHandled = await handleBotAdminMessage(env, token, message, telegram as TelegramApi);
    if (adminHandled) return;

    if (adminCommand) {
      await deleteIncomingMessage(token, message.chat.id, message.message_id);
      await replaceMenuMessage(env, token, message.chat.id, {
        text: `دسترسی ادمین برای این حساب فعال نیست.\n\nآیدی عددی تلگرام شما: ${message.from?.id ?? message.chat.id}\nاین عدد را داخل BOT_ADMIN قرار بدهید.`,
      }).catch(() => undefined);
      return;
    }

    if (isRegionCommand(message.text)) {
      await deleteIncomingMessage(token, message.chat.id, message.message_id);
      await sendUserRegionMenu(env, token, message.chat.id, message.from?.id ?? message.chat.id);
      return;
    }

    await deleteIncomingMessage(token, message.chat.id, message.message_id);
    await sendGameHome(env, token, message.chat.id);
  }
}

function isRegionCommand(text: string | undefined): boolean {
  return /^\/region(?:@[-_a-z0-9]+)?$/i.test(String(text || '').trim());
}

async function handleUserRegionCallback(env: Env, token: string, q: NonNullable<TelegramUpdate['callback_query']>): Promise<boolean> {
  const data = String(q.data || '');
  if (!data.startsWith('vexa:region:')) return false;
  const chatId = q.message?.chat.id ?? q.from.id;
  const action = data.slice('vexa:region:'.length).trim().toUpperCase();
  const countryCode = action === 'AUTO' ? null : USER_REGION_OPTIONS.some(([code]) => code === action) ? action : null;
  if (action !== 'AUTO' && !countryCode) {
    await telegram(token, 'answerCallbackQuery', { callback_query_id: q.id, text: 'Unknown region' }).catch(() => undefined);
    return true;
  }
  const preference = await setUserRegionPreference(env, q.from.id, countryCode);
  await telegram(token, 'answerCallbackQuery', { callback_query_id: q.id, text: preference.mode === 'automatic' ? 'Automatic detection enabled' : 'Region updated' }).catch(() => undefined);
  await sendUserRegionMenu(env, token, chatId, q.from.id, q.message?.message_id);
  return true;
}

async function sendUserRegionMenu(env: Env, token: string, chatId: number, userId: number, messageId?: number): Promise<void> {
  const preference = await getUserRegionPreference(env, userId);
  const currentCode = preference.countryCode || '';
  const currentLanguage = preference.languageCode ? (VEXA_LOCALE_LABELS as Record<string, string>)[preference.languageCode] : '';
  const title = preference.mode === 'automatic'
    ? '🌐 Region & Language\n\nAutomatic detection is active. Open the Mini App and the system will use your time zone, then IP only when that time zone belongs to more than one country.'
    : `🌐 Region & Language\n\nCurrent: ${currentCode} · ${currentLanguage}\n\nChoose a country. Its app language will be selected automatically.`;
  const rows = chunk(USER_REGION_OPTIONS.map(([code, label]) => ({ text: `${currentCode === code ? '✓ ' : ''}${label}`, callback_data: `vexa:region:${code}` })), 2);
  rows.push([{ text: `${preference.mode === 'automatic' ? '✓ ' : ''}Automatic (System)`, callback_data: 'vexa:region:AUTO' }]);
  await replaceMenuMessage(env, token, chatId, { text: title, reply_markup: { inline_keyboard: rows } }, messageId);
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) rows.push(items.slice(index, index + size));
  return rows;
}

function isAdminCommand(text: string | undefined): boolean {
  const normalized = String(text ?? '').trim().toLowerCase();
  return normalized === 'admin' || normalized === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(normalized);
}

async function sendGameHome(env: Env, token: string, chatId: number): Promise<void> {
  await replaceMenuMessage(env, token, chatId, {
    text: 'Open the Mini App',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Open Mini App',
        web_app: { url: `${PUBLIC_BASE_URL}/app` },
      }]],
    },
  });
}

async function replaceMenuMessage(env: Env, token: string, chatId: number, content: Record<string, unknown>, existingMessageId?: number): Promise<void> {
  const messageId = existingMessageId ?? await getTelegramMenuMessageId(env, chatId);
  const payload = { chat_id: chatId, ...content };
  if (messageId) {
    const edited = await telegram(token, 'editMessageText', { ...payload, message_id: messageId }).then(() => true).catch(() => false);
    if (edited) return;
    await telegram(token, 'deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);
  }
  const sent = await telegram<TelegramSentMessage>(token, 'sendMessage', payload);
  if (sent?.message_id) await setTelegramMenuMessageId(env, chatId, sent.message_id);
}

async function deleteIncomingMessage(token: string, chatId: number, messageId: number): Promise<void> {
  await telegram(token, 'deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);
}

function botToken(env: Env): string {
  let token = String(env.BOT_TOKEN ?? '').trim();
  token = token.replace(/^['"]|['"]$/g, '').trim();
  token = token.replace(/^https:\/\/api\.telegram\.org\/bot/i, '');
  token = token.replace(/^bot/i, '');
  token = token.split('/')[0]?.trim() ?? '';
  return token;
}

function botTokenError(token: string): string | null {
  if (!token) return 'BOT_TOKEN is not configured.';
  if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(token)) {
    return 'BOT_TOKEN format is invalid. Store only the raw BotFather token, without bot, URL, spaces or quotes.';
  }
  return null;
}

async function telegramRequest<T = unknown>(token: string, method: string, payload: unknown): Promise<TelegramEnvelope<T>> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as TelegramEnvelope<T>;
  if (!response.ok && typeof data.ok !== 'boolean') {
    return { ok: false, description: `Telegram ${method} failed with HTTP ${response.status}` };
  }
  return data;
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const data = await telegramRequest<T>(token, method, payload);
  if (!data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result as T;
}

import { handleBotAdminCallback, handleBotAdminMessage } from './telegram-bot-admin-panel';
import { handleSpecialWheelAdminCallback, isSpecialWheelEnabled } from './special-wheel-mode';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import type { Env, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL } from './utils';

type TelegramApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type TelegramEnvelope<T = unknown> = {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
};
type InlineButton = { text?: string; callback_data?: string; [key: string]: unknown };
type TelegramPayload = Record<string, unknown> & {
  text?: unknown;
  reply_markup?: { inline_keyboard?: InlineButton[][]; [key: string]: unknown };
};

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

  const adminTelegram: TelegramApi = <T = unknown>(currentToken: string, method: string, payload: unknown) =>
    telegramWithAdminPanel<T>(env, currentToken, method, payload);

  if (update.pre_checkout_query) {
    await handleStarsPreCheckout(env, update.pre_checkout_query);
    return;
  }

  const message = update.message;
  if (message?.successful_payment) {
    await handleStarsSuccessfulPayment(env, message.from?.id ?? message.chat.id, message.successful_payment);
    return;
  }

  if (update.callback_query) {
    if (await handleSpecialWheelAdminCallback(env, token, update.callback_query, adminTelegram)) return;
    if (await handleBotAdminCallback(env, token, update.callback_query, adminTelegram)) return;
    await telegram(token, 'answerCallbackQuery', { callback_query_id: update.callback_query.id }).catch(() => undefined);
    return;
  }

  if (message) {
    const adminCommand = isAdminCommand(message.text);
    const adminHandled = await handleBotAdminMessage(env, token, message, adminTelegram);
    if (adminHandled) return;

    if (adminCommand) {
      await telegram(token, 'sendMessage', {
        chat_id: message.chat.id,
        text: `دسترسی ادمین برای این حساب فعال نیست.\n\nآیدی عددی تلگرام شما: ${message.from?.id ?? message.chat.id}\nاین عدد را داخل BOT_ADMIN قرار بدهید.`,
      }).catch(() => undefined);
      return;
    }

    await sendGameHome(token, message.chat.id);
  }
}

function isAdminCommand(text: string | undefined): boolean {
  const normalized = String(text ?? '').trim().toLowerCase();
  return normalized === 'admin' || normalized === 'ادمین' || /^\/admin(?:@[-_a-z0-9]+)?$/.test(normalized);
}

async function sendGameHome(token: string, chatId: number): Promise<void> {
  await telegram(token, 'sendMessage', {
    chat_id: chatId,
    text: 'Open the Mini App',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Open Mini App',
        web_app: { url: `${PUBLIC_BASE_URL}/app` },
      }]],
    },
  });
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

async function telegramWithAdminPanel<T = unknown>(env: Env, token: string, method: string, payload: unknown): Promise<T> {
  const decorated = await decorateAdminPanelPayload(env, method, payload);
  return telegram<T>(token, method, decorated);
}

async function decorateAdminPanelPayload(env: Env, method: string, payload: unknown): Promise<unknown> {
  if (method !== 'sendMessage' && method !== 'editMessageText') return payload;
  if (!payload || typeof payload !== 'object') return payload;

  const source = payload as TelegramPayload;
  const text = String(source.text ?? '');
  if (!text.includes('🛡 پنل مدیریت ربات گیم')) return payload;

  const enabled = await isSpecialWheelEnabled(env);
  const existingRows = Array.isArray(source.reply_markup?.inline_keyboard)
    ? source.reply_markup!.inline_keyboard!
    : [];
  const rows = existingRows.filter((row) =>
    !row.some((button) => String(button.callback_data ?? '').startsWith('botadmin:specialwheel:')),
  );

  return {
    ...source,
    text: addSpecialWheelStatus(text, enabled),
    reply_markup: {
      ...(source.reply_markup ?? {}),
      inline_keyboard: [
        [{
          text: enabled ? '❌ غیرفعال کردن صفحه گردونه' : '✅ فعال کردن صفحه گردونه',
          callback_data: `botadmin:specialwheel:${enabled ? 'off' : 'on'}`,
        }],
        ...rows,
      ],
    },
  };
}

function addSpecialWheelStatus(text: string, enabled: boolean): string {
  const cleaned = text
    .split('\n')
    .filter((line) => !line.startsWith('🎡 صفحه موقت گردونه:'))
    .join('\n');
  const marker = 'از منوی زیر بخش موردنظر را انتخاب کنید.';
  const status = `🎡 صفحه موقت گردونه: ${enabled ? 'فعال ✅' : 'غیرفعال ❌'}`;
  if (cleaned.includes(marker)) return cleaned.replace(marker, `${status}\n\n${marker}`);
  return `${cleaned}\n\n${status}`;
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

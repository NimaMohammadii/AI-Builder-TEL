import { handleBotAdminCallback, handleBotAdminMessage } from './telegram-bot-admin-panel';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import { handleSpecialWheelPreCheckout, handleSpecialWheelSuccessfulPayment } from './special-wheel-engine';
import type { Env, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL } from './utils';

type TelegramApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;
type TelegramEnvelope<T = unknown> = {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
};
type TelegramSentMessage = { message_id?: number };

const MENU_MESSAGE_TTL = 60 * 60 * 24 * 30;

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
    if (await handleSpecialWheelPreCheckout(env, update.pre_checkout_query)) return;
    await handleStarsPreCheckout(env, update.pre_checkout_query);
    return;
  }

  const message = update.message;
  if (message?.successful_payment) {
    const userId = message.from?.id ?? message.chat.id;
    if (await handleSpecialWheelSuccessfulPayment(env, userId, message.successful_payment)) return;
    await handleStarsSuccessfulPayment(env, userId, message.successful_payment);
    return;
  }

  if (update.callback_query) {
    if (await handleBotAdminCallback(env, token, update.callback_query, telegram as TelegramApi)) return;
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

    await deleteIncomingMessage(token, message.chat.id, message.message_id);
    await sendGameHome(env, token, message.chat.id);
  }
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

async function replaceMenuMessage(env: Env, token: string, chatId: number, content: Record<string, unknown>): Promise<void> {
  const key = `botadmin:menu:${chatId}`;
  const stored = Number(await env.BOT_CACHE.get(key).catch(() => null));
  const messageId = Number.isSafeInteger(stored) && stored > 0 ? stored : undefined;
  const payload = { chat_id: chatId, ...content };
  if (messageId) {
    const edited = await telegram(token, 'editMessageText', { ...payload, message_id: messageId }).then(() => true).catch(() => false);
    if (edited) return;
    await telegram(token, 'deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);
  }
  const sent = await telegram<TelegramSentMessage>(token, 'sendMessage', payload);
  if (sent?.message_id) await env.BOT_CACHE.put(key, String(sent.message_id), { expirationTtl: MENU_MESSAGE_TTL });
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

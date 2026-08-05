import { handleBotAdminCallback, handleBotAdminMessage } from './telegram-bot-admin-panel';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import type { Env, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL } from './utils';

type TelegramApi = <T = unknown>(token: string, method: string, payload: unknown) => Promise<T>;

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string }> {
  if (!env.BOT_TOKEN) return { ok: false, description: 'BOT_TOKEN is not configured.' };
  return telegram<{ ok: boolean; description?: string }>(env.BOT_TOKEN, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query', 'pre_checkout_query', 'my_chat_member'],
    drop_pending_updates: true,
  });
}

export async function setGameMenuButton(env: Env): Promise<{ ok: boolean; description?: string }> {
  if (!env.BOT_TOKEN) return { ok: false, description: 'BOT_TOKEN is not configured.' };
  return telegram<{ ok: boolean; description?: string }>(env.BOT_TOKEN, 'setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Open Vexa Games',
      web_app: { url: `${PUBLIC_BASE_URL}/app` },
    },
  });
}

export async function handleGameBotWebhook(env: Env, update: TelegramUpdate): Promise<void> {
  const token = env.BOT_TOKEN;
  if (!token) throw new Error('BOT_TOKEN is not configured.');

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
    if (await handleBotAdminCallback(env, token, update.callback_query, telegram as TelegramApi)) return;
    await telegram(token, 'answerCallbackQuery', { callback_query_id: update.callback_query.id }).catch(() => undefined);
    return;
  }

  if (message) {
    if (await handleBotAdminMessage(env, token, message, telegram as TelegramApi)) return;
    await sendGameHome(token, message.chat.id);
  }
}

async function sendGameHome(token: string, chatId: number): Promise<void> {
  await telegram(token, 'sendMessage', {
    chat_id: chatId,
    text: '🎮 Vexa Games\n\nبرای ورود به بازی‌ها دکمه زیر را بزن.',
    reply_markup: {
      inline_keyboard: [[{
        text: '🎮 Open Games',
        web_app: { url: `${PUBLIC_BASE_URL}/app` },
      }]],
    },
  });
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result as T;
}

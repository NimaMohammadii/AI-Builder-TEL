import type { AppConfig, TelegramBotInfo, TelegramUpdate } from './types';

export function parseUpdate(body: unknown): TelegramUpdate {
  return body as TelegramUpdate;
}

export async function telegramApi<T>(token: string, method: string, payload: Record<string, unknown>): Promise<T & { ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await response.json() as T & { ok: boolean; description?: string };
}

export async function getMe(token: string): Promise<TelegramBotInfo | null> {
  const result = await telegramApi<{ result?: TelegramBotInfo }>(token, 'getMe', {});
  if (!result.ok || !result.result?.username) return null;
  return result.result;
}

export async function sendMessage(token: string, input: { chatId: number; text: string; replyMarkup?: unknown; replyToMessageId?: number }): Promise<void> {
  await telegramApi(token, 'sendMessage', {
    chat_id: input.chatId,
    text: input.text.slice(0, 3900),
    parse_mode: undefined,
    reply_markup: input.replyMarkup,
    reply_to_message_id: input.replyToMessageId
  });
}

export async function editMessage(token: string, input: { chatId: number; messageId: number; text: string; replyMarkup?: unknown }): Promise<void> {
  await telegramApi(token, 'editMessageText', {
    chat_id: input.chatId,
    message_id: input.messageId,
    text: input.text.slice(0, 3900),
    reply_markup: input.replyMarkup
  });
}

export async function answerCallback(token: string, callbackId: string, text?: string): Promise<void> {
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callbackId, text });
}

export async function setWebhook(token: string, webhookBase: string, botUsername?: string): Promise<{ ok: boolean; description?: string }> {
  const path = botUsername ? `/telegram/${botUsername.toLowerCase().replace(/^@/, '')}` : '/telegram/core';
  return telegramApi(token, 'setWebhook', {
    url: `${webhookBase}${path}`,
    allowed_updates: ['message', 'edited_message', 'callback_query']
  });
}

export async function setCustomerCommands(config: AppConfig, token: string): Promise<void> {
  await telegramApi(token, 'setMyCommands', {
    commands: [
      { command: 'start', description: 'شروع ربات' },
      { command: 'help', description: 'راهنما' }
    ]
  });
}

export function mainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: '🔌 کانکت' }, { text: '🤖 AI' }],
      [{ text: '✨ ساخت ربات بدون کدنویسی' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

export function builderKeyboard() {
  return {
    keyboard: [[{ text: '✅ اتمام ساخت' }, { text: '♻️ ریست ربات' }]],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

export function runtimeKeyboard(buttons: Array<{ label: string }>) {
  return {
    keyboard: buttons.map((button) => [{ text: button.label }]),
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

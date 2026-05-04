import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v3';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  try {
    await baseProcessTelegramUpdate(env, bot, update);
  } catch (error) {
    console.error('safe builder runtime caught error', error);
    await notifyBuilderFailure(env, bot, update, error).catch((notifyError) => console.error('failed to notify builder error', notifyError));
  }
}

async function notifyBuilderFailure(env: Env, bot: BotRecord, update: TelegramUpdate, error: unknown): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return;

  const callback = update.callback_query;
  const message = update.message;
  const chatId = callback?.message?.chat.id ?? message?.chat.id;
  if (!chatId) return;

  const token = await decryptUserToken(env, bot.encrypted_token);
  const text = buildFailureText(error);

  if (callback?.message?.message_id) {
    await telegram(token, 'editMessageText', {
      chat_id: chatId,
      message_id: callback.message.message_id,
      text,
      reply_markup: { inline_keyboard: [] },
    }).catch(async () => {
      await telegram(token, 'sendMessage', { chat_id: chatId, text });
    });
    return;
  }

  await telegram(token, 'sendMessage', { chat_id: chatId, text });
}

function buildFailureText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || 'unknown error');
  return `تغییر کامل نشد و عملیات متوقف شد.\nعلت: ${message.slice(0, 500)}\n\nدرخواست معلق حذف نشده؛ می‌تونی دوباره تأیید کنی یا درخواست رو واضح‌تر بفرستی.`;
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<T>;
}

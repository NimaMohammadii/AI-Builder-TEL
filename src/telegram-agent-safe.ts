import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v3';
import { trackTelegramBotUser } from './admin-users';
import { handleStarsPreCheckout, handleStarsSuccessfulPayment } from './stars-deposits';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  await trackTelegramBotUser(env, bot.id, update).catch((error) => console.warn('admin user tracking skipped', error));
  try {
    if (update.pre_checkout_query) {
      await handleStarsPreCheckout(env, update.pre_checkout_query);
      return;
    }
    if (update.message?.successful_payment) {
      const userId = update.message.from?.id ?? update.message.chat.id;
      await handleStarsSuccessfulPayment(env, userId, update.message.successful_payment);
      return;
    }
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
  return 'Change was not completed. Reason: ' + message.slice(0, 500) + '\n\nThe pending request was not removed. You can confirm again or send a clearer request.';
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<T>;
}

import type { AppConfig, Env } from '../types/env';
import type { TelegramMessage } from '../types/telegram';
import { sendUiMessage } from '../lib/telegram-ui';
import { buildRuntimeKeyboard, loadRuntimeBotConfig, loadRuntimeCommandResponse } from '../lib/bot-runtime-config';

export async function handleBuiltBotRuntime(message: TelegramMessage, config: AppConfig, env: Env, botId: string | null, text: string): Promise<boolean> {
  if (!botId || !text.trim()) return false;

  const value = text.trim();
  const runtime = await loadRuntimeBotConfig(env, botId);

  if (!runtime) {
    if (isStart(value)) {
      await sendUiMessage(config, {
        chatId: message.chat.id,
        text: '⚠️ هنوز منوی اجرایی برای این ربات پیدا نشد.\n\nدر ربات اصلی وارد «ساخت ربات بدون کدنویسی» شو و دوباره دستور ساخت را بفرست. اگر قبلاً ساختی، یعنی ذخیره runtime در D1 انجام نشده یا webhook این ربات به نسخه جدید وصل نیست.',
        replyToMessageId: message.message_id
      });
      return true;
    }
    return false;
  }

  if (isStart(value)) {
    await sendUiMessage(config, {
      chatId: message.chat.id,
      text: runtime.welcomeText,
      replyToMessageId: message.message_id,
      replyMarkup: buildRuntimeKeyboard(runtime)
    });
    return true;
  }

  const byButton = runtime.buttons.find((button) => button.label === value);
  if (byButton) {
    await sendUiMessage(config, {
      chatId: message.chat.id,
      text: byButton.response,
      replyToMessageId: message.message_id,
      replyMarkup: buildRuntimeKeyboard(runtime)
    });
    return true;
  }

  if (value.startsWith('/')) {
    const response = await loadRuntimeCommandResponse(env, botId, value);
    if (response) {
      await sendUiMessage(config, {
        chatId: message.chat.id,
        text: response,
        replyToMessageId: message.message_id,
        replyMarkup: buildRuntimeKeyboard(runtime)
      });
      return true;
    }
  }

  return false;
}

function isStart(value: string): boolean {
  return value === '/start' || value === 'start' || value === 'شروع';
}

import type { AppConfig, Env } from '../types/env';
import type { TelegramMessage } from '../types/telegram';
import { sendUiMessage } from '../lib/telegram-ui';
import { buildRuntimeKeyboard, loadRuntimeBotConfig, loadRuntimeCommandResponse } from '../lib/bot-runtime-config';

export async function handleBuiltBotRuntime(message: TelegramMessage, config: AppConfig, env: Env, botId: string | null, text: string): Promise<boolean> {
  if (!botId || !text.trim()) return true;

  const value = text.trim();
  const runtime = await loadRuntimeBotConfig(env, botId);

  if (!runtime) {
    await sendUiMessage(config, {
      chatId: message.chat.id,
      text: 'این ربات هنوز ساخته نشده است. مالک ربات باید از پنل اصلی، بخش ساخت ربات بدون کدنویسی را کامل کند.',
      replyToMessageId: message.message_id
    });
    return true;
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

  await sendUiMessage(config, {
    chatId: message.chat.id,
    text: 'این گزینه برای این ربات تعریف نشده است. از دکمه‌های همین ربات استفاده کن یا /start را بزن.',
    replyToMessageId: message.message_id,
    replyMarkup: buildRuntimeKeyboard(runtime)
  });
  return true;
}

function isStart(value: string): boolean {
  return value === '/start' || value === 'start' || value === 'شروع';
}

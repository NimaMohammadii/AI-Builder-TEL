import type { AppConfig } from "../types/env";
import type { TelegramApiResponse, TelegramMessage } from "../types/telegram";

export type TelegramUiMarkup = Record<string, unknown>;

export async function sendUiMessage(config: AppConfig, input: {
  chatId: number;
  text: string;
  replyToMessageId?: number;
  replyMarkup?: TelegramUiMarkup;
}): Promise<TelegramApiResponse<TelegramMessage>> {
  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      text: input.text.replace(/\u0000/g, "").trim().slice(0, 4000),
      reply_to_message_id: input.replyToMessageId,
      reply_markup: input.replyMarkup
    })
  });
  return await response.json() as TelegramApiResponse<TelegramMessage>;
}

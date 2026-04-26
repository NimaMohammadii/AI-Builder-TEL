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

export async function editUiMessage(config: AppConfig, input: {
  chatId: number;
  messageId: number;
  text: string;
  replyMarkup?: TelegramUiMarkup;
}): Promise<TelegramApiResponse<TelegramMessage>> {
  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/editMessageText`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      message_id: input.messageId,
      text: input.text.replace(/\u0000/g, "").trim().slice(0, 4000),
      reply_markup: input.replyMarkup
    })
  });
  return await response.json() as TelegramApiResponse<TelegramMessage>;
}

export async function answerCallback(config: AppConfig, callbackQueryId: string, text?: string): Promise<TelegramApiResponse<true>> {
  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/answerCallbackQuery`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false
    })
  });
  return await response.json() as TelegramApiResponse<true>;
}

import type { AppConfig } from "../types/env";
import type { TelegramApiResponse, TelegramMessage } from "../types/telegram";

export async function sendVideo(config: AppConfig, input: { chatId: number; videoUrl: string; caption?: string; replyToMessageId?: number }): Promise<TelegramApiResponse<TelegramMessage>> {
  const endpoint = `https://api.telegram.org/bot${config.telegramBotToken}/sendVideo`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      video: input.videoUrl,
      caption: input.caption,
      reply_to_message_id: input.replyToMessageId,
      supports_streaming: true
    })
  });

  return await response.json() as TelegramApiResponse<TelegramMessage>;
}

export async function getTelegramFileUrl(config: AppConfig, fileId: string): Promise<string | null> {
  const endpoint = `https://api.telegram.org/bot${config.telegramBotToken}/getFile`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ file_id: fileId })
  });

  const payload = await response.json() as { ok: boolean; result?: { file_path?: string } };
  if (!payload.ok || !payload.result?.file_path) {
    return null;
  }

  return `https://api.telegram.org/file/bot${config.telegramBotToken}/${payload.result.file_path}`;
}

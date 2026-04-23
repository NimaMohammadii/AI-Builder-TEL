import type { AppConfig } from "../types/env";
import type { TelegramApiResponse, TelegramMessage } from "../types/telegram";

interface SendVideoInput {
  chatId: number;
  videoUrl?: string;
  videoBase64?: string;
  mimeType?: string;
  fileName?: string;
  caption?: string;
  replyToMessageId?: number;
}

export async function sendVideo(config: AppConfig, input: SendVideoInput): Promise<TelegramApiResponse<TelegramMessage>> {
  const endpoint = `https://api.telegram.org/bot${config.telegramBotToken}/sendVideo`;

  if (input.videoBase64) {
    const formData = new FormData();
    formData.set("chat_id", String(input.chatId));
    if (input.caption) formData.set("caption", input.caption.slice(0, 1024));
    if (input.replyToMessageId) formData.set("reply_to_message_id", String(input.replyToMessageId));
    formData.set("supports_streaming", "true");
    const bytes = Uint8Array.from(atob(input.videoBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: input.mimeType || "video/mp4" });
    formData.set("video", blob, input.fileName || "vexa-video.mp4");
    const uploadResponse = await fetch(endpoint, { method: "POST", body: formData });
    return await uploadResponse.json() as TelegramApiResponse<TelegramMessage>;
  }

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

export async function fetchRemoteBinaryAsBase64(url: string): Promise<{ base64: string; mimeType?: string; fileName?: string } | null> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) return null;
  const mimeType = response.headers.get("content-type") || undefined;
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return {
    base64: btoa(binary),
    mimeType,
    fileName: buildFileName(url, mimeType)
  };
}

function buildFileName(url: string, mimeType?: string): string {
  const cleanUrl = url.split("?")[0] || "file";
  const rawName = cleanUrl.split("/").pop() || "file";
  if (rawName.includes(".")) return rawName;
  if (mimeType?.startsWith("video/")) return `${rawName}.mp4`;
  if (mimeType?.startsWith("image/")) return `${rawName}.jpg`;
  return rawName;
}

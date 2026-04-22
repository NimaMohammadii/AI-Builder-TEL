import type { AppConfig } from "../config";
import type { TelegramApiResponse, TelegramMessage, TelegramUpdate, TelegramUser } from "../types/telegram";

interface TelegramSendMessagePayload {
  chat_id: number;
  text: string;
  reply_to_message_id?: number;
}

interface TelegramWebhookPayload {
  url: string;
  secret_token?: string;
  allowed_updates?: string[];
}

interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  username?: string;
  first_name?: string;
}

interface TelegramApiContext {
  token: string;
}

async function callTelegramApi<T>(context: TelegramApiContext, method: string, body?: object): Promise<TelegramApiResponse<T>> {
  const endpoint = `https://api.telegram.org/bot${context.token}/${method}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return (await response.json()) as TelegramApiResponse<T>;
}

export async function sendMessage(config: AppConfig, payload: TelegramSendMessagePayload): Promise<TelegramApiResponse<TelegramMessage>> {
  return callTelegramApi<TelegramMessage>({ token: config.telegramBotToken }, "sendMessage", {
    chat_id: payload.chat_id,
    text: sanitizeText(payload.text),
    reply_to_message_id: payload.reply_to_message_id
  });
}

export async function setWebhook(config: AppConfig): Promise<TelegramApiResponse<true>> {
  const payload: TelegramWebhookPayload = {
    url: `${config.publicWebhookUrl.replace(/\/$/, "")}/telegram/webhook`,
    allowed_updates: ["message", "edited_message"]
  };

  if (config.telegramWebhookSecret) {
    payload.secret_token = config.telegramWebhookSecret;
  }

  return callTelegramApi<true>({ token: config.telegramBotToken }, "setWebhook", payload);
}

export async function deleteWebhook(config: AppConfig): Promise<TelegramApiResponse<true>> {
  return callTelegramApi<true>({ token: config.telegramBotToken }, "deleteWebhook", { drop_pending_updates: false });
}

export async function getMe(config: AppConfig): Promise<TelegramApiResponse<TelegramBotInfo>> {
  return callTelegramApi<TelegramBotInfo>({ token: config.telegramBotToken }, "getMe");
}

export function parseUpdate(payload: unknown): TelegramUpdate | null {
  if (!payload || typeof payload !== "object") return null;
  const maybeUpdate = payload as Partial<TelegramUpdate>;
  if (typeof maybeUpdate.update_id !== "number") return null;
  return maybeUpdate as TelegramUpdate;
}

export function isReplyToBot(message: TelegramMessage): boolean {
  return Boolean(message.reply_to_message?.from?.is_bot);
}

export function messageMentionsBot(message: TelegramMessage, botUsername?: string): boolean {
  if (!botUsername || !message.text) return false;

  const normalizedText = message.text.toLowerCase();
  if (normalizedText.includes(`@${botUsername}`)) {
    return true;
  }

  if (!message.entities) {
    return false;
  }

  return message.entities.some((entity) => {
    if (entity.type !== "mention") return false;
    const mention = normalizedText.slice(entity.offset, entity.offset + entity.length);
    return mention === `@${botUsername}`;
  });
}

export function shouldRespondInChat(message: TelegramMessage, botUsername?: string): boolean {
  if (!message.text) return false;

  if (message.chat.type === "private") {
    return true;
  }

  if (message.chat.type === "group" || message.chat.type === "supergroup") {
    return messageMentionsBot(message, botUsername) || isReplyToBot(message);
  }

  return false;
}

function sanitizeText(text: string): string {
  return text.replace(/\u0000/g, "").trim().slice(0, 4000);
}

export function verifyTelegramWebhookSecret(request: Request, expectedSecret?: string): boolean {
  if (!expectedSecret) return true;
  const provided = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
  return provided === expectedSecret;
}

export function getBotUsernameFromMe(result: TelegramApiResponse<TelegramUser>): string | undefined {
  if (result.ok && result.result.username) {
    return result.result.username.toLowerCase();
  }
  return undefined;
}

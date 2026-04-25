import type { AppConfig } from "../types/env";
import type { TelegramApiResponse, TelegramMessage, TelegramUpdate, TelegramUser } from "../types/telegram";
import { isGroupChat, isPrivateChat, isReplyToBot } from "../utils/telegram-helpers";

interface TelegramSendMessagePayload {
  chat_id: number;
  text: string;
  reply_to_message_id?: number;
}

interface TelegramSendPhotoPayload {
  chat_id: number;
  photoUrl?: string;
  photoBase64?: string;
  caption?: string;
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

export interface TelegramBotCommand {
  command: string;
  description: string;
}

interface TelegramApiContext {
  token: string;
}

async function callTelegramApi<T>(context: TelegramApiContext, method: string, body?: object): Promise<TelegramApiResponse<T>> {
  const endpoint = `https://api.telegram.org/bot${context.token}/${method}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  return (await response.json()) as TelegramApiResponse<T>;
}

async function callTelegramApiFormData<T>(context: TelegramApiContext, method: string, formData: FormData): Promise<TelegramApiResponse<T>> {
  const endpoint = `https://api.telegram.org/bot${context.token}/${method}`;
  const response = await fetch(endpoint, { method: "POST", body: formData });
  return (await response.json()) as TelegramApiResponse<T>;
}

export async function sendMessage(config: AppConfig, payload: TelegramSendMessagePayload): Promise<TelegramApiResponse<TelegramMessage>> {
  return callTelegramApi<TelegramMessage>({ token: config.telegramBotToken }, "sendMessage", {
    chat_id: payload.chat_id,
    text: sanitizeText(payload.text),
    reply_to_message_id: payload.reply_to_message_id
  });
}

export async function sendPhoto(config: AppConfig, payload: TelegramSendPhotoPayload): Promise<TelegramApiResponse<TelegramMessage>> {
  if (payload.photoUrl) {
    return callTelegramApi<TelegramMessage>({ token: config.telegramBotToken }, "sendPhoto", {
      chat_id: payload.chat_id,
      photo: payload.photoUrl,
      caption: payload.caption ? sanitizeCaption(payload.caption) : undefined,
      reply_to_message_id: payload.reply_to_message_id
    });
  }

  if (payload.photoBase64) {
    const formData = new FormData();
    formData.set("chat_id", String(payload.chat_id));
    if (payload.caption) formData.set("caption", sanitizeCaption(payload.caption));
    if (payload.reply_to_message_id) formData.set("reply_to_message_id", String(payload.reply_to_message_id));
    const bytes = Uint8Array.from(atob(payload.photoBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "image/png" });
    formData.set("photo", blob, "vexa-image.png");
    return callTelegramApiFormData<TelegramMessage>({ token: config.telegramBotToken }, "sendPhoto", formData);
  }

  return { ok: false, error_code: 400, description: "missing_photo_payload" } as TelegramApiResponse<TelegramMessage>;
}

export async function setWebhook(config: AppConfig): Promise<TelegramApiResponse<true>> {
  return setWebhookForToken(config.telegramBotToken, config.publicWebhookUrl, undefined, config.telegramWebhookSecret);
}

export async function setWebhookForToken(token: string, publicWebhookUrl: string, botUsername?: string, secretToken?: string): Promise<TelegramApiResponse<true>> {
  const baseUrl = normalizeWebhookBaseUrl(publicWebhookUrl);
  const webhookPath = botUsername ? `/telegram/webhook/${botUsername.replace(/^@/, "").toLowerCase()}` : "/telegram/webhook";
  const payload: TelegramWebhookPayload = {
    url: `${baseUrl}${webhookPath}`,
    allowed_updates: ["message", "edited_message"]
  };
  if (secretToken) payload.secret_token = secretToken;
  return callTelegramApi<true>({ token }, "setWebhook", payload);
}

export async function setBotCommands(config: AppConfig, commands: TelegramBotCommand[]): Promise<TelegramApiResponse<true>> {
  return callTelegramApi<true>({ token: config.telegramBotToken }, "setMyCommands", {
    commands: commands.map((item) => ({
      command: item.command.replace(/^\//, '').slice(0, 32),
      description: item.description.slice(0, 256)
    }))
  });
}

export async function deleteWebhook(config: AppConfig): Promise<TelegramApiResponse<true>> {
  return callTelegramApi<true>({ token: config.telegramBotToken }, "deleteWebhook", { drop_pending_updates: false });
}

export async function getMe(config: AppConfig): Promise<TelegramApiResponse<TelegramBotInfo>> {
  return callTelegramApi<TelegramBotInfo>({ token: config.telegramBotToken }, "getMe");
}

export async function getMeByToken(token: string): Promise<TelegramApiResponse<TelegramBotInfo>> {
  return callTelegramApi<TelegramBotInfo>({ token }, "getMe");
}

export function parseUpdate(payload: unknown): TelegramUpdate | null {
  if (!payload || typeof payload !== "object") return null;
  const maybeUpdate = payload as Partial<TelegramUpdate>;
  if (typeof maybeUpdate.update_id !== "number") return null;
  return maybeUpdate as TelegramUpdate;
}

export function shouldRespondInChat(message: TelegramMessage, botUsername?: string): boolean {
  const hasTextualContent = Boolean(message.text || message.caption);
  const hasPhoto = Array.isArray(message.photo) && message.photo.length > 0;

  if (isPrivateChat(message)) {
    return hasTextualContent || hasPhoto;
  }

  if (isGroupChat(message)) {
    return isBotMentionedInMessage(message, botUsername) || isReplyToBot(message);
  }

  return false;
}

function isBotMentionedInMessage(message: TelegramMessage, botUsername?: string): boolean {
  if (!botUsername) return false;

  const text = (message.text ?? message.caption ?? "").toLowerCase();
  if (text.includes(`@${botUsername}`)) {
    return true;
  }

  const entities = [...(message.entities ?? []), ...(message.caption_entities ?? [])];
  return entities.some((entity) => {
    if (entity.type !== "mention") return false;
    const mention = text.slice(entity.offset, entity.offset + entity.length);
    return mention === `@${botUsername}`;
  });
}

function sanitizeText(text: string): string {
  return text.replace(/\u0000/g, "").trim().slice(0, 4000);
}

function sanitizeCaption(text: string): string {
  return text.replace(/\u0000/g, "").trim().slice(0, 1024);
}

function normalizeWebhookBaseUrl(value: string): string {
  return value.replace(/\/$/, "").replace(/\/telegram\/webhook(?:\/.*)?$/, "");
}

export function verifyTelegramWebhookSecret(request: Request, expectedSecret?: string): boolean {
  if (!expectedSecret) return true;
  const provided = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
  return provided === expectedSecret;
}

export function getBotUsernameFromMe(result: TelegramApiResponse<TelegramUser>): string | undefined {
  if (result.ok && result.result.username) return result.result.username.toLowerCase();
  return undefined;
}

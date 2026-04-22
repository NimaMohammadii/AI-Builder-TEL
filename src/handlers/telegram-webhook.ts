import type { AppConfig } from "../types/env";
import type { TelegramMessage } from "../types/telegram";
import { logger } from "../lib/logger";
import { readConversationHistory, writeConversationHistory } from "../lib/chat-memory";
import { generateOpenAIReply } from "../lib/openai";
import { parseUpdate, sendMessage, shouldRespondInChat, verifyTelegramWebhookSecret } from "../lib/telegram";
import { jsonError, jsonOk } from "../utils/http";
import { isPrivateChat } from "../utils/telegram-helpers";

const NON_TEXT_PRIVATE_REPLY = "فعلاً فقط پیام متنی رو می‌تونم پردازش کنم.";

export async function handleTelegramWebhook(request: Request, config: AppConfig): Promise<Response> {
  const route = "/telegram/webhook";

  if (!verifyTelegramWebhookSecret(request, config.telegramWebhookSecret)) {
    logger.warn("Rejected webhook due to invalid secret token", { route, event: "invalid_secret" });
    return jsonError("unauthorized", 401);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    logger.warn("Invalid content-type for webhook", { route, event: "invalid_content_type" });
    return jsonError("invalid_content_type", 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn("Invalid JSON payload received", { route, event: "invalid_json" });
    return jsonError("invalid_json", 400);
  }

  const update = parseUpdate(body);
  if (!update) {
    logger.warn("Invalid update payload", { route, event: "invalid_update_payload" });
    return jsonOk({ ok: true, ignored: true });
  }

  const message = update.message ?? update.edited_message;
  if (!message) {
    logger.info("Ignoring unsupported update type", {
      route,
      event: "unsupported_update",
      updateId: update.update_id
    });
    return jsonOk({ ok: true, ignored: true });
  }

  return processMessage(message, config, update.update_id);
}

async function processMessage(message: TelegramMessage, config: AppConfig, updateId: number): Promise<Response> {
  const route = "/telegram/webhook";
  const chatType = message.chat.type;

  if (!shouldRespondInChat(message, config.botUsername)) {
    logger.info("Ignoring message due to chat policy", {
      route,
      event: "ignored_by_policy",
      chatType,
      updateId
    });
    return jsonOk({ ok: true, ignored: true });
  }

  if (!message.text && isPrivateChat(message)) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: NON_TEXT_PRIVATE_REPLY,
      reply_to_message_id: message.message_id
    });

    return jsonOk();
  }

  if (!message.text) {
    return jsonOk({ ok: true, ignored: true });
  }

  const history = await readConversationHistory(config, message.chat.id);
  const reply = await generateOpenAIReply(config, message.text, history);

  const sendResult = await sendMessage(config, {
    chat_id: message.chat.id,
    text: reply,
    reply_to_message_id: message.message_id
  });

  if (sendResult.ok) {
    await writeConversationHistory(config, message.chat.id, history, message.text, reply);
  }

  if (!sendResult.ok) {
    logger.error("Failed to send Telegram response", {
      route,
      event: "telegram_send_error",
      chatType,
      updateId,
      error: `${sendResult.error_code}:${sendResult.description}`
    });
  }

  logger.info("Processed Telegram message", {
    route,
    event: "message_processed",
    chatType,
    updateId,
    status: sendResult.ok ? 200 : 502
  });

  return jsonOk();
}

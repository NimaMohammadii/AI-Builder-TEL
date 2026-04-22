import type { TelegramMessage } from "../types/telegram";

export function isPrivateChat(message: TelegramMessage): boolean {
  return message.chat.type === "private";
}

export function isGroupChat(message: TelegramMessage): boolean {
  return message.chat.type === "group" || message.chat.type === "supergroup";
}

export function isReplyToBot(message: TelegramMessage): boolean {
  return Boolean(message.reply_to_message?.from?.is_bot);
}

export function isBotMentioned(message: TelegramMessage, botUsername?: string): boolean {
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

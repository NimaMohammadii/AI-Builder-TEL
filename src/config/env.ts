import { DEFAULT_SYSTEM_PROMPT } from "../prompts/system";
import type { AppConfig, Env } from "../types/env";

const FALLBACK_OPENAI_MODEL = "gpt-5.4";
const FALLBACK_IMAGE_MODEL = "gpt-image-1";

export function loadConfig(env: Env): AppConfig {
  if (!env.OPENAI_API_KEY || !env.TELEGRAM_BOT_TOKEN || !env.PUBLIC_WEBHOOK_URL) {
    throw new Error("Missing required environment variables.");
  }

  return {
    openAiApiKey: env.OPENAI_API_KEY,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    publicWebhookUrl: env.PUBLIC_WEBHOOK_URL,
    chatMemory: env.CHAT_MEMORY,
    openAiModel: env.OPENAI_MODEL ?? FALLBACK_OPENAI_MODEL,
    imageModel: env.IMAGE_MODEL ?? FALLBACK_IMAGE_MODEL,
    telegramWebhookSecret: env.TELEGRAM_WEBHOOK_SECRET,
    adminDebugToken: env.ADMIN_DEBUG_TOKEN,
    botUsername: normalizeBotUsername(env.BOT_USERNAME),
    environment: env.ENVIRONMENT ?? "development",
    systemPrompt: env.DEFAULT_SYSTEM_PROMPT ?? DEFAULT_SYSTEM_PROMPT
  };
}

function normalizeBotUsername(value?: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith("@") ? value.slice(1).toLowerCase() : value.toLowerCase();
}

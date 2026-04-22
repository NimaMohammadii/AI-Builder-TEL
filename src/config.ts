import { DEFAULT_SYSTEM_PROMPT } from "./prompts/system";

export interface Env {
  OPENAI_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  PUBLIC_WEBHOOK_URL: string;
  OPENAI_MODEL?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  ADMIN_DEBUG_TOKEN?: string;
  BOT_USERNAME?: string;
  DEFAULT_SYSTEM_PROMPT?: string;
  ENVIRONMENT?: string;
}

export interface AppConfig {
  openAiApiKey: string;
  telegramBotToken: string;
  publicWebhookUrl: string;
  openAiModel: string;
  telegramWebhookSecret?: string;
  adminDebugToken?: string;
  botUsername?: string;
  environment: string;
  systemPrompt: string;
}

const FALLBACK_OPENAI_MODEL = "gpt-4.1-mini";

export function getConfig(env: Env): AppConfig {
  if (!env.OPENAI_API_KEY || !env.TELEGRAM_BOT_TOKEN || !env.PUBLIC_WEBHOOK_URL) {
    throw new Error("Missing required environment variables.");
  }

  return {
    openAiApiKey: env.OPENAI_API_KEY,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    publicWebhookUrl: env.PUBLIC_WEBHOOK_URL,
    openAiModel: env.OPENAI_MODEL ?? FALLBACK_OPENAI_MODEL,
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

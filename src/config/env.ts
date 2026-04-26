import { ACTIVE_AI_PROVIDER } from "./ai-provider";
import { DEFAULT_SYSTEM_PROMPT } from "../prompts/system";
import type { AiProvider, AppConfig, Env } from "../types/env";

const OPENAI_MODEL = "gpt-5-mini";
const FALLBACK_IMAGE_MODEL = "gpt-image-1";
const FALLBACK_XAI_MODEL = "grok-4-1-fast-non-reasoning";
const FALLBACK_XAI_IMAGE_MODEL = "grok-imagine-image-pro";

export function loadConfig(env: Env): AppConfig {
  if (!env.TELEGRAM_BOT_TOKEN || !env.PUBLIC_WEBHOOK_URL) {
    throw new Error("Missing required environment variables.");
  }

  const provider = normalizeProvider(ACTIVE_AI_PROVIDER);
  if (provider === "gpt" && !env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY for GPT provider.");
  if (provider === "grok" && !env.XAI_API_KEY) throw new Error("Missing XAI_API_KEY for Grok provider.");

  return {
    provider,
    openAiApiKey: env.OPENAI_API_KEY,
    xAiApiKey: env.XAI_API_KEY,
    xAiBaseUrl: env.XAI_BASE_URL ?? "https://api.x.ai/v1",
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    publicWebhookUrl: env.PUBLIC_WEBHOOK_URL,
    chatMemory: env.CHAT_MEMORY,
    openAiModel: OPENAI_MODEL,
    imageModel: env.IMAGE_MODEL ?? FALLBACK_IMAGE_MODEL,
    xAiModel: env.XAI_MODEL ?? FALLBACK_XAI_MODEL,
    xAiImageModel: env.XAI_IMAGE_MODEL ?? FALLBACK_XAI_IMAGE_MODEL,
    telegramWebhookSecret: env.TELEGRAM_WEBHOOK_SECRET,
    adminDebugToken: env.ADMIN_DEBUG_TOKEN,
    botUsername: normalizeBotUsername(env.BOT_USERNAME),
    environment: env.ENVIRONMENT ?? "development",
    systemPrompt: env.DEFAULT_SYSTEM_PROMPT ?? DEFAULT_SYSTEM_PROMPT
  };
}

function normalizeProvider(value?: AiProvider): AiProvider {
  return value === "grok" ? "grok" : "gpt";
}

function normalizeBotUsername(value?: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith("@") ? value.slice(1).toLowerCase() : value.toLowerCase();
}

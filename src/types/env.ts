export type AiProvider = "gpt" | "grok";

export interface Env {
  OPENAI_API_KEY?: string;
  XAI_API_KEY?: string;
  TELEGRAM_BOT_TOKEN: string;
  PUBLIC_WEBHOOK_URL: string;
  CHAT_MEMORY?: KVNamespace;
  DB?: D1Database;
  AI_PROVIDER?: AiProvider;
  OPENAI_MODEL?: string;
  IMAGE_MODEL?: string;
  XAI_MODEL?: string;
  XAI_IMAGE_MODEL?: string;
  XAI_BASE_URL?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  ADMIN_DEBUG_TOKEN?: string;
  BOT_USERNAME?: string;
  DEFAULT_SYSTEM_PROMPT?: string;
  ENVIRONMENT?: string;
}

export interface AppConfig {
  provider: AiProvider;
  openAiApiKey?: string;
  xAiApiKey?: string;
  xAiBaseUrl: string;
  telegramBotToken: string;
  publicWebhookUrl: string;
  chatMemory?: KVNamespace;
  openAiModel: string;
  imageModel: string;
  xAiModel: string;
  xAiImageModel: string;
  telegramWebhookSecret?: string;
  adminDebugToken?: string;
  botUsername?: string;
  environment: string;
  systemPrompt: string;
}

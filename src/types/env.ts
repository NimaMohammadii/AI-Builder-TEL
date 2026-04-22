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

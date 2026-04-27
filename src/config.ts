import type { AppConfig, Env } from './types';

export function loadConfig(env: Env, request: Request): AppConfig {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error('Missing bot token');
  if (!env.OPENAI_API_KEY) throw new Error('Missing AI key');
  return {
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    openAiApiKey: env.OPENAI_API_KEY,
    openAiModel: 'gpt-5-mini',
    publicWebhookBase: new URL(request.url).origin
  };
}

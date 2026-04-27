export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  OPENAI_API_KEY: string;
  PUBLIC_WEBHOOK_BASE?: string;
  DB: D1Database;
  BOT_KV?: KVNamespace;
}

export interface AppConfig {
  telegramBotToken: string;
  openAiApiKey: string;
  openAiModel: string;
  publicWebhookBase: string;
}

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  username?: string;
  title?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  text?: string;
  chat: TelegramChat;
  from?: TelegramUser;
}

export interface TelegramCallbackQuery {
  id: string;
  data?: string;
  message?: TelegramMessage;
  from?: TelegramUser;
}

export interface TelegramUpdate {
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramBotInfo {
  id: number;
  username: string;
  first_name?: string;
}

export interface BotRecord {
  id: string;
  owner_user_id: string;
  token: string;
  telegram_bot_id: string;
  username: string;
  ai_enabled: number;
  ai_prompt: string;
  program_json?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramButton {
  label: string;
  command: string;
  response: string;
  flowId?: string;
}

export type ProgramStepKind = 'ask' | 'message' | 'end';

export interface ProgramStep {
  id: string;
  kind: ProgramStepKind;
  text: string;
  field?: string;
  next?: string;
}

export interface ProgramFlow {
  id: string;
  title: string;
  triggerLabels: string[];
  triggerCommands: string[];
  steps: ProgramStep[];
  summaryText: string;
}

export interface BotProgram {
  version: number;
  welcomeText: string;
  aiInstructions: string;
  buttons: ProgramButton[];
  flows: ProgramFlow[];
  fallbackText: string;
}

export interface RuntimeSession {
  bot_id: string;
  chat_id: string;
  flow_id: string;
  step_id: string;
  data_json: string;
}

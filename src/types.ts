export type Env = {
  DB: D1Database;
  BOT_CACHE: KVNamespace;
  RATE_LIMITS: KVNamespace;
  ASSETS: R2Bucket;
  APP_NAME: string;
  PUBLIC_BASE_URL: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODEL: string;
  OPENAI_API_KEY?: string;
  ADMIN_API_KEY?: string;
  TOKEN_ENCRYPTION_KEY?: string;
};

export type ButtonAction =
  | { type: 'menu'; target: string }
  | { type: 'products' }
  | { type: 'support' }
  | { type: 'ai_chat'; prompt: string }
  | { type: 'url'; url: string };

export type BotButton = {
  text: string;
  action: ButtonAction;
};

export type BotScreen = {
  id: string;
  title: string;
  message: string;
  buttons: BotButton[];
};

export type BotBlueprint = {
  version: 1;
  botType: 'sales' | 'support' | 'vip' | 'custom';
  language: 'fa' | 'en' | 'multi';
  tone: 'friendly' | 'formal' | 'premium' | 'bold';
  startScreen: string;
  screens: BotScreen[];
  aiSupport: {
    enabled: boolean;
    systemPrompt: string;
    handoffMessage: string;
  };
  safety: {
    blockedTopics: string[];
    requireHumanFor: string[];
  };
};

export type BotRecord = {
  id: string;
  owner_telegram_id: string | null;
  username: string | null;
  title: string;
  status: 'draft' | 'active' | 'paused' | 'suspended';
  encrypted_token: string;
  webhook_secret: string;
  blueprint_json: string;
  settings_json: string;
  created_at: string;
  updated_at: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

export type TelegramMessage = {
  message_id: number;
  text?: string;
  chat: { id: number; type: string };
  from?: { id: number; is_bot?: boolean; first_name?: string; username?: string };
};

export type TelegramCallbackQuery = {
  id: string;
  data?: string;
  from: { id: number; first_name?: string; username?: string };
  message?: TelegramMessage;
};

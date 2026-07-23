export type Env = {
  DB: D1Database;
  BOT_CACHE: KVNamespace;
  RATE_LIMITS: KVNamespace;
  ASSETS: R2Bucket;
  TELEGRAM_BOT_TOKEN: string;
  AI_BOT_TOKEN?: string;
  GAME_BOT_TOKEN?: string;
  GAME_BOT_USERNAME?: string;
  TELEGRAM_MINI_APP_SHORT_NAME?: string;
  OPENAI_API_KEY: string;
  XAI_API_KEY?: string;
  TONCENTER_API_KEY?: string;
  TON_WITHDRAW_MNEMONIC?: string;
  TON_WITHDRAW_PAYOUT_TOKEN?: string;
  TON_WITHDRAW_WALLET_ADDRESS?: string;
  ADMIN_KEY: string;
  BOT_ADMIN?: string;
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

export type TelegramChat = {
  id: number;
  type: string;
  title?: string;
  username?: string;
};

export type TelegramUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  username?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  pre_checkout_query?: TelegramPreCheckoutQuery;
  my_chat_member?: TelegramChatMemberUpdated;
};

export type TelegramSuccessfulPayment = {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  telegram_payment_charge_id?: string;
  provider_payment_charge_id?: string;
};

export type TelegramContact = {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
};

export type TelegramLocation = {
  longitude: number;
  latitude: number;
};

export type TelegramMessage = {
  message_id: number;
  text?: string;
  successful_payment?: TelegramSuccessfulPayment;
  contact?: TelegramContact;
  location?: TelegramLocation;
  chat: TelegramChat;
  from?: TelegramUser;
};

export type TelegramChatMemberUpdated = {
  chat: TelegramChat;
  from: TelegramUser;
  date: number;
  old_chat_member?: { status?: string; user?: TelegramUser };
  new_chat_member?: { status?: string; user?: TelegramUser };
};

export type TelegramCallbackQuery = {
  id: string;
  data?: string;
  from: TelegramUser;
  message?: TelegramMessage;
};

export type TelegramPreCheckoutQuery = {
  id: string;
  from: TelegramUser;
  currency: string;
  total_amount: number;
  invoice_payload: string;
};

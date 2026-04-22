// Core domain entities for Vexa platform

export type ID = string;

export interface Workspace {
  id: ID;
  ownerId: ID;
  name: string;
  createdAt: string;
}

export interface TelegramBot {
  id: ID;
  workspaceId: ID;
  telegramBotId: string;
  username: string;
  encryptedToken: string;
  active: boolean;
}

export interface Chat {
  id: ID;
  workspaceId: ID;
  telegramChatId: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
}

export interface AIProfile {
  id: ID;
  workspaceId: ID;
  botId: ID;
  systemPrompt: string;
  model: string;
  tone?: string;
}

export interface Rule {
  id: ID;
  workspaceId: ID;
  botId: ID;
  chatId?: ID;
  triggerType: string;
  triggerConfig: Record<string, any>;
  actionType: string;
  actionConfig: Record<string, any>;
  enabled: boolean;
}

-- Vexa production D1 schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  locale TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS telegram_bots (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_type TEXT NOT NULL,
  telegram_bot_id TEXT NOT NULL,
  bot_username TEXT NOT NULL,
  bot_name TEXT,
  encrypted_token TEXT NOT NULL,
  token_last4 TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS telegram_chats (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  telegram_chat_id INTEGER NOT NULL,
  chat_type TEXT NOT NULL,
  title TEXT,
  username TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id),
  UNIQUE (bot_id, telegram_chat_id)
);

CREATE TABLE IF NOT EXISTS ai_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  tone TEXT,
  language TEXT,
  reply_mode TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id)
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  chat_id TEXT,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_config TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id),
  FOREIGN KEY (chat_id) REFERENCES telegram_chats(id)
);

CREATE TABLE IF NOT EXISTS automations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  chat_id TEXT,
  name TEXT NOT NULL,
  schedule_type TEXT NOT NULL,
  schedule_expression TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_config TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  last_run_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id),
  FOREIGN KEY (chat_id) REFERENCES telegram_chats(id)
);

CREATE TABLE IF NOT EXISTS commands (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  description TEXT,
  command_type TEXT NOT NULL,
  command_config TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id),
  UNIQUE (bot_id, command)
);

CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  name TEXT NOT NULL,
  menu_type TEXT NOT NULL,
  menu_config TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id)
);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metadata TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id)
);

CREATE TABLE IF NOT EXISTS action_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  bot_id TEXT,
  chat_id TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  action_type TEXT NOT NULL,
  input_payload TEXT,
  output_payload TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (bot_id) REFERENCES telegram_bots(id),
  FOREIGN KEY (chat_id) REFERENCES telegram_chats(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT,
  target_type TEXT NOT NULL,
  target_id TEXT,
  change_type TEXT NOT NULL,
  before_data TEXT,
  after_data TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_bots_workspace_id ON telegram_bots(workspace_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_workspace_id ON telegram_chats(workspace_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_bot_id ON telegram_chats(bot_id);
CREATE INDEX IF NOT EXISTS idx_ai_profiles_workspace_id ON ai_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_profiles_bot_id ON ai_profiles(bot_id);
CREATE INDEX IF NOT EXISTS idx_rules_workspace_id ON rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_rules_bot_id ON rules(bot_id);
CREATE INDEX IF NOT EXISTS idx_rules_chat_id ON rules(chat_id);
CREATE INDEX IF NOT EXISTS idx_automations_workspace_id ON automations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_automations_bot_id ON automations(bot_id);
CREATE INDEX IF NOT EXISTS idx_automations_chat_id ON automations(chat_id);
CREATE INDEX IF NOT EXISTS idx_commands_workspace_id ON commands(workspace_id);
CREATE INDEX IF NOT EXISTS idx_commands_bot_id ON commands(bot_id);
CREATE INDEX IF NOT EXISTS idx_menus_workspace_id ON menus(workspace_id);
CREATE INDEX IF NOT EXISTS idx_menus_bot_id ON menus(bot_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_workspace_id ON knowledge_sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_workspace_id ON action_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_bot_id ON action_logs(bot_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON audit_logs(workspace_id);

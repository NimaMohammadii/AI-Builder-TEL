CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_bots (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  telegram_bot_id TEXT NOT NULL,
  username TEXT NOT NULL,
  ai_enabled INTEGER NOT NULL DEFAULT 1,
  ai_prompt TEXT NOT NULL DEFAULT '',
  program_json TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_bots_owner ON customer_bots(owner_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_bots_username ON customer_bots(username);

CREATE TABLE IF NOT EXISTS runtime_sessions (
  bot_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  flow_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  data_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (bot_id, chat_id)
);

CREATE TABLE IF NOT EXISTS builder_sessions (
  chat_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

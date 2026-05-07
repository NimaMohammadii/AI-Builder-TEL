CREATE TABLE IF NOT EXISTS app_users (
  telegram_user_id TEXT PRIMARY KEY,
  first_name TEXT,
  username TEXT,
  current_section TEXT NOT NULL DEFAULT 'home',
  credit INTEGER NOT NULL DEFAULT 1000,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_users_last_seen ON app_users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_app_users_section ON app_users(current_section);

DROP INDEX IF EXISTS idx_bot_users_last_seen;
DROP INDEX IF EXISTS idx_bot_users_section;

CREATE TABLE IF NOT EXISTS bot_users_clean (
  bot_id TEXT NOT NULL,
  telegram_user_id TEXT NOT NULL,
  first_name TEXT,
  username TEXT,
  state_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT,
  current_section TEXT,
  PRIMARY KEY (bot_id, telegram_user_id),
  FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

INSERT INTO bot_users_clean (bot_id, telegram_user_id, first_name, username, state_json, created_at, updated_at, last_seen_at, current_section)
SELECT bot_id, telegram_user_id, first_name, username, state_json, created_at, updated_at, last_seen_at, current_section
FROM bot_users;

DROP TABLE bot_users;
ALTER TABLE bot_users_clean RENAME TO bot_users;

CREATE INDEX IF NOT EXISTS idx_bot_users_last_seen ON bot_users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_bot_users_section ON bot_users(current_section);

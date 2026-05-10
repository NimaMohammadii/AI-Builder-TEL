CREATE TABLE IF NOT EXISTS bot_groups (
  bot_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  chat_type TEXT NOT NULL,
  title TEXT,
  username TEXT,
  first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (bot_id, chat_id),
  FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bot_groups_bot ON bot_groups(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_groups_seen ON bot_groups(last_seen_at);

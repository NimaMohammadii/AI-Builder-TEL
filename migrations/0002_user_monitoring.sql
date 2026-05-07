ALTER TABLE bot_users ADD COLUMN last_seen_at TEXT;
ALTER TABLE bot_users ADD COLUMN current_section TEXT;
ALTER TABLE bot_users ADD COLUMN credit INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bot_users ADD COLUMN is_miniapp INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bot_users_last_seen ON bot_users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_bot_users_section ON bot_users(current_section);

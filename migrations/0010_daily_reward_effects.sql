CREATE TABLE IF NOT EXISTS daily_reward_effects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  claim_id TEXT,
  effect_type TEXT NOT NULL,
  percent INTEGER,
  remaining_count INTEGER,
  remaining_nano INTEGER,
  expires_at TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_reward_effects_user_active
  ON daily_reward_effects(user_id, effect_type, expires_at);

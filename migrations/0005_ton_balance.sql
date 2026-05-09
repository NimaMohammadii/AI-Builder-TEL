ALTER TABLE app_users ADD COLUMN ton_balance_nano INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_app_users_ton_balance ON app_users(ton_balance_nano);

CREATE TABLE IF NOT EXISTS ton_deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount_ton TEXT NOT NULL,
  amount_nano TEXT NOT NULL,
  ton_balance_nano INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_hash TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ton_deposits_user ON ton_deposits(user_id, created_at);

CREATE TABLE IF NOT EXISTS stars_deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stars_amount INTEGER NOT NULL,
  amount_nano INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  telegram_payment_charge_id TEXT UNIQUE,
  provider_payment_charge_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stars_deposits_user ON stars_deposits(user_id, created_at);

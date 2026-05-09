ALTER TABLE app_users ADD COLUMN ton_balance_nano INTEGER NOT NULL DEFAULT 0;

ALTER TABLE ton_deposits ADD COLUMN ton_balance_nano INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_app_users_ton_balance ON app_users(ton_balance_nano);

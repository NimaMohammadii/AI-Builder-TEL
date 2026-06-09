CREATE TABLE IF NOT EXISTS referrals (
  invited_user_id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_nano INTEGER NOT NULL DEFAULT 100000000,
  deposit_reference_type TEXT,
  deposit_reference_id TEXT,
  rewarded_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

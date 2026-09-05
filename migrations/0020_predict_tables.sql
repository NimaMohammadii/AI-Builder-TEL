CREATE TABLE IF NOT EXISTS predict_rounds (
  id TEXT PRIMARY KEY,
  market TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  start_price REAL NOT NULL,
  end_price REAL,
  status TEXT NOT NULL DEFAULT 'open',
  result TEXT,
  settled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predict_rounds_market_end
  ON predict_rounds(market, ends_at);

CREATE TABLE IF NOT EXISTS predict_bets (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL,
  market TEXT NOT NULL,
  user_id TEXT NOT NULL,
  side TEXT NOT NULL,
  stake_nano INTEGER NOT NULL,
  ton_usd_snapshot REAL NOT NULL DEFAULT 0,
  stake_usd_snapshot REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  payout_nano INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predict_bets_round
  ON predict_bets(round_id);

CREATE INDEX IF NOT EXISTS idx_predict_bets_user_round
  ON predict_bets(user_id, round_id);

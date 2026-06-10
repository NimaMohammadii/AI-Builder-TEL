CREATE TABLE IF NOT EXISTS football_matches (
  id TEXT PRIMARY KEY,
  team_a_id TEXT NOT NULL,
  team_b_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  result TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settled_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_football_matches_status_start ON football_matches(status, starts_at);
CREATE INDEX IF NOT EXISTS idx_football_matches_featured_start ON football_matches(featured, starts_at);
CREATE TABLE IF NOT EXISTS football_bets (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  pick TEXT NOT NULL,
  stake_nano INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payout_nano INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settled_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_football_bets_one_active_user_match ON football_bets(match_id, user_id) WHERE status != 'failed';
CREATE INDEX IF NOT EXISTS idx_football_bets_match ON football_bets(match_id);
CREATE INDEX IF NOT EXISTS idx_football_bets_user_match ON football_bets(user_id, match_id);

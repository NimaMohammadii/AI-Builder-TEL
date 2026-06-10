CREATE TABLE IF NOT EXISTS football_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  custom INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS football_live_questions (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  result TEXT,
  starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settled_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_football_live_questions_match_status ON football_live_questions(match_id, status, expires_at);
CREATE TABLE IF NOT EXISTS football_live_question_bets (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  pick TEXT NOT NULL,
  stake_nano INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payout_nano INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settled_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_football_live_question_bets_one_user ON football_live_question_bets(question_id, user_id) WHERE status != 'failed';
CREATE INDEX IF NOT EXISTS idx_football_live_question_bets_question ON football_live_question_bets(question_id);

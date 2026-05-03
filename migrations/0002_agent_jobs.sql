CREATE TABLE IF NOT EXISTS agent_jobs (
  id TEXT PRIMARY KEY,
  owner_telegram_id TEXT NOT NULL,
  bot_id TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  mode TEXT NOT NULL DEFAULT 'feature_build',
  user_request TEXT NOT NULL,
  plan_json TEXT NOT NULL DEFAULT '{}',
  branch_name TEXT,
  result_json TEXT NOT NULL DEFAULT '{}',
  logs_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_jobs_owner ON agent_jobs(owner_telegram_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON agent_jobs(status);

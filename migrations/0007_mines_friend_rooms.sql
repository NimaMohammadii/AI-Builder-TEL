CREATE TABLE IF NOT EXISTS mines_friend_rooms (
  id TEXT PRIMARY KEY,
  host_user_id TEXT NOT NULL,
  host_name TEXT,
  guest_user_id TEXT,
  guest_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_turn_user_id TEXT,
  hidden_cells_json TEXT NOT NULL DEFAULT '[]',
  revealed_cells_json TEXT NOT NULL DEFAULT '[]',
  mine_count INTEGER NOT NULL DEFAULT 3,
  board_size INTEGER NOT NULL DEFAULT 25,
  round_index INTEGER NOT NULL DEFAULT 1,
  finished_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mines_friend_rooms_host ON mines_friend_rooms(host_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mines_friend_rooms_guest ON mines_friend_rooms(guest_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mines_friend_rooms_expires ON mines_friend_rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_mines_friend_rooms_status ON mines_friend_rooms(status, updated_at);

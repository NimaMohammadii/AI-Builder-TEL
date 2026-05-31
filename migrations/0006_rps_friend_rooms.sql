CREATE TABLE IF NOT EXISTS rps_friend_rooms (
  id TEXT PRIMARY KEY,
  host_user_id TEXT NOT NULL,
  host_name TEXT,
  guest_user_id TEXT,
  guest_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rps_friend_rooms_host ON rps_friend_rooms(host_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rps_friend_rooms_guest ON rps_friend_rooms(guest_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rps_friend_rooms_expires ON rps_friend_rooms(expires_at);

CREATE TABLE IF NOT EXISTS rps_friend_rounds (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  round_index INTEGER NOT NULL DEFAULT 1,
  host_choice TEXT,
  guest_choice TEXT,
  winner_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (room_id) REFERENCES rps_friend_rooms(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rps_friend_rounds_room_round ON rps_friend_rounds(room_id, round_index);
CREATE INDEX IF NOT EXISTS idx_rps_friend_rounds_room_status ON rps_friend_rounds(room_id, status);

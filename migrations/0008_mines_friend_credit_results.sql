ALTER TABLE mines_friend_rooms ADD COLUMN amount_nano INTEGER NOT NULL DEFAULT 10000000;
ALTER TABLE mines_friend_rooms ADD COLUMN winner_user_id TEXT;
ALTER TABLE mines_friend_rooms ADD COLUMN credit_settled_at TEXT;

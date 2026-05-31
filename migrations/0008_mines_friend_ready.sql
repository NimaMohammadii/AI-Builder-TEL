ALTER TABLE mines_friend_rooms ADD COLUMN host_ready INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mines_friend_rooms ADD COLUMN guest_ready INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mines_friend_rooms ADD COLUMN host_has_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mines_friend_rooms ADD COLUMN guest_has_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mines_friend_rooms ADD COLUMN amount_nano INTEGER NOT NULL DEFAULT 10000000;

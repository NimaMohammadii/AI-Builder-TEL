DROP TABLE IF EXISTS rps_friend_rounds;
DROP TABLE IF EXISTS rps_friend_rooms;
DROP TABLE IF EXISTS rps_rounds;

UPDATE app_users
SET current_section = 'playzone', updated_at = CURRENT_TIMESTAMP
WHERE current_section = 'rps';

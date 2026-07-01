ALTER TABLE app_users ADD COLUMN region_code TEXT;
ALTER TABLE app_users ADD COLUMN language_code TEXT;
CREATE INDEX IF NOT EXISTS idx_app_users_region ON app_users(region_code, last_seen_at);

-- Remove the discontinued AI bot-builder schema.
-- Game, user, payment, wallet, prediction and admin tables are intentionally preserved.

DROP TABLE IF EXISTS agent_jobs;
DROP TABLE IF EXISTS ai_usage;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS bot_users;
DROP TABLE IF EXISTS bots;

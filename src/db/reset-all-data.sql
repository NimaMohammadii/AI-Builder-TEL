-- Full application data reset for AI-Builder-TEL / Vexa
-- This keeps the schema and deletes all old application data.
-- Run only when you intentionally want a clean start.

DELETE FROM action_logs;
DELETE FROM audit_logs;
DELETE FROM bot_runtime_code;
DELETE FROM bot_builder_actions;
DELETE FROM builder_sessions;
DELETE FROM ai_prompt_sessions;
DELETE FROM knowledge_sources;
DELETE FROM menus;
DELETE FROM commands;
DELETE FROM automations;
DELETE FROM rules;
DELETE FROM ai_profiles;
DELETE FROM telegram_chats;
DELETE FROM telegram_bots;
DELETE FROM workspace_members;
DELETE FROM workspaces;
DELETE FROM users;

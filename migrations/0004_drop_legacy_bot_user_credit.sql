-- Credit is owned by app_users.credit only. Remove the unused legacy bot_users credit column
-- so old bot-user rows cannot be mistaken for the current miniapp balance.
ALTER TABLE bot_users DROP COLUMN credit;

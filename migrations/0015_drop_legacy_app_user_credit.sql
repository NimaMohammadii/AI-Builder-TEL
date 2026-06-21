-- TON balance is owned by app_users.ton_balance_nano only.
-- Drop the legacy miniapp credit column so stale point balances cannot be
-- mistaken for the current user TON balance.
ALTER TABLE app_users DROP COLUMN credit;

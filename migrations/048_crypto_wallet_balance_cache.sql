-- 048: Add cached balance columns to crypto_wallets
-- LDGR writes balances after fetching from blockchain APIs.
-- N-SIT reads cached values instead of re-fetching, avoiding duplicate API calls.

ALTER TABLE crypto_wallets ADD COLUMN IF NOT EXISTS cached_balance text;
ALTER TABLE crypto_wallets ADD COLUMN IF NOT EXISTS cached_usd_value numeric;
ALTER TABLE crypto_wallets ADD COLUMN IF NOT EXISTS balance_updated_at timestamptz;

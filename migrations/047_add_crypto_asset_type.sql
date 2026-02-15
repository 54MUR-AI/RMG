-- 047: Add 'crypto' to ldgr_assets asset_type check constraint
-- Allows manual crypto positions (ticker + quantity) without a wallet address.
-- Crypto wallets with addresses remain in crypto_wallets table.

ALTER TABLE ldgr_assets DROP CONSTRAINT IF EXISTS ldgr_assets_asset_type_check;

ALTER TABLE ldgr_assets ADD CONSTRAINT ldgr_assets_asset_type_check
  CHECK (asset_type IN (
    'stock', 'etf', 'mutf',
    'gold', 'silver', 'platinum', 'palladium', 'metal_other',
    'commodity',
    'crypto',
    'tokenized'
  ));

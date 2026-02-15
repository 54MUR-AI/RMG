-- 049: Migrate nsit_portfolio holdings into ldgr_assets
-- After this migration, N-SIT reads/writes ldgr_assets exclusively.
-- nsit_portfolio table is kept but no longer written to.

-- Copy stock holdings (skip duplicates by symbol+user)
INSERT INTO ldgr_assets (user_id, asset_name, asset_type, symbol, quantity, cost_basis, notes, created_at, updated_at)
SELECT
  np.user_id,
  np.symbol,                          -- use symbol as asset_name
  'stock',                            -- map 'stock' → 'stock'
  np.symbol,
  np.quantity,
  np.cost_basis,
  np.notes,
  np.created_at,
  np.updated_at
FROM nsit_portfolio np
WHERE np.asset_type = 'stock'
  AND NOT EXISTS (
    SELECT 1 FROM ldgr_assets la
    WHERE la.user_id = np.user_id
      AND la.symbol = np.symbol
      AND la.asset_type = 'stock'
  );

-- Copy crypto_manual holdings → ldgr_assets as 'crypto'
INSERT INTO ldgr_assets (user_id, asset_name, asset_type, symbol, quantity, cost_basis, notes, created_at, updated_at)
SELECT
  np.user_id,
  np.symbol,                          -- use symbol as asset_name
  'crypto',                           -- map 'crypto_manual' → 'crypto'
  np.symbol,
  np.quantity,
  np.cost_basis,
  np.notes,
  np.created_at,
  np.updated_at
FROM nsit_portfolio np
WHERE np.asset_type = 'crypto_manual'
  AND NOT EXISTS (
    SELECT 1 FROM ldgr_assets la
    WHERE la.user_id = np.user_id
      AND la.symbol = np.symbol
      AND la.asset_type = 'crypto'
  );

-- NOTE: nsit_portfolio table is NOT dropped — kept for rollback safety.
-- It can be dropped in a future migration after confirming everything works.

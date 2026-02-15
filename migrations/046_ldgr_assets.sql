-- 046: LDGR Assets table
-- Stores non-crypto assets: stocks, ETFs, mutual funds, metals, commodities,
-- and future tokenized physical assets (graded cards, coins, etc.)
-- Crypto wallets remain in the existing crypto_wallets table.

CREATE TABLE IF NOT EXISTS ldgr_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_name text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN (
    'stock', 'etf', 'mutf',           -- equities
    'gold', 'silver', 'platinum', 'palladium', 'metal_other',  -- metals
    'commodity',                        -- other commodities
    'tokenized'                         -- future: physical assets on-chain
  )),
  -- For stocks/ETFs/MUTF: ticker symbol (e.g., AAPL, VOO, VTSAX)
  symbol text,
  -- Quantity: shares for stocks, troy oz for metals, units for tokenized
  quantity numeric NOT NULL CHECK (quantity > 0),
  -- Cost basis per unit in USD
  cost_basis numeric NOT NULL CHECK (cost_basis >= 0),
  -- For metals: weight unit (oz, g, kg)
  weight_unit text CHECK (weight_unit IN ('oz', 'g', 'kg') OR weight_unit IS NULL),
  -- For tokenized assets: metadata
  token_id text,           -- on-chain token ID
  token_metadata jsonb,    -- grading info, images, serial numbers, etc.
  -- General
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_ldgr_assets_user_id ON ldgr_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_ldgr_assets_type ON ldgr_assets(user_id, asset_type);

-- Enable RLS
ALTER TABLE ldgr_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ldgr_assets_select" ON ldgr_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ldgr_assets_insert" ON ldgr_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ldgr_assets_update" ON ldgr_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ldgr_assets_delete" ON ldgr_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ldgr_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ldgr_assets_updated_at
  BEFORE UPDATE ON ldgr_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_ldgr_assets_updated_at();

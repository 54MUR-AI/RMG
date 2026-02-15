-- 045: N-SIT Portfolio table
-- Stores stock and manual crypto holdings for the unified portfolio widget.
-- Crypto wallet balances are read live from the existing crypto_wallets table.

CREATE TABLE IF NOT EXISTS nsit_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  cost_basis numeric NOT NULL CHECK (cost_basis >= 0),
  asset_type text NOT NULL DEFAULT 'stock' CHECK (asset_type IN ('stock', 'crypto_manual')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol, asset_type)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_nsit_portfolio_user_id ON nsit_portfolio(user_id);

-- Enable RLS
ALTER TABLE nsit_portfolio ENABLE ROW LEVEL SECURITY;

-- Users can only see their own holdings
CREATE POLICY "nsit_portfolio_select" ON nsit_portfolio
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "nsit_portfolio_insert" ON nsit_portfolio
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nsit_portfolio_update" ON nsit_portfolio
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "nsit_portfolio_delete" ON nsit_portfolio
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_nsit_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nsit_portfolio_updated_at
  BEFORE UPDATE ON nsit_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_nsit_portfolio_updated_at();

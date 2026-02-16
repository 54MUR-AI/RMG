-- 051: Drop deprecated nsit_portfolio table
-- All data has been migrated to ldgr_assets (migration 049).
-- N-SIT no longer reads/writes nsit_portfolio.

-- Drop the trigger first
DROP TRIGGER IF EXISTS nsit_portfolio_updated_at ON public.nsit_portfolio;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.update_nsit_portfolio_updated_at();

-- Drop the table (cascades policies and indexes)
DROP TABLE IF EXISTS public.nsit_portfolio;

-- 050: Database security & performance fixes
-- Fixes all Supabase linter warnings:
--   1. function_search_path_mutable — set search_path = '' on 4 functions
--   2. auth_rls_initplan — wrap auth.uid() in (select ...) for all affected RLS policies
--   3. multiple_permissive_policies — merge duplicate SELECT/UPDATE policies
--
-- Run this in Supabase SQL Editor.

-- ============================================================
-- PART 1: Fix function search_path (SECURITY)
-- ============================================================

-- 1a. get_channel_unread_counts — set immutable search_path
-- We ALTER the existing function to add search_path without changing its body.
ALTER FUNCTION public.get_channel_unread_counts SET search_path = '';

-- 1b. mark_channel_read
ALTER FUNCTION public.mark_channel_read SET search_path = '';

-- 1c. update_nsit_portfolio_updated_at
CREATE OR REPLACE FUNCTION public.update_nsit_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 1d. update_ldgr_assets_updated_at
CREATE OR REPLACE FUNCTION public.update_ldgr_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- ============================================================
-- PART 2: Fix auth_rls_initplan (PERFORMANCE)
-- Wrap auth.uid() in (select auth.uid()) so it evaluates once per query, not per row.
-- ============================================================

-- 2a. nsit_portfolio — drop and recreate all 4 policies
DROP POLICY IF EXISTS "nsit_portfolio_select" ON public.nsit_portfolio;
DROP POLICY IF EXISTS "nsit_portfolio_insert" ON public.nsit_portfolio;
DROP POLICY IF EXISTS "nsit_portfolio_update" ON public.nsit_portfolio;
DROP POLICY IF EXISTS "nsit_portfolio_delete" ON public.nsit_portfolio;

CREATE POLICY "nsit_portfolio_select" ON public.nsit_portfolio
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "nsit_portfolio_insert" ON public.nsit_portfolio
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "nsit_portfolio_update" ON public.nsit_portfolio
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "nsit_portfolio_delete" ON public.nsit_portfolio
  FOR DELETE USING (user_id = (select auth.uid()));

-- 2b. ldgr_assets — drop and recreate all 4 policies
DROP POLICY IF EXISTS "ldgr_assets_select" ON public.ldgr_assets;
DROP POLICY IF EXISTS "ldgr_assets_insert" ON public.ldgr_assets;
DROP POLICY IF EXISTS "ldgr_assets_update" ON public.ldgr_assets;
DROP POLICY IF EXISTS "ldgr_assets_delete" ON public.ldgr_assets;

CREATE POLICY "ldgr_assets_select" ON public.ldgr_assets
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "ldgr_assets_insert" ON public.ldgr_assets
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "ldgr_assets_update" ON public.ldgr_assets
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "ldgr_assets_delete" ON public.ldgr_assets
  FOR DELETE USING (user_id = (select auth.uid()));

-- 2c. nsit_ai_cache — fix the user policy
DROP POLICY IF EXISTS "nsit_ai_cache_user_policy" ON public.nsit_ai_cache;

CREATE POLICY "nsit_ai_cache_user_policy" ON public.nsit_ai_cache
  FOR ALL USING (user_id = (select auth.uid()));

-- 2d. wspr_channel_read_positions — fix all 3 policies
DROP POLICY IF EXISTS "Users can view own read positions" ON public.wspr_channel_read_positions;
DROP POLICY IF EXISTS "Users can insert own read positions" ON public.wspr_channel_read_positions;
DROP POLICY IF EXISTS "Users can update own read positions" ON public.wspr_channel_read_positions;

CREATE POLICY "Users can view own read positions" ON public.wspr_channel_read_positions
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own read positions" ON public.wspr_channel_read_positions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own read positions" ON public.wspr_channel_read_positions
  FOR UPDATE USING (user_id = (select auth.uid()));

-- 2e. wspr_dm_reactions — fix all 3 affected policies
DROP POLICY IF EXISTS "Users can view DM reactions" ON public.wspr_dm_reactions;
DROP POLICY IF EXISTS "Users can add DM reactions" ON public.wspr_dm_reactions;
DROP POLICY IF EXISTS "Users can remove their DM reactions" ON public.wspr_dm_reactions;

CREATE POLICY "Users can view DM reactions" ON public.wspr_dm_reactions
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can add DM reactions" ON public.wspr_dm_reactions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can remove their DM reactions" ON public.wspr_dm_reactions
  FOR DELETE USING (user_id = (select auth.uid()));

-- 2f. wspr_direct_messages — fix "Users can update their DMs"
-- This policy was created after migration 041 and uses bare auth.uid()
DROP POLICY IF EXISTS "Users can update their DMs" ON public.wspr_direct_messages;

CREATE POLICY "Users can update their DMs" ON public.wspr_direct_messages
  FOR UPDATE USING (
    sender_id = (select auth.uid()) OR recipient_id = (select auth.uid())
  );

-- 2g. user_bans — fix all 4 policies that use auth.uid()
DROP POLICY IF EXISTS "Admins can view all bans" ON public.user_bans;
DROP POLICY IF EXISTS "Admins can insert bans" ON public.user_bans;
DROP POLICY IF EXISTS "Admins can delete bans" ON public.user_bans;
DROP POLICY IF EXISTS "Users can check own ban status" ON public.user_bans;

CREATE POLICY "Admins can view all bans" ON public.user_bans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert bans" ON public.user_bans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete bans" ON public.user_bans
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.is_admin = true
    )
  );

-- ============================================================
-- PART 3: Fix multiple_permissive_policies (PERFORMANCE)
-- Merge duplicate SELECT/UPDATE policies into single policies.
-- ============================================================

-- 3a. user_bans: merge "Admins can view all bans" + "Users can check own ban status"
-- into a single SELECT policy. (We already recreated the admin one above, so just
-- create the merged version and drop the admin-only one.)
DROP POLICY IF EXISTS "Admins can view all bans" ON public.user_bans;

CREATE POLICY "user_bans_select" ON public.user_bans
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.is_admin = true
    )
  );

-- 3b. folder_access: merge "folder_access_select" + "folder_access_manage"
-- folder_access_manage is FOR ALL which covers SELECT too, causing the overlap.
-- Drop the separate SELECT policy — the FOR ALL policy handles it.
DROP POLICY IF EXISTS "folder_access_select" ON public.folder_access;

-- 3c. wspr_direct_messages: merge duplicate UPDATE policies
-- "Users can update their DMs" (just created above) + "dms_update" (from migration 041)
-- Drop the older one, keep the one we just created.
DROP POLICY IF EXISTS "dms_update" ON public.wspr_direct_messages;

-- ============================================================
-- DONE. Leaked password protection must be enabled manually:
-- Supabase Dashboard → Authentication → Settings → Password Security
-- → Enable "Leaked Password Protection"
-- ============================================================

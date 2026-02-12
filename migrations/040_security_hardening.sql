-- Migration 040: Security hardening
-- Fixes function_search_path_mutable and rls_policy_always_true warnings

-- ============================================================
-- PART 1: Fix mutable search_path on all public functions
-- Uses a DO block to safely set search_path on each function,
-- skipping any that don't exist or have different signatures.
-- ============================================================

DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid, n.nspname, p.proname,
           pg_catalog.pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'update_passwords_updated_at',
        'update_crypto_wallets_updated_at',
        'is_admin',
        'is_moderator',
        'get_dm_conversations',
        'create_wspr_profile',
        'ensure_drops_folder',
        'get_shared_files',
        'update_rmg_contacts_timestamp',
        'get_user_contacts',
        'get_pending_contact_requests',
        'search_users_for_contacts',
        'update_updated_at_column',
        'update_thread_reply_count',
        'assign_user_id_number',
        'update_api_keys_updated_at'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public',
      fn.nspname, fn.proname, fn.args
    );
    RAISE NOTICE 'Set search_path on %.%(%)', fn.nspname, fn.proname, fn.args;
  END LOOP;
END
$$;

-- ============================================================
-- PART 2: Tighten overly permissive RLS policies
-- ============================================================

-- 2a. folder_access: replace "Users can manage folder access" (ALL with true/true)
--     Allow users to see their own access, and folder/workspace owners to manage
DROP POLICY IF EXISTS "Users can manage folder access" ON folder_access;
CREATE POLICY "Users can manage folder access"
  ON folder_access FOR ALL TO authenticated
  USING (
    auth.uid() = user_id
    OR folder_id IN (SELECT id FROM folders WHERE user_id = auth.uid())
    OR folder_id IN (SELECT ldgr_folder_id FROM wspr_workspaces WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR folder_id IN (SELECT id FROM folders WHERE user_id = auth.uid())
    OR folder_id IN (SELECT ldgr_folder_id FROM wspr_workspaces WHERE owner_id = auth.uid())
  );

-- 2b. wspr_channel_members: replace open INSERT with auth check
DROP POLICY IF EXISTS "channel_members_insert" ON wspr_channel_members;
CREATE POLICY "channel_members_insert" ON wspr_channel_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2c. wspr_channels: tighten INSERT to workspace members only
DROP POLICY IF EXISTS "channels_insert" ON wspr_channels;
CREATE POLICY "channels_insert" ON wspr_channels
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = auth.uid()
    )
  );

-- 2d. wspr_channels: tighten UPDATE to creator or workspace owner/admin
DROP POLICY IF EXISTS "channels_update" ON wspr_channels;
CREATE POLICY "channels_update" ON wspr_channels
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- 2e. wspr_channels: tighten DELETE to creator or workspace owner/admin
DROP POLICY IF EXISTS "channels_delete" ON wspr_channels;
CREATE POLICY "channels_delete" ON wspr_channels
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- 2f. display_name_history: tighten INSERT to own records
DROP POLICY IF EXISTS "System can insert display name history" ON display_name_history;
CREATE POLICY "Users can insert own display name history" ON display_name_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2g. forum_posts: tighten INSERT to authenticated users inserting own posts
DROP POLICY IF EXISTS "posts_insert" ON forum_posts;
CREATE POLICY "posts_insert" ON forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- 2h. forum_threads: tighten INSERT to authenticated users inserting own threads
DROP POLICY IF EXISTS "threads_insert" ON forum_threads;
CREATE POLICY "threads_insert" ON forum_threads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

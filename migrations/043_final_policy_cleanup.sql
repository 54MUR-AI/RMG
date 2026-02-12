-- Migration 043: Final policy cleanup
-- Drops ALL policies on every affected table using pg_policies catalog,
-- then recreates exactly one policy per action with (select auth.uid()).
-- Also adds missing foreign key indexes and fixes wspr_dm_attachments.

-- ============================================================
-- STEP 1: Nuclear drop — remove every policy on affected tables
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'files', 'folders', 'folder_access',
        'forum_threads', 'forum_posts', 'forum_categories', 'forum_votes',
        'user_roles', 'api_keys', 'passwords', 'crypto_wallets',
        'wspr_profiles', 'wspr_channels', 'wspr_channel_members',
        'wspr_messages', 'wspr_reactions', 'wspr_workspaces',
        'wspr_workspace_members', 'wspr_contacts', 'wspr_direct_messages',
        'wspr_file_shares', 'wspr_attachments', 'wspr_dm_attachments',
        'rmg_contacts', 'display_name_history'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- STEP 2: Recreate all policies with (select auth.uid())
-- ============================================================

-- files
CREATE POLICY "files_select" ON files FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR folder_id IN (SELECT folder_id FROM folder_access WHERE user_id = (select auth.uid()))
  );
CREATE POLICY "files_insert" ON files FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    OR folder_id IN (
      SELECT folder_id FROM folder_access
      WHERE user_id = (select auth.uid())
      AND access_level IN ('write', 'admin')
    )
  );
CREATE POLICY "files_update" ON files FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "files_delete" ON files FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- folders
CREATE POLICY "folders_select" ON folders FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "folders_insert" ON folders FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "folders_update" ON folders FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "folders_delete" ON folders FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- folder_access
CREATE POLICY "folder_access_select" ON folder_access FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "folder_access_manage" ON folder_access FOR ALL TO authenticated
  USING (
    user_id = (select auth.uid())
    OR folder_id IN (SELECT id FROM folders WHERE user_id = (select auth.uid()))
    OR folder_id IN (SELECT ldgr_folder_id FROM wspr_workspaces WHERE owner_id = (select auth.uid()))
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR folder_id IN (SELECT id FROM folders WHERE user_id = (select auth.uid()))
    OR folder_id IN (SELECT ldgr_folder_id FROM wspr_workspaces WHERE owner_id = (select auth.uid()))
  );

-- forum_threads
CREATE POLICY "threads_select" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "threads_insert" ON forum_threads FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);
CREATE POLICY "threads_update" ON forum_threads FOR UPDATE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));
CREATE POLICY "threads_delete" ON forum_threads FOR DELETE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));

-- forum_posts
CREATE POLICY "posts_select" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON forum_posts FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);
CREATE POLICY "posts_update" ON forum_posts FOR UPDATE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));
CREATE POLICY "posts_delete" ON forum_posts FOR DELETE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));

-- forum_categories
CREATE POLICY "categories_select" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON forum_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));
CREATE POLICY "categories_update" ON forum_categories FOR UPDATE TO authenticated
  USING (public.is_admin((select auth.uid())));
CREATE POLICY "categories_delete" ON forum_categories FOR DELETE TO authenticated
  USING (public.is_admin((select auth.uid())));

-- forum_votes
CREATE POLICY "votes_select" ON forum_votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON forum_votes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "votes_update" ON forum_votes FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);
CREATE POLICY "votes_delete" ON forum_votes FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- user_roles
CREATE POLICY "roles_select" ON user_roles FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "roles_insert" ON user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));
CREATE POLICY "roles_update" ON user_roles FOR UPDATE TO authenticated
  USING (public.is_admin((select auth.uid())));
CREATE POLICY "roles_delete" ON user_roles FOR DELETE TO authenticated
  USING (public.is_admin((select auth.uid())));

-- api_keys
CREATE POLICY "api_keys_select" ON api_keys FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "api_keys_insert" ON api_keys FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "api_keys_update" ON api_keys FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "api_keys_delete" ON api_keys FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- passwords
CREATE POLICY "passwords_select" ON passwords FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "passwords_insert" ON passwords FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "passwords_update" ON passwords FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "passwords_delete" ON passwords FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- crypto_wallets
CREATE POLICY "wallets_select" ON crypto_wallets FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "wallets_insert" ON crypto_wallets FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "wallets_update" ON crypto_wallets FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "wallets_delete" ON crypto_wallets FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- wspr_profiles
CREATE POLICY "profiles_select" ON wspr_profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON wspr_profiles FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "profiles_update" ON wspr_profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id);

-- wspr_channels
CREATE POLICY "channels_select" ON wspr_channels FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "channels_insert" ON wspr_channels FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = (select auth.uid())
    )
  );
CREATE POLICY "channels_update" ON wspr_channels FOR UPDATE TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );
CREATE POLICY "channels_delete" ON wspr_channels FOR DELETE TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- wspr_channel_members
CREATE POLICY "channel_members_select" ON wspr_channel_members FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "channel_members_insert" ON wspr_channel_members FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- wspr_messages
CREATE POLICY "messages_select" ON wspr_messages FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "messages_insert" ON wspr_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "messages_update" ON wspr_messages FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "messages_delete" ON wspr_messages FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_moderator((select auth.uid())));

-- wspr_reactions
CREATE POLICY "reactions_select" ON wspr_reactions FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "reactions_insert" ON wspr_reactions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "reactions_delete" ON wspr_reactions FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- wspr_workspaces
CREATE POLICY "workspaces_select" ON wspr_workspaces FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "workspaces_insert" ON wspr_workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));
CREATE POLICY "workspaces_update" ON wspr_workspaces FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()));
CREATE POLICY "workspaces_delete" ON wspr_workspaces FOR DELETE TO authenticated
  USING (owner_id = (select auth.uid()));

-- wspr_workspace_members
CREATE POLICY "workspace_members_select" ON wspr_workspace_members FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "workspace_members_insert" ON wspr_workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "workspace_members_update" ON wspr_workspace_members FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "workspace_members_delete" ON wspr_workspace_members FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- wspr_contacts
CREATE POLICY "contacts_select" ON wspr_contacts FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR contact_id = (select auth.uid()));
CREATE POLICY "contacts_insert" ON wspr_contacts FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "contacts_update" ON wspr_contacts FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR contact_id = (select auth.uid()));
CREATE POLICY "contacts_delete" ON wspr_contacts FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- wspr_direct_messages
CREATE POLICY "dms_select" ON wspr_direct_messages FOR SELECT TO authenticated
  USING (sender_id = (select auth.uid()) OR recipient_id = (select auth.uid()));
CREATE POLICY "dms_insert" ON wspr_direct_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));
CREATE POLICY "dms_update" ON wspr_direct_messages FOR UPDATE TO authenticated
  USING (sender_id = (select auth.uid()) OR recipient_id = (select auth.uid()));
CREATE POLICY "dms_delete" ON wspr_direct_messages FOR DELETE TO authenticated
  USING (sender_id = (select auth.uid()));

-- wspr_file_shares
CREATE POLICY "file_shares_select" ON wspr_file_shares FOR SELECT TO authenticated
  USING (shared_by_user_id = (select auth.uid()) OR shared_with_user_id = (select auth.uid()));
CREATE POLICY "file_shares_insert" ON wspr_file_shares FOR INSERT TO authenticated
  WITH CHECK (shared_by_user_id = (select auth.uid()));
CREATE POLICY "file_shares_delete" ON wspr_file_shares FOR DELETE TO authenticated
  USING (shared_by_user_id = (select auth.uid()));

-- wspr_attachments
CREATE POLICY "attachments_select" ON wspr_attachments FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "attachments_insert" ON wspr_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));
CREATE POLICY "attachments_delete" ON wspr_attachments FOR DELETE TO authenticated
  USING (uploaded_by = (select auth.uid()));

-- wspr_dm_attachments (missed in earlier migrations)
CREATE POLICY "dm_attachments_select" ON wspr_dm_attachments FOR SELECT TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR dm_message_id IN (
      SELECT id FROM wspr_direct_messages
      WHERE sender_id = (select auth.uid()) OR recipient_id = (select auth.uid())
    )
  );
CREATE POLICY "dm_attachments_insert" ON wspr_dm_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));
CREATE POLICY "dm_attachments_delete" ON wspr_dm_attachments FOR DELETE TO authenticated
  USING (uploaded_by = (select auth.uid()));

-- rmg_contacts
CREATE POLICY "rmg_contacts_select" ON rmg_contacts FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR contact_id = (select auth.uid()));
CREATE POLICY "rmg_contacts_insert" ON rmg_contacts FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "rmg_contacts_update" ON rmg_contacts FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR contact_id = (select auth.uid()));
CREATE POLICY "rmg_contacts_delete" ON rmg_contacts FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- display_name_history
CREATE POLICY "dnh_select" ON display_name_history FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "dnh_insert" ON display_name_history FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- STEP 3: Add missing foreign key indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_folder_access_granted_by ON folder_access(granted_by);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_wspr_channel_members_user_id ON wspr_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wspr_channels_created_by ON wspr_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_wspr_channels_workspace_id ON wspr_channels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_wspr_contacts_contact_id ON wspr_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_wspr_dm_attachments_ldgr_file_id ON wspr_dm_attachments(ldgr_file_id);
CREATE INDEX IF NOT EXISTS idx_wspr_dm_attachments_uploaded_by ON wspr_dm_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_wspr_file_shares_shared_by ON wspr_file_shares(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_wspr_messages_user_id ON wspr_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_wspr_profiles_drops_folder ON wspr_profiles(drops_folder_id);
CREATE INDEX IF NOT EXISTS idx_wspr_reactions_user_id ON wspr_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wspr_workspaces_owner_id ON wspr_workspaces(owner_id);

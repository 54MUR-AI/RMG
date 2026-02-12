-- Migration 041: Performance hardening
-- Fixes: auth_rls_initplan, multiple_permissive_policies, duplicate_index
--
-- Strategy:
--   1. Drop ALL existing policies on affected tables
--   2. Recreate single consolidated policies using (select auth.uid()) pattern
--   3. Drop duplicate indexes

-- ============================================================
-- PART 1: files table — consolidate + initplan fix
-- ============================================================
DO $$ BEGIN
  -- Drop all existing policies on files
  DROP POLICY IF EXISTS "Users can view files" ON files;
  DROP POLICY IF EXISTS "Users can view own files" ON files;
  DROP POLICY IF EXISTS "Users can view their files or files in shared folders" ON files;
  DROP POLICY IF EXISTS "Users can insert own files" ON files;
  DROP POLICY IF EXISTS "Users can insert files into shared folders" ON files;
  DROP POLICY IF EXISTS "Users can upload files" ON files;
  DROP POLICY IF EXISTS "Users can update files" ON files;
  DROP POLICY IF EXISTS "Users can update own files" ON files;
  DROP POLICY IF EXISTS "Users can delete files" ON files;
  DROP POLICY IF EXISTS "Users can delete own files" ON files;
END $$;

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

-- ============================================================
-- PART 2: folders table — consolidate + initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view folders" ON folders;
  DROP POLICY IF EXISTS "Users can view own folders" ON folders;
  DROP POLICY IF EXISTS "Users can create folders" ON folders;
  DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
  DROP POLICY IF EXISTS "Users can update folders" ON folders;
  DROP POLICY IF EXISTS "Users can update own folders" ON folders;
  DROP POLICY IF EXISTS "Users can delete folders" ON folders;
  DROP POLICY IF EXISTS "Users can delete own folders" ON folders;
END $$;

CREATE POLICY "folders_select" ON folders FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "folders_insert" ON folders FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "folders_update" ON folders FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "folders_delete" ON folders FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- PART 3: folder_access — consolidate + initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their folder access" ON folder_access;
  DROP POLICY IF EXISTS "Users can manage folder access" ON folder_access;
  DROP POLICY IF EXISTS "Authenticated users can manage folder access" ON folder_access;
  DROP POLICY IF EXISTS "Folder owners can manage access" ON folder_access;
  DROP POLICY IF EXISTS "Workspace owners can manage folder access" ON folder_access;
END $$;

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

-- ============================================================
-- PART 4: forum_votes — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can create votes" ON forum_votes;
  DROP POLICY IF EXISTS "Users can delete their own votes" ON forum_votes;
  DROP POLICY IF EXISTS "Users can update their own votes" ON forum_votes;
  DROP POLICY IF EXISTS "Anyone can view votes" ON forum_votes;
END $$;

CREATE POLICY "votes_select" ON forum_votes FOR SELECT USING (true);

CREATE POLICY "votes_insert" ON forum_votes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "votes_update" ON forum_votes FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "votes_delete" ON forum_votes FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- PART 5: forum_threads — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "threads_select" ON forum_threads;
  DROP POLICY IF EXISTS "threads_insert" ON forum_threads;
  DROP POLICY IF EXISTS "threads_update" ON forum_threads;
  DROP POLICY IF EXISTS "threads_delete" ON forum_threads;
END $$;

CREATE POLICY "threads_select" ON forum_threads FOR SELECT USING (true);

CREATE POLICY "threads_insert" ON forum_threads FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "threads_update" ON forum_threads FOR UPDATE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));

CREATE POLICY "threads_delete" ON forum_threads FOR DELETE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));

-- ============================================================
-- PART 6: user_roles — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "roles_select" ON user_roles;
  DROP POLICY IF EXISTS "roles_insert" ON user_roles;
  DROP POLICY IF EXISTS "roles_update" ON user_roles;
  DROP POLICY IF EXISTS "roles_delete" ON user_roles;
END $$;

CREATE POLICY "roles_select" ON user_roles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "roles_insert" ON user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

CREATE POLICY "roles_update" ON user_roles FOR UPDATE TO authenticated
  USING (public.is_admin((select auth.uid())));

CREATE POLICY "roles_delete" ON user_roles FOR DELETE TO authenticated
  USING (public.is_admin((select auth.uid())));

-- ============================================================
-- PART 7: api_keys — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can insert their own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;
END $$;

CREATE POLICY "api_keys_select" ON api_keys FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "api_keys_insert" ON api_keys FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "api_keys_update" ON api_keys FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "api_keys_delete" ON api_keys FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- PART 8: passwords — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own passwords" ON passwords;
  DROP POLICY IF EXISTS "Users can insert their own passwords" ON passwords;
  DROP POLICY IF EXISTS "Users can update their own passwords" ON passwords;
  DROP POLICY IF EXISTS "Users can delete their own passwords" ON passwords;
END $$;

CREATE POLICY "passwords_select" ON passwords FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "passwords_insert" ON passwords FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "passwords_update" ON passwords FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "passwords_delete" ON passwords FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- PART 9: crypto_wallets — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own wallets" ON crypto_wallets;
  DROP POLICY IF EXISTS "Users can insert their own wallets" ON crypto_wallets;
  DROP POLICY IF EXISTS "Users can update their own wallets" ON crypto_wallets;
  DROP POLICY IF EXISTS "Users can delete their own wallets" ON crypto_wallets;
END $$;

CREATE POLICY "wallets_select" ON crypto_wallets FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "wallets_insert" ON crypto_wallets FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "wallets_update" ON crypto_wallets FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "wallets_delete" ON crypto_wallets FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- PART 10: wspr_channel_members — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "channel_members_select" ON wspr_channel_members;
  DROP POLICY IF EXISTS "channel_members_insert" ON wspr_channel_members;
END $$;

CREATE POLICY "channel_members_select" ON wspr_channel_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "channel_members_insert" ON wspr_channel_members FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- PART 11: wspr_profiles — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view all profiles" ON wspr_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON wspr_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON wspr_profiles;
  DROP POLICY IF EXISTS "profiles_select" ON wspr_profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON wspr_profiles;
  DROP POLICY IF EXISTS "profiles_update" ON wspr_profiles;
END $$;

CREATE POLICY "profiles_select" ON wspr_profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON wspr_profiles FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_update" ON wspr_profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id);

-- ============================================================
-- PART 12: wspr_reactions — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "reactions_select" ON wspr_reactions;
  DROP POLICY IF EXISTS "reactions_insert" ON wspr_reactions;
  DROP POLICY IF EXISTS "reactions_delete" ON wspr_reactions;
END $$;

CREATE POLICY "reactions_select" ON wspr_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "reactions_insert" ON wspr_reactions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "reactions_delete" ON wspr_reactions FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- PART 13: display_name_history — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own display name history" ON display_name_history;
  DROP POLICY IF EXISTS "Users can view own display name history" ON display_name_history;
  DROP POLICY IF EXISTS "Anyone can view display name history" ON display_name_history;
  DROP POLICY IF EXISTS "display_name_history_select" ON display_name_history;
END $$;

CREATE POLICY "dnh_select" ON display_name_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "dnh_insert" ON display_name_history FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- PART 14: wspr_channels — consolidate + initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "channels_select" ON wspr_channels;
  DROP POLICY IF EXISTS "channels_insert" ON wspr_channels;
  DROP POLICY IF EXISTS "channels_update" ON wspr_channels;
  DROP POLICY IF EXISTS "channels_delete" ON wspr_channels;
  DROP POLICY IF EXISTS "Users can create channels in their workspaces" ON wspr_channels;
  DROP POLICY IF EXISTS "Users can delete channels in their workspaces" ON wspr_channels;
END $$;

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

-- ============================================================
-- PART 15: wspr_contacts — consolidate + initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "contacts_select" ON wspr_contacts;
  DROP POLICY IF EXISTS "contacts_insert" ON wspr_contacts;
  DROP POLICY IF EXISTS "contacts_update" ON wspr_contacts;
  DROP POLICY IF EXISTS "contacts_delete" ON wspr_contacts;
  DROP POLICY IF EXISTS "Users can view their own contacts" ON wspr_contacts;
  DROP POLICY IF EXISTS "Users can add contacts" ON wspr_contacts;
  DROP POLICY IF EXISTS "Users can update their own contacts" ON wspr_contacts;
  DROP POLICY IF EXISTS "Users can delete their own contacts" ON wspr_contacts;
END $$;

CREATE POLICY "contacts_select" ON wspr_contacts FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR contact_id = (select auth.uid())
  );

CREATE POLICY "contacts_insert" ON wspr_contacts FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "contacts_update" ON wspr_contacts FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR contact_id = (select auth.uid()));

CREATE POLICY "contacts_delete" ON wspr_contacts FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- PART 16: wspr_direct_messages — consolidate + initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "dms_select" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "dms_insert" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "dms_update" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "dms_delete" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "Users can view their DMs" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "Users can send DMs" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "Users can send DMs to contacts" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "Recipients can mark DMs as read" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "Users can mark their DMs as read" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "Senders can delete their DMs" ON wspr_direct_messages;
  DROP POLICY IF EXISTS "Users can delete their sent DMs" ON wspr_direct_messages;
END $$;

CREATE POLICY "dms_select" ON wspr_direct_messages FOR SELECT TO authenticated
  USING (
    sender_id = (select auth.uid()) OR recipient_id = (select auth.uid())
  );

CREATE POLICY "dms_insert" ON wspr_direct_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));

CREATE POLICY "dms_update" ON wspr_direct_messages FOR UPDATE TO authenticated
  USING (
    sender_id = (select auth.uid()) OR recipient_id = (select auth.uid())
  );

CREATE POLICY "dms_delete" ON wspr_direct_messages FOR DELETE TO authenticated
  USING (sender_id = (select auth.uid()));

-- ============================================================
-- PART 17: rmg_contacts — consolidate + initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their contacts" ON rmg_contacts;
  DROP POLICY IF EXISTS "Users can insert contacts" ON rmg_contacts;
  DROP POLICY IF EXISTS "Users can update their contacts" ON rmg_contacts;
  DROP POLICY IF EXISTS "Recipients can accept requests" ON rmg_contacts;
  DROP POLICY IF EXISTS "Users can delete their contacts" ON rmg_contacts;
END $$;

CREATE POLICY "rmg_contacts_select" ON rmg_contacts FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR contact_user_id = (select auth.uid())
  );

CREATE POLICY "rmg_contacts_insert" ON rmg_contacts FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "rmg_contacts_update" ON rmg_contacts FOR UPDATE TO authenticated
  USING (
    user_id = (select auth.uid()) OR contact_user_id = (select auth.uid())
  );

CREATE POLICY "rmg_contacts_delete" ON rmg_contacts FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- PART 18: wspr_messages — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "messages_select" ON wspr_messages;
  DROP POLICY IF EXISTS "messages_insert" ON wspr_messages;
  DROP POLICY IF EXISTS "messages_update" ON wspr_messages;
  DROP POLICY IF EXISTS "messages_delete" ON wspr_messages;
END $$;

CREATE POLICY "messages_select" ON wspr_messages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "messages_insert" ON wspr_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "messages_update" ON wspr_messages FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "messages_delete" ON wspr_messages FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_moderator((select auth.uid())));

-- ============================================================
-- PART 19: wspr_workspaces — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "workspaces_select" ON wspr_workspaces;
  DROP POLICY IF EXISTS "workspaces_insert" ON wspr_workspaces;
  DROP POLICY IF EXISTS "workspaces_update" ON wspr_workspaces;
  DROP POLICY IF EXISTS "workspaces_delete" ON wspr_workspaces;
END $$;

CREATE POLICY "workspaces_select" ON wspr_workspaces FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "workspaces_insert" ON wspr_workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "workspaces_update" ON wspr_workspaces FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()));

CREATE POLICY "workspaces_delete" ON wspr_workspaces FOR DELETE TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================================
-- PART 20: wspr_workspace_members — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "workspace_members_select" ON wspr_workspace_members;
  DROP POLICY IF EXISTS "workspace_members_insert" ON wspr_workspace_members;
  DROP POLICY IF EXISTS "workspace_members_update" ON wspr_workspace_members;
  DROP POLICY IF EXISTS "workspace_members_delete" ON wspr_workspace_members;
END $$;

CREATE POLICY "workspace_members_select" ON wspr_workspace_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "workspace_members_insert" ON wspr_workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "workspace_members_update" ON wspr_workspace_members FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "workspace_members_delete" ON wspr_workspace_members FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- PART 21: wspr_file_shares — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view files shared with them" ON wspr_file_shares;
  DROP POLICY IF EXISTS "Users can share files" ON wspr_file_shares;
  DROP POLICY IF EXISTS "Users can delete their shares" ON wspr_file_shares;
  DROP POLICY IF EXISTS "file_shares_select" ON wspr_file_shares;
  DROP POLICY IF EXISTS "file_shares_insert" ON wspr_file_shares;
  DROP POLICY IF EXISTS "file_shares_delete" ON wspr_file_shares;
END $$;

CREATE POLICY "file_shares_select" ON wspr_file_shares FOR SELECT TO authenticated
  USING (
    shared_by = (select auth.uid()) OR shared_with = (select auth.uid())
  );

CREATE POLICY "file_shares_insert" ON wspr_file_shares FOR INSERT TO authenticated
  WITH CHECK (shared_by = (select auth.uid()));

CREATE POLICY "file_shares_delete" ON wspr_file_shares FOR DELETE TO authenticated
  USING (shared_by = (select auth.uid()));

-- ============================================================
-- PART 22: wspr_attachments — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "attachments_select" ON wspr_attachments;
  DROP POLICY IF EXISTS "attachments_insert" ON wspr_attachments;
  DROP POLICY IF EXISTS "attachments_delete" ON wspr_attachments;
END $$;

CREATE POLICY "attachments_select" ON wspr_attachments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "attachments_insert" ON wspr_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));

CREATE POLICY "attachments_delete" ON wspr_attachments FOR DELETE TO authenticated
  USING (uploaded_by = (select auth.uid()));

-- ============================================================
-- PART 23: forum_posts — initplan fix
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "posts_select" ON forum_posts;
  DROP POLICY IF EXISTS "posts_insert" ON forum_posts;
  DROP POLICY IF EXISTS "posts_update" ON forum_posts;
  DROP POLICY IF EXISTS "posts_delete" ON forum_posts;
END $$;

CREATE POLICY "posts_select" ON forum_posts FOR SELECT USING (true);

CREATE POLICY "posts_insert" ON forum_posts FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "posts_update" ON forum_posts FOR UPDATE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));

CREATE POLICY "posts_delete" ON forum_posts FOR DELETE TO authenticated
  USING ((select auth.uid()) = author_id OR public.is_moderator((select auth.uid())));

-- ============================================================
-- PART 24: Drop duplicate indexes
-- ============================================================
DROP INDEX IF EXISTS idx_files_folder;
DROP INDEX IF EXISTS idx_files_user;
DROP INDEX IF EXISTS idx_folders_user;
DROP INDEX IF EXISTS idx_wspr_direct_messages_users;
DROP INDEX IF EXISTS idx_wspr_dm_sender_recipient;

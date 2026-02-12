-- Migration 042: Drop all stale/old-named policies
-- Migration 041 created new consolidated policies but the old ones from
-- earlier migrations (019-037) still exist. This drops every old policy
-- by its exact original name, leaving only the new consolidated ones.

-- ============================================================
-- files: old policies from migrations 024/030
-- ============================================================
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

-- ============================================================
-- folders: old policies from migrations 024/030
-- ============================================================
DROP POLICY IF EXISTS "Users can view folders" ON folders;
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can create folders" ON folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can update folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

-- ============================================================
-- folder_access: old policies from migration 030/040
-- ============================================================
DROP POLICY IF EXISTS "Users can view their folder access" ON folder_access;
DROP POLICY IF EXISTS "Users can manage folder access" ON folder_access;
DROP POLICY IF EXISTS "Authenticated users can manage folder access" ON folder_access;
DROP POLICY IF EXISTS "Folder owners can manage access" ON folder_access;
DROP POLICY IF EXISTS "Workspace owners can manage folder access" ON folder_access;

-- ============================================================
-- forum_votes: old policies from migration 021
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create votes" ON forum_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON forum_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON forum_votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON forum_votes;

-- ============================================================
-- forum_threads: old policies from migrations 021/033/035
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view threads" ON forum_threads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON forum_threads;
DROP POLICY IF EXISTS "Users can update their own threads" ON forum_threads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON forum_threads;

-- ============================================================
-- forum_posts: old policies from migrations 021/033/035
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON forum_posts;

-- ============================================================
-- forum_categories: old policies from migrations 019/021/035
-- Need to recreate with (select auth.uid()) pattern
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view categories" ON forum_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON forum_categories;
DROP POLICY IF EXISTS "categories_select" ON forum_categories;
DROP POLICY IF EXISTS "categories_insert" ON forum_categories;
DROP POLICY IF EXISTS "categories_update" ON forum_categories;
DROP POLICY IF EXISTS "categories_delete" ON forum_categories;

CREATE POLICY "categories_select" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON forum_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));
CREATE POLICY "categories_update" ON forum_categories FOR UPDATE TO authenticated
  USING (public.is_admin((select auth.uid())));
CREATE POLICY "categories_delete" ON forum_categories FOR DELETE TO authenticated
  USING (public.is_admin((select auth.uid())));

-- ============================================================
-- user_roles: old policies from migrations 019/035
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can view roles" ON user_roles;

-- ============================================================
-- api_keys: old policies from migration 024
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;

-- ============================================================
-- passwords: old policies from migration 024
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can insert their own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can update their own passwords" ON passwords;
DROP POLICY IF EXISTS "Users can delete their own passwords" ON passwords;

-- ============================================================
-- crypto_wallets: old policies from migration 024
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Users can insert their own wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Users can update their own wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Users can delete their own wallets" ON crypto_wallets;

-- ============================================================
-- wspr_profiles: old policies from migration 034
-- ============================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON wspr_profiles;

-- ============================================================
-- wspr_channels: old policies from migration 033/034
-- ============================================================
DROP POLICY IF EXISTS "Users can view channels in their workspaces" ON wspr_channels;
DROP POLICY IF EXISTS "Users can create channels in their workspaces" ON wspr_channels;
DROP POLICY IF EXISTS "Users can update channels in their workspaces" ON wspr_channels;
DROP POLICY IF EXISTS "Users can delete channels in their workspaces" ON wspr_channels;

-- ============================================================
-- wspr_channel_members: old policies from migration 033/034
-- ============================================================
DROP POLICY IF EXISTS "Users can view channel members" ON wspr_channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON wspr_channel_members;

-- ============================================================
-- wspr_messages: old policies from migration 033/034
-- ============================================================
DROP POLICY IF EXISTS "Users can view messages in their channels" ON wspr_messages;
DROP POLICY IF EXISTS "Users can send messages" ON wspr_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON wspr_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON wspr_messages;

-- ============================================================
-- wspr_reactions: old policies from migration 033/034
-- ============================================================
DROP POLICY IF EXISTS "Users can view reactions" ON wspr_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON wspr_reactions;
DROP POLICY IF EXISTS "Users can remove their reactions" ON wspr_reactions;

-- ============================================================
-- wspr_workspaces: old policies from migration 033/034
-- ============================================================
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON wspr_workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON wspr_workspaces;
DROP POLICY IF EXISTS "Workspace owners can update" ON wspr_workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete" ON wspr_workspaces;

-- ============================================================
-- wspr_workspace_members: old policies from migration 033/034
-- ============================================================
DROP POLICY IF EXISTS "Users can view workspace members" ON wspr_workspace_members;
DROP POLICY IF EXISTS "Users can join workspaces" ON wspr_workspace_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON wspr_workspace_members;
DROP POLICY IF EXISTS "Users can leave workspaces" ON wspr_workspace_members;

-- ============================================================
-- wspr_contacts: old policies from migration 034/036
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can add contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON wspr_contacts;

-- ============================================================
-- wspr_direct_messages: old policies from migration 034/036
-- ============================================================
DROP POLICY IF EXISTS "Users can view their DMs" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Users can send DMs to contacts" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Recipients can mark DMs as read" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Users can mark their DMs as read" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Senders can delete their DMs" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Users can delete their sent DMs" ON wspr_direct_messages;

-- ============================================================
-- wspr_file_shares: old policies from migration 037
-- ============================================================
DROP POLICY IF EXISTS "Users can view their file shares" ON wspr_file_shares;
DROP POLICY IF EXISTS "Users can create file shares" ON wspr_file_shares;
DROP POLICY IF EXISTS "Sharers can delete their shares" ON wspr_file_shares;
DROP POLICY IF EXISTS "Users can view files shared with them" ON wspr_file_shares;
DROP POLICY IF EXISTS "Users can share files" ON wspr_file_shares;
DROP POLICY IF EXISTS "Users can delete their shares" ON wspr_file_shares;

-- ============================================================
-- wspr_attachments: old policies from migration 034
-- ============================================================
DROP POLICY IF EXISTS "Users can view attachments in their channels" ON wspr_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their channels" ON wspr_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON wspr_attachments;

-- ============================================================
-- rmg_contacts: old policies from various migrations
-- ============================================================
DROP POLICY IF EXISTS "Users can view their contacts" ON rmg_contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON rmg_contacts;
DROP POLICY IF EXISTS "Users can update their contacts" ON rmg_contacts;
DROP POLICY IF EXISTS "Recipients can accept requests" ON rmg_contacts;
DROP POLICY IF EXISTS "Users can delete their contacts" ON rmg_contacts;

-- ============================================================
-- display_name_history: old policies from migration 010
-- ============================================================
DROP POLICY IF EXISTS "Users can view own display name history" ON display_name_history;
DROP POLICY IF EXISTS "Admins can view all display name history" ON display_name_history;
DROP POLICY IF EXISTS "System can insert display name history" ON display_name_history;
DROP POLICY IF EXISTS "Users can insert own display name history" ON display_name_history;

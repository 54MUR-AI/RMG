-- WSPR Schema Reset - Complete Fix
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can view own contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can manage own contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can view workspaces they're members of" ON wspr_workspaces;
DROP POLICY IF EXISTS "Owners can manage workspaces" ON wspr_workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON wspr_workspaces;
DROP POLICY IF EXISTS "Users can view workspace members" ON wspr_workspace_members;
DROP POLICY IF EXISTS "Workspace owners can add members" ON wspr_workspace_members;
DROP POLICY IF EXISTS "Users can view channels in their workspaces" ON wspr_channels;
DROP POLICY IF EXISTS "Workspace members can create channels" ON wspr_channels;
DROP POLICY IF EXISTS "Users can view messages in their channels" ON wspr_messages;
DROP POLICY IF EXISTS "Users can send messages to their channels" ON wspr_messages;
DROP POLICY IF EXISTS "Users can view their DMs" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Users can send DMs" ON wspr_direct_messages;
DROP POLICY IF EXISTS "Users can view files shared with them" ON wspr_file_shares;

-- Step 2: Create simple, working policies

-- Profiles - Allow all authenticated users
CREATE POLICY "profiles_select" ON wspr_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON wspr_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON wspr_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Contacts - Users manage their own
CREATE POLICY "contacts_select" ON wspr_contacts FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() = contact_id);
CREATE POLICY "contacts_insert" ON wspr_contacts FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update" ON wspr_contacts FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "contacts_delete" ON wspr_contacts FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Workspaces - Simple ownership model
CREATE POLICY "workspaces_select" ON wspr_workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "workspaces_insert" ON wspr_workspaces FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "workspaces_update" ON wspr_workspaces FOR UPDATE TO authenticated 
  USING (auth.uid() = owner_id);
CREATE POLICY "workspaces_delete" ON wspr_workspaces FOR DELETE TO authenticated 
  USING (auth.uid() = owner_id);

-- Workspace Members - Simple model
CREATE POLICY "workspace_members_select" ON wspr_workspace_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "workspace_members_insert" ON wspr_workspace_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "workspace_members_update" ON wspr_workspace_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "workspace_members_delete" ON wspr_workspace_members FOR DELETE TO authenticated USING (true);

-- Channels - Simple model
CREATE POLICY "channels_select" ON wspr_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "channels_insert" ON wspr_channels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "channels_update" ON wspr_channels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "channels_delete" ON wspr_channels FOR DELETE TO authenticated USING (true);

-- Channel Members - Simple model
CREATE POLICY "channel_members_select" ON wspr_channel_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "channel_members_insert" ON wspr_channel_members FOR INSERT TO authenticated WITH CHECK (true);

-- Messages - Simple model
CREATE POLICY "messages_select" ON wspr_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_insert" ON wspr_messages FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_update" ON wspr_messages FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Direct Messages - Simple model
CREATE POLICY "dms_select" ON wspr_direct_messages FOR SELECT TO authenticated 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "dms_insert" ON wspr_direct_messages FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "dms_update" ON wspr_direct_messages FOR UPDATE TO authenticated 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- File Shares - Simple model
CREATE POLICY "file_shares_select" ON wspr_file_shares FOR SELECT TO authenticated USING (true);
CREATE POLICY "file_shares_insert" ON wspr_file_shares FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = shared_by);

-- Reactions - Simple model
CREATE POLICY "reactions_select" ON wspr_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reactions_insert" ON wspr_reactions FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON wspr_reactions FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

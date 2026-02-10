-- WSPR Database Schema
-- Run this in Supabase SQL Editor

-- WSPR User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS wspr_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  status TEXT DEFAULT 'online', -- online, away, busy, offline
  status_message TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WSPR Contacts/Connections
CREATE TABLE IF NOT EXISTS wspr_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- WSPR Workspaces (tied to LDGR folders)
CREATE TABLE IF NOT EXISTS wspr_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ldgr_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL, -- Links to LDGR folder
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WSPR Workspace Members
CREATE TABLE IF NOT EXISTS wspr_workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES wspr_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- WSPR Channels
CREATE TABLE IF NOT EXISTS wspr_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES wspr_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WSPR Channel Members (for private channels)
CREATE TABLE IF NOT EXISTS wspr_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES wspr_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- WSPR Messages (encrypted in database, decrypted on client)
CREATE TABLE IF NOT EXISTS wspr_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES wspr_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL, -- Encrypted content
  is_encrypted BOOLEAN DEFAULT true,
  thread_id UUID REFERENCES wspr_messages(id), -- for threaded replies
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WSPR Direct Messages (encrypted)
CREATE TABLE IF NOT EXISTS wspr_direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Encrypted content
  is_encrypted BOOLEAN DEFAULT true,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WSPR File Shares (links LDGR files to WSPR messages)
CREATE TABLE IF NOT EXISTS wspr_file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE, -- LDGR files table
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES wspr_channels(id) ON DELETE CASCADE,
  message_id UUID REFERENCES wspr_messages(id) ON DELETE CASCADE,
  share_type TEXT DEFAULT 'temporary', -- 'send' (permanent copy to drops) or 'temporary' (time-limited access)
  expires_at TIMESTAMP WITH TIME ZONE, -- For temporary access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WSPR Message Reactions
CREATE TABLE IF NOT EXISTS wspr_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES wspr_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wspr_messages_channel ON wspr_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wspr_messages_thread ON wspr_messages(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wspr_direct_messages_users ON wspr_direct_messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wspr_file_shares_channel ON wspr_file_shares(channel_id);
CREATE INDEX IF NOT EXISTS idx_wspr_contacts_user ON wspr_contacts(user_id);

-- Row Level Security Policies

-- Profiles: Users can read all profiles, but only update their own
ALTER TABLE wspr_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON wspr_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON wspr_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON wspr_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Contacts: Users can manage their own contacts
ALTER TABLE wspr_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts" ON wspr_contacts
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = contact_id);

CREATE POLICY "Users can manage own contacts" ON wspr_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Workspaces: Members can view, owners can manage
ALTER TABLE wspr_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspaces they're members of" ON wspr_workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_workspaces.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage workspaces" ON wspr_workspaces
  FOR ALL USING (auth.uid() = owner_id);

-- Workspace Members: Members can view, admins can manage
ALTER TABLE wspr_workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace members" ON wspr_workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wspr_workspace_members wm
      WHERE wm.workspace_id = wspr_workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Channels: Members can view, workspace admins can manage
ALTER TABLE wspr_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view channels in their workspaces" ON wspr_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Messages: Channel members can read/write
ALTER TABLE wspr_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their channels" ON wspr_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wspr_channels c
      JOIN wspr_workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = wspr_messages.channel_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their channels" ON wspr_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM wspr_channels c
      JOIN wspr_workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = channel_id
      AND wm.user_id = auth.uid()
    )
  );

-- Direct Messages: Sender and recipient can view
ALTER TABLE wspr_direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their DMs" ON wspr_direct_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send DMs" ON wspr_direct_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- File Shares: Shared users can view
ALTER TABLE wspr_file_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files shared with them" ON wspr_file_shares
  FOR SELECT USING (
    auth.uid() = shared_by OR 
    auth.uid() = shared_with OR
    EXISTS (
      SELECT 1 FROM wspr_channels c
      JOIN wspr_workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = wspr_file_shares.channel_id
      AND wm.user_id = auth.uid()
    )
  );

-- Create default "WSPR" workspace for all users
-- This will be handled by application logic on first login

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION create_wspr_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wspr_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created_wspr ON auth.users;
CREATE TRIGGER on_auth_user_created_wspr
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_wspr_profile();

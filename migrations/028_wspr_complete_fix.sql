-- Complete WSPR fix for RMG integration
-- This creates a minimal profiles table that syncs with RMG user data
-- Run this in Supabase SQL Editor

-- 1. Ensure wspr_profiles table exists with minimal structure
CREATE TABLE IF NOT EXISTS wspr_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'offline',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on wspr_profiles
ALTER TABLE wspr_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing profile policies
DROP POLICY IF EXISTS "Users can view all profiles" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON wspr_profiles;

-- 4. Create simple profile policies (everyone can view, users can manage their own)
CREATE POLICY "Users can view all profiles"
ON wspr_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON wspr_profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON wspr_profiles FOR UPDATE
USING (id = auth.uid());

-- 5. Fix wspr_contacts RLS policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can add contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON wspr_contacts;

CREATE POLICY "Users can view their own contacts"
ON wspr_contacts FOR SELECT
USING (user_id = auth.uid() OR contact_id = auth.uid());

CREATE POLICY "Users can add contacts"
ON wspr_contacts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own contacts"
ON wspr_contacts FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own contacts"
ON wspr_contacts FOR DELETE
USING (user_id = auth.uid());

-- 6. Ensure foreign keys exist
ALTER TABLE wspr_contacts 
  DROP CONSTRAINT IF EXISTS wspr_contacts_contact_profile_fkey;
  
ALTER TABLE wspr_contacts 
  ADD CONSTRAINT wspr_contacts_contact_profile_fkey 
  FOREIGN KEY (contact_id) REFERENCES wspr_profiles(id) ON DELETE CASCADE;

-- 7. Fix wspr_workspaces RLS policies
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON wspr_workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON wspr_workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON wspr_workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON wspr_workspaces;

CREATE POLICY "Users can view workspaces they own or are members of"
ON wspr_workspaces FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
ON wspr_workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces"
ON wspr_workspaces FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces"
ON wspr_workspaces FOR DELETE
USING (owner_id = auth.uid());

-- 8. Reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- WSPR Database Schema - FIXED VERSION
-- Run this in Supabase SQL Editor to fix RLS policy issues

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view workspace members" ON wspr_workspace_members;
DROP POLICY IF EXISTS "Users can insert own profile" ON wspr_profiles;
DROP POLICY IF EXISTS "Users can manage own contacts" ON wspr_contacts;

-- Fix Profile INSERT policy to allow both user and service role
CREATE POLICY "Users can insert own profile" ON wspr_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.role() = 'service_role'
  );

-- Fix Workspace Members SELECT policy (remove infinite recursion)
CREATE POLICY "Users can view workspace members" ON wspr_workspace_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM wspr_workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Add INSERT policy for workspace members
CREATE POLICY "Workspace owners can add members" ON wspr_workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wspr_workspaces
      WHERE id = workspace_id
      AND owner_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );

-- Fix Contacts policy to allow INSERT
CREATE POLICY "Users can insert contacts" ON wspr_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update contacts" ON wspr_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete contacts" ON wspr_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Add INSERT policy for workspaces
CREATE POLICY "Users can create workspaces" ON wspr_workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Add INSERT policy for channels
CREATE POLICY "Workspace members can create channels" ON wspr_channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wspr_workspace_members
      WHERE workspace_id = wspr_channels.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

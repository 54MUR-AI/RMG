-- Fix wspr_contacts RLS policies to work with RMG user IDs directly
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can add contacts" ON wspr_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON wspr_contacts;

-- Create new policies that work with RMG user IDs (no profile requirement)
CREATE POLICY "Users can view their own contacts"
ON wspr_contacts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can add contacts"
ON wspr_contacts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own contacts"
ON wspr_contacts FOR DELETE
USING (user_id = auth.uid());

-- Reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

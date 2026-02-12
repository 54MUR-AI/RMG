-- Add email column to existing wspr_profiles table
-- Run this in Supabase SQL Editor

-- Add email column if it doesn't exist
ALTER TABLE wspr_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

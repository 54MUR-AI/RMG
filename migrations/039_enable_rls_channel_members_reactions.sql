-- Migration 039: Enable RLS on wspr_channel_members and wspr_reactions
-- These tables already have policies but RLS was never enabled.

ALTER TABLE wspr_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wspr_reactions ENABLE ROW LEVEL SECURITY;

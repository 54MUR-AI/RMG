-- Migration 044: Create user_bans table for admin ban/suspend functionality
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.user_bans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  banned_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view all bans"
  ON public.user_bans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert bans"
  ON public.user_bans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete bans"
  ON public.user_bans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Allow any authenticated user to check their own ban status
CREATE POLICY "Users can check own ban status"
  ON public.user_bans FOR SELECT
  USING (user_id = auth.uid());

-- Display Name History Tracking
-- This table tracks all display name changes for users

CREATE TABLE IF NOT EXISTS display_name_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_display_name UNIQUE(user_id, display_name, changed_at)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_display_name_history_user_id ON display_name_history(user_id);
CREATE INDEX IF NOT EXISTS idx_display_name_history_changed_at ON display_name_history(changed_at DESC);

-- Enable RLS
ALTER TABLE display_name_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own display name history" ON display_name_history;
DROP POLICY IF EXISTS "Admins can view all display name history" ON display_name_history;
DROP POLICY IF EXISTS "System can insert display name history" ON display_name_history;

-- Policy: Users can view their own history
CREATE POLICY "Users can view own display name history"
  ON display_name_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all history
CREATE POLICY "Admins can view all display name history"
  ON display_name_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Policy: System can insert (for tracking changes)
CREATE POLICY "System can insert display name history"
  ON display_name_history
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON display_name_history TO authenticated;
GRANT INSERT ON display_name_history TO authenticated;

-- Note: To populate initial data, run:
-- INSERT INTO display_name_history (user_id, display_name, changed_at)
-- SELECT id, raw_user_meta_data->>'display_name', created_at
-- FROM auth.users
-- WHERE raw_user_meta_data->>'display_name' IS NOT NULL
-- ON CONFLICT DO NOTHING;

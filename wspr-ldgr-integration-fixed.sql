-- WSPR-LDGR Integration Schema (Fixed - No Recursion)
-- Adds folder linking and shared access management

-- Add ldgr_folder_id to workspaces
ALTER TABLE wspr_workspaces 
ADD COLUMN IF NOT EXISTS ldgr_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Add ldgr_folder_id to channels
ALTER TABLE wspr_channels 
ADD COLUMN IF NOT EXISTS ldgr_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Create folder_access table for shared workspace folders
CREATE TABLE IF NOT EXISTS folder_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'read', -- 'read', 'write', 'admin'
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(folder_id, user_id)
);

-- Enable RLS on folder_access
ALTER TABLE folder_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their folder access" ON folder_access;
DROP POLICY IF EXISTS "Folder owners can manage access" ON folder_access;
DROP POLICY IF EXISTS "Workspace owners can manage folder access" ON folder_access;

-- Policy: Users can see their own folder access
CREATE POLICY "Users can view their folder access"
  ON folder_access FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Folder owners can manage access (NO RECURSION - direct folder ownership check)
CREATE POLICY "Folder owners can manage access"
  ON folder_access FOR ALL
  USING (
    folder_id IN (
      SELECT id FROM folders WHERE user_id = auth.uid()
    )
  );

-- Policy: Workspace owners can manage folder access (NO RECURSION - direct workspace ownership check)
CREATE POLICY "Workspace owners can manage folder access"
  ON folder_access FOR ALL
  USING (
    folder_id IN (
      SELECT ldgr_folder_id FROM wspr_workspaces WHERE owner_id = auth.uid()
    )
  );

-- IMPORTANT: Keep original folders policy simple - NO folder_access reference to avoid recursion
-- The folder_access table will handle shared access separately
-- Users query folder_access directly when they need to check shared folders

-- Update files RLS to include shared folder access
DROP POLICY IF EXISTS "Users can view their files" ON files;
CREATE POLICY "Users can view their files or files in shared folders"
  ON files FOR SELECT
  USING (
    user_id = auth.uid()
    OR folder_id IN (
      SELECT folder_id FROM folder_access WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert files into shared folders with write access
DROP POLICY IF EXISTS "Users can insert files into shared folders" ON files;
CREATE POLICY "Users can insert files into shared folders"
  ON files FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (
      folder_id IN (
        SELECT folder_id FROM folder_access 
        WHERE user_id = auth.uid() 
        AND access_level IN ('write', 'admin')
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_folder_access_user ON folder_access(user_id);
CREATE INDEX IF NOT EXISTS idx_folder_access_folder ON folder_access(folder_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_ldgr_folder ON wspr_workspaces(ldgr_folder_id);
CREATE INDEX IF NOT EXISTS idx_channels_ldgr_folder ON wspr_channels(ldgr_folder_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';

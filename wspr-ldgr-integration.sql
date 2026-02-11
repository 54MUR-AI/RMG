-- WSPR-LDGR Integration Schema
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

-- Policy: Users can see their own folder access
CREATE POLICY "Users can view their folder access"
  ON folder_access FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Folder owners can manage access
CREATE POLICY "Folder owners can manage access"
  ON folder_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM folders
      WHERE folders.id = folder_access.folder_id
      AND folders.user_id = auth.uid()
    )
  );

-- Policy: Workspace owners can manage folder access
CREATE POLICY "Workspace owners can manage folder access"
  ON folder_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM wspr_workspaces
      WHERE wspr_workspaces.ldgr_folder_id = folder_access.folder_id
      AND wspr_workspaces.owner_id = auth.uid()
    )
  );

-- Update folders RLS to include shared access
DROP POLICY IF EXISTS "Users can view their folders" ON folders;
CREATE POLICY "Users can view their folders or shared folders"
  ON folders FOR SELECT
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM folder_access
      WHERE folder_access.folder_id = folders.id
      AND folder_access.user_id = auth.uid()
    )
  );

-- Update files RLS to include shared folder access
DROP POLICY IF EXISTS "Users can view their files" ON files;
CREATE POLICY "Users can view their files or files in shared folders"
  ON files FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM folder_access
      WHERE folder_access.folder_id = files.folder_id
      AND folder_access.user_id = auth.uid()
    )
  );

-- Policy: Users can insert files into shared folders with write access
CREATE POLICY "Users can insert files into shared folders"
  ON files FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM folder_access
      WHERE folder_access.folder_id = files.folder_id
      AND folder_access.user_id = auth.uid()
      AND folder_access.access_level IN ('write', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_folder_access_user ON folder_access(user_id);
CREATE INDEX IF NOT EXISTS idx_folder_access_folder ON folder_access(folder_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_ldgr_folder ON wspr_workspaces(ldgr_folder_id);
CREATE INDEX IF NOT EXISTS idx_channels_ldgr_folder ON wspr_channels(ldgr_folder_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';

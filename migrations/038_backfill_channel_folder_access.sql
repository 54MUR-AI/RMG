-- Migration 038: Backfill folder_access for channel subfolders
-- Existing workspace members may not have folder_access rows for channel subfolders.
-- This grants read access to all workspace members for all channel folders in their workspace.

INSERT INTO folder_access (folder_id, user_id, access_level)
SELECT 
  c.ldgr_folder_id,
  m.user_id,
  CASE WHEN m.role IN ('owner', 'admin') THEN 'write' ELSE 'read' END
FROM wspr_channels c
JOIN wspr_workspace_members m ON m.workspace_id = c.workspace_id
WHERE c.ldgr_folder_id IS NOT NULL
ON CONFLICT (folder_id, user_id) DO NOTHING;

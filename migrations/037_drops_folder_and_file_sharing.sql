-- WSPR Drops Folder & File Sharing Support
-- Safe to run multiple times — all statements use IF NOT EXISTS / OR REPLACE
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. Add drops_folder_id to wspr_profiles
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wspr_profiles' AND column_name = 'drops_folder_id'
  ) THEN
    ALTER TABLE wspr_profiles ADD COLUMN drops_folder_id UUID REFERENCES folders(id);
  END IF;
END $$;

-- ============================================================
-- 2. Create wspr_file_shares table
--    Tracks individual file shares in DMs and channels.
--    The actual file lives in LDGR storage once — this table
--    records who has access and in what context.
-- ============================================================
CREATE TABLE IF NOT EXISTS wspr_file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_context TEXT NOT NULL CHECK (share_context IN ('dm', 'channel')),
  context_id TEXT NOT NULL,  -- dm contact_id or channel_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_wspr_file_shares_recipient
  ON wspr_file_shares(shared_with_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wspr_file_shares_file
  ON wspr_file_shares(file_id);

CREATE INDEX IF NOT EXISTS idx_wspr_file_shares_context
  ON wspr_file_shares(share_context, context_id);

-- Prevent duplicate shares of the same file to the same user in the same context
CREATE UNIQUE INDEX IF NOT EXISTS idx_wspr_file_shares_unique
  ON wspr_file_shares(file_id, shared_with_user_id, share_context, context_id);

-- ============================================================
-- 3. RLS policies for wspr_file_shares
-- ============================================================
ALTER TABLE wspr_file_shares ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wspr_file_shares' AND policyname = 'Users can view their file shares'
  ) THEN
    CREATE POLICY "Users can view their file shares" ON wspr_file_shares
      FOR SELECT USING (
        auth.uid() = shared_with_user_id OR auth.uid() = shared_by_user_id
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wspr_file_shares' AND policyname = 'Users can create file shares'
  ) THEN
    CREATE POLICY "Users can create file shares" ON wspr_file_shares
      FOR INSERT WITH CHECK (auth.uid() = shared_by_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wspr_file_shares' AND policyname = 'Sharers can delete their shares'
  ) THEN
    CREATE POLICY "Sharers can delete their shares" ON wspr_file_shares
      FOR DELETE USING (auth.uid() = shared_by_user_id);
  END IF;
END $$;

-- ============================================================
-- 4. RPC: Create Drops folder for a user (idempotent)
--    Returns the drops_folder_id (existing or newly created)
-- ============================================================
CREATE OR REPLACE FUNCTION ensure_drops_folder(user_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_folder_id UUID;
  new_folder_id UUID;
BEGIN
  -- Check if user already has a Drops folder
  SELECT drops_folder_id INTO existing_folder_id
  FROM wspr_profiles
  WHERE id = user_id_param;

  IF existing_folder_id IS NOT NULL THEN
    RETURN existing_folder_id;
  END IF;

  -- Check if a folder named 'Drops' already exists for this user
  SELECT id INTO existing_folder_id
  FROM folders
  WHERE user_id = user_id_param AND name = 'Drops' AND parent_id IS NULL
  LIMIT 1;

  IF existing_folder_id IS NOT NULL THEN
    -- Link existing folder
    UPDATE wspr_profiles SET drops_folder_id = existing_folder_id WHERE id = user_id_param;
    RETURN existing_folder_id;
  END IF;

  -- Create new Drops folder
  INSERT INTO folders (user_id, name, parent_id, display_order)
  VALUES (user_id_param, 'Drops', NULL, 0)
  RETURNING id INTO new_folder_id;

  -- Link to profile
  UPDATE wspr_profiles SET drops_folder_id = new_folder_id WHERE id = user_id_param;

  RETURN new_folder_id;
END;
$$;

-- ============================================================
-- 5. Retroactively create Drops folders for all existing users
--    who have a wspr_profile but no drops_folder_id
-- ============================================================
DO $$
DECLARE
  profile_record RECORD;
  new_folder_id UUID;
  existing_folder_id UUID;
BEGIN
  FOR profile_record IN
    SELECT id FROM wspr_profiles WHERE drops_folder_id IS NULL
  LOOP
    -- Check if Drops folder already exists
    SELECT id INTO existing_folder_id
    FROM folders
    WHERE user_id = profile_record.id AND name = 'Drops' AND parent_id IS NULL
    LIMIT 1;

    IF existing_folder_id IS NOT NULL THEN
      UPDATE wspr_profiles SET drops_folder_id = existing_folder_id WHERE id = profile_record.id;
    ELSE
      INSERT INTO folders (user_id, name, parent_id, display_order)
      VALUES (profile_record.id, 'Drops', NULL, 0)
      RETURNING id INTO new_folder_id;

      UPDATE wspr_profiles SET drops_folder_id = new_folder_id WHERE id = profile_record.id;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 6. RPC: Get files shared with a user (for Drops view)
-- ============================================================
CREATE OR REPLACE FUNCTION get_shared_files(user_id_param UUID)
RETURNS TABLE (
  share_id UUID,
  file_id UUID,
  filename TEXT,
  file_size BIGINT,
  file_type TEXT,
  storage_path TEXT,
  shared_by_user_id UUID,
  shared_by_display_name TEXT,
  share_context TEXT,
  context_id TEXT,
  shared_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fs.id AS share_id,
    fs.file_id,
    f.name AS filename,
    f.size AS file_size,
    f.type AS file_type,
    f.storage_path,
    fs.shared_by_user_id,
    COALESCE(wp.display_name, 'Unknown') AS shared_by_display_name,
    fs.share_context,
    fs.context_id,
    fs.created_at AS shared_at
  FROM wspr_file_shares fs
  JOIN files f ON f.id = fs.file_id
  LEFT JOIN wspr_profiles wp ON wp.id = fs.shared_by_user_id
  WHERE fs.shared_with_user_id = user_id_param
  ORDER BY fs.created_at DESC;
END;
$$;

-- WSPR Direct Messages Support
-- Safe to run multiple times — all statements use IF NOT EXISTS / OR REPLACE
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. Ensure wspr_direct_messages table exists (already in 034, but safe)
-- ============================================================
CREATE TABLE IF NOT EXISTS wspr_direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT true,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. Indexes (IF NOT EXISTS — safe to re-run)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wspr_dm_sender_recipient
  ON wspr_direct_messages(sender_id, recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wspr_dm_recipient_sender
  ON wspr_direct_messages(recipient_id, sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wspr_dm_recipient_unread
  ON wspr_direct_messages(recipient_id, created_at DESC)
  WHERE read_at IS NULL;

-- ============================================================
-- 3. Add avatar_color column to wspr_profiles if missing
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wspr_profiles' AND column_name = 'avatar_color'
  ) THEN
    ALTER TABLE wspr_profiles ADD COLUMN avatar_color TEXT DEFAULT '#E63946';
  END IF;
END $$;

-- ============================================================
-- 4. RLS policies for wspr_direct_messages (idempotent)
-- ============================================================
ALTER TABLE wspr_direct_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: sender or recipient can view
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wspr_direct_messages' AND policyname = 'Users can view their DMs'
  ) THEN
    CREATE POLICY "Users can view their DMs" ON wspr_direct_messages
      FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  END IF;
END $$;

-- INSERT: only sender can insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wspr_direct_messages' AND policyname = 'Users can send DMs'
  ) THEN
    CREATE POLICY "Users can send DMs" ON wspr_direct_messages
      FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

-- UPDATE: recipient can mark as read (update read_at)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wspr_direct_messages' AND policyname = 'Recipients can mark DMs as read'
  ) THEN
    CREATE POLICY "Recipients can mark DMs as read" ON wspr_direct_messages
      FOR UPDATE USING (auth.uid() = recipient_id);
  END IF;
END $$;

-- DELETE: sender can delete their own messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wspr_direct_messages' AND policyname = 'Senders can delete their DMs'
  ) THEN
    CREATE POLICY "Senders can delete their DMs" ON wspr_direct_messages
      FOR DELETE USING (auth.uid() = sender_id);
  END IF;
END $$;

-- ============================================================
-- 5. Enable realtime for wspr_direct_messages
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'wspr_direct_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wspr_direct_messages;
  END IF;
END $$;

-- ============================================================
-- 6. RPC: get_dm_conversations
--    Returns a list of DM conversations for a user, with contact
--    info, last message, and unread count. Sorted by most recent.
-- ============================================================
CREATE OR REPLACE FUNCTION get_dm_conversations(user_id_param UUID)
RETURNS TABLE (
  contact_id UUID,
  contact_display_name TEXT,
  contact_avatar_url TEXT,
  contact_avatar_color TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_sender_name TEXT,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH conversation_partners AS (
    -- Get all unique users we've exchanged DMs with
    SELECT DISTINCT
      CASE
        WHEN dm.sender_id = user_id_param THEN dm.recipient_id
        ELSE dm.sender_id
      END AS partner_id
    FROM wspr_direct_messages dm
    WHERE dm.sender_id = user_id_param OR dm.recipient_id = user_id_param
  ),
  latest_messages AS (
    -- Get the most recent message per conversation partner
    SELECT DISTINCT ON (cp.partner_id)
      cp.partner_id,
      dm.content,
      dm.created_at,
      dm.sender_id
    FROM conversation_partners cp
    JOIN wspr_direct_messages dm ON (
      (dm.sender_id = user_id_param AND dm.recipient_id = cp.partner_id)
      OR
      (dm.sender_id = cp.partner_id AND dm.recipient_id = user_id_param)
    )
    ORDER BY cp.partner_id, dm.created_at DESC
  ),
  unread_counts AS (
    -- Count unread messages per sender
    SELECT
      dm.sender_id AS partner_id,
      COUNT(*) AS cnt
    FROM wspr_direct_messages dm
    WHERE dm.recipient_id = user_id_param AND dm.read_at IS NULL
    GROUP BY dm.sender_id
  )
  SELECT
    lm.partner_id AS contact_id,
    COALESCE(wp.display_name, 'Unknown') AS contact_display_name,
    wp.avatar_url AS contact_avatar_url,
    COALESCE(wp.avatar_color, '#E63946') AS contact_avatar_color,
    lm.content AS last_message,
    lm.created_at AS last_message_at,
    COALESCE(sp.display_name, 'Unknown') AS last_message_sender_name,
    COALESCE(uc.cnt, 0) AS unread_count
  FROM latest_messages lm
  LEFT JOIN wspr_profiles wp ON wp.id = lm.partner_id
  LEFT JOIN wspr_profiles sp ON sp.id = lm.sender_id
  LEFT JOIN unread_counts uc ON uc.partner_id = lm.partner_id
  ORDER BY lm.created_at DESC;
END;
$$;

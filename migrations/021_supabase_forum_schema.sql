-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Threads Table
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL, -- Display name or "Anonymous"
  author_avatar_color TEXT DEFAULT '#E63946',
  is_anonymous BOOLEAN DEFAULT false,
  category_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Posts (Replies) Table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar_color TEXT DEFAULT '#E63946',
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Votes Table (for upvotes/downvotes)
CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, post_id),
  CHECK ((thread_id IS NOT NULL AND post_id IS NULL) OR (thread_id IS NULL AND post_id IS NOT NULL))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_votes_thread ON forum_votes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_post ON forum_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user ON forum_votes(user_id);

-- Enable Row Level Security
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON forum_categories FOR SELECT USING (true);

-- RLS Policies for forum_threads (public read, authenticated write)
CREATE POLICY "Anyone can view threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Anyone can create threads" ON forum_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can update their own threads" ON forum_threads FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors can delete their own threads" ON forum_threads FOR DELETE USING (author_id = auth.uid());

-- RLS Policies for forum_posts (public read, authenticated write)
CREATE POLICY "Anyone can view posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can update their own posts" ON forum_posts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors can delete their own posts" ON forum_posts FOR DELETE USING (author_id = auth.uid());

-- RLS Policies for forum_votes (users can manage their own votes)
CREATE POLICY "Users can view all votes" ON forum_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create votes" ON forum_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON forum_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON forum_votes FOR DELETE USING (auth.uid() = user_id);

-- Function to update thread reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads 
    SET reply_count = reply_count + 1, updated_at = NOW()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads 
    SET reply_count = GREATEST(reply_count - 1, 0), updated_at = NOW()
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update reply count
CREATE TRIGGER update_thread_reply_count_trigger
AFTER INSERT OR DELETE ON forum_posts
FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Insert default categories
INSERT INTO forum_categories (name, description, icon) VALUES
  ('General', 'General discussion about RMG projects', '💬'),
  ('LDGR', 'Discuss LDGR secure file storage', '🔒'),
  ('OMNI', 'Talk about OMNI features', '🌐'),
  ('SCRP', 'Web scraping discussions', '🕷️'),
  ('WSPR', 'WSPR related topics', '📡'),
  ('STONKS', 'Market analysis and trading', '📈'),
  ('Support', 'Get help and support', '🆘'),
  ('Announcements', 'Official announcements', '📢')
ON CONFLICT DO NOTHING;

-- User Roles Table for Admin System
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view roles" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Only admins can insert roles" ON user_roles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Only admins can update roles" ON user_roles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Only admins can delete roles" ON user_roles FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_id_param AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_id_param AND (is_admin = true OR is_moderator = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update forum RLS policies to allow admin/moderator actions
DROP POLICY IF EXISTS "Authors can update their own threads" ON forum_threads;
DROP POLICY IF EXISTS "Authors can delete their own threads" ON forum_threads;

CREATE POLICY "Authors and admins can update threads" ON forum_threads FOR UPDATE USING (
  author_id = auth.uid() OR is_admin(auth.uid())
);

CREATE POLICY "Authors and admins can delete threads" ON forum_threads FOR DELETE USING (
  author_id = auth.uid() OR is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Authors can update their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON forum_posts;

CREATE POLICY "Authors and admins can update posts" ON forum_posts FOR UPDATE USING (
  author_id = auth.uid() OR is_admin(auth.uid())
);

CREATE POLICY "Authors and admins can delete posts" ON forum_posts FOR DELETE USING (
  author_id = auth.uid() OR is_admin(auth.uid())
);

-- Add admin-only policy for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON forum_categories;
CREATE POLICY "Anyone can view categories" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON forum_categories FOR ALL USING (is_admin(auth.uid()));

-- Function to automatically create user_role on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
  VALUES (
    NEW.id, 
    NEW.email,
    -- Set admin flag if email matches
    NEW.email = 'roninmediacollective@proton.me',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Manually set admin for existing user (run this after creating the table)
-- This will be executed when the admin account signs in
-- INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
-- SELECT id, email, true, true FROM auth.users WHERE email = 'roninmediacollective@proton.me'
-- ON CONFLICT (user_id) DO UPDATE SET is_admin = true, is_moderator = true;

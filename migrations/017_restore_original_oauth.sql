-- Restore original OAuth configuration
-- This reverts to the original admin schema setup

-- Step 1: Drop all current policies on user_roles
DROP POLICY IF EXISTS "Allow user role creation" ON user_roles;
DROP POLICY IF EXISTS "Admins and system can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can view roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Authors and admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Authors and admins can delete roles" ON user_roles;

-- Step 2: Recreate ORIGINAL policies from supabase-admin-schema.sql
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

-- Step 3: Ensure the trigger function has SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER  -- This is critical - bypasses RLS
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.email = 'roninmediacollective@proton.me',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Verify setup
SELECT 'Policies:' as check_type;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_roles' ORDER BY policyname;

SELECT 'Trigger:' as check_type;
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

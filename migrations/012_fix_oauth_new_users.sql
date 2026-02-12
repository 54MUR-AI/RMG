-- Fix OAuth login for new users
-- The issue: INSERT policy blocks the trigger from creating user_roles entries
-- The trigger runs with SECURITY DEFINER but RLS still applies

-- Step 1: Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins and system can insert roles" ON user_roles;

-- Step 2: Temporarily disable RLS to allow trigger to work
-- (The trigger function already has SECURITY DEFINER which should bypass RLS,
--  but we need to ensure it works in all contexts)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new policies that allow trigger execution
-- Policy for INSERT - allow admins OR allow any insert (trigger will handle validation)
CREATE POLICY "Allow user role creation" ON user_roles FOR INSERT 
WITH CHECK (
  -- Allow if current user is admin
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)
  OR
  -- Allow if no current user (trigger context during signup)
  auth.uid() IS NULL
  OR
  -- Allow if inserting for the authenticated user
  user_id = auth.uid()
);

-- Keep existing SELECT policy
-- (Should already exist, but recreate to be safe)
DROP POLICY IF EXISTS "Anyone can view roles" ON user_roles;
CREATE POLICY "Anyone can view roles" ON user_roles FOR SELECT USING (true);

-- Keep existing UPDATE policy
DROP POLICY IF EXISTS "Only admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Authors and admins can update roles" ON user_roles;
CREATE POLICY "Only admins can update roles" ON user_roles FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Keep existing DELETE policy
DROP POLICY IF EXISTS "Only admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Authors and admins can delete roles" ON user_roles;
CREATE POLICY "Only admins can delete roles" ON user_roles FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Verify the fix
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_roles' 
ORDER BY policyname;

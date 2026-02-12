-- Simulate what happens during OAuth signup
-- This will test if the trigger and policies actually work together

-- Step 1: Check current RLS setting on user_roles
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_roles';

-- Step 2: Try to manually insert a test user_role (as if the trigger is running)
-- This should work if RLS policies are correct
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test_oauth_user@example.com';
BEGIN
  -- Try to insert as the trigger would
  INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
  VALUES (test_user_id, test_email, false, false);
  
  RAISE NOTICE 'SUCCESS: Test user_role created with ID %', test_user_id;
  
  -- Clean up the test
  DELETE FROM user_roles WHERE user_id = test_user_id;
  RAISE NOTICE 'Test user_role cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FAILED: %', SQLERRM;
END $$;

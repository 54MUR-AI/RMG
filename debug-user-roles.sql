-- Debug: Check if user_roles table exists and has data
SELECT COUNT(*) as user_roles_count FROM user_roles;

-- Check auth.users to see actual accounts
SELECT 
  id as user_id,
  email,
  created_at,
  raw_user_meta_data->>'preferred_username' as github_username,
  raw_user_meta_data->>'name' as github_name,
  raw_user_meta_data->>'email' as github_email
FROM auth.users
ORDER BY created_at;

-- Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_roles';

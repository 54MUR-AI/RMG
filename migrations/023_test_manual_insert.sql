-- Test if we can manually insert into user_roles
-- This will help us understand if the issue is RLS or something else

-- First, check if there are any recent auth.users entries
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check if those users have user_roles entries
SELECT 
  ur.user_id,
  ur.email,
  ur.is_admin,
  ur.created_at,
  au.email as auth_email
FROM user_roles ur
FULL OUTER JOIN auth.users au ON ur.user_id = au.id
ORDER BY COALESCE(ur.created_at, au.created_at) DESC
LIMIT 10;

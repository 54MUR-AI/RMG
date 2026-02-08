-- Check current user roles and find the GitHub OAuth account
-- Run this to see all users and their admin status

SELECT 
  ur.user_id,
  ur.email,
  ur.is_admin,
  ur.is_moderator,
  ur.user_id_number,
  au.created_at,
  au.raw_user_meta_data->>'preferred_username' as github_username,
  au.raw_user_meta_data->>'name' as github_name
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at;

-- If you need to grant admin to a specific user, use:
-- UPDATE user_roles 
-- SET is_admin = true, is_moderator = true 
-- WHERE email = 'roninmediacollective@proton.me';

-- Or by user_id if you know it:
-- UPDATE user_roles 
-- SET is_admin = true, is_moderator = true 
-- WHERE user_id = 'YOUR_USER_ID_HERE';

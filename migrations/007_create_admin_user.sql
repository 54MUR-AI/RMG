-- Create admin user_roles entry
-- Replace 'YOUR_USER_ID' with your actual user_id from auth.users query
-- Replace 'YOUR_EMAIL' with your actual email from auth.users query

INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
VALUES (
  'YOUR_USER_ID',  -- Replace with your user_id from debug-user-roles.sql results
  'YOUR_EMAIL',     -- Replace with your email from debug-user-roles.sql results
  true,             -- is_admin
  true              -- is_moderator
)
ON CONFLICT (user_id) DO UPDATE
SET is_admin = true, is_moderator = true;

-- Verify it worked
SELECT 
  user_id,
  email,
  is_admin,
  is_moderator,
  user_id_number,
  created_at
FROM user_roles
WHERE is_admin = true;

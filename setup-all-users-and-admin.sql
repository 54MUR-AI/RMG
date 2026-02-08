-- Create user_roles entries for all existing users
-- This will trigger the auto-assign of user_id_numbers

-- Insert all users from auth.users into user_roles
INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
SELECT 
  id,
  COALESCE(email, raw_user_meta_data->>'email'),
  false,  -- Default to non-admin
  false   -- Default to non-moderator
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Grant admin privileges to the 54MUR-AI account
UPDATE user_roles 
SET is_admin = true, is_moderator = true 
WHERE user_id = 'd5bf8d03-b60b-4920-8368-3aab05641707';

-- Verify all users were created with their ID numbers
SELECT 
  ur.user_id,
  ur.email,
  ur.is_admin,
  ur.is_moderator,
  ur.user_id_number,
  au.raw_user_meta_data->>'preferred_username' as github_username,
  au.raw_user_meta_data->>'name' as name
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.user_id_number;

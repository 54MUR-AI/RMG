-- Migration: Add unique user ID numbers for tracking
-- This allows users to change display names while admins can track them

-- Add user_id_number column to user_roles table
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS user_id_number INTEGER UNIQUE;

-- Create sequence for auto-incrementing user IDs
CREATE SEQUENCE IF NOT EXISTS user_id_sequence START 1;

-- Backfill existing users with sequential IDs based on creation order
-- Uses auth.users.created_at to determine order
WITH ordered_users AS (
  SELECT 
    ur.user_id,
    ROW_NUMBER() OVER (ORDER BY au.created_at) as id_number
  FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE ur.user_id_number IS NULL
)
UPDATE user_roles ur
SET user_id_number = ou.id_number
FROM ordered_users ou
WHERE ur.user_id = ou.user_id;

-- Update sequence to continue from highest existing ID
SELECT setval('user_id_sequence', COALESCE((SELECT MAX(user_id_number) FROM user_roles), 0) + 1, false);

-- Create function to auto-assign user ID number on new user creation
CREATE OR REPLACE FUNCTION assign_user_id_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if user_id_number is not already set
  IF NEW.user_id_number IS NULL THEN
    NEW.user_id_number := nextval('user_id_sequence');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign user ID number
DROP TRIGGER IF EXISTS assign_user_id_number_trigger ON user_roles;
CREATE TRIGGER assign_user_id_number_trigger
  BEFORE INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_id_number();

-- Add comment for documentation
COMMENT ON COLUMN user_roles.user_id_number IS 'Unique sequential ID number for admin tracking. Permanent and unchangeable, allows users to change display names freely.';

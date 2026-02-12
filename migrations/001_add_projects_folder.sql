-- Add "Projects" folder for all existing users
-- This folder will be used by omni-lite for file creation

-- Insert Projects folder for all existing users who don't have one
INSERT INTO folders (id, user_id, name, parent_id, display_order, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    'Projects',
    NULL,
    4, -- Display order after Documents, Images, Scrapes
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM folders f 
    WHERE f.user_id = u.id 
    AND f.name = 'Projects'
    AND f.parent_id IS NULL
);

-- Update handle_new_user trigger to include Projects folder
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create user_roles entry
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default folders
  INSERT INTO folders (user_id, name, parent_id, display_order)
  VALUES 
    (NEW.id, 'Documents', NULL, 1),
    (NEW.id, 'Images', NULL, 2),
    (NEW.id, 'Scrapes', NULL, 3),
    (NEW.id, 'Projects', NULL, 4);
  
  RETURN NEW;
END;
$$;

-- Verify the results
SELECT 
    u.email,
    COUNT(f.id) as folder_count,
    STRING_AGG(f.name, ', ' ORDER BY f.display_order) as folders
FROM auth.users u
LEFT JOIN folders f ON f.user_id = u.id AND f.parent_id IS NULL
GROUP BY u.id, u.email
ORDER BY u.email;

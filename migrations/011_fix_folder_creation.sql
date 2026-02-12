-- COMPREHENSIVE FIX: Folder creation for new and existing users
-- This ensures folders are created ONLY in the database trigger, not in frontend code
-- Order: Projects, Scrapes, Documents, Images

-- Step 1: Add Projects folder to all existing users who don't have it
INSERT INTO folders (id, user_id, name, parent_id, display_order, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    'Projects',
    NULL,
    1, -- Projects is now first
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM folders f 
    WHERE f.user_id = u.id 
    AND f.name = 'Projects'
    AND f.parent_id IS NULL
);

-- Step 2: Update display_order for existing folders to match new order
-- Projects = 1, Scrapes = 2, Documents = 3, Images = 4
UPDATE folders SET display_order = 1 WHERE name = 'Projects' AND parent_id IS NULL;
UPDATE folders SET display_order = 2 WHERE name = 'Scrapes' AND parent_id IS NULL;
UPDATE folders SET display_order = 3 WHERE name = 'Documents' AND parent_id IS NULL;
UPDATE folders SET display_order = 4 WHERE name = 'Images' AND parent_id IS NULL;

-- Step 3: Update handle_new_user trigger to create ALL folders in correct order
-- This is the ONLY place folders should be created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create user_roles entry
  INSERT INTO user_roles (user_id, email, is_admin, is_moderator)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.email = 'roninmediacollective@proton.me',
    false
  );
  
  -- Create default folders in correct order: Projects, Scrapes, Documents, Images
  INSERT INTO folders (user_id, name, parent_id, display_order)
  VALUES 
    (NEW.id, 'Projects', NULL, 1),
    (NEW.id, 'Scrapes', NULL, 2),
    (NEW.id, 'Documents', NULL, 3),
    (NEW.id, 'Images', NULL, 4);
  
  RETURN NEW;
END;
$$;

-- Step 4: Verify the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Verify the results
SELECT 
    u.email,
    COUNT(f.id) as folder_count,
    STRING_AGG(f.name, ', ' ORDER BY f.display_order) as folders
FROM auth.users u
LEFT JOIN folders f ON f.user_id = u.id AND f.parent_id IS NULL
GROUP BY u.id, u.email
ORDER BY u.email;

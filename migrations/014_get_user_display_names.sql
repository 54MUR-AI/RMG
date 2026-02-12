-- Function to get user display names for admin panel
-- This allows admins to fetch display names from auth.users metadata

CREATE OR REPLACE FUNCTION get_user_display_names()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return display names from auth.users metadata
  RETURN QUERY
  SELECT 
    au.id as user_id,
    COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)) as display_name
  FROM auth.users au;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_display_names() TO authenticated;

-- Add is_active column to admin_users view
DROP VIEW IF EXISTS admin_users;

CREATE OR REPLACE VIEW admin_users AS
SELECT 
  p.id,
  p.role,
  u.email,
  u.created_at,
  u.confirmed_at,
  u.last_sign_in_at,
  NOT u.banned AS is_active
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('standard_admin', 'global_admin')
  AND p.id != auth.uid()
ORDER BY u.created_at DESC;

-- Create function to toggle user activation
CREATE OR REPLACE FUNCTION toggle_user_activation(user_id UUID, is_active BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the executing user is a global admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'global_admin'
  ) THEN
    RAISE EXCEPTION 'Only global admins can modify user activation status';
  END IF;

  -- Update the user's banned status (inverse of is_active)
  UPDATE auth.users
  SET banned = NOT is_active
  WHERE id = user_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION toggle_user_activation TO authenticated;
-- Create function to update user role
CREATE OR REPLACE FUNCTION update_user_role(user_id UUID, new_role TEXT)
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
    RAISE EXCEPTION 'Only global admins can update user roles';
  END IF;

  -- Validate the new role
  IF new_role NOT IN ('global_admin', 'standard_admin') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- Update the user's role in profiles
  UPDATE profiles 
  SET role = new_role,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_role TO authenticated;
-- Create function to delete a user
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
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
    RAISE EXCEPTION 'Only global admins can delete users';
  END IF;

  -- Delete the user's profile first (this will cascade to related data)
  DELETE FROM profiles WHERE id = user_id;
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION delete_user TO authenticated;
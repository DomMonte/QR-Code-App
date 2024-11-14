-- Create a function to check if a user is a global admin
CREATE OR REPLACE FUNCTION is_global_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'global_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle user invitations
CREATE OR REPLACE FUNCTION handle_user_invitation()
RETURNS trigger AS $$
BEGIN
  IF NOT is_global_admin() THEN
    RAISE EXCEPTION 'Only global admins can invite users';
  END IF;
  
  -- Set the role in the user's metadata
  NEW.raw_user_meta_data = jsonb_set(
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(COALESCE(NEW.raw_user_meta_data->>'role', 'standard_admin'))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user invitations
DROP TRIGGER IF EXISTS on_auth_user_invited ON auth.users;
CREATE TRIGGER on_auth_user_invited
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS NOT NULL)
  EXECUTE FUNCTION handle_user_invitation();

-- Update the profiles trigger to use metadata role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    new.id,
    COALESCE(
      (new.raw_user_meta_data->>'role')::text,
      'standard_admin'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
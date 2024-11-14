-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS is_global_admin();

-- Create function to check if user is global admin
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

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if the user already has a profile
  IF EXISTS (SELECT 1 FROM profiles WHERE id = new.id) THEN
    RETURN new;
  END IF;

  -- Insert new profile with role from metadata or default to standard_admin
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

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update profiles policies
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create admin view with proper permissions
DROP VIEW IF EXISTS admin_users;
CREATE VIEW admin_users AS
SELECT 
  p.id,
  p.role,
  u.email,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('standard_admin', 'global_admin')
  AND p.id != auth.uid();

-- Grant access to the view
GRANT SELECT ON admin_users TO authenticated;
-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_invited ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_invitation();
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

-- Update RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow all authenticated users to view profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow service role to insert profiles
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update admin_users view
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

-- Grant permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON profiles TO postgres;

-- Enable realtime for profiles
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
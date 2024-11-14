-- Enable postgres role to manage auth.users
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;
GRANT ALL ON auth.users TO service_role;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_invitation();

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::text,
      'standard_admin'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Create new policies
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage profiles"
ON profiles USING (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO service_role;
GRANT ALL ON profiles TO postgres;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

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

GRANT SELECT ON admin_users TO authenticated;
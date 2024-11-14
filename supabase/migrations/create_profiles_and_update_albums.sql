-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('global_admin', 'standard_admin', 'guest')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add created_by column to albums
ALTER TABLE albums 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Enable insert for service role"
ON profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Albums policies
CREATE POLICY "Anyone can view albums"
ON albums FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create albums"
ON albums FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Global admins can manage all albums"
ON albums FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'global_admin'
  )
);

CREATE POLICY "Standard admins can manage their own albums"
ON albums FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'standard_admin'
    AND created_by = auth.uid()
  )
);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'standard_admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create new policies
CREATE POLICY "Enable insert for service role"
ON profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
USING (auth.uid() = id);
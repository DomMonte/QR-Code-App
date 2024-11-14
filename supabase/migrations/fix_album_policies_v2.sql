-- First, drop all existing album policies
DROP POLICY IF EXISTS "Anyone can view albums" ON albums;
DROP POLICY IF EXISTS "Authenticated users can create albums" ON albums;
DROP POLICY IF EXISTS "Global admins can manage all albums" ON albums;
DROP POLICY IF EXISTS "Standard admins can manage their own albums" ON albums;

-- Create simplified policies for albums
CREATE POLICY "Global admins full access"
ON albums FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'global_admin'::text
  )
);

CREATE POLICY "Standard admins own albums"
ON albums FOR ALL
TO authenticated
USING (
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'standard_admin'::text
    )
    AND albums.created_by = auth.uid()
  )
);

CREATE POLICY "Public view albums"
ON albums FOR SELECT
USING (true);
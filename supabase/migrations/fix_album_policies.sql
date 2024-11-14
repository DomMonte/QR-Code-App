-- Drop existing policies
DROP POLICY IF EXISTS "Global admins can manage all albums" ON albums;
DROP POLICY IF EXISTS "Standard admins can manage their own albums" ON albums;

-- Recreate album policies with fixed conditions
CREATE POLICY "Global admins can manage all albums"
ON albums FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'global_admin'
  )
);

CREATE POLICY "Standard admins can manage their own albums"
ON albums FOR ALL
TO authenticated
USING (
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'standard_admin'
    )
    AND albums.created_by = auth.uid()
  )
);
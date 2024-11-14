-- Update the global admin policy to allow assigning albums
DROP POLICY IF EXISTS "Global admins full access" ON albums;

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
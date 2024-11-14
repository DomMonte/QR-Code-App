-- Create a view for admin users
CREATE OR REPLACE VIEW admin_users AS
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
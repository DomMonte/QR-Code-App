-- Drop existing view
DROP VIEW IF EXISTS admin_users;

-- Create view for all admin users except the current user
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  p.id,
  p.role,
  u.email,
  u.created_at,
  u.confirmed_at,
  u.last_sign_in_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('standard_admin', 'global_admin')
  AND p.id != auth.uid()
ORDER BY u.created_at DESC;

-- Grant access to the view
GRANT SELECT ON admin_users TO authenticated;
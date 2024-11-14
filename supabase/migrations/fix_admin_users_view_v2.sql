-- Drop existing view
DROP VIEW IF EXISTS admin_users;

-- Create view for all users except the current user
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  u.id,
  p.role,
  u.email,
  u.created_at,
  u.confirmed_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.id != auth.uid()
  AND p.role IN ('standard_admin', 'global_admin')
ORDER BY u.created_at DESC;

-- Grant access to the view
GRANT SELECT ON admin_users TO authenticated;
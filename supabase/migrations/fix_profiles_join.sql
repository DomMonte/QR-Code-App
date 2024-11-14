-- Drop existing view if it exists
DROP VIEW IF EXISTS admin_users;

-- Create view for standard admins only
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  p.id,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'standard_admin';

-- Grant access to the view
GRANT SELECT ON admin_users TO authenticated;
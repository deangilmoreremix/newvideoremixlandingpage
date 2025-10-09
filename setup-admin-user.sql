-- Setup Admin User: dean@videoremix.vip
-- This script creates the admin user with proper authentication and role

-- First, create the user in auth.users with a password
-- Note: In production, use Supabase CLI or dashboard to create users with passwords
-- For development/testing, you can use the admin-auth signup endpoint

-- After creating the user, assign the super_admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'dean@videoremix.vip'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  updated_at = NOW();

-- Verify the setup
SELECT
  u.email,
  ur.role,
  u.created_at,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'dean@videoremix.vip';
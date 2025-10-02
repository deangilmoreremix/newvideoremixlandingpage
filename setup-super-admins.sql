-- Setup Super Admin Users
-- Run this SQL script to create super admin accounts for the specified users

-- Insert super admin users (they will need to set their passwords via the signup flow)
INSERT INTO auth.users (email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES
  ('dean@videoremix.vip', NOW(), NOW(), NOW(), '{"role": "super_admin", "first_name": "Dean", "last_name": "Admin"}'::jsonb),
  ('samuel@videoremix.vip', NOW(), NOW(), NOW(), '{"role": "super_admin", "first_name": "Samuel", "last_name": "Admin"}'::jsonb),
  ('victor@videoremix.vip', NOW(), NOW(), NOW(), '{"role": "super_admin", "first_name": "Victor", "last_name": "Admin"}'::jsonb)
ON CONFLICT (email) DO UPDATE SET
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Note: These users will need to complete the signup process to set their passwords
-- They can do this by going to /admin/signup with their email addresses
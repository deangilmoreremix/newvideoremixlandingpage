-- Add first_name and last_name columns to app_users table
ALTER TABLE app_users
ADD COLUMN first_name VARCHAR(255),
ADD COLUMN last_name VARCHAR(255);

-- Update existing records to split name into first_name and last_name if needed
-- This is optional and can be done manually if there are existing users

-- Create indexes for the new columns
CREATE INDEX idx_app_users_first_name ON app_users(first_name);
CREATE INDEX idx_app_users_last_name ON app_users(last_name);
/*
  # Create Apps Management System

  1. New Tables
    - `apps`
      - `id` (uuid, primary key)
      - `name` (text) - Application name
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text) - App description
      - `category` (text) - App category
      - `icon_url` (text) - Icon image URL
      - `is_active` (boolean) - Whether app is active
      - `is_featured` (boolean) - Whether app is featured
      - `sort_order` (integer) - Display order
      - `deployment_url` (text) - External deployment URL
      - `domain` (text) - Custom domain
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `apps` table
    - Add policy for public read access to active apps
    - Add policy for authenticated admin users to manage apps
*/

CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  icon_url text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  deployment_url text,
  domain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Public can view active apps
CREATE POLICY "Anyone can view active apps"
  ON apps
  FOR SELECT
  USING (is_active = true);

-- Admins can view all apps
CREATE POLICY "Admins can view all apps"
  ON apps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- Admins can insert apps
CREATE POLICY "Admins can insert apps"
  ON apps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- Admins can update apps
CREATE POLICY "Admins can update apps"
  ON apps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- Admins can delete apps
CREATE POLICY "Admins can delete apps"
  ON apps
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_apps_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_is_active ON apps(is_active);
CREATE INDEX IF NOT EXISTS idx_apps_sort_order ON apps(sort_order);
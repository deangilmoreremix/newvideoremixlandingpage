-- Migration: Add Images Table and Enhanced User Access Views
-- Created: 2025-10-30

-- Create images table for storing image metadata
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text,
  description text,
  original_filename text NOT NULL,
  storage_path text NOT NULL, -- Supabase Storage path
  file_size bigint,
  mime_type text,
  width integer,
  height integer,
  alt_text text,
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add storage_path column to videos table (if not already added)
ALTER TABLE videos ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create indexes for images
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_storage_path ON images(storage_path);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);

-- Create indexes for videos (if not already exist)
CREATE INDEX IF NOT EXISTS idx_videos_storage_path ON videos(storage_path);

-- Enable RLS for images table
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  false,
  104857600, -- 100MB limit per image
  ARRAY['image/*']::text[]
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for images storage bucket
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for images table
CREATE POLICY "Users can read own images"
  ON images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
  ON images FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create enhanced user access views
CREATE OR REPLACE VIEW v_user_accessible_products AS
SELECT
  uaa.user_id,
  uaa.app_slug,
  uaa.access_type,
  uaa.granted_at,
  uaa.expires_at,
  uaa.is_active,
  pc.name as product_name,
  pc.description as product_description,
  pc.product_type,
  p.purchase_date,
  p.amount,
  p.currency
FROM user_app_access uaa
LEFT JOIN purchases p ON uaa.purchase_id = p.id
LEFT JOIN products_catalog pc ON p.product_id = pc.id
WHERE uaa.is_active = true
AND (uaa.expires_at IS NULL OR uaa.expires_at > now());

-- Create a comprehensive user entitlements view
CREATE OR REPLACE VIEW v_user_entitlements AS
SELECT
  ua.user_id,
  pc.id as product_id,
  pc.name as product_name,
  pc.slug as product_slug,
  pc.description,
  pc.product_type,
  pc.apps_granted,
  ua.access_type,
  ua.granted_at,
  ua.expires_at,
  ua.is_active,
  p.purchase_date,
  p.amount,
  p.currency
FROM user_app_access ua
JOIN products_catalog pc ON ua.app_slug = ANY(pc.apps_granted)
LEFT JOIN purchases p ON ua.purchase_id = p.id
WHERE ua.is_active = true
AND (ua.expires_at IS NULL OR ua.expires_at > now());

-- Create a view for user media files (images and videos)
CREATE OR REPLACE VIEW v_user_media AS
SELECT
  'image' as media_type,
  i.id,
  i.user_id,
  i.title,
  i.description,
  i.original_filename,
  i.storage_path,
  i.file_size,
  i.mime_type,
  i.width,
  i.height,
  i.status,
  i.created_at,
  i.updated_at
FROM images i
WHERE i.status != 'failed'

UNION ALL

SELECT
  'video' as media_type,
  v.id,
  v.user_id,
  v.title,
  v.description,
  v.original_filename,
  v.storage_path,
  v.file_size,
  v.mime_type,
  NULL as width,
  NULL as height,
  v.status,
  v.created_at,
  v.updated_at
FROM videos v
WHERE v.status != 'failed';

-- Create utility functions for user access management
CREATE OR REPLACE FUNCTION get_user_accessible_apps(user_uuid uuid)
RETURNS TABLE(
  app_slug text,
  access_type text,
  expires_at timestamptz,
  product_name text,
  product_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uaa.app_slug,
    uaa.access_type,
    uaa.expires_at,
    pc.name,
    pc.product_type
  FROM user_app_access uaa
  LEFT JOIN purchases p ON uaa.purchase_id = p.id
  LEFT JOIN products_catalog pc ON p.product_id = pc.id
  WHERE uaa.user_id = user_uuid
  AND uaa.is_active = true
  AND (uaa.expires_at IS NULL OR uaa.expires_at > now());
END;
$$;

-- Function to check if user has access to specific app
CREATE OR REPLACE FUNCTION user_has_app_access(user_uuid uuid, app_slug_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_app_access uaa
    WHERE uaa.user_id = user_uuid
    AND uaa.app_slug = app_slug_param
    AND uaa.is_active = true
    AND (uaa.expires_at IS NULL OR uaa.expires_at > now())
  );
END;
$$;

-- Function to get user's product access summary
CREATE OR REPLACE FUNCTION get_user_product_summary(user_uuid uuid)
RETURNS TABLE(
  product_name text,
  product_type text,
  apps_count bigint,
  access_type text,
  expires_at timestamptz,
  purchase_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.name,
    pc.product_type,
    array_length(pc.apps_granted, 1)::bigint,
    uaa.access_type,
    uaa.expires_at,
    p.purchase_date
  FROM user_app_access uaa
  JOIN products_catalog pc ON uaa.app_slug = ANY(pc.apps_granted)
  LEFT JOIN purchases p ON uaa.purchase_id = p.id
  WHERE uaa.user_id = user_uuid
  AND uaa.is_active = true
  AND (uaa.expires_at IS NULL OR uaa.expires_at > now())
  GROUP BY pc.id, pc.name, pc.product_type, pc.apps_granted, uaa.access_type, uaa.expires_at, p.purchase_date;
END;
$$;

-- Create trigger for updated_at on images table
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE images IS 'User uploaded images with metadata and storage references';
COMMENT ON COLUMN images.storage_path IS 'Path to file in Supabase Storage images bucket';
COMMENT ON VIEW v_user_accessible_products IS 'View of all products/apps a user currently has access to';
COMMENT ON VIEW v_user_entitlements IS 'Comprehensive view of user product entitlements with app access';
COMMENT ON VIEW v_user_media IS 'Unified view of user images and videos';
COMMENT ON FUNCTION get_user_accessible_apps(uuid) IS 'Returns all apps a user has access to with product details';
COMMENT ON FUNCTION user_has_app_access(uuid, text) IS 'Checks if a user has access to a specific app';
COMMENT ON FUNCTION get_user_product_summary(uuid) IS 'Returns a summary of user product access';
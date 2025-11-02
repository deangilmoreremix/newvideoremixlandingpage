-- Migration: Create videos storage bucket and policies
-- Created: 2025-10-29

-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  524288000, -- 500MB limit
  ARRAY['video/*']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for videos bucket
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add storage_path column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_videos_storage_path ON videos(storage_path);
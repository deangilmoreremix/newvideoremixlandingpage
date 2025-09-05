/*
  # Edge Function Support Tables

  1. New Tables
    - `contact_submissions` - Store contact form submissions
    - `newsletter_subscribers` - Newsletter signups
    - `video_metadata` - Store processed video metadata
    - `personalization_events` - Track content personalization events

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and service role
*/

-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  company text,
  status text DEFAULT 'new',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contact submissions" 
  ON contact_submissions 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Service role can manage contact submissions" 
  ON contact_submissions 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  interests text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view newsletter subscribers" 
  ON newsletter_subscribers 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Service role can manage newsletter subscribers" 
  ON newsletter_subscribers 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Video metadata table
CREATE TABLE IF NOT EXISTS video_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text NOT NULL,
  thumbnail_url text,
  title text NOT NULL,
  description text,
  duration integer DEFAULT 0,
  processed boolean DEFAULT false,
  processing_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE video_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view processed video metadata" 
  ON video_metadata 
  FOR SELECT 
  TO public 
  USING (processed = true);

CREATE POLICY "Authenticated users can view all video metadata" 
  ON video_metadata 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Service role can manage video metadata" 
  ON video_metadata 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Personalization events tracking
CREATE TABLE IF NOT EXISTS personalization_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid,
  device text,
  location text,
  content_served jsonb NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE personalization_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage personalization events" 
  ON personalization_events 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can see their own personalization events" 
  ON personalization_events 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- Update functions for updated_at fields
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON contact_submissions
FOR EACH ROW EXECUTE PROCEDURE update_contact_submissions_updated_at();

CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_newsletter_subscribers_updated_at
BEFORE UPDATE ON newsletter_subscribers
FOR EACH ROW EXECUTE PROCEDURE update_newsletter_subscribers_updated_at();

CREATE OR REPLACE FUNCTION update_video_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_metadata_updated_at
BEFORE UPDATE ON video_metadata
FOR EACH ROW EXECUTE PROCEDURE update_video_metadata_updated_at();
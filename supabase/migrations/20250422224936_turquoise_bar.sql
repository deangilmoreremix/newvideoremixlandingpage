/*
  # Create landing page content tables

  1. New Tables
    - `hero_content` - Hero section content
    - `benefits_features` - Benefits and features content
    - `testimonials` - Update to add enabled column

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create hero_content table
CREATE TABLE IF NOT EXISTS hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL,
  description text NOT NULL,
  primary_button_text text NOT NULL,
  primary_button_url text NOT NULL,
  secondary_button_text text NOT NULL,
  secondary_button_url text NOT NULL,
  background_image_url text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage hero content"
  ON hero_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
  
CREATE POLICY "Allow public to view hero content"
  ON hero_content
  FOR SELECT
  TO public
  USING (enabled = true);

-- Create benefits_features table
CREATE TABLE IF NOT EXISTS benefits_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  stats jsonb DEFAULT '[]'::jsonb,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE benefits_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage benefits"
  ON benefits_features
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
  
CREATE POLICY "Allow public to view benefits"
  ON benefits_features
  FOR SELECT
  TO public
  USING (enabled = true);

-- Update testimonials table to add enabled column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'testimonials' 
    AND column_name = 'enabled'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN enabled boolean DEFAULT true;
  END IF;
END $$;

-- Make sure RLS is enabled on testimonials table
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Add or update RLS policies for testimonials
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'testimonials' 
    AND policyname = 'Allow authenticated users to manage testimonials'
  ) THEN
    CREATE POLICY "Allow authenticated users to manage testimonials"
      ON testimonials
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'testimonials' 
    AND policyname = 'Allow public to view testimonials'
  ) THEN
    CREATE POLICY "Allow public to view testimonials"
      ON testimonials
      FOR SELECT
      TO public
      USING (enabled = true);
  END IF;
END $$;

-- Add featured column to testimonials if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'testimonials' 
    AND column_name = 'featured'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;
/*
  # AI and API Usage Tables
  
  1. New Tables
    - `ai_settings` - Store user AI provider settings
    - `api_usage` - Track API calls and usage metrics
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
    - Create indexes for performance
*/

-- Create AI settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key text,
  gemini_api_key text,
  default_provider text DEFAULT 'auto' CHECK (default_provider IN ('openai', 'gemini', 'auto')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Check if policy exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_settings' 
    AND policyname = 'Users can manage their own AI settings'
  ) THEN
    CREATE POLICY "Users can manage their own AI settings"
      ON ai_settings
      FOR ALL
      TO public
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create API usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('openai', 'gemini', 'supabase')),
  model text,
  input_tokens integer,
  output_tokens integer,
  status text NOT NULL CHECK (status IN ('success', 'error')),
  error_message text,
  request_path text,
  request_body jsonb,
  response_status integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Check if policy exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'api_usage' 
    AND policyname = 'Users can view their own API usage'
  ) THEN
    CREATE POLICY "Users can view their own API usage"
      ON api_usage
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for API usage table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'api_usage_user_id_idx'
  ) THEN
    CREATE INDEX api_usage_user_id_idx ON api_usage(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'api_usage_created_at_idx'
  ) THEN
    CREATE INDEX api_usage_created_at_idx ON api_usage(created_at);
  END IF;
END $$;

-- Create or replace function for updating timestamp
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_ai_settings_updated_at ON ai_settings;
CREATE TRIGGER update_ai_settings_updated_at
BEFORE UPDATE ON ai_settings
FOR EACH ROW EXECUTE FUNCTION update_ai_settings_updated_at();
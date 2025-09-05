/*
  # Landing Page Content Schema

  1. New Tables
    - `hero_content` - For storing hero section content
    - `benefits_features` - For storing benefits and features content
    - `testimonials` - For storing user testimonials
    - `faqs` - For storing frequently asked questions
    - `pricing_plans` - For storing pricing information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage content
    - Add policies for public users to view content
*/

-- Drop existing tables if they exist to avoid schema conflicts
DROP TABLE IF EXISTS hero_content CASCADE;
DROP TABLE IF EXISTS benefits_features CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;

-- Hero Content Table
CREATE TABLE hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  primary_button_text TEXT NOT NULL,
  primary_button_url TEXT NOT NULL,
  secondary_button_text TEXT NOT NULL,
  secondary_button_url TEXT NOT NULL,
  background_image_url TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Benefits and Features Table
CREATE TABLE benefits_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  stats JSONB DEFAULT '[]'::jsonb,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials Table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  image_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  category TEXT,
  featured BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FAQs Table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  list_order INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pricing Plans Table
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can manage hero content"
  ON hero_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage benefits and features"
  ON benefits_features
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage FAQs"
  ON faqs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage pricing plans"
  ON pricing_plans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for public read access
CREATE POLICY "Public can view hero content"
  ON hero_content
  FOR SELECT
  TO public
  USING (enabled = true);

CREATE POLICY "Public can view benefits and features"
  ON benefits_features
  FOR SELECT
  TO public
  USING (enabled = true);

CREATE POLICY "Public can view testimonials"
  ON testimonials
  FOR SELECT
  TO public
  USING (enabled = true);

CREATE POLICY "Public can view FAQs"
  ON faqs
  FOR SELECT
  TO public
  USING (enabled = true);

CREATE POLICY "Public can view pricing plans"
  ON pricing_plans
  FOR SELECT
  TO public
  USING (enabled = true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update_updated_at trigger to all tables
CREATE TRIGGER update_hero_content_updated_at
BEFORE UPDATE ON hero_content
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_benefits_features_updated_at
BEFORE UPDATE ON benefits_features
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON faqs
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_pricing_plans_updated_at
BEFORE UPDATE ON pricing_plans
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Insert sample data for hero content
INSERT INTO hero_content (title, subtitle, description, primary_button_text, primary_button_url, secondary_button_text, secondary_button_url, background_image_url) 
VALUES (
  'Create Professional Videos in Minutes Without Complex Editing Skills',
  'AI-Powered Video Creation Platform',
  'Transform your content with AI-powered tools that make video creation 10X faster and more effective than traditional methods.',
  'Get Started Free',
  '/get-started',
  'Watch Demo',
  '#demo',
  'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
);

-- Insert sample data for benefits and features
INSERT INTO benefits_features (title, description, icon_name, stats) 
VALUES 
(
  'Save 15+ Hours Every Week',
  'Stop wasting time with complex editing. Our AI handles the technical work so you can focus on creativity.',
  'Clock',
  '[{"label": "Average time saved", "value": "87%"}, {"label": "Average video creation time", "value": "15 mins"}]'
),
(
  'Professional-Quality Results',
  'Get stunning videos that look like they were made by a professional editor, regardless of your experience level.',
  'Star',
  '[{"label": "Templates available", "value": "500+"}, {"label": "Quality rating", "value": "4.9/5"}]'
),
(
  'Grow Your Audience Faster',
  'Create more engaging content that attracts viewers and keeps them watching longer.',
  'Users',
  '[{"label": "Average engagement increase", "value": "143%"}, {"label": "Average growth acceleration", "value": "2.7x"}]'
),
(
  'Scale Your Content Creation',
  'Easily repurpose long-form content into multiple short clips perfect for every platform.',
  'Zap',
  '[{"label": "Content output increase", "value": "5x"}, {"label": "Cross-platform optimizations", "value": "Auto"}]'
);

-- Insert sample data for testimonials
INSERT INTO testimonials (content, name, role, company, image_url, rating, category, featured) 
VALUES 
(
  'VideoRemix.io transformed our social media strategy. We''re creating 3x more content in half the time, and our engagement has increased by 200%.',
  'Sarah Johnson',
  'Social Media Manager',
  'Global Marketing Inc.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  5,
  'marketing',
  true
),
(
  'As a YouTuber, editing used to take me days. With VideoRemix.io, I can edit an entire video in just hours, and the quality is even better. Total game-changer!',
  'Marcus Chen',
  'Content Creator',
  'TechReviews Channel',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  5,
  'content-creation',
  true
),
(
  'The AI features in VideoRemix.io are truly next level. It automatically extracted the best clips from our 2-hour webinar for social media. This tool is worth every penny.',
  'Emma Rodriguez',
  'Director of Content',
  'E-Learning Solutions',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  5,
  'education',
  true
);

-- Insert sample data for FAQs
INSERT INTO faqs (question, answer, category, list_order) 
VALUES 
(
  'How does VideoRemix.io work?',
  'VideoRemix.io uses artificial intelligence to automate the video editing process. Upload your footage, choose a template, make any customizations you want, and our AI will handle the tedious parts of editing. You can export the final video in minutes instead of hours.',
  'general',
  1
),
(
  'Do I need any technical skills to use VideoRemix.io?',
  'Not at all! VideoRemix.io is designed for users with zero video editing experience. Our intuitive interface and AI-powered features make it easy for anyone to create professional-looking videos without technical skills.',
  'general',
  2
),
(
  'What types of videos can I create?',
  'You can create virtually any type of video including social media content, marketing videos, product demos, educational content, YouTube videos, testimonials, webinar recordings, and much more. Our template library covers dozens of use cases across all major industries.',
  'general',
  3
),
(
  'Can I use my own branding in the videos?',
  'Absolutely! Pro users can upload their logo, fonts, and color schemes to create a brand kit that can be applied to any template. This ensures all your videos maintain consistent branding.',
  'features',
  4
),
(
  'Is there a limit to the number of videos I can create?',
  'Free accounts can export up to 5 videos per month. Pro accounts have unlimited video exports with no restrictions.',
  'pricing',
  5
);

-- Insert sample data for pricing plans
INSERT INTO pricing_plans (name, price_monthly, price_yearly, description, features, is_popular)
VALUES
(
  'Free',
  0,
  0,
  'Perfect for trying out the platform',
  ARRAY['5 video exports per month', '720p video quality', 'Basic editing features', '2GB cloud storage', 'Standard templates', 'Watermarked videos'],
  false
),
(
  'Pro',
  29,
  290,
  'Ideal for content creators and small teams',
  ARRAY['Unlimited video exports', '4K video quality', 'All editing features', '50GB cloud storage', 'Premium templates', 'No watermarks', 'Basic AI features', 'Auto subtitle generation', '2 team members', 'Priority email support'],
  true
),
(
  'Business',
  79,
  790,
  'For teams and professionals with advanced needs',
  ARRAY['Everything in Pro', '500GB cloud storage', 'All AI features', 'Advanced analytics', 'White-label exports', '10 team members', 'Custom templates', 'API access', 'Dedicated account manager', '24/7 priority support'],
  false
);
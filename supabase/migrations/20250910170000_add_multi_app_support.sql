-- Add multi-app support to existing schema

-- Add app context to features table
ALTER TABLE features ADD COLUMN app_slug VARCHAR(255);

-- Add domain/url tracking to apps table
ALTER TABLE apps ADD COLUMN domain VARCHAR(500);
ALTER TABLE apps ADD COLUMN deployment_url VARCHAR(500);

-- Create app-specific feature toggles
ALTER TABLE app_features ADD COLUMN app_slug VARCHAR(255);

-- Update indexes for better performance
CREATE INDEX idx_features_app_slug ON features(app_slug);
CREATE INDEX idx_app_features_app_slug ON app_features(app_slug);

-- Update RLS policies for multi-app support
DROP POLICY IF EXISTS "Authenticated users can view enabled features" ON features;
DROP POLICY IF EXISTS "Admin users can manage features" ON features;

-- New policies that consider app context
CREATE POLICY "Users can view enabled features for their app" ON features
  FOR SELECT USING (
    is_enabled = true AND (
      app_slug = current_setting('app.current_app', true) OR
      app_slug IS NULL -- Global features
    )
  );

CREATE POLICY "Admin users can manage features" ON features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id::text = auth.uid()::text
    )
  );

-- Update app policies
DROP POLICY IF EXISTS "Authenticated users can view active apps" ON apps;

CREATE POLICY "Users can view active apps for their context" ON apps
  FOR SELECT USING (
    is_active = true AND (
      slug = current_setting('app.current_app', true) OR
      current_setting('app.current_app', true) IS NULL
    )
  );

-- Insert the 19 apps from the provided list
INSERT INTO apps (name, slug, description, category, domain, deployment_url, is_active, is_featured, sort_order) VALUES
('AI Personalized Content', 'ai-personalized-content', 'Personalized content creation with AI', 'content', 'capable-mermaid-3c73fa.netlify.app', 'https://capable-mermaid-3c73fa.netlify.app/', true, false, 1),
('AI Referral Maximizer', 'ai-referral-maximizer', 'Maximize referrals with AI optimization', 'marketing', 'eloquent-kleicha-7e3a3e.netlify.app', 'https://eloquent-kleicha-7e3a3e.netlify.app/', true, false, 2),
('AI Sales Maximizer', 'ai-sales-maximizer', 'Optimize sales with AI insights', 'sales', 'magnificent-lamington-619374.netlify.app', 'https://magnificent-lamington-619374.netlify.app/', true, false, 3),
('AI Screen Recorder', 'ai-screen-recorder', 'Record and enhance screen captures', 'productivity', 'adorable-arithmetic-675d28.netlify.app', 'https://adorable-arithmetic-675d28.netlify.app/', true, false, 4),
('Smart CRM Closer', 'smart-crm-closer', 'Close deals with intelligent CRM automation', 'crm', 'stupendous-twilight-64389a.netlify.app', 'https://stupendous-twilight-64389a.netlify.app/', true, false, 5),
('Video AI Editor', 'video-ai-editor', 'Advanced AI-powered video editing', 'video', 'heroic-seahorse-296f32.netlify.app', 'https://heroic-seahorse-296f32.netlify.app/', true, false, 6),
('AI Video & Image', 'ai-video-image', 'Transform videos and images with AI', 'media', 'thriving-mochi-ecd815.netlify.app', 'https://thriving-mochi-ecd815.netlify.app/', true, false, 7),
('AI Skills Monetizer', 'ai-skills-monetizer', 'Turn skills into profitable businesses', 'business', 'roaring-mochi-39a60a.netlify.app', 'https://roaring-mochi-39a60a.netlify.app/', true, false, 8),
('AI Signature', 'ai-signature', 'Generate professional digital signatures', 'productivity', 'kaleidoscopic-tarsier-3d0a6c.netlify.app', 'https://kaleidoscopic-tarsier-3d0a6c.netlify.app/', true, false, 9),
('AI Template Generator', 'ai-template-generator', 'Create custom templates with AI', 'design', 'cute-khapse-4e62cb.netlify.app', 'https://cute-khapse-4e62cb.netlify.app/', true, false, 10),
('FunnelCraft AI', 'funnelcraft-ai', 'Build high-converting sales funnels', 'marketing', 'serene-valkyrie-fec320.netlify.app', 'https://serene-valkyrie-fec320.netlify.app/', true, false, 11),
('Interactive Shopping', 'interactive-shopping', 'Create engaging shopping experiences', 'ecommerce', 'inspiring-mandazi-d17556.netlify.app', 'https://inspiring-mandazi-d17556.netlify.app/', true, false, 12),
('Personalizer AI Profile Generator', 'personalizer-ai-profile-generator', 'Create optimized profiles for any platform', 'personalization', 'endearing-churros-2ce8c6.netlify.app', 'https://endearing-churros-2ce8c6.netlify.app/', true, false, 13),
('Personalizer AI Video & Image Transformer', 'personalizer-ai-video-image-transformer', 'Transform videos and images with AI', 'media', 'thriving-mochi-ecd815.netlify.app', 'https://thriving-mochi-ecd815.netlify.app/', true, false, 14),
('Personalizer URL Video Generation Templates & Editor', 'personalizer-url-video-generation', 'Generate videos from URLs with templates', 'video', 'cute-khapse-4e62cb.netlify.app', 'https://cute-khapse-4e62cb.netlify.app/', true, false, 15),
('AI Proposal', 'ai-proposal', 'Generate professional proposals with AI', 'business', 'keen-pastelito-6b9074.netlify.app', 'https://keen-pastelito-6b9074.netlify.app/', true, false, 16),
('Sales Assistant App', 'sales-assistant-app', 'Complete AI-powered sales assistant', 'sales', 'gentle-frangipane-ceed17.netlify.app', 'https://gentle-frangipane-ceed17.netlify.app/', true, false, 17),
('Sales Page Builder', 'sales-page-builder', 'Build high-converting sales pages', 'marketing', 'prismatic-starship-c0b4c2.netlify.app', 'https://prismatic-starship-c0b4c2.netlify.app/', true, false, 18);

-- Insert some sample features for each app
INSERT INTO features (name, slug, description, is_enabled, app_slug, config) VALUES
('AI Content Generation', 'ai-content-generation', 'Generate personalized content with AI', true, 'ai-personalized-content', '{"model": "gpt-4", "max_tokens": 2000}'),
('Referral Tracking', 'referral-tracking', 'Track and optimize referral programs', true, 'ai-referral-maximizer', '{"analytics": true}'),
('Sales Analytics', 'sales-analytics', 'Advanced sales performance analytics', true, 'ai-sales-maximizer', '{"dashboard": true}'),
('Screen Recording', 'screen-recording', 'High-quality screen recording capabilities', true, 'ai-screen-recorder', '{"quality": "4k"}'),
('CRM Integration', 'crm-integration', 'Seamless CRM system integration', true, 'smart-crm-closer', '{"sync": true}'),
('Video Editing', 'video-editing', 'Professional video editing tools', true, 'video-ai-editor', '{"auto_edit": true}'),
('Image Processing', 'image-processing', 'Advanced image processing and enhancement', true, 'ai-video-image', '{"filters": ["blur", "sharpen"]}'),
('Monetization Tools', 'monetization-tools', 'Tools to monetize skills and expertise', true, 'ai-skills-monetizer', '{"pricing": true}'),
('Digital Signatures', 'digital-signatures', 'Create and manage digital signatures', true, 'ai-signature', '{"verification": true}'),
('Template Engine', 'template-engine', 'Powerful template generation system', true, 'ai-template-generator', '{"customization": true}'),
('Funnel Builder', 'funnel-builder', 'Drag-and-drop funnel creation', true, 'funnelcraft-ai', '{"ab_testing": true}'),
('Interactive Elements', 'interactive-elements', 'Add interactive components to shopping', true, 'interactive-shopping', '{"animations": true}'),
('Profile Optimization', 'profile-optimization', 'Optimize profiles for better engagement', true, 'personalizer-ai-profile-generator', '{"seo": true}'),
('Media Transformation', 'media-transformation', 'Transform media files with AI', true, 'personalizer-ai-video-image-transformer', '{"batch": true}'),
('URL Processing', 'url-processing', 'Process URLs for video generation', true, 'personalizer-url-video-generation', '{"scraping": true}'),
('Proposal Generation', 'proposal-generation', 'Generate professional proposals', true, 'ai-proposal', '{"templates": ["business", "technical"]}'),
('Sales Automation', 'sales-automation', 'Automate sales processes', true, 'sales-assistant-app', '{"follow_up": true}'),
('Page Builder', 'page-builder', 'Visual page building interface', true, 'sales-page-builder', '{"responsive": true}');

-- Create app-feature relationships
INSERT INTO app_features (app_id, feature_id, is_enabled, app_slug)
SELECT
  a.id,
  f.id,
  true,
  a.slug
FROM apps a
JOIN features f ON f.app_slug = a.slug;
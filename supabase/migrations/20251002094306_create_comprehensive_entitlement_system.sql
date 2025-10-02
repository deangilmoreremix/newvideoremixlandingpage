-- Comprehensive Entitlement System Migration
-- Replaces the simple user_subscriptions table with a full enterprise-grade system

-- Drop existing table (we're replacing it entirely)
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- Products catalog table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,         -- e.g., 'SMARTCRM_FE', 'OTO1_SALES_MAX'
  display_name TEXT NOT NULL,
  tier TEXT,                         -- optional (fe/oto1/oto2/...)
  description TEXT,
  features JSONB DEFAULT '{}'::JSONB, -- What this product unlocks
  price_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- External purchase events from payment providers
CREATE TABLE purchase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe','paypal','zaxaa','paykickstart')),
  provider_event_id TEXT NOT NULL,        -- e.g., Stripe event id, PayPal txn id
  provider_order_id TEXT,                 -- checkout/session/order id
  purchaser_email TEXT NOT NULL,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('paid', 'refunded', 'chargeback', 'cancelled', 'trial', 'pending')),
  raw JSONB NOT NULL,                     -- full payload for audits
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_event_id)
);

-- User entitlements (what the app actually checks)
CREATE TABLE user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_sku TEXT REFERENCES products(sku),
  source_provider TEXT NOT NULL,
  source_txn_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'refunded', 'chargeback', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,                 -- null for lifetime
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_sku)
);

-- Pending entitlements (for purchases before user account creation)
CREATE TABLE pending_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchaser_email TEXT NOT NULL,
  product_sku TEXT REFERENCES products(sku),
  source_provider TEXT NOT NULL,
  source_txn_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  purchase_event_id UUID REFERENCES purchase_events(id),
  claimed_by UUID REFERENCES auth.users(id), -- set when claimed
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product provider mappings (maps external IDs to our SKUs)
CREATE TABLE product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe','paypal','zaxaa','paykickstart')),
  provider_product_id TEXT NOT NULL,      -- e.g., Stripe price ID, PayPal button ID
  product_sku TEXT REFERENCES products(sku),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_product_id)
);

-- Indexes for performance
CREATE INDEX idx_purchase_events_email ON purchase_events(purchaser_email);
CREATE INDEX idx_purchase_events_status ON purchase_events(status);
CREATE INDEX idx_purchase_events_created_at ON purchase_events(created_at DESC);

CREATE INDEX idx_user_entitlements_user_id ON user_entitlements(user_id);
CREATE INDEX idx_user_entitlements_product_sku ON user_entitlements(product_sku);
CREATE INDEX idx_user_entitlements_status ON user_entitlements(status);
CREATE INDEX idx_user_entitlements_expires_at ON user_entitlements(expires_at);

CREATE INDEX idx_pending_entitlements_email ON pending_entitlements(purchaser_email);
CREATE INDEX idx_pending_entitlements_status ON pending_entitlements(status);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_entitlements_updated_at
    BEFORE UPDATE ON user_entitlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_entitlements_updated_at
    BEFORE UPDATE ON pending_entitlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;

-- Products: readable by all authenticated users
CREATE POLICY "Products are readable by authenticated users" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Purchase events: only admins can see
CREATE POLICY "Purchase events are admin only" ON purchase_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- User entitlements: users can see their own
CREATE POLICY "Users can view own entitlements" ON user_entitlements
    FOR SELECT USING (auth.uid() = user_id);

-- Pending entitlements: users can see pending ones matching their email
CREATE POLICY "Users can view pending entitlements for their email" ON pending_entitlements
    FOR SELECT USING (
        purchaser_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND status = 'pending'
        AND claimed_by IS NULL
    );

-- Product mappings: admin only
CREATE POLICY "Product mappings are admin only" ON product_mappings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Useful views
CREATE VIEW v_user_entitlements AS
SELECT
    ue.*,
    p.display_name,
    p.description,
    p.features,
    CASE
        WHEN ue.expires_at IS NULL THEN true
        WHEN ue.expires_at > NOW() THEN true
        ELSE false
    END as is_active
FROM user_entitlements ue
JOIN products p ON p.sku = ue.product_sku
WHERE ue.status = 'active';

CREATE VIEW v_pending_entitlements AS
SELECT
    pe.*,
    p.display_name,
    p.description
FROM pending_entitlements pe
JOIN products p ON p.sku = pe.product_sku
WHERE pe.status = 'pending' AND pe.claimed_by IS NULL;

-- Grant permissions
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON v_user_entitlements TO authenticated;
GRANT SELECT ON v_pending_entitlements TO authenticated;

-- Insert some sample products (you'll want to customize these)
INSERT INTO products (sku, display_name, description, tier, features, price_cents, currency) VALUES
('SMARTCRM_FE', 'SmartCRM Frontend Edition', 'Complete CRM solution for small businesses', 'fe', '{"crm": true, "contacts": true, "deals": true}'::jsonb, 2999, 'USD'),
('OTO1_SALES_MAX', 'OTO1 Sales Maximizer', 'Advanced sales automation tools', 'oto1', '{"automation": true, "analytics": true}'::jsonb, 4999, 'USD'),
('OTO2_ENTERPRISE', 'OTO2 Enterprise Suite', 'Full enterprise features', 'oto2', '{"enterprise": true, "api": true, "white_label": true}'::jsonb, 9999, 'USD');

-- Sample product mappings (you'll need to add your actual provider IDs)
-- INSERT INTO product_mappings (provider, provider_product_id, product_sku) VALUES
-- ('stripe', 'price_1234567890', 'SMARTCRM_FE'),
-- ('paypal', 'BUTTON_123', 'OTO1_SALES_MAX');
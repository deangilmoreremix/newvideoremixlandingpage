-- Create the user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('app', 'feature', 'plan')),
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_product_id ON user_subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiry ON user_subscriptions(expiry_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_created_at ON user_subscriptions(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can do everything (you'll need to set up admin roles)
CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW user_active_subscriptions AS
SELECT
    us.*,
    CASE
        WHEN us.expiry_date IS NULL THEN true
        WHEN us.expiry_date > NOW() THEN true
        ELSE false
    END as is_active
FROM user_subscriptions us
WHERE us.status = 'active';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_subscriptions TO authenticated;
GRANT SELECT ON user_active_subscriptions TO authenticated;
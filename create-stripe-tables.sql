-- Manual SQL script to create Stripe historical data tables
-- Run this in your Supabase SQL editor if migrations are not working

-- Stripe Customers
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id TEXT PRIMARY KEY,
  object TEXT,
  email TEXT,
  name TEXT,
  phone TEXT,
  address JSONB,
  description TEXT,
  created BIGINT,
  delinquent BOOLEAN,
  discount JSONB,
  invoice_prefix TEXT,
  livemode BOOLEAN,
  metadata JSONB,
  preferred_locales TEXT[],
  shipping JSONB,
  tax_exempt TEXT,
  tax_ids JSONB,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Payment Methods
CREATE TABLE IF NOT EXISTS public.stripe_payment_methods (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES public.stripe_customers(id),
  type TEXT,
  billing_details JSONB,
  card JSONB,
  created BIGINT,
  livemode BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Charges/Payments
CREATE TABLE IF NOT EXISTS public.stripe_charges (
  id TEXT PRIMARY KEY,
  object TEXT,
  amount BIGINT,
  amount_refunded BIGINT,
  application TEXT,
  application_fee TEXT,
  balance_transaction TEXT,
  balance_transaction_details JSONB,
  captured BOOLEAN,
  created BIGINT,
  currency TEXT,
  customer TEXT REFERENCES public.stripe_customers(id),
  customer_details JSONB,
  description TEXT,
  destination TEXT,
  dispute TEXT,
  disputed BOOLEAN,
  failure_code TEXT,
  failure_message TEXT,
  fraud_details JSONB,
  invoice TEXT,
  invoice_details JSONB,
  livemode BOOLEAN,
  metadata JSONB,
  outcome JSONB,
  paid BOOLEAN,
  payment_intent TEXT,
  payment_method TEXT,
  payment_method_details JSONB,
  receipt_email TEXT,
  receipt_number TEXT,
  receipt_url TEXT,
  refunded BOOLEAN,
  review TEXT,
  shipping JSONB,
  source JSONB,
  source_transfer TEXT,
  statement_descriptor TEXT,
  status TEXT,
  transfer_data JSONB,
  transfer_group TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Invoices
CREATE TABLE IF NOT EXISTS public.stripe_invoices (
  id TEXT PRIMARY KEY,
  object TEXT,
  account_country TEXT,
  account_name TEXT,
  amount_due BIGINT,
  amount_paid BIGINT,
  amount_remaining BIGINT,
  application_fee_amount BIGINT,
  attempt_count INTEGER,
  attempted BOOLEAN,
  auto_advance BOOLEAN,
  billing_reason TEXT,
  charge TEXT,
  collection_method TEXT,
  created BIGINT,
  currency TEXT,
  custom_fields JSONB,
  customer TEXT,
  customer_address JSONB,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_shipping JSONB,
  customer_tax_exempt TEXT,
  customer_tax_ids JSONB,
  default_payment_method TEXT,
  default_source TEXT,
  default_tax_rates JSONB,
  description TEXT,
  discount JSONB,
  discounts JSONB,
  due_date BIGINT,
  ending_balance BIGINT,
  footer TEXT,
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  last_finalization_error JSONB,
  lines JSONB,
  livemode BOOLEAN,
  metadata JSONB,
  next_payment_attempt BIGINT,
  number TEXT,
  on_behalf_of TEXT,
  paid BOOLEAN,
  payment_settings JSONB,
  period_end BIGINT,
  period_start BIGINT,
  post_payment_credit_notes_amount BIGINT,
  pre_payment_credit_notes_amount BIGINT,
  receipt_number TEXT,
  starting_balance BIGINT,
  statement_descriptor TEXT,
  status TEXT,
  status_transitions JSONB,
  subscription TEXT,
  subtotal BIGINT,
  tax JSONB,
  total BIGINT,
  total_tax_amounts JSONB,
  transfer_data JSONB,
  webhooks_delivered_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Subscriptions
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id TEXT PRIMARY KEY,
  object TEXT,
  application_fee_percent DECIMAL,
  billing_cycle_anchor BIGINT,
  billing_thresholds JSONB,
  cancel_at BIGINT,
  cancel_at_period_end BOOLEAN,
  canceled_at BIGINT,
  collection_method TEXT,
  created BIGINT,
  current_period_end BIGINT,
  current_period_start BIGINT,
  customer TEXT,
  days_until_due INTEGER,
  default_payment_method TEXT,
  default_source TEXT,
  default_tax_rates JSONB,
  discount JSONB,
  ended_at BIGINT,
  items JSONB,
  latest_invoice TEXT,
  livemode BOOLEAN,
  metadata JSONB,
  next_pending_invoice_item_invoice BIGINT,
  pause_collection JSONB,
  payment_settings JSONB,
  pending_invoice_item_interval JSONB,
  pending_setup_intent TEXT,
  pending_update JSONB,
  schedule TEXT,
  start_date BIGINT,
  status TEXT,
  transfer_data JSONB,
  trial_end BIGINT,
  trial_start BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Products
CREATE TABLE IF NOT EXISTS public.stripe_products (
  id TEXT PRIMARY KEY,
  object TEXT,
  active BOOLEAN,
  created BIGINT,
  default_price TEXT,
  description TEXT,
  images TEXT[],
  livemode BOOLEAN,
  metadata JSONB,
  name TEXT,
  package_dimensions JSONB,
  shippable BOOLEAN,
  statement_descriptor TEXT,
  tax_code TEXT,
  type TEXT,
  unit_label TEXT,
  updated BIGINT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Prices
CREATE TABLE IF NOT EXISTS public.stripe_prices (
  id TEXT PRIMARY KEY,
  object TEXT,
  active BOOLEAN,
  billing_scheme TEXT,
  created BIGINT,
  currency TEXT,
  custom_unit_amount BIGINT,
  livemode BOOLEAN,
  lookup_key TEXT,
  metadata JSONB,
  nickname TEXT,
  product TEXT REFERENCES public.stripe_products(id),
  recurring JSONB,
  tax_behavior TEXT,
  tiers JSONB,
  tiers_mode TEXT,
  transform_quantity JSONB,
  type TEXT,
  unit_amount BIGINT,
  unit_amount_decimal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Checkout Sessions
CREATE TABLE IF NOT EXISTS public.stripe_checkout_sessions (
  id TEXT PRIMARY KEY,
  object TEXT,
  after_expiration JSONB,
  allow_promotion_codes BOOLEAN,
  amount_subtotal BIGINT,
  amount_total BIGINT,
  automatic_tax JSONB,
  billing_address_collection TEXT,
  cancel_url TEXT,
  client_reference_id TEXT,
  consent JSONB,
  consent_collection JSONB,
  created BIGINT,
  currency TEXT,
  custom_fields JSONB,
  custom_text JSONB,
  customer TEXT,
  customer_creation TEXT,
  customer_details JSONB,
  customer_email TEXT,
  expires_at BIGINT,
  invoice TEXT,
  invoice_creation JSONB,
  line_items JSONB,
  livemode BOOLEAN,
  locale TEXT,
  metadata JSONB,
  mode TEXT,
  payment_intent TEXT,
  payment_link TEXT,
  payment_method_collection TEXT,
  payment_method_options JSONB,
  payment_method_types TEXT[],
  payment_status TEXT,
  phone_number_collection JSONB,
  recovered_from TEXT,
  setup_intent TEXT,
  shipping_address_collection JSONB,
  shipping_cost JSONB,
  shipping_details JSONB,
  shipping_options JSONB,
  status TEXT,
  submit_type TEXT,
  subscription TEXT,
  success_url TEXT,
  total_details JSONB,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe Payment Intents
CREATE TABLE IF NOT EXISTS public.stripe_payment_intents (
  id TEXT PRIMARY KEY,
  object TEXT,
  amount BIGINT,
  amount_capturable BIGINT,
  amount_details JSONB,
  amount_received BIGINT,
  application TEXT,
  application_fee_amount BIGINT,
  automatic_payment_methods JSONB,
  canceled_at BIGINT,
  cancellation_reason TEXT,
  capture_method TEXT,
  client_secret TEXT,
  confirmation_method TEXT,
  created BIGINT,
  currency TEXT,
  customer TEXT,
  description TEXT,
  invoice TEXT,
  last_payment_error JSONB,
  livemode BOOLEAN,
  metadata JSONB,
  next_action JSONB,
  on_behalf_of TEXT,
  payment_method TEXT,
  payment_method_options JSONB,
  payment_method_types TEXT[],
  processing JSONB,
  receipt_email TEXT,
  review TEXT,
  setup_future_usage TEXT,
  shipping JSONB,
  source TEXT,
  statement_descriptor TEXT,
  statement_descriptor_suffix TEXT,
  status TEXT,
  transfer_data JSONB,
  transfer_group TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_email ON public.stripe_customers(email);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_created ON public.stripe_customers(created);
CREATE INDEX IF NOT EXISTS idx_stripe_charges_customer ON public.stripe_charges(customer);
CREATE INDEX IF NOT EXISTS idx_stripe_charges_created ON public.stripe_charges(created);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_customer ON public.stripe_invoices(customer);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer ON public.stripe_subscriptions(customer);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_customer ON public.stripe_checkout_sessions(customer);

-- RLS Policies (admin only for raw Stripe data)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payment_intents ENABLE ROW LEVEL SECURITY;

-- Admin-only access to raw Stripe data
DROP POLICY IF EXISTS "Stripe customers admin only" ON public.stripe_customers;
CREATE POLICY "Stripe customers admin only" ON public.stripe_customers FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe payment methods admin only" ON public.stripe_payment_methods;
CREATE POLICY "Stripe payment methods admin only" ON public.stripe_payment_methods FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe charges admin only" ON public.stripe_charges;
CREATE POLICY "Stripe charges admin only" ON public.stripe_charges FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe invoices admin only" ON public.stripe_invoices;
CREATE POLICY "Stripe invoices admin only" ON public.stripe_invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe subscriptions admin only" ON public.stripe_subscriptions;
CREATE POLICY "Stripe subscriptions admin only" ON public.stripe_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe products admin only" ON public.stripe_products;
CREATE POLICY "Stripe products admin only" ON public.stripe_products FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe prices admin only" ON public.stripe_prices;
CREATE POLICY "Stripe prices admin only" ON public.stripe_prices FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe checkout sessions admin only" ON public.stripe_checkout_sessions;
CREATE POLICY "Stripe checkout sessions admin only" ON public.stripe_checkout_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

DROP POLICY IF EXISTS "Stripe payment intents admin only" ON public.stripe_payment_intents;
CREATE POLICY "Stripe payment intents admin only" ON public.stripe_payment_intents FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON public.stripe_customers;
CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON public.stripe_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_payment_methods_updated_at ON public.stripe_payment_methods;
CREATE TRIGGER update_stripe_payment_methods_updated_at BEFORE UPDATE ON public.stripe_payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_charges_updated_at ON public.stripe_charges;
CREATE TRIGGER update_stripe_charges_updated_at BEFORE UPDATE ON public.stripe_charges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_invoices_updated_at ON public.stripe_invoices;
CREATE TRIGGER update_stripe_invoices_updated_at BEFORE UPDATE ON public.stripe_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_subscriptions_updated_at ON public.stripe_subscriptions;
CREATE TRIGGER update_stripe_subscriptions_updated_at BEFORE UPDATE ON public.stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_products_updated_at ON public.stripe_products;
CREATE TRIGGER update_stripe_products_updated_at BEFORE UPDATE ON public.stripe_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_prices_updated_at ON public.stripe_prices;
CREATE TRIGGER update_stripe_prices_updated_at BEFORE UPDATE ON public.stripe_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_checkout_sessions_updated_at ON public.stripe_checkout_sessions;
CREATE TRIGGER update_stripe_checkout_sessions_updated_at BEFORE UPDATE ON public.stripe_checkout_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_payment_intents_updated_at ON public.stripe_payment_intents;
CREATE TRIGGER update_stripe_payment_intents_updated_at BEFORE UPDATE ON public.stripe_payment_intents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Complete customer profile view
DROP VIEW IF EXISTS v_customer_profiles;
CREATE VIEW v_customer_profiles AS
SELECT
  c.id,
  c.email,
  c.name,
  c.phone,
  c.created as stripe_created_at,
  c.livemode,
  c.metadata,

  -- Payment methods count
  COALESCE(pm_count.count, 0) as payment_methods_count,

  -- Lifetime value
  COALESCE(lv.lifetime_value, 0) as lifetime_value_cents,

  -- Total payments
  COALESCE(pc.payment_count, 0) as total_payments,

  -- First purchase
  fp.first_purchase_date,

  -- Latest purchase
  lp.latest_purchase_date,

  -- Active subscriptions
  COALESCE(subs.active_subscriptions, 0) as active_subscriptions,

  -- Total invoices
  COALESCE(inv.invoice_count, 0) as total_invoices

FROM public.stripe_customers c
LEFT JOIN (SELECT customer_id, COUNT(*) as count FROM public.stripe_payment_methods GROUP BY customer_id) pm_count
  ON c.id = pm_count.customer_id
LEFT JOIN (SELECT customer, SUM(amount) as lifetime_value FROM public.stripe_charges WHERE status = 'succeeded' GROUP BY customer) lv
  ON c.id = lv.customer
LEFT JOIN (SELECT customer, COUNT(*) as payment_count FROM public.stripe_charges WHERE status = 'succeeded' GROUP BY customer) pc
  ON c.id = pc.customer
LEFT JOIN (SELECT customer, MIN(created) as first_purchase_date FROM public.stripe_charges WHERE status = 'succeeded' GROUP BY customer) fp
  ON c.id = fp.customer
LEFT JOIN (SELECT customer, MAX(created) as latest_purchase_date FROM public.stripe_charges WHERE status = 'succeeded' GROUP BY customer) lp
  ON c.id = lp.customer
LEFT JOIN (SELECT customer, COUNT(*) as active_subscriptions FROM public.stripe_subscriptions WHERE status = 'active' GROUP BY customer) subs
  ON c.id = subs.customer
LEFT JOIN (SELECT customer, COUNT(*) as invoice_count FROM public.stripe_invoices GROUP BY customer) inv
  ON c.id = inv.customer;

-- Customer purchase history view
DROP VIEW IF EXISTS v_customer_purchase_history;
CREATE VIEW v_customer_purchase_history AS
SELECT
  c.id as customer_id,
  c.email,
  c.name,
  ch.id as charge_id,
  ch.amount,
  ch.currency,
  ch.status,
  ch.description,
  ch.created as charge_date,
  ch.receipt_url,
  ch.payment_method_details,
  i.id as invoice_id,
  i.number as invoice_number,
  i.hosted_invoice_url,
  p.name as product_name,
  pr.nickname as price_nickname,
  pr.unit_amount,
  pr.currency as price_currency
FROM public.stripe_customers c
JOIN public.stripe_charges ch ON c.id = ch.customer
LEFT JOIN public.stripe_invoices i ON ch.invoice = i.id
LEFT JOIN public.stripe_prices pr ON i.lines->0->>'price' = pr.id
LEFT JOIN public.stripe_products p ON pr.product = p.id
ORDER BY c.id, ch.created DESC;

-- Grant permissions for views
GRANT SELECT ON v_customer_profiles TO authenticated;
GRANT SELECT ON v_customer_purchase_history TO authenticated;
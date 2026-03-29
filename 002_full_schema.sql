-- ============================================================
-- Convertfy Mail — Full Schema Migration
-- Generated from Supabase production database
-- ============================================================

-- 1. STORES
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  shopify_domain TEXT,
  shopify_access_token TEXT,
  webhook_secret TEXT,
  sender_name TEXT DEFAULT 'Minha Loja',
  sender_email TEXT,
  reply_to_email TEXT,
  sending_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  resend_domain_id TEXT,
  wa_phone_number_id TEXT,
  wa_business_account_id TEXT,
  wa_access_token TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stores" ON stores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own stores" ON stores
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stores" ON stores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE UNIQUE INDEX idx_stores_shopify_domain ON stores(shopify_domain) WHERE shopify_domain IS NOT NULL;

-- 2. STORE_USERS (multi-tenant team members)
CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  invite_token TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(store_id, email)
);

ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view store members" ON store_users
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Owners and admins can manage members" ON store_users
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- 3. CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  shopify_customer_id TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  properties JSONB DEFAULT '{}'::jsonb,
  total_spent NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  city TEXT,
  state TEXT,
  country TEXT,
  zip_code TEXT,
  consent_email TEXT DEFAULT 'subscribed',
  consent_whatsapp TEXT DEFAULT 'none',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view contacts" ON contacts
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage contacts" ON contacts
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE UNIQUE INDEX idx_contacts_store_email ON contacts(store_id, email);
CREATE INDEX idx_contacts_store_id ON contacts(store_id);
CREATE INDEX idx_contacts_shopify_id ON contacts(store_id, shopify_customer_id) WHERE shopify_customer_id IS NOT NULL;
CREATE INDEX idx_contacts_consent ON contacts(store_id, consent_email);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  title TEXT,
  handle TEXT,
  image_url TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  vendor TEXT,
  product_type TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  status TEXT DEFAULT 'active',
  synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view products" ON products
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage products" ON products
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE UNIQUE INDEX idx_products_store_shopify ON products(store_id, shopify_product_id);
CREATE INDEX idx_products_store_id ON products(store_id);

-- 5. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  revenue NUMERIC,
  shopify_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view events" ON events
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage events" ON events
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_events_store_id ON events(store_id);
CREATE INDEX idx_events_contact_id ON events(contact_id);
CREATE INDEX idx_events_type ON events(store_id, event_type);
CREATE INDEX idx_events_created ON events(store_id, created_at DESC);
CREATE INDEX idx_events_shopify ON events(store_id, shopify_event_id) WHERE shopify_event_id IS NOT NULL;

-- 6. LISTS
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  opt_in_type TEXT DEFAULT 'single',
  contact_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view lists" ON lists
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage lists" ON lists
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_lists_store_id ON lists(store_id);

-- 7. LIST_MEMBERS
CREATE TABLE IF NOT EXISTS list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view list_members" ON list_members
  FOR SELECT USING (list_id IN (SELECT id FROM lists WHERE store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid())));

CREATE POLICY "Store members can manage list_members" ON list_members
  FOR ALL USING (list_id IN (SELECT id FROM lists WHERE store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid())));

CREATE UNIQUE INDEX idx_list_members_unique ON list_members(list_id, contact_id);
CREATE INDEX idx_list_members_contact ON list_members(contact_id);

-- 8. SEGMENTS
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  contact_count INTEGER DEFAULT 0,
  is_prebuilt BOOLEAN DEFAULT false,
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view segments" ON segments
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage segments" ON segments
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_segments_store_id ON segments(store_id);

-- 9. TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  preview_text TEXT,
  design_json JSONB,
  html TEXT,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'custom',
  is_prebuilt BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view templates" ON templates
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage templates" ON templates
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_templates_store_id ON templates(store_id);
CREATE INDEX idx_templates_category ON templates(store_id, category);

-- 10. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
  list_id UUID REFERENCES lists(id) ON DELETE SET NULL,
  subject TEXT,
  preview_text TEXT,
  sender_name TEXT,
  sender_email TEXT,
  reply_to TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}'::text[],
  utm_source TEXT DEFAULT 'convertfy',
  utm_medium TEXT DEFAULT 'email',
  utm_campaign TEXT,
  stats JSONB DEFAULT '{"sent":0,"total":0,"opened":0,"bounced":0,"clicked":0,"delivered":0,"complained":0,"unsubscribed":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view campaigns" ON campaigns
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage campaigns" ON campaigns
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_campaigns_store_id ON campaigns(store_id);
CREATE INDEX idx_campaigns_status ON campaigns(store_id, status);

-- 11. FLOWS
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  flow_definition JSONB NOT NULL DEFAULT '{"edges":[],"nodes":[]}'::jsonb,
  status TEXT DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}'::text[],
  is_prebuilt BOOLEAN DEFAULT false,
  stats JSONB DEFAULT '{"active":0,"entered":0,"completed":0,"emails_sent":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view flows" ON flows
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage flows" ON flows
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_flows_store_id ON flows(store_id);
CREATE INDEX idx_flows_status ON flows(store_id, status);
CREATE INDEX idx_flows_trigger ON flows(store_id, trigger_type) WHERE status = 'live';

-- 12. FLOW_EXECUTIONS
CREATE TABLE IF NOT EXISTS flow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  current_node_id TEXT,
  status TEXT DEFAULT 'active',
  next_step_at TIMESTAMPTZ,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  entered_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE flow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view flow_executions" ON flow_executions
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage flow_executions" ON flow_executions
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_flow_exec_flow ON flow_executions(flow_id);
CREATE INDEX idx_flow_exec_contact ON flow_executions(contact_id);
CREATE INDEX idx_flow_exec_status ON flow_executions(status) WHERE status IN ('active', 'waiting');
CREATE INDEX idx_flow_exec_next_step ON flow_executions(next_step_at) WHERE status = 'waiting' AND next_step_at IS NOT NULL;

-- 13. EMAIL_SENDS
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  subject TEXT,
  sender_email TEXT,
  resend_message_id TEXT,
  status TEXT DEFAULT 'queued',
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounce_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view email_sends" ON email_sends
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage email_sends" ON email_sends
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_email_sends_store ON email_sends(store_id);
CREATE INDEX idx_email_sends_contact ON email_sends(contact_id);
CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_email_sends_flow ON email_sends(flow_id) WHERE flow_id IS NOT NULL;
CREATE INDEX idx_email_sends_resend ON email_sends(resend_message_id) WHERE resend_message_id IS NOT NULL;
CREATE INDEX idx_email_sends_status ON email_sends(store_id, status);

-- 14. WHATSAPP_SENDS
CREATE TABLE IF NOT EXISTS whatsapp_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  template_name TEXT,
  message_content TEXT,
  wa_message_id TEXT,
  status TEXT DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE whatsapp_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view whatsapp_sends" ON whatsapp_sends
  FOR SELECT USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE POLICY "Store members can manage whatsapp_sends" ON whatsapp_sends
  FOR ALL USING (store_id IN (SELECT store_id FROM store_users WHERE user_id = auth.uid()));

CREATE INDEX idx_wa_sends_store ON whatsapp_sends(store_id);
CREATE INDEX idx_wa_sends_contact ON whatsapp_sends(contact_id);

-- ============================================================
-- UPDATED_AT TRIGGER (auto-update updated_at on row change)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_stores_updated BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_campaigns_updated BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_templates_updated BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_segments_updated BEFORE UPDATE ON segments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_flows_updated BEFORE UPDATE ON flows FOR EACH ROW EXECUTE FUNCTION update_updated_at();

// Types matching Supabase production schema — auto-generated

export interface Store {
  id: string
  user_id: string | null
  name: string
  shopify_domain: string | null
  shopify_access_token: string | null
  webhook_secret: string | null
  sender_name: string | null
  sender_email: string | null
  reply_to_email: string | null
  sending_domain: string | null
  domain_verified: boolean
  resend_domain_id: string | null
  wa_phone_number_id: string | null
  wa_business_account_id: string | null
  wa_access_token: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  store_id: string
  email: string
  phone: string | null
  first_name: string | null
  last_name: string | null
  shopify_customer_id: string | null
  tags: string[]
  properties: Record<string, unknown>
  total_spent: number
  total_orders: number
  avg_order_value: number
  last_order_at: string | null
  city: string | null
  state: string | null
  country: string | null
  zip_code: string | null
  consent_email: string
  consent_whatsapp: string
  source: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  shopify_product_id: string
  title: string | null
  handle: string | null
  image_url: string | null
  price: number | null
  compare_at_price: number | null
  vendor: string | null
  product_type: string | null
  tags: string[]
  status: string
  synced_at: string
}

export interface Event {
  id: string
  store_id: string
  contact_id: string | null
  event_type: string
  properties: Record<string, unknown>
  revenue: number | null
  shopify_event_id: string | null
  created_at: string
}

export interface ContactList {
  id: string
  store_id: string
  name: string
  description: string | null
  opt_in_type: string
  contact_count: number
  created_at: string
}

export interface ListMember {
  id: string
  list_id: string
  contact_id: string
  status: string
  created_at: string
}

export interface Segment {
  id: string
  store_id: string
  name: string
  description: string | null
  conditions: Record<string, unknown>
  contact_count: number
  is_prebuilt: boolean
  last_calculated_at: string | null
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  store_id: string
  name: string
  subject: string | null
  preview_text: string | null
  design_json: Record<string, unknown> | null
  html: string | null
  thumbnail_url: string | null
  category: string
  is_prebuilt: boolean
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  store_id: string
  name: string
  template_id: string | null
  segment_id: string | null
  list_id: string | null
  subject: string | null
  preview_text: string | null
  sender_name: string | null
  sender_email: string | null
  reply_to: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
  scheduled_at: string | null
  sent_at: string | null
  completed_at: string | null
  tags: string[]
  utm_source: string
  utm_medium: string
  utm_campaign: string | null
  stats: CampaignStats
  created_at: string
  updated_at: string
}

export interface CampaignStats {
  sent: number
  total: number
  opened: number
  bounced: number
  clicked: number
  delivered: number
  complained: number
  unsubscribed: number
}

export interface Flow {
  id: string
  store_id: string
  name: string
  description: string | null
  trigger_type: string
  trigger_config: Record<string, unknown>
  flow_definition: FlowDefinition
  status: 'draft' | 'live' | 'paused'
  tags: string[]
  is_prebuilt: boolean
  stats: FlowStats
  created_at: string
  updated_at: string
}

export interface FlowDefinition {
  nodes: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    data: { type: string; label: string; config: Record<string, unknown> }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string | null
  }>
}

export interface FlowStats {
  active: number
  entered: number
  completed: number
  emails_sent: number
}

export interface FlowExecution {
  id: string
  flow_id: string
  contact_id: string
  store_id: string
  current_node_id: string | null
  status: 'active' | 'waiting' | 'completed' | 'failed'
  next_step_at: string | null
  trigger_data: Record<string, unknown>
  entered_at: string
  completed_at: string | null
}

export interface EmailSend {
  id: string
  store_id: string
  contact_id: string
  campaign_id: string | null
  flow_id: string | null
  template_id: string | null
  subject: string | null
  sender_email: string | null
  resend_message_id: string | null
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'
  opened_at: string | null
  clicked_at: string | null
  delivered_at: string | null
  bounced_at: string | null
  bounce_type: string | null
  created_at: string
}

export interface WhatsAppSend {
  id: string
  store_id: string
  contact_id: string
  flow_id: string | null
  phone: string
  message_type: string
  template_name: string | null
  message_content: string | null
  wa_message_id: string | null
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  created_at: string
}

export interface StoreUser {
  id: string
  store_id: string
  user_id: string | null
  email: string
  name: string | null
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  invite_token: string | null
  invited_at: string
  accepted_at: string | null
}

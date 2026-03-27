// Database types for Convertfy Mail

export interface Store {
  id: string;
  user_id: string;
  name: string;
  shopify_domain: string | null;
  shopify_access_token: string | null;
  sender_name: string | null;
  sender_email: string | null;
  reply_to: string | null;
  sending_domain: string | null;
  resend_domain_id: string | null;
  domain_verified: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  store_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  tags: string[];
  consent_email: "subscribed" | "unsubscribed" | "bounced";
  consent_whatsapp: "subscribed" | "unsubscribed";
  subscribed: boolean;
  source: string | null;
  total_spent: number;
  total_orders: number;
  avg_order_value: number;
  last_order_at: string | null;
  shopify_customer_id: string | null;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  shopify_product_id: string;
  title: string;
  handle: string;
  image_url: string | null;
  price: number;
  compare_at_price: number | null;
  vendor: string | null;
  product_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  store_id: string;
  contact_id: string;
  event_type: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface List {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  opt_in_type: "single" | "double";
  contact_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListMember {
  id: string;
  list_id: string;
  contact_id: string;
  store_id?: string;
  status?: "active" | "unsubscribed";
  created_at: string;
  contact?: Contact;
}

export interface Template {
  id: string;
  store_id: string;
  name: string;
  category: string;
  subject: string | null;
  html: string | null;
  design_json: Record<string, unknown> | null;
  thumbnail_url: string | null;
  is_prebuilt: boolean;
  created_at: string;
  updated_at: string;
}

export interface Segment {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  rules: string | null;
  conditions: Record<string, unknown>;
  contact_count: number;
  is_prebuilt: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  store_id: string;
  name: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  template_id: string | null;
  list_id: string | null;
  segment_id: string | null;
  subject: string;
  preview_text: string | null;
  sender_name: string;
  sender_email: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  tags: string[];
  stats: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Flow {
  id: string;
  store_id: string;
  name: string;
  status: "draft" | "live";
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  flow_definition: Record<string, unknown>;
  total_entered: number;
  total_completed: number;
  total_emails_sent: number;
  created_at: string;
  updated_at: string;
}

export interface FlowExecution {
  id: string;
  flow_id: string;
  contact_id: string;
  store_id: string;
  status: "active" | "waiting" | "completed" | "failed";
  current_node_id: string | null;
  next_step_at: string | null;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EmailSend {
  id: string;
  store_id: string;
  contact_id: string;
  campaign_id: string | null;
  flow_id: string | null;
  flow_execution_id: string | null;
  template_id: string | null;
  resend_message_id: string | null;
  subject: string;
  status: "sent" | "delivered" | "bounced" | "failed";
  sent_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  created_at: string;
}

export interface WhatsappSend {
  id: string;
  store_id: string;
  contact_id: string;
  flow_id: string | null;
  flow_execution_id: string | null;
  phone: string;
  template_name: string | null;
  message: string | null;
  status: "sent" | "delivered" | "read" | "failed";
  wa_message_id: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface WhatsappTemplate {
  id: string;
  store_id: string;
  name: string;
  category: "marketing" | "utility" | "authentication";
  body: string;
  buttons: { text: string; type: "url" | "phone"; value: string }[];
  language: string;
  status: "approved" | "pending" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  store_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  status: "active" | "expired" | "disabled";
  created_at: string;
  updated_at: string;
}

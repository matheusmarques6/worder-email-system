export interface Store {
  id: string
  user_id: string
  name: string
  shopify_domain: string | null
  shopify_token: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  store_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  subscribed: boolean
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  store_id: string
  name: string
  subject: string | null
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  template_id: string | null
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  store_id: string
  name: string
  html: string | null
  json_data: string | null
  thumbnail: string | null
  created_at: string
  updated_at: string
}

export interface Flow {
  id: string
  store_id: string
  name: string
  status: "draft" | "live" | "paused"
  trigger_type: string | null
  flow_data: string | null
  created_at: string
  updated_at: string
}

export interface Segment {
  id: string
  store_id: string
  name: string
  description: string | null
  rules: string | null
  is_prebuilt: boolean
  contact_count: number
  created_at: string
  updated_at: string
}

export interface List {
  id: string
  store_id: string
  name: string
  description: string | null
  opt_in_type: "single" | "double"
  created_at: string
  updated_at: string
}

export interface ListMember {
  id: string
  list_id: string
  contact_id: string
  status: "active" | "unsubscribed"
  created_at: string
  contact?: Contact
}

export interface EmailSend {
  id: string
  store_id: string
  campaign_id: string | null
  contact_id: string
  status: "queued" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed"
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
}

export interface Store {
  id: string
  user_id: string
  name: string
  shopify_domain: string | null
  shopify_access_token: string | null
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
  design_json: Record<string, unknown> | null
  type: "email" | "whatsapp"
  created_at: string
  updated_at: string
}

export interface Flow {
  id: string
  store_id: string
  name: string
  trigger_type: string
  status: "draft" | "live" | "paused"
  definition: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Segment {
  id: string
  store_id: string
  name: string
  rules: Record<string, unknown> | null
  contact_count: number
  created_at: string
  updated_at: string
}

export interface ContactList {
  id: string
  store_id: string
  name: string
  description: string | null
  member_count: number
  created_at: string
  updated_at: string
}

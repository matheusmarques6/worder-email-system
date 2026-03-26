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

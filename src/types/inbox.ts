export interface Conversation {
  id: string
  store_id: string
  contact_id: string
  channel: "whatsapp" | "email" | "sms"
  status: "open" | "waiting" | "done"
  assigned_to: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
  // Joined
  contact?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    phone: string | null
  }
  last_message?: string | null
}

export interface Message {
  id: string
  conversation_id: string
  store_id: string
  contact_id: string | null
  direction: "inbound" | "outbound"
  channel: "whatsapp" | "email" | "sms"
  content: string
  message_type: "text" | "image" | "template" | "audio"
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export type InboxFilter = "me" | "team" | "waiting" | "bot" | "done"

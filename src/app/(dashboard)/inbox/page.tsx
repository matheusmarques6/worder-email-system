"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { ConversationList } from "@/components/inbox/conversation-list"
import { ChatArea } from "@/components/inbox/chat-area"
import { ContactPanel } from "@/components/inbox/contact-panel"
import { toast } from "sonner"
import type { Conversation, Message, InboxFilter } from "@/types/inbox"

interface ContactDetails {
  total_spent: number
  total_orders: number
  last_order_at: string | null
  city: string | null
  state: string | null
  lists: string[]
  recent_orders: { id: string; total: number; date: string }[]
  recent_campaigns: { id: string; name: string; date: string }[]
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<InboxFilter>("me")
  const [loading, setLoading] = useState(true)

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null

  // Fetch store ID
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (store) setStoreId(store.id)
    }
    init()
  }, [])

  // Fetch conversations
  useEffect(() => {
    if (!storeId) return

    async function fetchConversations() {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from("conversations")
        .select("*, contact:contacts(id, first_name, last_name, email, phone)")
        .eq("store_id", storeId)
        .order("last_message_at", { ascending: false, nullsFirst: false })

      if (activeFilter === "done") {
        query = query.eq("status", "done")
      } else if (activeFilter === "waiting") {
        query = query.eq("status", "waiting")
      } else {
        query = query.neq("status", "done")
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching conversations:", error)
        setConversations([])
      } else {
        // Fetch last message for each conversation
        const convs = (data || []).map((c: Record<string, unknown>) => ({
          ...c,
          contact: c.contact,
          last_message: null,
          unread_count: (c as Record<string, unknown>).unread_count || 0,
        })) as Conversation[]

        // Get last message per conversation
        if (convs.length > 0) {
          const ids = convs.map((c) => c.id)
          const { data: lastMessages } = await supabase
            .from("messages")
            .select("conversation_id, content")
            .in("conversation_id", ids)
            .order("created_at", { ascending: false })

          if (lastMessages) {
            const lastMsgMap = new Map<string, string>()
            for (const msg of lastMessages) {
              if (!lastMsgMap.has(msg.conversation_id)) {
                lastMsgMap.set(msg.conversation_id, msg.content)
              }
            }
            convs.forEach((c) => {
              c.last_message = lastMsgMap.get(c.id) || null
            })
          }
        }

        setConversations(convs)
      }
      setLoading(false)
    }

    fetchConversations()
  }, [storeId, activeFilter])

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      setContactDetails(null)
      return
    }

    async function fetchMessages() {
      const supabase = createClient()

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true })

      setMessages((data as Message[]) || [])

      // Mark as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", selectedId)
        .eq("direction", "inbound")
        .is("read_at", null)

      // Update unread count
      await supabase
        .from("conversations")
        .update({ unread_count: 0 })
        .eq("id", selectedId)

      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
      )
    }

    fetchMessages()
  }, [selectedId])

  // Fetch contact details when conversation changes
  useEffect(() => {
    if (!selectedConversation?.contact_id) {
      setContactDetails(null)
      return
    }

    async function fetchContactDetails() {
      const supabase = createClient()
      const contactId = selectedConversation!.contact_id

      // Fetch contact extra data (may not have all fields depending on schema)
      const { data: contactData } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", contactId)
        .single()

      // Fetch lists
      const { data: listMembers } = await supabase
        .from("list_members")
        .select("list:lists(name)")
        .eq("contact_id", contactId)

      const lists = (listMembers || [])
        .map((lm: Record<string, unknown>) => {
          const list = lm.list as { name: string } | null
          return list?.name
        })
        .filter(Boolean) as string[]

      setContactDetails({
        total_spent: (contactData as Record<string, unknown>)?.total_spent as number || 0,
        total_orders: (contactData as Record<string, unknown>)?.total_orders as number || 0,
        last_order_at: (contactData as Record<string, unknown>)?.last_order_at as string | null || null,
        city: (contactData as Record<string, unknown>)?.city as string | null || null,
        state: (contactData as Record<string, unknown>)?.state as string | null || null,
        lists,
        recent_orders: [],
        recent_campaigns: [],
      })
    }

    fetchContactDetails()
  }, [selectedConversation?.contact_id])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!selectedId || !storeId) return

    const supabase = createClient()
    const conv = conversations.find((c) => c.id === selectedId)

    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedId,
        store_id: storeId,
        contact_id: conv?.contact_id || null,
        direction: "outbound",
        channel: conv?.channel || "whatsapp",
        content,
        message_type: "text",
        metadata: {},
      })
      .select()
      .single()

    if (error) {
      toast.error("Erro ao enviar mensagem")
      return
    }

    setMessages((prev) => [...prev, msg as Message])

    // Update last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", selectedId)
  }, [selectedId, storeId, conversations])

  const handleMarkDone = useCallback(async () => {
    if (!selectedId) return

    const supabase = createClient()
    await supabase
      .from("conversations")
      .update({ status: "done" })
      .eq("id", selectedId)

    setConversations((prev) => prev.filter((c) => c.id !== selectedId))
    setSelectedId(null)
    toast.success("Conversa marcada como concluída")
  }, [selectedId])

  return (
    <div className="-mx-6 -my-6 flex h-[calc(100vh-4rem)]">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <ChatArea
        conversation={selectedConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        onMarkDone={handleMarkDone}
      />
      <ContactPanel
        conversation={selectedConversation}
        contactDetails={contactDetails}
      />
    </div>
  )
}

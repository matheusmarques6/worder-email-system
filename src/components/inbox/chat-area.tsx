"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, CheckCircle, ArrowLeftRight, Tag, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Conversation, Message } from "@/types/inbox"
import { format, isToday, isYesterday } from "date-fns"
import { ptBR } from "date-fns/locale"

const channelLabels: Record<string, { label: string; className: string }> = {
  whatsapp: { label: "WhatsApp", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  email: { label: "Email", className: "bg-blue-50 text-blue-700 border-blue-200" },
  sms: { label: "SMS", className: "bg-gray-100 text-gray-600 border-gray-200" },
}

interface ChatAreaProps {
  conversation: Conversation | null
  messages: Message[]
  onSendMessage: (content: string) => void
  onMarkDone: () => void
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, "HH:mm")
  if (isYesterday(date)) return `Ontem ${format(date, "HH:mm")}`
  return format(date, "dd/MM HH:mm", { locale: ptBR })
}

function shouldShowDateSeparator(current: string, previous: string | null): boolean {
  if (!previous) return true
  const c = new Date(current).toDateString()
  const p = new Date(previous).toDateString()
  return c !== p
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return "Hoje"
  if (isYesterday(date)) return "Ontem"
  return format(date, "dd 'de' MMMM", { locale: ptBR })
}

export function ChatArea({ conversation, messages, onSendMessage, onMarkDone }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend() {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleTextareaInput() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-gray-100 p-4 mb-3">
          <MessageSquare size={40} className="text-gray-300" />
        </div>
        <p className="text-lg text-gray-500">Selecione uma conversa</p>
        <p className="text-sm text-gray-400 mt-1">Escolha uma conversa da lista para começar</p>
      </div>
    )
  }

  const contactName = `${conversation.contact?.first_name || ""} ${conversation.contact?.last_name || ""}`.trim() || conversation.contact?.email || "Sem nome"
  const channelInfo = channelLabels[conversation.channel]

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
            {(conversation.contact?.first_name?.[0] || "").toUpperCase()}
            {(conversation.contact?.last_name?.[0] || "").toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{contactName}</p>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${channelInfo.className}`}>
              {channelInfo.label}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onMarkDone} title="Marcar como concluído">
            <CheckCircle size={16} className="text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" title="Transferir">
            <ArrowLeftRight size={16} className="text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" title="Tags">
            <Tag size={16} className="text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-gray-400">Nenhuma mensagem ainda</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const prevDate = i > 0 ? messages[i - 1].created_at : null
          const showSeparator = shouldShowDateSeparator(msg.created_at, prevDate)

          return (
            <div key={msg.id}>
              {showSeparator && (
                <div className="flex items-center justify-center py-3">
                  <span className="rounded-full bg-gray-200 px-3 py-0.5 text-xs text-gray-500">
                    {formatDateSeparator(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={`flex mb-1 ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    msg.direction === "outbound"
                      ? "bg-brand-50 text-gray-900"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-400">{formatMessageDate(msg.created_at)}</span>
                    {msg.direction === "outbound" && msg.read_at && (
                      <span className="text-[10px] text-blue-500">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm" className="flex-shrink-0 mb-0.5">
            <Paperclip size={16} className="text-gray-400" />
          </Button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            style={{ maxHeight: "120px" }}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex-shrink-0 mb-0.5"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

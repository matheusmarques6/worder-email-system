"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, MessageCircle, Mail, Check } from "lucide-react"
import { useStore } from "@/hooks/use-store"

interface IntegrationCard {
  id: string
  name: string
  description: string
  icon: React.ElementType
  connected: boolean
  href: string
  buttonLabel: string
}

export default function IntegrationsPage() {
  const { store } = useStore()

  const integrations: IntegrationCard[] = [
    {
      id: "shopify",
      name: "Shopify",
      description: "Sincronize pedidos, clientes e produtos",
      icon: ShoppingBag,
      connected: !!store?.shopify_access_token,
      href: "/settings/integrations/shopify",
      buttonLabel: "Conectar",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Envie mensagens via WhatsApp Cloud API",
      icon: MessageCircle,
      connected: false,
      href: "/settings/whatsapp",
      buttonLabel: "Configurar",
    },
    {
      id: "resend",
      name: "Resend",
      description: "Envio de emails transacionais e marketing",
      icon: Mail,
      connected: false,
      href: "/settings/email",
      buttonLabel: "Configurar",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Integrações</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <div
              key={integration.id}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                </div>
              </div>

              <div className="mt-4">
                {integration.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                    <Check size={14} />
                    Conectado
                  </span>
                ) : (
                  <a
                    href={integration.href}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                  >
                    {integration.buttonLabel}
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

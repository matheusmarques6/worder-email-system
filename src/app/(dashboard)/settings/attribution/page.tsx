"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { toast } from "sonner"
import { BarChart3, Info, Mail, Smartphone, MessageCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AttributionSettings {
  email: number
  sms: number
  whatsapp: number
  push: number
}

const channels: {
  key: keyof AttributionSettings
  label: string
  icon: React.ComponentType<{ className?: string }>
  options: number[]
  defaultValue: number
}[] = [
  { key: "email", label: "Email", icon: Mail, options: [1, 2, 3, 4, 5, 6, 7], defaultValue: 5 },
  { key: "sms", label: "SMS", icon: Smartphone, options: [1, 2, 3], defaultValue: 1 },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, options: [1, 2, 3], defaultValue: 1 },
  { key: "push", label: "Push", icon: Bell, options: [1, 2, 3], defaultValue: 1 },
]

export default function AttributionPage() {
  const { store, loading: storeLoading } = useStore()
  const [settings, setSettings] = useState<AttributionSettings>({
    email: 5,
    sms: 1,
    whatsapp: 1,
    push: 1,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (store) {
      const storeSettings = (store as unknown as Record<string, unknown>).settings as
        | Record<string, unknown>
        | undefined
      if (storeSettings?.attribution) {
        const attribution = storeSettings.attribution as Record<string, unknown>
        setSettings({
          email: (attribution.email as number) ?? 5,
          sms: (attribution.sms as number) ?? 1,
          whatsapp: (attribution.whatsapp as number) ?? 1,
          push: (attribution.push as number) ?? 1,
        })
      }
    }
  }, [store])

  async function handleSave() {
    if (!store) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("stores")
        .update({
          settings: {
            ...((store as unknown as Record<string, unknown>).settings as Record<string, unknown> ?? {}),
            attribution: {
              email: settings.email,
              sms: settings.sms,
              whatsapp: settings.whatsapp,
              push: settings.push,
            },
          },
        })
        .eq("id", store.id)

      if (error) {
        toast.error("Erro ao salvar configurações")
      } else {
        toast.success("Configurações salvas com sucesso")
      }
    } catch {
      toast.error("Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  if (storeLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Atribuição</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure a janela de atribuição por canal
        </p>
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="h-[18px] w-[18px] text-brand-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            A janela de atribuição define por quantos dias após uma interação (email aberto,
            clique, etc.) uma conversão será atribuída àquele canal.
          </p>
        </div>
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => {
          const Icon = channel.icon
          return (
            <div
              key={channel.key}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-[18px] w-[18px] text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">{channel.label}</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`attribution-${channel.key}`}>Janela de atribuição</Label>
                <Select
                  value={String(settings[channel.key])}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, [channel.key]: Number(value) }))
                  }
                >
                  <SelectTrigger id={`attribution-${channel.key}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channel.options.map((opt) => (
                      <SelectItem key={opt} value={String(opt)}>
                        {opt} {opt === 1 ? "dia" : "dias"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  )
}

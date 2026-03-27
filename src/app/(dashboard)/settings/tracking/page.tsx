"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { toast } from "sonner"
import { Eye, MousePointerClick, Globe, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface TrackingSettings {
  trackOpens: boolean
  trackClicks: boolean
  trackVisitors: boolean
  facebookPixelId: string
  googleAnalyticsId: string
}

export default function TrackingPage() {
  const { store, loading: storeLoading } = useStore()
  const [settings, setSettings] = useState<TrackingSettings>({
    trackOpens: true,
    trackClicks: true,
    trackVisitors: false,
    facebookPixelId: "",
    googleAnalyticsId: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (store) {
      const storeSettings = store.settings as
        | Record<string, unknown>
        | undefined
      if (storeSettings?.tracking) {
        const tracking = storeSettings.tracking as Record<string, unknown>
        setSettings({
          trackOpens: (tracking.track_opens as boolean) ?? true,
          trackClicks: (tracking.track_clicks as boolean) ?? true,
          trackVisitors: (tracking.track_visitors as boolean) ?? false,
          facebookPixelId: (tracking.facebook_pixel_id as string) ?? "",
          googleAnalyticsId: (tracking.google_analytics_id as string) ?? "",
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
            ...(store.settings as Record<string, unknown> ?? {}),
            tracking: {
              track_opens: settings.trackOpens,
              track_clicks: settings.trackClicks,
              track_visitors: settings.trackVisitors,
              facebook_pixel_id: settings.facebookPixelId,
              google_analytics_id: settings.googleAnalyticsId,
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
      <h1 className="text-2xl font-semibold text-gray-900">Rastreamento</h1>

      {/* Tracking toggles */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Eye className="h-[18px] w-[18px] text-gray-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Rastreamento de Abertura
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Adicionar pixel transparente nos emails para rastrear quando são abertos
                </p>
              </div>
            </div>
            <Switch
              checked={settings.trackOpens}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, trackOpens: checked }))
              }
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <MousePointerClick className="h-[18px] w-[18px] text-gray-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Rastreamento de Cliques
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Reescrever links nos emails para rastrear cliques
                </p>
              </div>
            </div>
            <Switch
              checked={settings.trackClicks}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, trackClicks: checked }))
              }
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Globe className="h-[18px] w-[18px] text-gray-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Rastreamento de Visitantes
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Identificar visitantes anônimos no seu site
                </p>
              </div>
            </div>
            <Switch
              checked={settings.trackVisitors}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, trackVisitors: checked }))
              }
            />
          </div>
        </div>
      </div>

      {/* Third-party pixels */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-[18px] w-[18px] text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Pixels de Terceiros</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
            <Input
              id="fb-pixel"
              placeholder="Seu Pixel ID"
              value={settings.facebookPixelId}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, facebookPixelId: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ga-id">Google Analytics ID</Label>
            <Input
              id="ga-id"
              placeholder="G-XXXXXXXXXX"
              value={settings.googleAnalyticsId}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, googleAnalyticsId: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  )
}

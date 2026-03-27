"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link2 } from "lucide-react";

interface UtmSettings {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  auto_append: boolean;
}

const defaultUtm: UtmSettings = {
  utm_source: "convertfy",
  utm_medium: "email",
  utm_campaign: "",
  auto_append: true,
};

export default function UtmSettingsPage() {
  const { store } = useStore();
  const [settings, setSettings] = useState<UtmSettings>(defaultUtm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!store) return;

    async function loadSettings() {
      const supabase = createClient();
      const { data } = await supabase
        .from("stores")
        .select("settings")
        .eq("id", store!.id)
        .single();

      if (data?.settings?.utm) {
        setSettings({ ...defaultUtm, ...data.settings.utm });
      }
    }

    loadSettings();
  }, [store]);

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);

    const supabase = createClient();
    const { data: current } = await supabase
      .from("stores")
      .select("settings")
      .eq("id", store.id)
      .single();

    const currentSettings = current?.settings ?? {};

    const { error } = await supabase
      .from("stores")
      .update({
        settings: { ...currentSettings, utm: settings },
      })
      .eq("id", store.id);

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar configurações UTM");
    } else {
      toast.success("Configurações UTM salvas!");
    }
  };

  const previewUrl = (() => {
    const params = new URLSearchParams();
    if (settings.utm_source) params.set("utm_source", settings.utm_source);
    if (settings.utm_medium) params.set("utm_medium", settings.utm_medium);
    params.set("utm_campaign", settings.utm_campaign || "exemplo");
    return `https://sualoja.com.br/produto?${params.toString()}`;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Parâmetros UTM
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure UTMs padrão para links nos emails
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Link2 className="h-[18px] w-[18px] text-brand-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Configuração de UTM
            </h3>
            <p className="text-sm text-gray-500">
              Defina os parâmetros UTM padrão para rastreamento
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-lg">
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              utm_source
            </Label>
            <Input
              placeholder="convertfy"
              value={settings.utm_source}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, utm_source: e.target.value }))
              }
            />
          </div>

          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              utm_medium
            </Label>
            <Input
              placeholder="email"
              value={settings.utm_medium}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, utm_medium: e.target.value }))
              }
            />
          </div>

          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              utm_campaign
            </Label>
            <Input
              placeholder="Nome da campanha (preenchido automaticamente)"
              value={settings.utm_campaign}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  utm_campaign: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Adicionar UTM automaticamente a todos os links
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                UTMs serão adicionados em todos os links das campanhas
              </p>
            </div>
            <Switch
              checked={settings.auto_append}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, auto_append: checked }))
              }
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Preview de URL
          </p>
          <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm break-all text-gray-700">
            {previewUrl}
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { createClient } from "@/lib/supabase/client";

interface StepConnectWhatsappProps {
  onComplete: () => void;
}

export function StepConnectWhatsapp({ onComplete }: StepConnectWhatsappProps) {
  const { store } = useStore();
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!phoneNumberId.trim() || !businessAccountId.trim() || !accessToken.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (!store) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stores")
        .update({
          settings: {
            ...store.settings,
            whatsapp_phone_number_id: phoneNumberId.trim(),
            whatsapp_business_account_id: businessAccountId.trim(),
            whatsapp_access_token: accessToken.trim(),
          },
        })
        .eq("id", store.id);

      if (error) {
        toast.error("Erro ao salvar configurações.");
      } else {
        toast.success("WhatsApp configurado com sucesso!");
        onComplete();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
          <MessageCircle size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">
            Conectar WhatsApp Business
          </h2>
        </div>
      </div>
      <p className="text-[14px] text-gray-500 mb-6">
        Configure o WhatsApp Cloud API para enviar mensagens.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[14px] font-medium text-gray-700 mb-1.5">
            Phone Number ID
          </label>
          <input
            type="text"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="Insira o Phone Number ID"
            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-700 mb-1.5">
            Business Account ID
          </label>
          <input
            type="text"
            value={businessAccountId}
            onChange={(e) => setBusinessAccountId(e.target.value)}
            placeholder="Insira o Business Account ID"
            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-700 mb-1.5">
            Access Token
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Insira o Access Token"
            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-[14px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar e Testar"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SenderConfig() {
  const { store, loading } = useStore();
  const { toast } = useToast();
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load initial values from store
  if (store && !loaded) {
    setSenderName(store.sender_name || "");
    setSenderEmail(store.sender_email || "");
    setReplyTo(store.reply_to || "");
    setLoaded(true);
  }

  async function handleSave() {
    if (!store) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("stores")
        .update({
          sender_name: senderName,
          sender_email: senderEmail,
          reply_to: replyTo,
        })
        .eq("id", store.id);
      toast({ title: "Configurações salvas" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-brand-50 rounded-lg p-2">
          <Mail size={20} className="text-brand-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Remetente Padrão</h3>
          <p className="text-sm text-gray-500">Configure o nome e email do remetente</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome do remetente
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Minha Loja"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email do remetente
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="noreply@seudominio.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Responder para
          </label>
          <input
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="suporte@seudominio.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

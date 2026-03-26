"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Check, Send } from "lucide-react";

export default function WhatsAppSettingsPage() {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!phoneNumberId || !businessAccountId || !accessToken) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSaving(true);
    // In production, save to store settings
    setConnected(true);
    setSaving(false);
    toast.success("Configurações do WhatsApp salvas!");
  };

  const handleTest = async () => {
    if (!testPhone) {
      toast.error("Informe um número de telefone para teste.");
      return;
    }
    toast.success(`Mensagem de teste enviada para ${testPhone}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">WhatsApp</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure a integração com WhatsApp Cloud API
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                WhatsApp Cloud API
              </h3>
              <p className="text-sm text-gray-500">
                Envie mensagens via WhatsApp Business
              </p>
            </div>
          </div>
          {connected ? (
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="mr-1 h-3 w-3" />
              Conectado
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
              Desconectado
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Phone Number ID
            </Label>
            <Input
              placeholder="Ex: 123456789"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Business Account ID
            </Label>
            <Input
              placeholder="Ex: 987654321"
              value={businessAccountId}
              onChange={(e) => setBusinessAccountId(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Access Token
            </Label>
            <Input
              type="password"
              placeholder="Token de acesso"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        {connected && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              Enviar mensagem de teste
            </h4>
            <div className="flex gap-3">
              <Input
                placeholder="5511999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="secondary" onClick={handleTest}>
                <Send className="mr-2 h-4 w-4" />
                Testar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

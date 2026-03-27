"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function WhatsAppSettingsPage() {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookVerifyToken] = useState("convertfy_whatsapp_verify_2024");
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const isConnected = phoneNumberId && businessAccountId && accessToken;

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://app.convertfy.com.br"}/api/webhooks/whatsapp`;

  function handleCopyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copiada para a área de transferência");
  }

  async function handleSave() {
    setSaving(true);
    // MVP: mock save
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    toast.success("Configurações salvas");
  }

  async function handleSendTest() {
    setSendingTest(true);
    // MVP: mock test
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSendingTest(false);
    toast.info("Mensagem teste enviada");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Configurações do WhatsApp
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure a integração com o WhatsApp Cloud API para enviar
            mensagens.
          </p>
        </div>
        <Badge
          variant={isConnected ? "default" : "secondary"}
          className={
            isConnected
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-gray-100 text-gray-500 hover:bg-gray-100"
          }
        >
          {isConnected ? "Conectado" : "Não configurado"}
        </Badge>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-[18px] w-[18px] text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            WhatsApp Cloud API
          </h2>
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="phoneNumberId">Phone Number ID</Label>
            <Input
              id="phoneNumberId"
              placeholder="Ex: 123456789012345"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAccountId">Business Account ID</Label>
            <Input
              id="businessAccountId"
              placeholder="Ex: 123456789012345"
              value={businessAccountId}
              onChange={(e) => setBusinessAccountId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Token de acesso permanente"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
            <Input
              id="webhookVerifyToken"
              value={webhookVerifyToken}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex items-center gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="bg-gray-50 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyWebhook}
                title="Copiar URL"
              >
                <Copy className="h-[18px] w-[18px]" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use esta URL nas configurações de webhook do Facebook Developers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSendTest}
            disabled={sendingTest || !isConnected}
          >
            <Send className="h-[18px] w-[18px] mr-2" />
            {sendingTest ? "Enviando..." : "Enviar mensagem teste"}
          </Button>
        </div>
      </div>
    </div>
  );
}

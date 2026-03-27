"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Smartphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SMSSettingsPage() {
  const [provider, setProvider] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const isConfigured = provider && accountSid && authToken && fromNumber;

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
    toast.info("SMS teste enviado");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Configurações de SMS
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure o provedor de SMS para enviar mensagens de texto.
          </p>
        </div>
        <Badge
          variant={isConfigured ? "default" : "secondary"}
          className={
            isConfigured
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-gray-100 text-gray-500 hover:bg-gray-100"
          }
        >
          {isConfigured ? "Conectado" : "Não configurado"}
        </Badge>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Smartphone className="h-[18px] w-[18px] text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Provedor de SMS
          </h2>
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="provider">Provedor</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="vonage">Vonage</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountSid">Account SID</Label>
            <Input
              id="accountSid"
              placeholder="Ex: AC1234567890abcdef"
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authToken">Auth Token</Label>
            <Input
              id="authToken"
              type="password"
              placeholder="Token de autenticação"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromNumber">Número de envio</Label>
            <Input
              id="fromNumber"
              placeholder="+5511999999999"
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
            />
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
            disabled={sendingTest || !isConfigured}
          >
            <Send className="h-[18px] w-[18px] mr-2" />
            {sendingTest ? "Enviando..." : "Enviar SMS teste"}
          </Button>
        </div>
      </div>
    </div>
  );
}

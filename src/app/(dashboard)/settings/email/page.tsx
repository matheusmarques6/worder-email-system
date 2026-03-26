"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign } from "lucide-react";

export default function EmailSettingsPage() {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

  const handleSave = () => {
    toast.success("Configurações de email salvas!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Email</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure suas preferências de envio de email
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <AtSign className="h-5 w-5 text-brand-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Configurações de Envio
            </h3>
            <p className="text-sm text-gray-500">
              Defina o remetente padrão para suas campanhas
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-lg">
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Nome do remetente
            </Label>
            <Input
              placeholder="Ex: Minha Loja"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Email do remetente
            </Label>
            <Input
              placeholder="noreply@minha-loja.com"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              Use um domínio verificado no Resend
            </p>
          </div>
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Reply-To
            </Label>
            <Input
              placeholder="contato@minha-loja.com"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmailEditorWrapper } from "@/components/editor/email-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function EditTemplatePage() {
  const [testEmail, setTestEmail] = useState("");

  const handleSave = async (html: string, json: Record<string, unknown>) => {
    // In production, save to Supabase
    console.log("Saving template:", { html: html.length, json });
    toast.success("Template salvo com sucesso!");
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Informe um email para enviar o teste.");
      return;
    }
    // In production, call API to send test email
    toast.success(`Email de teste enviado para ${testEmail}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <span className="text-sm font-medium text-gray-900">
            Editar Template
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Send className="mr-1 h-4 w-4" />
                Enviar Teste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar email de teste</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="email@exemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button onClick={handleSendTest} className="w-full">
                  Enviar teste
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1">
        <EmailEditorWrapper onSave={handleSave} />
      </div>
    </div>
  );
}

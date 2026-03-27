"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Template } from "@/types";
import type { EmailEditorHandle } from "@/components/editor/email-editor";

const EmailEditorWrapper = dynamic(
  () =>
    import("@/components/editor/email-editor").then(
      (mod) => mod.EmailEditorWrapper
    ),
  { ssr: false, loading: () => <div className="flex-1 bg-gray-50" /> }
);

export default function EditTemplatePage() {
  const params = useParams();
  const editorRef = useRef<EmailEditorHandle>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showTestInput, setShowTestInput] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    async function fetchTemplate() {
      const supabase = createClient();
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setTemplate(data as Template);
        setName(data.name);
      }
    }

    fetchTemplate();
  }, [params.id]);

  const handleSave = useCallback(
    async (html: string, designJson: Record<string, unknown>) => {
      setSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("templates")
        .update({
          name,
          html,
          design_json: designJson,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (error) {
        toast.error("Erro ao salvar template");
      } else {
        toast.success("Template salvo!");
      }
      setSaving(false);
    },
    [name, params.id]
  );

  const handleSendTest = useCallback(() => {
    if (!testEmail.trim()) {
      toast.error("Digite um email para teste");
      return;
    }

    setSendingTest(true);
    editorRef.current?.getHtml(async (html) => {
      try {
        const response = await fetch("/api/campaigns/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: testEmail.trim(),
            subject: `[TESTE] ${name || "Template"}`,
            html,
          }),
        });

        if (response.ok) {
          toast.success(`Email de teste enviado para ${testEmail}`);
          setShowTestInput(false);
          setTestEmail("");
        } else {
          toast.error("Erro ao enviar email de teste");
        }
      } catch {
        toast.error("Erro ao enviar email de teste");
      }
      setSendingTest(false);
    });
  }, [testEmail, name]);

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-3">
          <Link href="/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-none bg-transparent text-sm font-medium text-gray-900 outline-none focus:ring-0"
            placeholder="Nome do template"
          />
        </div>
        <div className="flex items-center gap-2">
          {showTestInput ? (
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="email@teste.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="h-8 w-56 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendTest();
                  if (e.key === "Escape") setShowTestInput(false);
                }}
                autoFocus
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={sendingTest}
              >
                {sendingTest ? "Enviando..." : "Enviar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestInput(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTestInput(true)}
            >
              <Send size={14} className="mr-1" />
              Enviar Teste
            </Button>
          )}
          <Button
            size="sm"
            disabled={saving}
            onClick={() => editorRef.current?.exportHtml()}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </header>
      <div className="flex-1">
        <EmailEditorWrapper
          ref={editorRef}
          designJson={template.design_json as Record<string, unknown> | undefined}
          onSave={handleSave}
          height="100%"
        />
      </div>
    </div>
  );
}

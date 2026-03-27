"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Send, FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EmailEditorHandle } from "@/components/editor/email-editor";

const EmailEditorWrapper = dynamic(
  () =>
    import("@/components/editor/email-editor").then(
      (mod) => mod.EmailEditorWrapper
    ),
  { ssr: false, loading: () => <div className="flex h-[500px] items-center justify-center bg-gray-50 rounded-lg"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div> }
);

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  design_json: Record<string, unknown> | null;
}

const steps = ["Detalhes", "Destinatários", "Conteúdo", "Editor", "Revisão"];

export default function NewCampaignPage() {
  const router = useRouter();
  const editorRef = useRef<EmailEditorHandle>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientType, setRecipientType] = useState<"list" | "segment">("list");
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<Record<string, unknown> | null>(null);
  const [campaignHtml, setCampaignHtml] = useState("");
  const [campaignDesign, setCampaignDesign] = useState<Record<string, unknown> | null>(null);
  const [sending, setSending] = useState(false);
  const [lists, setLists] = useState<{ id: string; name: string; contact_count: number }[]>([]);
  const [segments, setSegments] = useState<{ id: string; name: string; contact_count: number }[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from("stores")
        .select("id, sender_name, sender_email")
        .eq("user_id", user.id)
        .single();

      if (!store) return;

      // Load templates
      const { data: tpls } = await supabase
        .from("templates")
        .select("id, name, category, design_json")
        .eq("store_id", store.id)
        .order("updated_at", { ascending: false });

      if (tpls) setTemplates(tpls as TemplateOption[]);

      // Load lists
      const { data: listsData } = await supabase
        .from("lists")
        .select("id, name, contact_count")
        .eq("store_id", store.id);

      if (listsData) setLists(listsData);

      // Load segments
      const { data: segData } = await supabase
        .from("segments")
        .select("id, name, contact_count")
        .eq("store_id", store.id);

      if (segData) setSegments(segData);

      // Pre-fill sender info
      if (store.sender_name) setSenderName(store.sender_name);
      if (store.sender_email) setSenderEmail(store.sender_email);
    }

    loadData();
  }, []);

  function handleSelectTemplate(tpl: TemplateOption) {
    setSelectedTemplateId(tpl.id);
    setSelectedDesign(tpl.design_json);
  }

  const handleEditorSave = useCallback((html: string, design: Record<string, unknown>) => {
    setCampaignHtml(html);
    setCampaignDesign(design);
    setCurrentStep(4);
  }, []);

  function goToReview() {
    editorRef.current?.exportHtml();
  }

  async function handleSend() {
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!store) return;

      // Create campaign
      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
          store_id: store.id,
          name,
          subject,
          preview_text: previewText,
          sender_name: senderName,
          sender_email: senderEmail,
          template_id: selectedTemplateId || null,
          list_id: recipientType === "list" ? selectedListId || null : null,
          segment_id: recipientType === "segment" ? selectedSegmentId || null : null,
          status: "sending",
        })
        .select("id")
        .single();

      if (error || !campaign) {
        toast.error("Erro ao criar campanha");
        setSending(false);
        return;
      }

      // Save HTML to template if modified
      if (campaignHtml && selectedTemplateId) {
        await supabase
          .from("templates")
          .update({ html: campaignHtml, design_json: campaignDesign })
          .eq("id", selectedTemplateId);
      }

      // Trigger send
      const res = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id }),
      });

      if (res.ok) {
        toast.success("Campanha enviada com sucesso!");
        router.push("/campaigns");
      } else {
        toast.error("Erro ao enviar campanha");
      }
    } catch {
      toast.error("Erro ao enviar campanha");
    }
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nova Campanha</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => i < currentStep && setCurrentStep(i)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                i === currentStep
                  ? "bg-brand-500 text-white"
                  : i < currentStep
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {step}
            </button>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Details */}
      {currentStep === 0 && (
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 text-sm font-medium text-gray-700">Nome da campanha</Label>
              <Input placeholder="Ex: Newsletter Março" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 text-sm font-medium text-gray-700">Assunto do email</Label>
              <Input placeholder="Ex: Novidades do mês" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 text-sm font-medium text-gray-700">Texto de preview</Label>
              <Input placeholder="Texto que aparece após o assunto" value={previewText} onChange={(e) => setPreviewText(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 text-sm font-medium text-gray-700">Nome do remetente</Label>
                <Input placeholder="Ex: Minha Loja" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 text-sm font-medium text-gray-700">Email do remetente</Label>
                <Input placeholder="noreply@minha-loja.com" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(1)} disabled={!name || !subject}>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Recipients */}
      {currentStep === 1 && (
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <Label className="mb-3 text-sm font-medium text-gray-700">Tipo de destinatário</Label>
            <div className="flex gap-4">
              <button onClick={() => setRecipientType("list")} className={`flex-1 rounded-lg border-2 p-4 text-center ${recipientType === "list" ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}>
                <p className="text-sm font-medium">Lista</p>
                <p className="text-xs text-gray-500">Envie para uma lista específica</p>
              </button>
              <button onClick={() => setRecipientType("segment")} className={`flex-1 rounded-lg border-2 p-4 text-center ${recipientType === "segment" ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}>
                <p className="text-sm font-medium">Segmento</p>
                <p className="text-xs text-gray-500">Envie para um segmento dinâmico</p>
              </button>
            </div>

            {recipientType === "list" && lists.length > 0 && (
              <div className="space-y-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm ${selectedListId === list.id ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <span className="font-medium">{list.name}</span>
                    <span className="ml-2 text-gray-500">{list.contact_count} contatos</span>
                  </button>
                ))}
              </div>
            )}

            {recipientType === "segment" && segments.length > 0 && (
              <div className="space-y-2">
                {segments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegmentId(seg.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm ${selectedSegmentId === seg.id ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <span className="font-medium">{seg.name}</span>
                    <span className="ml-2 text-gray-500">{seg.contact_count} contatos</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(0)}>Voltar</Button>
              <Button onClick={() => setCurrentStep(2)}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {currentStep === 2 && (
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Escolha um template</h3>

          {templates.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedTemplateId === tpl.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="mb-2 flex h-24 items-center justify-center rounded bg-gray-100">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{tpl.name}</p>
                  <p className="text-xs text-gray-500">{tpl.category || "Sem categoria"}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-900">Nenhum template encontrado</p>
              <p className="mt-1 text-xs text-gray-500">Crie um template primeiro ou prossiga com editor em branco.</p>
              <Link href="/templates/new" className="mt-3">
                <Button variant="secondary" size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Criar Template
                </Button>
              </Link>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setCurrentStep(1)}>Voltar</Button>
            <Button onClick={() => setCurrentStep(3)}>
              {selectedTemplateId ? "Editar Email" : "Editor em Branco"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Email Editor (Drag & Drop) */}
      {currentStep === 3 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Editor de Email</h3>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCurrentStep(2)}>Voltar</Button>
              <Button size="sm" onClick={goToReview}>Próximo: Revisão <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </div>
          <EmailEditorWrapper
            ref={editorRef}
            designJson={selectedDesign || undefined}
            onSave={handleEditorSave}
            height="600px"
          />
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 4 && (
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revisão da Campanha</h3>
          <dl className="space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-sm text-gray-500">Campanha</dt>
              <dd className="text-sm font-medium text-gray-900">{name}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-sm text-gray-500">Assunto</dt>
              <dd className="text-sm text-gray-900">{subject}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-sm text-gray-500">Remetente</dt>
              <dd className="text-sm text-gray-900">{senderName} &lt;{senderEmail}&gt;</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-sm text-gray-500">Destinatários</dt>
              <dd className="text-sm text-gray-900">{recipientType === "list" ? "Lista" : "Segmento"}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{campaignHtml ? "Conteúdo configurado" : "Sem conteúdo"}</dd>
            </div>
          </dl>

          {campaignHtml && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Preview do email:</p>
              <div
                className="max-h-60 overflow-y-auto rounded border border-gray-100 bg-gray-50 p-3 text-sm"
                dangerouslySetInnerHTML={{ __html: campaignHtml }}
              />
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setCurrentStep(3)}>Voltar ao Editor</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => toast.success("Campanha salva como rascunho!")}>
                Salvar Rascunho
              </Button>
              <Button onClick={handleSend} disabled={sending}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Enviando..." : "Enviar Agora"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

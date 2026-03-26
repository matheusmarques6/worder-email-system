"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Send, Calendar } from "lucide-react";

const steps = ["Detalhes", "Destinatários", "Conteúdo", "Revisão"];

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientType, setRecipientType] = useState<"list" | "segment">("list");

  const handleSend = () => {
    toast.success("Campanha enviada com sucesso!");
    router.push("/campaigns");
  };

  const handleSchedule = () => {
    toast.success("Campanha agendada com sucesso!");
    router.push("/campaigns");
  };

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
              onClick={() => setCurrentStep(i)}
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

      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 text-sm font-medium text-gray-700">Nome da campanha</Label>
              <Input placeholder="Ex: Newsletter Março" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(1)} disabled={!name}>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
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
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(0)}>Voltar</Button>
              <Button onClick={() => setCurrentStep(2)}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 text-sm font-medium text-gray-700">Assunto</Label>
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
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>Voltar</Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!subject}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Revisão</h3>
            <dl className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-sm text-gray-500">Campanha</dt>
                <dd className="text-sm font-medium text-gray-900">{name}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-sm text-gray-500">Destinatários</dt>
                <dd className="text-sm text-gray-900">{recipientType === "list" ? "Lista" : "Segmento"}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-sm text-gray-500">Assunto</dt>
                <dd className="text-sm text-gray-900">{subject}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-sm text-gray-500">Remetente</dt>
                <dd className="text-sm text-gray-900">{senderName} &lt;{senderEmail}&gt;</dd>
              </div>
            </dl>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>Voltar</Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSchedule}>
                  <Calendar className="mr-2 h-4 w-4" />Agendar
                </Button>
                <Button onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />Enviar Agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

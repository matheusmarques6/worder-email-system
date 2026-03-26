"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentBuilder } from "@/components/segments/segment-builder";
import { toast } from "sonner";

export default function NewSegmentPage() {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (!name) {
      toast.error("Informe o nome do segmento.");
      return;
    }
    toast.success("Segmento salvo com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/audience/segments">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Criar Segmento</h1>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Segmento
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Label className="mb-1.5 text-sm font-medium text-gray-700">Nome do segmento</Label>
          <Input placeholder="Ex: Compradores recorrentes" value={name} onChange={(e) => setName(e.target.value)} className="max-w-md" />
        </div>

        <SegmentBuilder />
      </div>
    </div>
  );
}

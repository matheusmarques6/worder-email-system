"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, LayoutTemplate } from "lucide-react";
import Link from "next/link";

const categories = [
  "E-commerce",
  "Welcome",
  "Abandono",
  "Pós-compra",
  "Newsletter",
];

const prebuiltTemplates = [
  { id: "welcome", name: "Boas-vindas", category: "Welcome" },
  { id: "abandoned-cart", name: "Carrinho Abandonado", category: "Abandono" },
  { id: "order-confirm", name: "Confirmação de Pedido", category: "E-commerce" },
  { id: "post-purchase", name: "Avaliação Pós-Compra", category: "Pós-compra" },
  { id: "newsletter", name: "Newsletter", category: "Newsletter" },
];

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [mode, setMode] = useState<"blank" | "prebuilt" | null>(null);

  const handleCreate = () => {
    if (!name) return;
    // In production, this would create the template in Supabase and redirect
    router.push("/templates/1/edit");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Criar Template
        </h1>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Nome do template
            </Label>
            <Input
              placeholder="Ex: Email de boas-vindas"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Categoria
            </Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-3 text-sm font-medium text-gray-700">
              Como deseja começar?
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode("blank")}
                className={`flex flex-col items-center rounded-lg border-2 p-6 transition-colors ${
                  mode === "blank"
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  Começar do zero
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Editor vazio
                </span>
              </button>
              <button
                onClick={() => setMode("prebuilt")}
                className={`flex flex-col items-center rounded-lg border-2 p-6 transition-colors ${
                  mode === "prebuilt"
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <LayoutTemplate className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  Template pré-construído
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Escolha um modelo
                </span>
              </button>
            </div>
          </div>

          {mode === "prebuilt" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Escolha um template
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {prebuiltTemplates.map((t) => (
                  <button
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:border-brand-500 hover:bg-brand-50"
                  >
                    <LayoutTemplate className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500">{t.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={handleCreate} disabled={!name || !mode}>
              Criar e Editar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

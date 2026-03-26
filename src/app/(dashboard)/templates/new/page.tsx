"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

import welcomeDesign from "@/lib/email/templates/welcome.json";
import abandonedCartDesign from "@/lib/email/templates/abandoned-cart.json";
import orderConfirmDesign from "@/lib/email/templates/order-confirm.json";
import postPurchaseDesign from "@/lib/email/templates/post-purchase.json";
import newsletterDesign from "@/lib/email/templates/newsletter.json";

const categoryOptions = [
  { value: "e-commerce", label: "E-commerce" },
  { value: "welcome", label: "Welcome" },
  { value: "abandono", label: "Abandono de carrinho" },
  { value: "pos-compra", label: "Pós-compra" },
  { value: "newsletter", label: "Newsletter" },
  { value: "custom", label: "Custom" },
];

const prebuiltTemplates = [
  { key: "welcome", name: "Boas-vindas", category: "welcome", design: welcomeDesign },
  { key: "abandoned-cart", name: "Carrinho Abandonado", category: "abandono", design: abandonedCartDesign },
  { key: "order-confirm", name: "Confirmação de Pedido", category: "pos-compra", design: orderConfirmDesign },
  { key: "post-purchase", name: "Pós-compra", category: "pos-compra", design: postPurchaseDesign },
  { key: "newsletter", name: "Newsletter", category: "newsletter", design: newsletterDesign },
];

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("custom");
  const [loading, setLoading] = useState(false);

  async function createTemplate(
    designJson?: Record<string, unknown>,
    overrideCategory?: string
  ) {
    if (!name.trim()) {
      toast.error("Digite um nome para o template");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      toast.error("Loja não encontrada");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("templates")
      .insert({
        store_id: store.id,
        name: name.trim(),
        category: overrideCategory || category,
        design_json: designJson || null,
        is_prebuilt: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar template");
      setLoading(false);
      return;
    }

    toast.success("Template criado!");
    router.push(`/templates/${data.id}/edit`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Novo Template</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="max-w-md space-y-4">
          <div>
            <Label className="mb-1.5 text-sm font-medium text-gray-700">
              Nome do template
            </Label>
            <Input
              placeholder="Ex: Newsletter Semanal"
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
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Escolha como começar
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => createTemplate()}
            disabled={loading}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 transition-colors hover:border-brand-500 hover:bg-brand-50"
          >
            <Plus size={32} className="mb-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Em branco</span>
            <span className="text-xs text-gray-400">Comece do zero</span>
          </button>

          {prebuiltTemplates.map((pt) => (
            <button
              key={pt.key}
              onClick={() =>
                createTemplate(
                  pt.design as Record<string, unknown>,
                  pt.category
                )
              }
              disabled={loading}
              className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-colors hover:border-brand-500 hover:bg-brand-50"
            >
              <Mail size={32} className="mb-2 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {pt.name}
              </span>
              <span className="text-xs text-gray-400">{pt.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

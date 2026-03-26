"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateGallery } from "@/components/editor/template-gallery";
import { createClient } from "@/lib/supabase/client";
import type { Template } from "@/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!store) return;

      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      setTemplates((data as Template[]) || []);
      setLoading(false);
    }

    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao deletar template");
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deletado");
  };

  const handleClone = async (id: string) => {
    const supabase = createClient();
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    const { data, error } = await supabase
      .from("templates")
      .insert({
        store_id: template.store_id,
        name: `${template.name} (cópia)`,
        category: template.category,
        subject: template.subject,
        html: template.html,
        design_json: template.design_json,
        is_prebuilt: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao clonar template");
      return;
    }
    setTemplates((prev) => [data as Template, ...prev]);
    toast.success("Template clonado");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <Link href="/templates/new">
          <Button>
            <Plus size={16} className="mr-2" />
            Criar Template
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <Skeleton className="h-48 w-full rounded-b-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TemplateGallery
          templates={templates}
          onDelete={handleDelete}
          onClone={handleClone}
        />
      )}
    </div>
  );
}

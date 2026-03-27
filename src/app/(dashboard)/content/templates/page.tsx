"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { LayoutTemplate, Mail, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/hooks/use-store";
import type { Template } from "@/types";

const categoryLabels: Record<string, string> = {
  marketing: "Marketing",
  transactional: "Transacional",
  notification: "Notificação",
};

const categoryColors: Record<string, string> = {
  marketing: "bg-amber-100 text-amber-800",
  transactional: "bg-blue-100 text-blue-800",
  notification: "bg-purple-100 text-purple-800",
};

export default function ContentTemplatesPage() {
  const { store, loading: storeLoading } = useStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!store) return;

    async function fetchTemplates() {
      const supabase = createClient();
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false });

      setTemplates((data as Template[]) || []);
      setLoading(false);
    }

    fetchTemplates();
  }, [store]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.subject && t.subject.toLowerCase().includes(search.toLowerCase()));
      const matchesFilter = filter === "all" || t.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [templates, search, filter]);

  const isLoading = storeLoading || loading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <Skeleton className="h-48 rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Templates de Email</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 shadow-sm rounded-lg">
          <LayoutTemplate className="h-12 w-12 text-gray-400 mb-4" size={18} />
          <p className="text-lg font-medium text-gray-900 mb-1">Nenhum template criado</p>
          <p className="text-sm text-gray-500 mb-6">
            Crie templates para suas campanhas de email
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/templates/new">
              <Plus className="mr-2" size={18} />
              Criar Template
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Templates de Email</h1>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/templates/new">
            <Plus className="mr-2" size={18} />
            Criar Template
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="transactional">Transacional</SelectItem>
            <SelectItem value="notification">Notificação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filtered.map((template) => (
          <Link
            key={template.id}
            href={`/templates/${template.id}/edit`}
            className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              {template.thumbnail_url ? (
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Mail className="text-gray-400" size={18} />
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
                <Badge className={categoryColors[template.category] || "bg-gray-100 text-gray-800"}>
                  {categoryLabels[template.category] || template.category}
                </Badge>
              </div>
              {template.subject && (
                <p className="text-sm text-gray-500 truncate">{template.subject}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(template.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

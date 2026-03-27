"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Search, MoreVertical, Copy, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Template } from "@/types";

const categories = [
  "Todos",
  "E-commerce",
  "Welcome",
  "Abandono",
  "Pós-compra",
  "Newsletter",
  "Custom",
] as const;

interface TemplateGalleryProps {
  templates: Template[];
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void;
}

export function TemplateGallery({
  templates,
  onDelete,
  onClone,
}: TemplateGalleryProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "Todos" ||
      t.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
        <div className="mb-4 rounded-lg bg-gray-100 p-3">
          <Mail size={48} className="text-gray-400" />
        </div>
        <p className="text-lg text-gray-600">Nenhum template criado</p>
        <p className="mb-4 text-sm text-gray-400">
          Crie seu primeiro template de email
        </p>
        <Link href="/templates/new">
          <Button>Criar Template</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-48 items-center justify-center bg-gray-100">
              {template.thumbnail_url ? (
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Mail size={48} className="text-gray-300" />
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Link href={`/templates/${template.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {template.name}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {template.category}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/templates/${template.id}/edit`}>
                        <Pencil size={14} className="mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onClone?.(template.id)}>
                      <Copy size={14} className="mr-2" />
                      Clonar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(template.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(template.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Search size={48} className="mb-4 text-gray-300" />
          <p className="text-gray-500">Nenhum template encontrado</p>
        </div>
      )}
    </div>
  );
}

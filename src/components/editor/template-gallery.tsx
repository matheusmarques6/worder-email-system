"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Copy, Trash2, Pencil, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Template } from "@/types";

const categories = [
  "Todos",
  "E-commerce",
  "Welcome",
  "Abandono",
  "Pós-compra",
  "Newsletter",
];

interface TemplateGalleryProps {
  templates: Template[];
  onClone?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TemplateGallery({
  templates,
  onClone,
  onDelete,
}: TemplateGalleryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "Todos" ||
      t.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus templates de email
          </p>
        </div>
        <Link href="/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Template
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Buscar templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
          <LayoutTemplate className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg text-gray-600">
            Nenhum template encontrado
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Crie seu primeiro template de email
          </p>
          <Link href="/templates/new" className="mt-4">
            <Button>Criar Template</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex h-40 items-center justify-center rounded-t-lg bg-gray-50">
                <LayoutTemplate className="h-10 w-10 text-gray-300" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {template.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-600 border-gray-200"
                  >
                    {template.category}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/templates/${template.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onClone?.(template.id)}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Clonar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDelete?.(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

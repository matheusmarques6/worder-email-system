"use client";

import { TemplateGallery } from "@/components/editor/template-gallery";
import type { Template } from "@/types";

// Mock data for now - will be replaced with Supabase queries
const mockTemplates: Template[] = [
  {
    id: "1",
    store_id: "1",
    name: "Boas-vindas",
    category: "Welcome",
    subject: "Bem-vindo à nossa loja!",
    html: null,
    design_json: null,
    thumbnail_url: null,
    is_prebuilt: true,
    created_at: "2026-03-01",
    updated_at: "2026-03-01",
  },
  {
    id: "2",
    store_id: "1",
    name: "Carrinho Abandonado",
    category: "Abandono",
    subject: "Você esqueceu algo no carrinho",
    html: null,
    design_json: null,
    thumbnail_url: null,
    is_prebuilt: true,
    created_at: "2026-03-01",
    updated_at: "2026-03-01",
  },
  {
    id: "3",
    store_id: "1",
    name: "Confirmação de Pedido",
    category: "E-commerce",
    subject: "Pedido confirmado #{{order_number}}",
    html: null,
    design_json: null,
    thumbnail_url: null,
    is_prebuilt: true,
    created_at: "2026-03-01",
    updated_at: "2026-03-01",
  },
  {
    id: "4",
    store_id: "1",
    name: "Avaliação Pós-Compra",
    category: "Pós-compra",
    subject: "Como foi sua experiência?",
    html: null,
    design_json: null,
    thumbnail_url: null,
    is_prebuilt: true,
    created_at: "2026-03-01",
    updated_at: "2026-03-01",
  },
  {
    id: "5",
    store_id: "1",
    name: "Newsletter Mensal",
    category: "Newsletter",
    subject: "Novidades do mês",
    html: null,
    design_json: null,
    thumbnail_url: null,
    is_prebuilt: true,
    created_at: "2026-03-01",
    updated_at: "2026-03-01",
  },
];

export default function TemplatesPage() {
  return <TemplateGallery templates={mockTemplates} />;
}

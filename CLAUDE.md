# CLAUDE.md — Convertfy Mail

## Projeto
Plataforma de email marketing + WhatsApp para e-commerce Shopify BR.
Clone do Klaviyo + Omnisend adaptado para mercado brasileiro.

## Stack
- Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- Resend (envio de email)
- Unlayer react-email-editor (editor drag-and-drop)
- React Flow @xyflow/react (flow builder visual)
- react-querybuilder (segment builder)
- Recharts (gráficos)
- WhatsApp Cloud API
- Vercel (deploy)
- pnpm (package manager)

## Regras de código
- Multi-tenant: TODA query filtra por store_id
- RLS habilitado em TODAS tabelas Supabase
- Validação com Zod para todos inputs
- Server Actions para mutations
- Interface em Português BR, código/comentários em Inglês
- Imports com @/ alias para src/
- NÃO usar Prisma — usar Supabase client direto
- NÃO usar `any` em TypeScript — tipar tudo
- NÃO instalar packages sem necessidade real

## Regras de UI/UX (OBRIGATÓRIO)
- Cor primária: laranja #F97316. NUNCA roxo, violeta ou gradientes
- Fonte: DM Sans (NÃO Inter, NÃO Roboto, NÃO system default)
- Sidebar: bg-[#1A1D21] escura, item ativo com border-left laranja 3px
- Cards: bg-white border border-gray-200 shadow-sm rounded-lg p-6
- Botão primary: bg-orange-500 hover:bg-orange-600 text-white rounded-lg
- Botão secondary: bg-white border border-gray-300 text-gray-700
- Status badges: Verde (live/verified), Cinza (draft), Amarelo (scheduled), Vermelho (failed)
- SEMPRE criar empty states com ícone + texto + CTA
- SEMPRE usar Skeleton durante loading
- SEMPRE ter breadcrumb no header
- SEMPRE feedback com toast após ações
- NUNCA cards com background colorido — só bg-white
- NUNCA sombras exageradas (shadow-sm apenas)
- NUNCA rounded-2xl ou rounded-3xl — usar rounded-lg (8px)
- NUNCA fontes genéricas de AI (Inter, Roboto)
- NUNCA lorem ipsum — textos reais em Português BR
- NUNCA gradientes como cor de fundo
- Max 5-6 metric cards no dashboard
- Tabelas com 5-7 colunas visíveis
- Ícones SOMENTE do lucide-react, tamanho padrão 18px
- Tipografia: H1=24px semibold, H2=18px semibold, Body=14px regular, Small=12px

## Paleta de cores (Tailwind config)
```
brand: {
  50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
  400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
  800: '#9A3412', 900: '#7C2D12',
},
sidebar: { DEFAULT: '#1A1D21', hover: '#2C3035', active: '#35393E' },
```

## Layout padrão
- Sidebar fixa 240px à esquerda (bg-[#1A1D21])
- Header com breadcrumb + user avatar
- Conteúdo: bg-white/bg-gray-50, max-w-7xl mx-auto, px-6 py-6
- Sidebar items: Dashboard, Campanhas, Automações, Templates, Audiência (sub: Perfis, Segmentos, Listas), Analytics, Configurações (sub: Integrações, Email, WhatsApp)

## Navegação (sidebar)
```
📊 Dashboard          → /
📧 Campanhas          → /campaigns
⚡ Automações          → /flows
✉️ Templates           → /templates
👥 Audiência
   Perfis             → /audience/profiles
   Segmentos          → /audience/segments
   Listas             → /audience/lists
📈 Analytics          → /analytics
⚙️ Configurações
   Integrações        → /settings/integrations
   Email              → /settings/email
   WhatsApp           → /settings/whatsapp
```

## Tabelas do banco (Supabase)
stores, contacts, products, events, lists, list_members, templates, segments, campaigns, flows, flow_executions, email_sends, whatsapp_sends

## Merge tags disponíveis
Profile: {{first_name}}, {{last_name}}, {{email}}, {{phone}}
Store: {{store_name}}, {{store_url}}
Cart: {{cart_items}}, {{cart_total}}, {{cart_url}}
Order: {{order_number}}, {{order_total}}, {{order_tracking_url}}
Product: {{product_name}}, {{product_image}}, {{product_price}}, {{product_url}}

## Repositórios de referência (se /reference/ existir)
- `/reference/adtracked/` — Webhook handler Shopify, OAuth, tracking server-side (do github.com/matheusmarques6/adtracked)
- `/reference/acelle/` — Lógica de automações, segmentação, merge tags, sending engine (do github.com/matheusmarques6/worder-email)
- `/reference/shadcn-workflows/` — React Flow + shadcn + custom nodes (do github.com/nobruf/shadcn-next-workflows)

## NPMs do projeto
@supabase/supabase-js, @supabase/ssr, @shopify/shopify-api, resend, react-email-editor, @xyflow/react, react-querybuilder, @react-querybuilder/dnd, papaparse, recharts, date-fns, zod, lucide-react, uuid

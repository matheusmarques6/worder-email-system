# AUTORUN-SETUP.md — Fundação (RODAR PRIMEIRO, SOZINHO)

Leia CLAUDE.md e DESIGN-SYSTEM.md. Execute TUDO sem parar.

## 1. INICIALIZAR

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --use-pnpm --no-git

pnpm add @supabase/supabase-js @supabase/ssr @shopify/shopify-api resend react-email-editor @xyflow/react react-querybuilder @react-querybuilder/dnd papaparse recharts date-fns zod lucide-react uuid nanoid
pnpm add -D @types/papaparse @types/uuid

pnpm dlx shadcn@latest init -d -y
pnpm dlx shadcn@latest add button card input label select table dialog sheet tabs toast badge separator skeleton avatar dropdown-menu popover calendar command switch textarea tooltip alert checkbox radio-group scroll-area sidebar breadcrumb progress slider toggle-group collapsible accordion -y
```

## 2. TAILWIND CONFIG

No tailwind.config.ts, extend:
- colors.brand: { 50:'#FFF7ED', 100:'#FFEDD5', 200:'#FED7AA', 300:'#FDBA74', 400:'#FB923C', 500:'#F97316', 600:'#EA580C', 700:'#C2410C', 800:'#9A3412', 900:'#7C2D12' }
- colors.sidebar: { DEFAULT:'#1A1D21', hover:'#2C3035', active:'#35393E' }
- fontFamily.sans: ['"DM Sans"', 'system-ui', 'sans-serif']

## 3. LAYOUT ROOT

src/app/layout.tsx: DM Sans via next/font/google weights 400,500,600,700. lang="pt-BR". Toaster component. Metadata title "Convertfy Mail".

globals.css: só @tailwind base/components/utilities + body bg-white text-gray-900.

## 4. SUPABASE CLIENTS (3 arquivos)

src/lib/supabase/client.ts — createBrowserClient com NEXT_PUBLIC vars
src/lib/supabase/server.ts — createServerClient com cookies() do next/headers
src/lib/supabase/admin.ts — createClient com SERVICE_ROLE_KEY (bypassa RLS)

## 5. TODA ESTRUTURA DE PASTAS (com .gitkeep)

```
src/app/(auth)/login/ register/ forgot-password/
src/app/(dashboard)/campaigns/new/ [id]/
src/app/(dashboard)/flows/new/ [id]/
src/app/(dashboard)/templates/new/ [id]/edit/
src/app/(dashboard)/audience/profiles/[id]/ segments/new/ segments/[id]/ lists/[id]/
src/app/(dashboard)/analytics/
src/app/(dashboard)/forms/new/ [id]/
src/app/(dashboard)/settings/integrations/ email/ whatsapp/ sms/ account/
src/app/api/auth/shopify/callback/
src/app/api/webhooks/shopify/ resend/ whatsapp/ sms/
src/app/api/t/o/[id]/ c/[id]/
src/app/api/track/
src/app/api/campaigns/send/ test/
src/app/api/cron/process-flows/ process-segments/
src/app/api/domains/verify/
src/app/api/unsubscribe/[id]/
src/app/api/forms/submit/
src/lib/shopify/ email/templates/ whatsapp/ sms/ flows/ segments/ analytics/ tracking/ recommendations/
src/components/layout/ dashboard/ campaigns/ flows/nodes/ editor/ segments/ contacts/ settings/ forms/
src/hooks/ types/
```

## 6. MIDDLEWARE AUTH

src/middleware.ts: Supabase middleware. Se não autenticado em rotas que NÃO são /login, /register, /api/webhooks, /api/t, /api/track, /api/unsubscribe, /api/forms/submit → redirect /login. Se autenticado em /login ou /register → redirect /.

## 7. AUTH PAGES

src/app/(auth)/layout.tsx: bg-gray-50, flex items-center justify-center min-h-screen. Card central max-w-md.

src/app/(auth)/login/page.tsx: Logo "Convertfy Mail" (Convertfy em gray-900 + Mail em brand-500). Card bg-white rounded-xl border shadow-sm p-8. Título "Entrar na sua conta" text-xl semibold. Inputs email + senha. Botão "Entrar" w-full bg-brand-500. Link "Criar conta grátis". Supabase signInWithPassword. Toast erro.

src/app/(auth)/register/page.tsx: Mesmo visual. Inputs: nome completo, email, senha. Botão "Criar conta grátis". Supabase signUp. Após sucesso: INSERT stores (user_id, name). Redirect /.

src/hooks/use-store.ts: Hook busca store do user logado. Retorna { store, loading }.

## 8. DASHBOARD LAYOUT + SIDEBAR

src/app/(dashboard)/layout.tsx: flex min-h-screen bg-gray-50. Sidebar fixa esquerda w-60. Conteúdo flex-1 ml-60. Header no topo. Main p-6 max-w-7xl mx-auto.

src/components/layout/sidebar.tsx: PROFISSIONAL inspirado Klaviyo:
- bg-sidebar h-screen fixed w-60, flex flex-col
- Logo topo: px-5 py-5, "Convertfy" text-white font-bold + "Mail" text-brand-400
- Nav items: ícones lucide 18px, text-sm, text-gray-400, hover:text-gray-200 hover:bg-sidebar-hover
- ATIVO: bg-sidebar-active text-white border-l-[3px] border-brand-500
- Submenus expansíveis (Audiência, Config) com ChevronDown
- Separadores: h-px bg-gray-700/50 mx-4 my-2
- Footer: avatar iniciais + nome + email truncado + botão sair
- Items do CLAUDE.md: Dashboard, Campanhas, Automações, Templates, Audiência (Perfis/Segmentos/Listas), Formulários, Analytics, Configurações (Integrações/Email/WhatsApp/SMS)
- usePathname() para ativo

src/components/layout/header.tsx: h-16 border-b bg-white. Breadcrumb esquerda. Avatar dropdown direita (Minha conta, Sair).

## 9. DASHBOARD HOME

src/app/(dashboard)/page.tsx:
- H1 "Dashboard" + subtitle "Visão geral"
- 5 metric cards grid-cols-5 gap-4: Emails Enviados (Mail), Taxa Abertura (Eye), Taxa Clique (MousePointerClick), Contatos Ativos (Users), Flows Ativos (Zap). Valores 0 por agora.
- Recharts AreaChart: "Emails Enviados" últimos 30 dias. Cor brand-500. Dados mock.
- Tabela "Campanhas Recentes" ou empty state: "Nenhuma campanha enviada. Crie sua primeira!" + botão CTA

src/components/dashboard/metric-card.tsx: bg-white border-gray-200 shadow-sm rounded-lg p-6. Icon 20px em bg-brand-50 rounded-lg p-2 text-brand-600. Label text-sm text-gray-500. Value text-3xl font-bold. Change text-xs (green/red).

## 10. .env.example + vercel.json

.env.example com TODAS variáveis do CLAUDE.md.
vercel.json: crons para process-flows (1min) e process-segments (15min).

## FINALIZAR

pnpm build → corrigir erros → git add -A && git commit -m "feat: foundation auth layout dashboard" && git push origin main

NÃO PARE até o push ser feito.

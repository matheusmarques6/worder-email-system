# AUTORUN-SETUP.md — Rodar PRIMEIRO (antes dos outros 5 Claudes)

Leia CLAUDE.md e DESIGN-SYSTEM.md. Execute TUDO abaixo em sequência sem parar.

## MÓDULO 1: Inicializar projeto

Inicialize Next.js 15 neste repositório com: TypeScript, Tailwind CSS, App Router, src directory, pnpm.

Instale dependências:
```
pnpm add @supabase/supabase-js @supabase/ssr @shopify/shopify-api resend react-email-editor @xyflow/react react-querybuilder @react-querybuilder/dnd papaparse recharts date-fns zod lucide-react uuid
pnpm add -D @types/papaparse @types/uuid
```

Instale shadcn/ui:
```
pnpm dlx shadcn@latest init -d -y
pnpm dlx shadcn@latest add button card input label select table dialog sheet tabs toast badge separator skeleton avatar dropdown-menu popover calendar command switch textarea tooltip alert checkbox radio-group scroll-area sidebar breadcrumb -y
```

## MÓDULO 2: Configurar Tailwind + Layout

No tailwind.config.ts adicione extend:
- colors.brand: { 50:'#FFF7ED', 100:'#FFEDD5', 200:'#FED7AA', 300:'#FDBA74', 400:'#FB923C', 500:'#F97316', 600:'#EA580C', 700:'#C2410C', 800:'#9A3412', 900:'#7C2D12' }
- colors.sidebar: { DEFAULT:'#1A1D21', hover:'#2C3035', active:'#35393E' }
- fontFamily.sans: ['"DM Sans"', 'system-ui', 'sans-serif']

No src/app/layout.tsx: importar DM Sans via next/font/google com weights 400,500,600,700. Metadata title "Convertfy Mail".

## MÓDULO 3: Supabase clients

Criar src/lib/supabase/client.ts:
```typescript
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
```

Criar src/lib/supabase/server.ts:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
    },
  })
}
```

Criar src/lib/supabase/admin.ts:
```typescript
import { createClient } from '@supabase/supabase-js'
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
```

## MÓDULO 4: Estrutura de pastas

Criar TODAS estas pastas com .gitkeep em cada:
src/app/(auth)/login, src/app/(auth)/register, src/app/(dashboard)/campaigns/new, src/app/(dashboard)/campaigns/[id], src/app/(dashboard)/flows/new, src/app/(dashboard)/flows/[id], src/app/(dashboard)/templates/new, src/app/(dashboard)/templates/[id]/edit, src/app/(dashboard)/audience/profiles/[id], src/app/(dashboard)/audience/segments/new, src/app/(dashboard)/audience/lists/[id], src/app/(dashboard)/analytics, src/app/(dashboard)/settings/integrations, src/app/(dashboard)/settings/email, src/app/(dashboard)/settings/whatsapp, src/app/api/auth/shopify/callback, src/app/api/webhooks/shopify, src/app/api/webhooks/resend, src/app/api/webhooks/whatsapp, src/app/api/t/o/[id], src/app/api/t/c/[id], src/app/api/campaigns/send, src/app/api/campaigns/test, src/app/api/cron/process-flows, src/app/api/domains/verify, src/app/api/unsubscribe/[id], src/lib/shopify, src/lib/email/templates, src/lib/whatsapp, src/lib/flows, src/lib/segments, src/lib/analytics, src/components/layout, src/components/dashboard, src/components/campaigns, src/components/flows/nodes, src/components/editor, src/components/segments, src/components/contacts, src/components/settings, src/hooks, src/types

## MÓDULO 5: Middleware + Auth pages + Página raiz

Criar src/middleware.ts que verifica sessão Supabase. Se não autenticado em /(dashboard)/* → redirect /login. Se autenticado em /login ou /register → redirect /.

Criar src/app/(auth)/layout.tsx — Layout centralizado sem sidebar, bg-gray-50, logo "Convertfy Mail" acima do card central.

Criar src/app/(auth)/login/page.tsx — Form email + senha. Botão "Entrar" laranja (bg-brand-500). Link "Criar conta". Supabase signInWithPassword. Toast erro. Redirect / após login.

Criar src/app/(auth)/register/page.tsx — Form nome + email + senha. Botão "Criar conta" laranja. Supabase signUp. Após registro: INSERT stores com user_id e name. Redirect /.

Criar src/app/page.tsx — redirect para /login.

Criar src/hooks/use-store.ts — Hook: busca store WHERE user_id = current user. Retorna { store, loading }.

## MÓDULO 6: Layout dashboard + Sidebar + Dashboard home

Criar src/app/(dashboard)/layout.tsx — Sidebar fixa esquerda 240px bg-[#1A1D21] + conteúdo principal. Seguir DESIGN-SYSTEM.md EXATAMENTE para cores, tipografia, spacing.

Criar src/components/layout/sidebar.tsx — Logo "Convertfy Mail" topo. Nav items com ícones lucide-react 18px conforme CLAUDE.md. Item ativo: bg-sidebar-active border-l-3 border-brand-500 text-white. Submenus para Audiência e Configurações. Collapse mobile.

Criar src/components/layout/header.tsx — Breadcrumb + avatar user dropdown (Perfil, Sair).

Criar src/app/(dashboard)/page.tsx — Dashboard com:
- 5 metric cards em row: Emails Enviados, Taxa Abertura, Taxa Clique, Contatos Ativos, Flows Ativos (dados mock por agora, valores 0)
- Recharts AreaChart: emails por dia (mock data, cor brand-500)
- Tabela últimas 5 campanhas (empty state: "Nenhuma campanha enviada. Crie sua primeira campanha!")

Criar src/components/dashboard/metric-card.tsx — Seguir DESIGN-SYSTEM.md: bg-white border-gray-200 shadow-sm rounded-lg p-6. Ícone 20px + label text-sm text-gray-500 + número text-3xl font-bold + variação text-xs.

## FINALIZAR

Rodar `pnpm build`. Se falhar, corrigir TODOS os erros até passar.
Depois: `git add -A && git commit -m "feat: project setup + auth + layout + dashboard" && git push origin main`

IMPORTANTE: Não pare até o build passar e o push ser feito.

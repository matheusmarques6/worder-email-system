# AUTORUN-CLAUDE-4.md — Segments + Contacts + Lists

Leia CLAUDE.md e DESIGN-SYSTEM.md. Execute TUDO abaixo em sequência sem parar. Antes de começar: `git pull origin main`.

Você SÓ cria/edita arquivos nestas pastas:
src/lib/segments/, src/components/segments/, src/components/contacts/, src/app/(dashboard)/audience/

---

## MÓDULO A: Contacts Table + Profile Page

Criar src/app/(dashboard)/audience/profiles/page.tsx:
- Título "Contatos", botão "Importar CSV" (secondary)
- DataTable paginada server-side (20/page)
- Colunas: Nome (first_name + last_name), Email, Telefone, Total Gasto (R$ formatado), Pedidos, Consent (badge: subscribed=verde, unsubscribed=vermelho, bounced=cinza), Criado em (date formatado)
- Busca por nome ou email (input com ícone Search)
- Clicar em row → navegar /audience/profiles/[id]
- Empty state: "Nenhum contato ainda. Conecte sua loja Shopify ou importe um CSV."

Criar src/components/contacts/contacts-table.tsx:
- shadcn DataTable com sorting por nome, email, total_spent, created_at
- Badge component para consent_email
- Formatação: R$ para valores monetários, dd/mm/yyyy para datas

Criar src/app/(dashboard)/audience/profiles/[id]/page.tsx:
- Buscar contact pelo id + events + email_sends + list_members
- Layout com 2 colunas: info card à esquerda (1/3), tabs à direita (2/3)
- Info card: avatar placeholder com iniciais, nome, email, phone, cidade/estado, tags (badges), consent badge, botão "Editar"
- Tabs (shadcn Tabs):
  Timeline: eventos ordenados por created_at desc. Cada evento: ícone por tipo (ShoppingCart para placed_order, Mail para email_sent, Eye para email_opened, MousePointer para email_clicked, CreditCard para order_paid, Truck para order_fulfilled), título, data relativa, expandir para ver properties
  Emails: tabela de email_sends com subject, status, opened_at, clicked_at
  Listas: listas e segmentos que o contato pertence

Criar src/components/contacts/contact-detail.tsx — Card de info pessoal
Criar src/components/contacts/contact-timeline.tsx — Lista de eventos com ícones

Criar src/components/contacts/import-csv.tsx:
- Dialog (shadcn Dialog) de importação:
  Step 1: Drop zone para upload CSV. Usar input type=file accept=".csv"
  Step 2: Parse com papaparse no browser. Mostrar preview 5 primeiras linhas em tabela
  Step 3: Mapeamento: para cada coluna do CSV, select dropdown mapeando para campo do contato (email, first_name, last_name, phone, city, tags). Campo email obrigatório.
  Step 4: Selecionar lista destino (dropdown das lists da store)
  Step 5: Botão "Importar X contatos" → server action que faz bulk upsert em contacts + insert em list_members
  Progress bar durante import. Toast de sucesso com contagem.

## MÓDULO B: Lists CRUD

Criar src/app/(dashboard)/audience/lists/page.tsx:
- Tabela: nome, descrição, tipo opt-in (single/double), contagem membros, data criação
- Botão "Criar Lista" → dialog com input nome + description + select opt-in type → INSERT lists
- Empty state: "Crie sua primeira lista para organizar seus contatos"

Criar src/app/(dashboard)/audience/lists/[id]/page.tsx:
- Header: nome lista, badge opt-in type, contagem
- Tabela de membros: nome, email, phone, status (active/unsubscribed), data adição
- Botões: "Adicionar Contato" (dialog com busca de contato existente), "Importar CSV"
- Botão "Remover" por membro

## MÓDULO C: Segment Builder + Resolver

Criar src/app/(dashboard)/audience/segments/page.tsx:
- Tabela: nome, descrição, contagem, badge "Pré-construído" se is_prebuilt, última atualização
- Botão "Criar Segmento"
- Seção "Segmentos Pré-construídos" com 6 cards: Engajados, Não Engajados, Compradores Recorrentes, Novos Inscritos, Nunca Comprou, Em Risco
- Empty state para tabela vazia

Criar src/app/(dashboard)/audience/segments/new/page.tsx:
- Form: nome, descrição
- SegmentBuilder component abaixo
- Preview: contagem estimada em tempo real
- Botão "Criar Segmento" (laranja)

Criar src/components/segments/segment-builder.tsx:
- Wrapper do react-querybuilder customizado com shadcn components
- Fields configurados:
  Profile: email(text), first_name(text), city(text), country(text), total_spent(number), total_orders(number), consent_email(select: subscribed/unsubscribed/bounced), tags(text), created_at(date), last_order_at(date)
  Events: placed_order_count(number), email_opened_count(number), email_clicked_count(number), started_checkout_count(number)
- Operators por tipo: text(equals, not_equals, contains, starts_with, is_set, is_not_set), number(=, !=, >, <, >=, <=, between), date(before, after, in_last_days, in_last_months), select(equals, not_equals)
- Combinator AND/OR toggle
- Botão "Adicionar condição"
- Visual limpo seguindo DESIGN-SYSTEM.md

Criar src/components/segments/segment-preview.tsx:
- Mostra: "X contatos correspondem" com ícone Users
- Abaixo: tabela com 5 sample profiles (nome, email)
- Loading state com skeleton

Criar src/lib/segments/resolver.ts:
```typescript
export async function resolveSegment(segmentId: string, storeId: string): Promise<string[]> {
  // Buscar segment.conditions (JSON do react-querybuilder)
  // Chamar buildContactQuery
  // Retornar array de contact_ids
}
export async function countSegment(conditions: object, storeId: string): Promise<number> {
  // Mesmo que resolve mas retorna apenas count
}
```

Criar src/lib/segments/query-builder.ts:
- buildContactQuery(conditions, storeId): traduzir JSON do react-querybuilder para Supabase queries
- Para profile fields: usar .eq(), .neq(), .gt(), .lt(), .gte(), .lte(), .ilike(), .contains(), .is()
- Para event counts: subquery em events com GROUP BY contact_id HAVING count
- Para tags: .contains('tags', [value])
- Combinator 'and': chain de filters. Combinator 'or': usar .or()

Criar src/lib/segments/prebuilt.ts:
- 6 segmentos pré-construídos como objetos { name, description, conditions (JSON react-querybuilder) }:
  1. Engajados: opened email in last 30 days AND consent=subscribed
  2. Não Engajados: NOT opened email in last 90 days AND consent=subscribed
  3. Compradores Recorrentes: total_orders >= 2
  4. Novos Inscritos: created_at in last 7 days
  5. Nunca Comprou: total_orders = 0 AND consent=subscribed
  6. Em Risco: last_order_at before 60 days ago AND total_orders >= 1

## FINALIZAR

`pnpm build` → corrigir tudo → `git pull origin main && git add -A && git commit -m "feat: contacts segments lists complete" && git push origin main`
Se push falhar: `git pull --rebase origin main` e push novamente. NÃO PARE.

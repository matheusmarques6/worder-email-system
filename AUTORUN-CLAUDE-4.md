# AUTORUN-CLAUDE-4.md — Contacts + Segments + Lists + Sign-up Forms + CDP

Leia CLAUDE.md e DESIGN-SYSTEM.md. git pull origin main. Execute TUDO sem parar.

SÓ edite: src/lib/segments/, src/components/segments/, src/components/contacts/, src/components/forms/, src/app/(dashboard)/audience/, src/app/(dashboard)/forms/, src/app/api/forms/

---

## MÓDULO A: Contacts Table + Profile

src/app/(dashboard)/audience/profiles/page.tsx:
- H1 "Contatos", subtitle count total. Botões: "Importar CSV" (secondary), "Exportar" (ghost)
- DataTable paginada server-side 20/page
- Colunas: checkbox select, Nome (first+last), Email, Telefone, Total Gasto (R$ formato), Pedidos (número), Consent (badge verde/vermelho/cinza), Tags (badges), Criado em
- Busca por nome/email. Filtro consent (Todos/Subscribed/Unsubscribed)
- Bulk actions ao selecionar: Adicionar tag, Remover tag, Adicionar à lista
- Click row → /audience/profiles/[id]
- Empty state: ícone Users, "Nenhum contato ainda. Conecte Shopify ou importe CSV."

src/components/contacts/contacts-table.tsx — DataTable com sorting, badges, formatação R$.

src/app/(dashboard)/audience/profiles/[id]/page.tsx:
- Grid 2 colunas (1/3 + 2/3)
- Coluna esquerda: Card com avatar (iniciais, bg-brand-100 text-brand-700, w-16 h-16 rounded-full text-xl), nome completo, email (copiável), telefone, localização (cidade/estado/país), tags como badges editáveis (+), consent badge, botões Editar/Suprimir
- Coluna direita: Tabs (shadcn):
  **Timeline**: eventos cronológicos desc. Cada evento: ícone por tipo (ShoppingCart=placed_order, Mail=email_sent, Eye=email_opened, MousePointerClick=email_clicked, CreditCard=order_paid, Truck=order_fulfilled, ShoppingBag=started_checkout, UserPlus=customer_created), título, data relativa (há 2 horas), valor se revenue, expandir para ver properties JSON formatado
  **Emails**: tabela email_sends com subject, status badge, sent_at, opened_at, clicked_at
  **Pedidos**: tabela events WHERE type=placed_order. Order number, total, items count, data
  **Listas**: listas e segmentos do contato. Botão "Adicionar à lista"

src/components/contacts/contact-timeline.tsx — Lista infinita. Ícones coloridos. Date relative com date-fns (formatDistanceToNow com locale pt-BR).
src/components/contacts/import-csv.tsx — Dialog multi-step:
1. Upload CSV (drop zone com Upload icon)
2. Parse papaparse → preview tabela 5 rows
3. Mapeamento: cada coluna CSV → dropdown campo contato (email obrigatório, rest opcional)
4. Selecionar lista destino
5. Progress bar durante import → toast sucesso

## MÓDULO B: Lists

src/app/(dashboard)/audience/lists/page.tsx — Tabela: nome, contagem, opt-in type badge, data. Botão "Criar Lista" → dialog: nome, descrição, opt-in type (single/double). Empty state.

src/app/(dashboard)/audience/lists/[id]/page.tsx — Header com nome, badge, contagem. Tabela membros: nome, email, status, data. Botões: Adicionar contato (dialog busca), Importar CSV, Exportar. Remover membro.

## MÓDULO C: Segment Builder Completo

src/app/(dashboard)/audience/segments/page.tsx — Tabela: nome, descrição, contagem (badge), badge "Pré-construído" se is_prebuilt, updated_at. Botão "Criar Segmento". Seção inferior: "Segmentos prontos para usar" com 10 cards. Empty state.

src/app/(dashboard)/audience/segments/new/page.tsx — Nome, descrição. SegmentBuilder component. Preview contagem tempo real. Botão "Criar Segmento" (laranja).

src/components/segments/segment-builder.tsx — react-querybuilder CUSTOMIZADO com shadcn:
Fields COMPLETOS:
```
// Profile properties
email (text) — operators: equals, not_equals, contains, starts_with, ends_with, is_set, is_not_set
first_name (text)
last_name (text)
phone (text) — is_set, is_not_set
city (text) — equals, contains
state (text) — equals
country (text) — equals
zip_code (text)
tags (text) — contains, not_contains
source (select) — values: shopify, import, form, api
consent_email (select) — values: subscribed, unsubscribed, bounced
consent_whatsapp (select) — values: subscribed, unsubscribed, none
total_spent (number) — =, !=, >, <, >=, <=, between
total_orders (number)
avg_order_value (number)
created_at (date) — before, after, in_last_days, in_last_months, between_dates
last_order_at (date)
// Event-based
event:placed_order (number+timeframe) — at_least X times in last Y days
event:started_checkout (number+timeframe)
event:email_opened (number+timeframe)
event:email_clicked (number+timeframe)
event:viewed_product (number+timeframe)
// List membership
in_list (select) — values: dynamic from lists table
not_in_list (select)
```
Combinator AND/OR toggle visível. Botão "Adicionar condição" + "Adicionar grupo".
Visual clean com shadcn components (Select, Input, Button). Não usar estilo default do react-querybuilder.

src/components/segments/segment-preview.tsx — Mostra count + 5 sample contacts + loading skeleton.

## MÓDULO D: Segment Resolver

src/lib/segments/resolver.ts:
- resolveSegment(segmentId, storeId): Promise<string[]> — retorna contact_ids
- countSegment(conditions, storeId): Promise<number>

src/lib/segments/query-builder.ts — Traduz JSON react-querybuilder → Supabase queries:
Profile fields: usar .eq(), .neq(), .gt(), .lt(), .ilike('%value%'), .contains(), .is(null), .not.is(null)
Event counts: subquery em events WHERE event_type AND created_at, GROUP BY contact_id HAVING count
List membership: subquery em list_members
Tags: .contains('tags', [value])
Combinator and: chain filters. or: .or('field1.eq.val1,field2.eq.val2')
Date in_last_days: .gte('field', new Date(Date.now() - days*86400000).toISOString())

src/lib/segments/prebuilt.ts — 10 segmentos pré-construídos:
1. Inscritos Engajados — abriu email últimos 30d + subscribed
2. Não Engajados — NÃO abriu email 90d + subscribed
3. Compradores Recorrentes — total_orders >= 2
4. Novos Inscritos — created_at últimos 7d
5. Nunca Comprou — total_orders = 0 + subscribed
6. Em Risco de Churn — last_order_at > 60d + total_orders >= 1
7. VIP (Top Spenders) — total_spent > R$500
8. Compradores Recentes — last_order_at últimos 30d
9. Abandonaram Carrinho — started_checkout últimos 7d + NOT placed_order últimos 7d
10. Fãs de Email — email_opened >= 5 últimos 30d

## MÓDULO E: Sign-up Forms / Popups

src/app/(dashboard)/forms/page.tsx:
- Tabela: nome, tipo (popup/embedded/landing), status (active/inactive), submissions count, conversion rate. Botão "Criar Formulário". Empty state.

src/app/(dashboard)/forms/new/page.tsx:
- Tipo: Popup, Formulário Embedded, Landing Page
- Config: campos a coletar (email obrigatório, nome, telefone, custom), lista destino, mensagem de sucesso
- Design: bg color, text color, button color (default brand-500), título, subtítulo, imagem header
- Trigger (popup): after X seconds, on exit intent, on scroll %, manual
- Gerar embed code (para popup/embedded)

src/app/(dashboard)/forms/[id]/page.tsx — Editor do form + preview + analytics (submissions, conversion rate)

src/components/forms/form-builder.tsx — Builder visual simples: preview à esquerda, config à direita.

src/app/api/forms/submit/route.ts — POST público (sem auth):
Recebe { form_id, email, name?, phone?, custom_fields? }. Buscar form config → store_id. Upsert contact. Adicionar à lista configurada. INSERT list_members. Disparar flow de welcome se existe. Retornar { success }.

## MÓDULO F: CDP Foundation

Enriquecer o perfil do contato automaticamente:
- No webhook handler de orders: calcular e salvar em contacts.properties: { first_purchase_date, last_purchase_date, purchase_frequency, preferred_categories[], avg_days_between_orders, predicted_next_order_date }
- No webhook handler de products viewed: salvar em properties: { recently_viewed_products[], most_viewed_category }
- Estes campos ficam disponíveis para segmentação e merge tags

## FINALIZAR

pnpm build → corrigir → git pull --rebase origin main && git add -A && git commit -m "feat: contacts segments forms cdp" && git push origin main
NÃO PARE.

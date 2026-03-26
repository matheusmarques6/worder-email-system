# PROMPTS — Convertfy Mail (15 módulos sequenciais)

Execute na ordem. Cada prompt é independente. Após cada um: `pnpm build` → se OK → `git commit && git push`.

---

## PROMPT 1 — Setup do Projeto

```
Leia CLAUDE.md e DESIGN-SYSTEM.md na raiz.

Inicialize Next.js 15 com App Router, TypeScript, Tailwind CSS, src dir, pnpm. Depois:

1. Instale: @supabase/supabase-js @supabase/ssr @shopify/shopify-api resend react-email-editor @xyflow/react react-querybuilder @react-querybuilder/dnd papaparse recharts date-fns zod lucide-react uuid (dev: @types/papaparse @types/uuid)

2. Instale shadcn/ui: pnpm dlx shadcn@latest init -d -y && pnpm dlx shadcn@latest add button card input label select table dialog sheet tabs toast badge separator skeleton avatar dropdown-menu popover calendar command switch textarea tooltip alert checkbox radio-group scroll-area sidebar breadcrumb -y

3. Configure tailwind.config.ts com colors.brand (laranja), colors.sidebar (#1A1D21), fontFamily.sans DM Sans — conforme DESIGN-SYSTEM.md

4. Configure layout.tsx com DM Sans via next/font/google weights 400,500,600,700. Metadata title "Convertfy Mail"

5. Crie 3 Supabase clients: src/lib/supabase/client.ts (createBrowserClient), server.ts (createServerClient com cookies), admin.ts (createClient com service_role)

6. Crie toda estrutura de pastas com .gitkeep: src/app/(auth)/login, register. src/app/(dashboard)/campaigns/new, [id]. flows/new, [id]. templates/new, [id]/edit. audience/profiles/[id], segments/new, lists/[id]. analytics. settings/integrations, email, whatsapp. src/app/api/auth/shopify/callback. webhooks/shopify, resend, whatsapp. t/o/[id], t/c/[id]. campaigns/send. cron/process-flows. domains/verify. unsubscribe/[id]. src/lib/shopify, email/templates, whatsapp, flows, segments, analytics. src/components/layout, dashboard, campaigns, flows/nodes, editor, segments, contacts, settings. src/hooks, src/types

7. Crie .env.example com todas variáveis do CLAUDE.md

8. src/app/page.tsx com redirect para /login

9. pnpm build → corrigir até passar → git add -A && git commit -m "feat: initial setup" && git push
```

---

## PROMPT 2 — Layout + Sidebar + Dashboard

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie o layout principal e dashboard home.

1. src/app/(dashboard)/layout.tsx — Layout com sidebar fixa à esquerda (240px, bg-[#1A1D21]) + área de conteúdo. Sidebar com: logo "Convertfy Mail" no topo, navegação conforme CLAUDE.md, ícones lucide-react 18px. Item ativo: bg-sidebar-active border-l-3 border-brand-500 text-white. Items inativos: text-gray-400 hover:text-gray-200. Collapse em mobile com hamburger.

2. src/components/layout/sidebar.tsx — Componente da sidebar com nav items, submenus expansíveis para Audiência e Configurações. Usar usePathname() para detectar ativo.

3. src/components/layout/header.tsx — Header com breadcrumb (shadcn Breadcrumb) + avatar do user com dropdown (Perfil, Sair).

4. src/app/(dashboard)/page.tsx — Dashboard home com:
   - Row de 5 metric cards: Emails Enviados, Taxa Abertura, Taxa Clique, Contatos Ativos, Flows Ativos
   - Recharts AreaChart: emails por dia últimos 30d (dados mock por agora)
   - Tabela: últimas 5 campanhas (dados mock)

5. src/components/dashboard/metric-card.tsx — Card com ícone, label cinza, número grande, variação %. Seguir DESIGN-SYSTEM.md exatamente.

6. src/components/dashboard/revenue-chart.tsx — Recharts AreaChart responsivo, cor laranja brand-500.

7. Todos empty states em Português BR. Skeletons para loading.

pnpm build → git commit -m "feat: layout sidebar dashboard" → git push
```

---

## PROMPT 3 — Auth (Login/Register/Store)

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie autenticação com Supabase Auth.

1. src/app/(auth)/layout.tsx — Layout centralizado sem sidebar, bg-gray-50, card central.

2. src/app/(auth)/login/page.tsx — Form com email + senha. Logo "Convertfy Mail" acima. Botão "Entrar" laranja. Link "Criar conta". Usar Supabase signInWithPassword. Toast de erro. Redirect para / após login.

3. src/app/(auth)/register/page.tsx — Form: nome, email, senha. Botão "Criar conta" laranja. Supabase signUp. Após registro: criar store automaticamente na tabela stores (INSERT com user_id e name). Redirect para /.

4. src/middleware.ts — Middleware de auth: verificar sessão Supabase. Se não autenticado em rotas /(dashboard)/*, redirect /login. Se autenticado em /login ou /register, redirect /.

5. src/hooks/use-store.ts — Hook que busca store do user atual: SELECT * FROM stores WHERE user_id = current user. Retorna { store, loading, error }.

6. src/app/(auth)/forgot-password/page.tsx — Form de recuperação de senha.

pnpm build → git commit -m "feat: auth login register store" → git push
```

---

## PROMPT 4 — Shopify OAuth + Webhooks

```
Leia CLAUDE.md. Crie integração Shopify completa.

Referência: o repo github.com/matheusmarques6/adtracked tem implementação completa de OAuth Shopify e webhook handler em app/api/webhooks/shopify/route.ts e app/api/auth/shopify/route.ts. Use a MESMA lógica adaptando as tabelas.

1. src/lib/shopify/oauth.ts — generateAuthUrl(shopDomain, storeId) que gera URL OAuth Shopify com SHOPIFY_API_KEY, SHOPIFY_SCOPES, redirect_uri para /api/auth/shopify/callback

2. src/app/api/auth/shopify/route.ts — GET: recebe shop domain como query param, gera auth URL, redireciona

3. src/app/api/auth/shopify/callback/route.ts — GET: recebe code do Shopify, troca por access_token via POST https://{shop}/admin/oauth/access_token, salva access_token e shop domain na tabela stores, chama registerWebhooks

4. src/lib/shopify/webhooks.ts — registerWebhooks(shop, accessToken, storeId): registra 12 webhooks (orders/create, orders/paid, orders/fulfilled, orders/cancelled, checkouts/create, checkouts/update, customers/create, customers/update, products/update, refunds/create). Verifica existentes antes de criar. Deleta duplicados.

5. src/app/api/webhooks/shopify/route.ts — POST handler:
   - Verificar HMAC signature com crypto.timingSafeEqual
   - Switch por x-shopify-topic
   - orders/create → upsert contact + criar event type='placed_order' + update contact.total_spent/total_orders
   - orders/paid → criar event type='order_paid' + update contact metrics
   - orders/fulfilled → event type='order_fulfilled'
   - orders/cancelled → event type='order_cancelled'
   - checkouts/create e update → event type='started_checkout' (para abandoned cart)
   - customers/create e update → upsert contact
   - products/update → upsert product
   - refunds/create → event type='refund_created'

6. src/lib/shopify/sync.ts — syncCustomers, syncProducts, syncOrders (bulk sync inicial via Shopify Admin API)

7. src/app/(dashboard)/settings/integrations/page.tsx — Página com botão "Conectar Shopify", input de domínio da loja, status de conexão, data do último sync.

8. src/components/settings/shopify-connect.tsx — Card de status: conectado/desconectado, domain, botões.

pnpm build → git commit -m "feat: shopify oauth webhooks" → git push
```

---

## PROMPT 5 — Email Editor + Templates

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie editor de email e galeria de templates.

1. src/components/editor/email-editor.tsx — Wrapper do react-email-editor (Unlayer). Props: designJson, onSave(html, json). Configurar: mergeTags do CLAUDE.md, locale pt-BR, appearance modern_light. Se NEXT_PUBLIC_UNLAYER_PROJECT_ID existir, usar.

2. src/components/editor/merge-tags.ts — Exportar objeto mergeTags com todos os merge tags do CLAUDE.md formatados para Unlayer: { first_name: { name: 'Nome', value: '{{first_name}}' }, ... }

3. src/app/(dashboard)/templates/page.tsx — Grid de templates em cards (3 colunas). Cada card: thumbnail (ou placeholder cinza), nome, categoria badge, botões Editar/Clonar/Deletar. Filtro por categoria (Todos, E-commerce, Welcome, Abandono, Pós-compra, Newsletter). Busca por nome. Botão "Criar Template" laranja.

4. src/components/editor/template-gallery.tsx — Componente do grid com filtros.

5. src/app/(dashboard)/templates/new/page.tsx — Form: nome, categoria (select). Opções: "Começar do zero" ou "Usar template pré-construído". Redirect para /templates/[id]/edit.

6. src/app/(dashboard)/templates/[id]/edit/page.tsx — Página fullscreen com Unlayer. Buscar template do Supabase → loadDesign(design_json). Botão "Salvar" → exportHtml → update design_json e html no Supabase. Botão "Enviar Teste" (input email + botão). Botão "Voltar".

7. Criar 5 templates pré-built em src/lib/email/templates/ como JSON do Unlayer: welcome.json, abandoned-cart.json, order-confirm.json, post-purchase.json, newsletter.json. Cada um com merge tags já inseridos, layout responsivo, product blocks.

8. Server action ou API para: criar template, update, clone, delete.

pnpm build → git commit -m "feat: email editor templates" → git push
```

---

## PROMPT 6 — Merge Tag Engine + Sending via Resend

```
Leia CLAUDE.md. Crie engine de merge tags e envio via Resend.

Referência: Acelle StringHelper.php faz substituição de tags + reescrita de URLs + injeção de pixel. Reimplementar em TypeScript.

1. src/lib/email/render.ts:
   - renderMergeTags(html, data) → substituir {{tag}} por valor. Fallback: {{tag|default}}
   - rewriteUrlsForTracking(html, emailSendId, baseUrl) → todo <a href="URL"> vira /api/t/c/{id}?url=encodedURL
   - injectOpenPixel(html, emailSendId, baseUrl) → <img src="/api/t/o/{id}" width="1" height="1" /> antes do </body>
   - addUnsubscribeLink(html, emailSendId, baseUrl) → link antes do </body> se não existir
   - prepareEmailHtml(html, contact, store, emailSendId) → pipeline completo

2. src/lib/email/resend.ts:
   - Resend client com RESEND_API_KEY
   - sendEmail({ to, from, senderName, subject, html, replyTo }) → retorna { id } ou { error }
   - sendBatch(emails[]) para envio em massa

3. src/lib/email/send-campaign-email.ts:
   - Função completa: buscar template → render merge tags com dados do contact e store → rewrite URLs → inject pixel → add unsubscribe → enviar via Resend → INSERT email_sends (status, contact_id, campaign_id, resend_message_id)

pnpm build → git commit -m "feat: merge tags sending engine" → git push
```

---

## PROMPT 7 — Tracking (Open/Click/Bounce)

```
Leia CLAUDE.md. Crie endpoints de tracking de email.

Referência: Acelle CampaignController.php tem open(), click(), unsubscribe() testados em produção.

1. src/app/api/t/o/[id]/route.ts — GET. Open tracking pixel.
   Buscar email_send por id (admin client). Se opened_at null → update opened_at = now(). Criar event type='email_opened'. Retornar GIF 1x1: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64') com Content-Type image/gif, Cache-Control no-store.

2. src/app/api/t/c/[id]/route.ts — GET. Click tracking redirect.
   Recebe ?url=encodedUrl. Buscar email_send. Se clicked_at null → update clicked_at. Criar event type='email_clicked' com {url}. Redirect 302 para URL decodificada.

3. src/app/api/unsubscribe/[id]/route.ts — GET. Unsubscribe.
   Buscar email_send → contact_id. Update contact.consent_email = 'unsubscribed'. Retornar HTML simples: "Você foi descadastrado com sucesso. Não receberá mais emails."

4. src/app/api/webhooks/resend/route.ts — POST. Resend webhooks.
   Tratar: email.delivered → update email_sends.delivered_at. email.bounced → email_sends.bounced_at + contact.consent_email='bounced'. email.complained → contact.consent_email='unsubscribed'.

pnpm build → git commit -m "feat: email tracking open click bounce" → git push
```

---

## PROMPT 8 — Flow Builder Canvas

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie o flow builder visual com React Flow.

Referência: github.com/nobruf/shadcn-next-workflows tem React Flow + shadcn + custom nodes. Usar como base.

1. src/components/flows/flow-canvas.tsx — ReactFlowProvider + MiniMap + Controls + Background. Zustand store para nodes/edges. onNodesChange, onEdgesChange, onConnect.

2. src/components/flows/flow-sidebar.tsx — Sidebar com componentes arrastáveis em 3 grupos:
   Triggers: Métrica, Lista, Segmento
   Actions: Email, WhatsApp, Esperar
   Logic: Condição, Split
   Cada item com ícone + label, onDragStart com dataTransfer.

3. Custom nodes (cada um com ícone, cor, handles, panel de config ao clicar):
   - src/components/flows/nodes/trigger-node.tsx — Roxo, ícone raio, dropdown tipo trigger
   - src/components/flows/nodes/email-node.tsx — Azul, ícone email, select template
   - src/components/flows/nodes/whatsapp-node.tsx — Verde, ícone WhatsApp
   - src/components/flows/nodes/delay-node.tsx — Cinza, ícone relógio, input número + select unidade
   - src/components/flows/nodes/condition-node.tsx — Amarelo, ícone diamond, 2 handles YES/NO

4. src/app/(dashboard)/flows/page.tsx — Lista de flows. Tabela: nome, trigger, status badge, métricas. Botão "Criar Automação".

5. src/app/(dashboard)/flows/new/page.tsx — Modal: nome + trigger type. Seção "Templates" com 5 cards pré-built. Criar flow no Supabase → redirect /flows/[id].

6. src/app/(dashboard)/flows/[id]/page.tsx — Fullscreen: sidebar esquerda + canvas central. Carregar flow_definition JSON → nodes/edges. Botão Salvar (serializa React Flow → salva no Supabase). Toggle status Live/Draft.

7. src/types/flows.ts — Types para FlowNode, FlowEdge, FlowTriggerType, FlowNodeType.

pnpm build → git commit -m "feat: flow builder canvas" → git push
```

---

## PROMPT 9 — Flow Execution Engine

```
Leia CLAUDE.md. Crie engine que executa flows automaticamente.

Referência: Acelle Automation2.php + RunAutomation.php tem engine completa.

1. src/lib/flows/engine.ts — processEvent(storeId, eventType, contactId, eventData):
   Buscar flows live com trigger_config.metric = eventType. Para cada: verificar filters. Se passa: criar flow_execution (status='active', current_node_id=primeiro node após trigger). Chamar processNode().

2. src/lib/flows/triggers.ts — matchesTrigger(flow, eventType, eventData): verificar match.

3. src/lib/flows/actions.ts — processNode(execution, node):
   Switch node.type:
   'send_email' → buscar template, chamar sendCampaignEmail()
   'send_whatsapp' → chamar whatsapp send
   'time_delay' → calcular next_step_at, status='waiting'
   'conditional' → evaluateCondition() → seguir YES ou NO edge
   Após: encontrar próximo node via edges. Se existe → processNode(). Se não → status='completed'.

4. src/lib/flows/conditions.ts — evaluateCondition(condition, contactId, storeId):
   Tipos: has_placed_order, has_opened_email, property_equals, total_spent_greater_than, in_list, in_segment.

5. src/app/api/cron/process-flows/route.ts — GET handler (Vercel Cron cada 1 min):
   SELECT flow_executions WHERE status='waiting' AND next_step_at <= now() LIMIT 50. Para cada: processNode().

6. Adicionar ao vercel.json: crons: [{ path: "/api/cron/process-flows", schedule: "* * * * *" }]

7. Atualizar webhook handler (src/app/api/webhooks/shopify/route.ts): após criar evento, chamar processEvent() para triggerar flows.

pnpm build → git commit -m "feat: flow execution engine" → git push
```

---

## PROMPT 10 — WhatsApp + Flow Templates

```
Leia CLAUDE.md. Integre WhatsApp Cloud API e crie templates de flow.

1. src/lib/whatsapp/client.ts — sendText(phone, message, config) e sendTemplate(phone, templateName, params, config). Fetch para https://graph.facebook.com/{version}/{phoneNumberId}/messages.

2. src/app/(dashboard)/settings/whatsapp/page.tsx — Form: Phone Number ID, Business Account ID, Access Token. Botão testar (envia "Teste Convertfy Mail" para um número). Status de conexão.

3. src/app/api/webhooks/whatsapp/route.ts — POST: verificar webhook Meta, processar delivery status (sent/delivered/read), update whatsapp_sends.

4. src/components/flows/flow-templates.ts — 5 templates pré-construídos como JSON (nodes + edges posicionados):
   - Welcome Series: Trigger(Lista) → Email1 → Delay 2d → Email2 → Delay 3d → Email3
   - Abandoned Cart: Trigger(Checkout) → Delay 1h → Condition(Comprou?) → NO: Email → Delay 24h → WhatsApp
   - Post-Purchase: Trigger(Pedido) → Email Confirmação → Delay 7d → Condition(Enviado?) → YES: Email Review
   - Recuperação Boleto: Trigger(Pedido) → Condition(Pagamento=pending) → YES: Delay 24h → Email → Delay 48h → WhatsApp
   - Win-back: Trigger(Segmento Churning) → Email → Delay 7d → Email Cupom → Delay 14d → WhatsApp

5. Atualizar flows/new para mostrar esses templates como cards selecionáveis.

pnpm build → git commit -m "feat: whatsapp flow templates" → git push
```

---

## PROMPT 11 — Contacts + CSV Import

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie gestão de contatos.

1. src/app/(dashboard)/audience/profiles/page.tsx — Tabela de contatos paginada (20/page). Colunas: Nome, Email, Telefone, Total Gasto, Pedidos, Consent (badge), Criado em. Busca por nome/email. Botão "Importar CSV".

2. src/components/contacts/contacts-table.tsx — shadcn DataTable com sorting. Badge para consent.

3. src/app/(dashboard)/audience/profiles/[id]/page.tsx — Perfil com 4 tabs:
   Visão Geral: dados pessoais, tags, properties, consent
   Timeline: eventos cronológicos com ícones por tipo
   Emails: histórico de email_sends
   Listas/Segmentos: membership

4. src/components/contacts/contact-detail.tsx — Card info + edit inline.
5. src/components/contacts/contact-timeline.tsx — Lista de eventos.
6. src/components/contacts/import-csv.tsx — Dialog: upload CSV → parse com papaparse → preview 5 linhas → mapeamento colunas → selecionar lista → importar (server action bulk insert).

pnpm build → git commit -m "feat: contacts csv import profile" → git push
```

---

## PROMPT 12 — Lists + Segment Builder

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie listas e segment builder visual.

1. src/app/(dashboard)/audience/lists/page.tsx — Tabela de listas: nome, contagem, tipo opt-in. Criar lista.
2. src/app/(dashboard)/audience/lists/[id]/page.tsx — Membros da lista, add/remove contato.
3. src/app/(dashboard)/audience/segments/page.tsx — Lista de segmentos: nome, contagem, badge pré-built.
4. src/app/(dashboard)/audience/segments/new/page.tsx — Segment builder fullscreen.

5. src/components/segments/segment-builder.tsx — react-querybuilder com fields:
   Profile: email, first_name, city, country, total_spent(number), total_orders(number), consent_email(select), tags, created_at(date), last_order_at(date)
   Events: event:placed_order(number+timeframe), event:email_opened, event:email_clicked, event:started_checkout
   Operators: equals, not_equals, contains, >, <, between, is_set, in_last_days
   Combinator AND/OR toggle. Preview de contagem estimada.

6. src/components/segments/segment-preview.tsx — Mostra count + 5 sample profiles.

pnpm build → git commit -m "feat: lists segment builder" → git push
```

---

## PROMPT 13 — Segment Resolver + Pre-built

```
Leia CLAUDE.md. Crie lógica de resolução de segmentos.

Referência: Acelle SegmentCondition.php traduz condições para SQL.

1. src/lib/segments/resolver.ts — resolveSegment(segmentId, storeId): buscar conditions JSON → traduzir cada rule para Supabase filter → combinar AND/OR → retornar contact_ids.

2. src/lib/segments/query-builder.ts — buildSupabaseQuery(conditions, storeId):
   Profile props: .eq(), .gt(), .lt(), .ilike()
   Event counts: subquery em events GROUP BY contact_id HAVING count >= N
   Tags: .contains()
   List membership: subquery em list_members
   Date: .gte(), .lte()

3. src/lib/segments/prebuilt.ts — 6 segmentos pré-construídos (JSON react-querybuilder):
   Engajados (abriu 30d), Não Engajados (90d+), Compradores Recorrentes (2+ orders), Novos (7d), Nunca Comprou, Em Risco Churn (60d+ sem compra)

4. Atualizar segments/new para mostrar pré-built como cards.
5. Recalcular contact_count ao salvar segmento.

pnpm build → git commit -m "feat: segment resolver prebuilt" → git push
```

---

## PROMPT 14 — Campaign Wizard

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie sistema completo de campanhas.

1. src/app/(dashboard)/campaigns/page.tsx — Tabela campanhas: nome, status badge, data, enviados, abertos, clicados. Busca. Filtro status. Botão "Nova Campanha".

2. src/app/(dashboard)/campaigns/new/page.tsx — Wizard 4 steps:
   Step 1: Nome + tags
   Step 2: Destinatários (dropdown lista OU segmento, mostrar contagem, toggle excluir não-engajados)
   Step 3: Template (select existente ou criar), subject line, preview text, sender name/email
   Step 4: Review (resumo com count, subject, sender, preview). Botões "Enviar Agora" + "Agendar" (date/time picker)

3. src/components/campaigns/campaign-wizard.tsx — State management do wizard, validação Zod por step.

4. src/app/api/campaigns/send/route.ts — POST: buscar campanha + template + lista/segmento → resolver contacts → filtrar consent=subscribed → para cada: prepareEmailHtml() + sendEmail() → INSERT email_sends → update campaign.status/stats

5. src/app/api/campaigns/test/route.ts — POST: enviar 1 email de teste com merge tags de exemplo.

pnpm build → git commit -m "feat: campaign wizard send" → git push
```

---

## PROMPT 15 — Campaign Report + Analytics

```
Leia CLAUDE.md e DESIGN-SYSTEM.md. Crie relatórios e analytics.

1. src/app/(dashboard)/campaigns/[id]/page.tsx — Relatório:
   Header: nome, status, data, subject
   6 metric cards: Enviados, Entregues, Abertos %, Clicados %, Bounced %, Unsubscribed %
   Recharts: opens/clicks ao longo do tempo
   Tabela recipients: email, status, opened_at, clicked_at

2. src/components/campaigns/campaign-report.tsx — Componente do relatório.

3. src/lib/analytics/metrics.ts:
   getCampaignMetrics(campaignId) → queries em email_sends
   getDashboardMetrics(storeId, days) → métricas agregadas
   getEmailsOverTime(storeId, days) → GROUP BY date_trunc('day')

4. src/app/(dashboard)/analytics/page.tsx — Analytics com:
   Filtro período (7d, 30d, 90d)
   Gráfico emails/dia + open rate/dia
   Top 5 campanhas + Top 5 flows

5. Atualizar dashboard home (page.tsx) para usar getDashboardMetrics() com dados reais em vez de mock.

pnpm build → git commit -m "feat: campaign reports analytics" → git push
```

# AUTORUN-MASTER.md — Executar TODAS as 10 fases automaticamente

Leia CLAUDE.md, DESIGN-SYSTEM.md e PLANO-MASTER-CONVERTFY.md antes de começar.
git pull origin feat/onboarding-dashboard. 

## REGRA DE EXECUÇÃO

Para CADA fase (1 a 10):
1. Implemente TUDO que está descrito na fase
2. Rode `pnpm build`
3. Se der erro: corrija e rode `pnpm build` de novo. Repita até compilar sem erros
4. Quando compilar: `git add -A && git commit -m "feat: fase X completa" && git push origin feat/onboarding-dashboard`
5. Passe para a próxima fase
6. NÃO PARE entre fases. NÃO peça confirmação. Execute tudo sequencialmente.

## FASE 1 — Core Email Loop

### 1.1 src/lib/email/resend.ts
Reescrever completo:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
  to: string
  from: string
  subject: string
  html: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export async function sendEmail(params: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      reply_to: params.replyTo,
      tags: params.tags,
    })
    if (error) return { error: error.message }
    return { id: data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
```

### 1.2 src/lib/email/render.ts
Reescrever completo. Função renderTemplate(html, contact, store, eventData):
- Substituir TODOS merge tags: {{first_name}}, {{last_name}}, {{email}}, {{phone}}, {{store_name}}, {{store_url}}, {{order_number}}, {{order_total}}, {{order_tracking_url}}, {{cart_total}}, {{cart_url}}, {{cart_items}}, {{product_name}}, {{product_image}}, {{product_price}}, {{product_url}}
- Valores vêm de: contact (first_name, last_name, email, phone), store (name, shopify_domain), eventData (order_*, cart_*, product_*)
- Se merge tag não tem valor, substituir por string vazia

Função injectTracking(html, emailSendId, appUrl):
- Antes do </body>: injetar `<img src="${appUrl}/api/t/o/${emailSendId}" width="1" height="1" style="display:none">`
- Reescrever todo href="URL" para href="${appUrl}/api/t/c/${emailSendId}?url=${encodeURIComponent(URL)}" (exceto mailto: e unsubscribe)
- Antes do </body>: injetar link unsubscribe: `<p style="text-align:center;font-size:12px;color:#999"><a href="${appUrl}/api/unsubscribe/${emailSendId}">Cancelar inscrição</a></p>`

### 1.3 src/lib/flows/actions.ts — case 'send_email'
Reescrever o case completo:
```
case 'send_email': {
  const config = node.data.config as unknown as EmailActionConfig
  // 1. Buscar template
  const { data: template } = await db.from('templates').select('*').eq('id', config.templateId).single()
  // 2. Buscar contact
  const { data: contact } = await db.from('contacts').select('*').eq('id', execution.contact_id).single()
  // 3. Buscar store
  const { data: store } = await db.from('stores').select('*').eq('id', execution.store_id).single()
  
  if (!template?.html || !contact || !store) {
    await advanceToNext(executionId, nodeId, definition)
    break
  }
  
  // 4. Renderizar template com merge tags
  const renderedHtml = renderTemplate(template.html, contact, store, execution.data || {})
  
  // 5. Criar email_send record
  const subject = config.subject || template.subject || 'Sem assunto'
  const senderEmail = store.sender_email || 'noreply@resend.dev'
  const senderName = store.sender_name || store.name
  
  const { data: emailSend } = await db.from('email_sends').insert({
    store_id: execution.store_id,
    contact_id: execution.contact_id,
    flow_id: flow.id,
    template_id: template.id,
    subject,
    sender_email: senderEmail,
    status: 'queued',
  }).select().single()
  
  if (emailSend) {
    // 6. Injetar tracking
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const finalHtml = injectTracking(renderedHtml, emailSend.id, appUrl)
    
    // 7. Enviar via Resend
    const result = await sendEmail({
      to: contact.email,
      from: `${senderName} <${senderEmail}>`,
      subject,
      html: finalHtml,
      replyTo: store.reply_to_email || undefined,
    })
    
    if (result.id) {
      await db.from('email_sends').update({ status: 'sent', resend_message_id: result.id }).eq('id', emailSend.id)
    } else {
      await db.from('email_sends').update({ status: 'failed' }).eq('id', emailSend.id)
    }
  }
  
  await advanceToNext(executionId, nodeId, definition)
  break
}
```

### 1.4 src/app/api/campaigns/send/route.ts
Reescrever. Lógica:
- Validar campaign existe e status é 'draft' ou 'scheduled'
- Buscar contatos: se campaign.list_id → query list_members JOIN contacts; se campaign.segment_id → usar segment resolver; senão erro
- Filtrar só consent_email = 'subscribed'
- Marcar campaign status = 'sending', stats.total = contatos.length
- Loop em batches de 10:
  - Para cada contato: renderizar template, criar email_send, injetar tracking, enviar via Resend
  - Atualizar campaign.stats.sent incrementalmente
  - await delay 1000ms entre batches (rate limit Resend)
- Ao final: marcar campaign status = 'sent', completed_at = now()
- Se erro em contato individual: logar, continuar com próximo (não parar campanha)

### 1.5 Tracking endpoints
src/app/api/t/o/[id]/route.ts:
- GET: buscar email_send pelo id param
- Se encontrado e opened_at IS NULL: UPDATE opened_at = now(), status = 'opened'
- INSERT events (store_id, contact_id, event_type='email_opened', properties={email_send_id, campaign_id, flow_id})
- Se campaign_id: UPDATE campaigns SET stats = jsonb_set(stats, '{opened}', (stats->>'opened')::int + 1)
- Retornar Response com 1x1 transparent GIF (Buffer base64), Content-Type: image/gif, Cache-Control: no-store

src/app/api/t/c/[id]/route.ts:
- GET: buscar email_send, ler searchParams.get('url')
- Se encontrado e clicked_at IS NULL: UPDATE clicked_at = now(), status = 'clicked'
- INSERT events (event_type='email_clicked', properties={url, email_send_id})
- Se campaign_id: UPDATE campaigns stats clicked +1
- Redirect 302 para a url decodificada

src/app/api/unsubscribe/[id]/route.ts:
- GET: buscar email_send → buscar contact
- UPDATE contacts SET consent_email = 'unsubscribed'
- INSERT events type='unsubscribed'
- Se campaign_id: UPDATE campaigns stats unsubscribed +1
- Retornar HTML page: "Você foi descadastrado com sucesso. Não receberá mais emails."

### 1.6 src/app/api/webhooks/resend/route.ts
- POST: ler body JSON do Resend webhook
- Extrair type (email.delivered, email.bounced, email.complained) e data.email_id
- Buscar email_send WHERE resend_message_id = data.email_id
- Se delivered: UPDATE delivered_at, status='delivered', campaign stats delivered+1
- Se bounced: UPDATE bounced_at, bounce_type, status='bounced', campaign stats bounced+1
- Se complained: UPDATE status='complained', campaign stats complained+1

### 1.7 src/app/api/cron/process-flows/route.ts
- Verificar Authorization header contém Bearer CRON_SECRET (env var) OU que vem da Vercel (x-vercel-cron header)
- Buscar flow_executions WHERE status='waiting' AND next_step_at <= now() LIMIT 50
- Para cada: chamar processNode(execution.id, execution.current_node_id)
- Retornar JSON { processed: count }

pnpm build → corrigir erros → commit "feat: fase 1 - core email loop" → push → PRÓXIMA FASE

---

## FASE 2 — Shopify Integration Completa

### 2.1 src/lib/shopify/oauth.ts
Garantir que generateAuthUrl e exchangeCodeForToken funcionam:
- generateAuthUrl(shopDomain, storeId) → redirect URL com SHOPIFY_API_KEY, scopes, redirect_uri=/api/auth/shopify/callback?store_id=X
- exchangeCodeForToken(shop, code) → POST https://{shop}/admin/oauth/access_token

### 2.2 src/app/api/auth/shopify/callback/route.ts
- Trocar code por access_token
- UPDATE stores SET shopify_domain, shopify_access_token, webhook_secret=generateRandomSecret()
- Chamar registerWebhooks(shop, accessToken, webhookSecret)
- Redirect para /settings/integrations?success=true

### 2.3 src/lib/shopify/webhooks.ts — registerWebhooks
Registrar TODOS os webhooks necessários:
- orders/create, orders/paid, orders/fulfilled, orders/cancelled
- checkouts/create, checkouts/update
- customers/create, customers/update
- products/update
- refunds/create
Para cada: POST /admin/api/2024-01/webhooks.json com address=${APP_URL}/api/webhooks/shopify e topic

### 2.4 src/app/api/webhooks/shopify/route.ts — handlers completos
Implementar TODOS handlers que faltam:
- handleOrderCreate: upsert contact + INSERT events type=placed_order + update contact metrics + processEvent
- handleOrderPaid: INSERT events type=order_paid
- handleOrderFulfilled: INSERT events type=order_fulfilled com tracking info
- handleOrderCancelled: INSERT events type=order_cancelled
- handleCheckout: upsert contact + INSERT events type=started_checkout (para abandoned cart)
- handleCustomer: upsert contact com TODOS campos
- handleProduct: upsert products
- handleRefund: INSERT events type=refund_created

### 2.5 src/lib/shopify/sync.ts completo
- syncCustomers: GET /admin/api/2024-01/customers.json paginado → bulk upsert contacts
- syncProducts: GET /admin/api/2024-01/products.json paginado → bulk upsert products
- syncOrders: GET /admin/api/2024-01/orders.json paginado → criar events
- Paginação via Link header (rel="next")

### 2.6 src/app/api/auth/shopify/sync/route.ts
POST endpoint para sync manual chamado pelo botão na UI

pnpm build → corrigir → commit "feat: fase 2 - shopify integration" → push → PRÓXIMA FASE

---

## FASE 3 — Audiência Completa

### 3.1 src/lib/segments/resolver.ts
Reescrever resolver que traduz conditions JSONB em query SQL:
- Suportar: consent_email, total_spent (gt/lt/eq), total_orders, last_order_at (dias), tags (contains), city, state, country, source
- Suportar eventos: "placed_order nos últimos X dias", "NOT placed_order nos últimos X dias"
- Retornar array de contact_ids
- Usar Supabase query builder (não raw SQL)

### 3.2 src/app/api/cron/process-segments/route.ts
- Para cada segment: rodar resolver, UPDATE segment.contact_count e last_calculated_at
- Adicionar ao vercel.json crons (a cada 15 min)

### 3.3 Completar contacts-table.tsx e profiles/page.tsx
- Tabela com sorting, busca, filtro por consent
- Paginação server-side (20 por página)
- Click na row → /audience/profiles/[id]

### 3.4 Completar profile [id]/page.tsx
- Tab Timeline: query events WHERE contact_id ORDER BY created_at DESC com ícones por tipo
- Tab Emails: query email_sends WHERE contact_id com status badges
- Tab Pedidos: query events WHERE type=placed_order
- Tab Listas: query list_members JOIN lists
- Editar tags, adicionar à lista

### 3.5 CSV Import funcional
- import-csv.tsx já existe: garantir que processa em batches, faz upsert, mostra progresso

### 3.6 Bulk actions
- Selecionar múltiplos → adicionar tag, remover tag, adicionar à lista

pnpm build → corrigir → commit "feat: fase 3 - audiencia completa" → push → PRÓXIMA FASE

---

## FASE 4 — Flow Builder Completo

### 4.1 Flows pré-built
Criar função seedPrebuiltFlows(storeId) que insere:
- Welcome Series: customer_created → email welcome → delay 2d → email cupom
- Abandoned Cart: started_checkout → delay 1h → email carrinho → delay 24h → email urgência
- Post-Purchase: placed_order → delay 3d → email review → delay 7d → email cross-sell
- Winback: usar segment "sem compra 60 dias"
Cada um com flow_definition completo (nodes com positions + edges), trigger_config, is_prebuilt=true, status='draft'

### 4.2 Trigger por segment e lista
No cron process-flows: além de metric triggers, verificar:
- trigger_type='list': monitorar list_members novos
- trigger_type='segment': comparar contact_ids atuais vs anteriores

### 4.3 Flow page melhorias
- Listagem com stats (entered, completed, emails sent)
- Botão ativar/pausar que muda status
- Flow editor [id]/page.tsx salvando corretamente no Supabase

### 4.4 Flow analytics por node
- Na page do flow: mostrar stats de cada node (emails enviados, opens, clicks)
- Query email_sends WHERE flow_id GROUP BY template_id

pnpm build → corrigir → commit "feat: fase 4 - flows completos" → push → PRÓXIMA FASE

---

## FASE 5 — Templates & Editor

### 5.1 Seed templates pré-built
Os JSONs existem em src/lib/email/templates/*.json
Criar função seedPrebuiltTemplates(storeId):
- Para cada JSON: INSERT templates com is_prebuilt=true, category baseado no nome, design_json=conteúdo
- Chamar no register (quando store é criada) e no onboarding

### 5.2 Template gallery funcional
- template-gallery.tsx: grid com cards, filtro por categoria, busca
- Thumbnail: mostrar ícone por categoria (não precisa screenshot)
- Click → editar ou clonar

### 5.3 Editor salvando
- templates/[id]/edit/page.tsx: carregar design_json no Unlayer, exportHtml ao salvar
- Salvar html + design_json + updated_at
- Botão "Enviar teste" → POST /api/campaigns/test com email do usuário

### 5.4 Test email endpoint
POST /api/campaigns/test: receber template_id + test_email, renderizar com dados fictícios, enviar via Resend

pnpm build → corrigir → commit "feat: fase 5 - templates editor" → push → PRÓXIMA FASE

---

## FASE 6 — Campaigns Completas

### 6.1 Campaign wizard funcional
- campaigns/new/page.tsx: wizard 4 steps salvando em estado local
- Step 1: nome, tags, A/B toggle
- Step 2: selecionar segment OU list, mostrar contact_count estimado
- Step 3: selecionar template, subject, preview_text, sender (defaults da store)
- Step 4: resumo, botões "Enviar agora" e "Agendar"
- INSERT campaign ao finalizar, POST /api/campaigns/send se envio imediato

### 6.2 Agendamento
- No cron: verificar campaigns WHERE status='scheduled' AND scheduled_at <= now()
- Iniciar envio automaticamente

### 6.3 Campaign report
- campaigns/[id]/page.tsx: métricas dos stats, gráfico timeline, click map
- Query email_sends WHERE campaign_id para tabela de detalhes

pnpm build → corrigir → commit "feat: fase 6 - campaigns completas" → push → PRÓXIMA FASE

---

## FASE 7 — Analytics com Dados Reais

### 7.1 Dashboard page.tsx com queries reais
Substituir TODOS dados mock por queries Supabase:
- emails_sent: COUNT email_sends WHERE store_id AND created_at > 30 dias
- open_rate: (COUNT WHERE opened_at IS NOT NULL) / total
- click_rate: (COUNT WHERE clicked_at IS NOT NULL) / total
- active_contacts: COUNT contacts WHERE consent_email='subscribed'
- live_flows: COUNT flows WHERE status='live'
- total_revenue: SUM events.revenue WHERE type='placed_order' AND created_at > 30 dias
- Gráfico: GROUP BY date(created_at) últimos 30 dias

### 7.2 Analytics page com dados reais
- Filtro de período funcionando
- Top campaigns por open rate
- Top flows por emails enviados
- Crescimento de contatos por dia

pnpm build → corrigir → commit "feat: fase 7 - analytics dados reais" → push → PRÓXIMA FASE

---

## FASE 8 — Settings Funcionais

### 8.1 Integrations page
- Shopify connect: input domain, botão conectar (redirect OAuth), status badge, sync buttons
- Dados da store.shopify_domain para mostrar status

### 8.2 Email settings
- Domain config: input domain → POST /api/domains → mostrar DNS records → botão verificar
- Sender config: inputs sender_name, sender_email, reply_to → UPDATE stores

### 8.3 WhatsApp settings
- Inputs phone_number_id, business_account_id, access_token → UPDATE stores
- Botão testar conexão

### 8.4 Account settings
- Alterar nome store
- Team members: convidar, listar, remover

pnpm build → corrigir → commit "feat: fase 8 - settings funcionais" → push → PRÓXIMA FASE

---

## FASE 9 — Forms

### 9.1 Form builder
- forms/new/page.tsx: configurar campos, cores, lista destino
- Salvar config como JSONB

### 9.2 Form submit endpoint
- POST /api/forms/submit: validar, upsert contact, adicionar à lista, trigger flow
- CORS headers para funcionar em sites externos
- Retornar JSON success

### 9.3 Embed code generator
- Gerar snippet HTML/JS que o lojista cola no site
- Script faz POST para /api/forms/submit

pnpm build → corrigir → commit "feat: fase 9 - forms" → push → PRÓXIMA FASE

---

## FASE 10 — Polish & Produção

### 10.1 Error handling
- Try-catch em TODOS endpoints da API
- Toast feedback em TODA ação da UI (save, delete, send)

### 10.2 Loading states
- Skeleton loading em TODA página que busca dados
- Botões com loading spinner durante ações assíncronas

### 10.3 Empty states
- TODA tabela/lista vazia: ícone + texto descritivo + botão CTA
- Contacts: "Nenhum contato. Conecte Shopify ou importe CSV."
- Campaigns: "Nenhuma campanha. Crie e envie seu primeiro email!"
- Flows: "Nenhuma automação. Comece com um template pronto!"
- Templates: "Nenhum template. Crie ou use um dos nossos modelos!"

### 10.4 Onboarding flow
- Garantir que /onboarding funciona com os 6 steps
- Redirect para /onboarding após register se store não tem shopify conectado
- Marcar progresso em store.settings.onboarding

### 10.5 vercel.json crons
```json
{
  "crons": [
    { "path": "/api/cron/process-flows", "schedule": "* * * * *" },
    { "path": "/api/cron/process-segments", "schedule": "*/15 * * * *" }
  ]
}
```

### 10.6 Seed automático
- Quando nova store é criada (register): chamar seedPrebuiltTemplates e seedPrebuiltFlows

### 10.7 Sidebar navigation
Garantir que TODOS links funcionam:
- Dashboard → /
- Campanhas → /campaigns
- Automações → /flows
- Templates → /templates
- Audiência > Perfis → /audience/profiles
- Audiência > Segmentos → /audience/segments
- Audiência > Listas → /audience/lists
- Analytics → /analytics
- Forms → /forms
- Configurações > Integrações → /settings/integrations
- Configurações > Email → /settings/email
- Configurações > WhatsApp → /settings/whatsapp
- Configurações > Conta → /settings/account

pnpm build → corrigir → commit "feat: fase 10 - polish producao" → push

## FINALIZADO
Todas as 10 fases implementadas. O sistema está 100% funcional.

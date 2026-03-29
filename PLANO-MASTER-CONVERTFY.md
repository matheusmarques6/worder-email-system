# PLANO MASTER — Convertfy Mail 100% Funcional (Clone Klaviyo)

## PRÉ-REQUISITOS (o Matheus faz manualmente)

### 1. Criar conta Resend (5 min)
- Acesse https://resend.com e crie conta grátis
- Vá em API Keys → Create API Key → copie a key
- No painel Vercel do projeto → Settings → Environment Variables → adicione:
  - `RESEND_API_KEY` = a key copiada

### 2. Criar app Shopify Partners (10 min)
- Acesse https://partners.shopify.com → Apps → Create app
- App URL: `https://worder-email-system.vercel.app`
- Redirect URL: `https://worder-email-system.vercel.app/api/auth/shopify/callback`
- Scopes: read_products, read_customers, read_orders, write_script_tags, read_checkouts, write_checkouts
- Copie API Key e API Secret
- No Vercel adicione:
  - `SHOPIFY_API_KEY` = API key
  - `SHOPIFY_API_SECRET` = API secret
  - `NEXT_PUBLIC_APP_URL` = `https://worder-email-system.vercel.app`

### 3. Verificar Supabase (já deve estar)
- `NEXT_PUBLIC_SUPABASE_URL` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## FASE 1 — Core Email Loop (PRIORIDADE MÁXIMA)
**Objetivo: Flow engine envia emails de verdade via Resend com tracking**

### 1.1 Corrigir src/lib/email/resend.ts
```
- Importar Resend SDK
- Criar função sendEmail({ to, from, subject, html, replyTo, tags })
- Retornar { id: resendMessageId } ou { error }
- Tratar rate limits do Resend (batch de 2/segundo no plano grátis)
```

### 1.2 Criar src/lib/email/render.ts completo
```
- Função renderTemplate(html, contact, store, eventData)
- Substituir TODOS merge tags: {{first_name}}, {{last_name}}, {{email}}, 
  {{phone}}, {{store_name}}, {{store_url}}, {{order_number}}, {{order_total}},
  {{order_tracking_url}}, {{cart_total}}, {{cart_url}}, {{cart_items}},
  {{product_name}}, {{product_image}}, {{product_price}}, {{product_url}}
- Injetar open tracking pixel: <img src="APP_URL/api/t/o/EMAIL_SEND_ID" width="1" height="1">
- Reescrever URLs para click tracking: href="APP_URL/api/t/c/EMAIL_SEND_ID?url=ENCODED_URL"
- Injetar link de unsubscribe no footer
```

### 1.3 Corrigir src/lib/flows/actions.ts — case 'send_email'
```
- Buscar template pelo templateId da config do node
- Buscar contact e store
- Chamar renderTemplate(template.html, contact, store, execution.data)
- Chamar sendEmail com o HTML renderizado
- INSERT email_sends com resend_message_id retornado
- Atualizar stats do flow (emails_sent +1)
- Se erro, marcar email_send como 'failed', NÃO parar o flow
```

### 1.4 Corrigir src/app/api/campaigns/send/route.ts
```
- Buscar contatos do segment_id OU list_id da campanha
- Para cada contato: renderizar template, enviar via Resend, INSERT email_sends
- Implementar batching: enviar em lotes de 10 com 1s de delay entre lotes
- Atualizar campaign.stats conforme vai enviando
- Marcar campaign status = 'sending' → 'sent' quando completo
```

### 1.5 Corrigir tracking endpoints
```
src/app/api/t/o/[id]/route.ts (open tracking):
- GET request → buscar email_send pelo id
- UPDATE email_sends SET opened_at = now(), status = 'opened' WHERE opened_at IS NULL
- INSERT events type='email_opened'
- Retornar 1x1 transparent GIF

src/app/api/t/c/[id]/route.ts (click tracking):
- GET request → buscar email_send pelo id, ler ?url= param
- UPDATE email_sends SET clicked_at = now(), status = 'clicked' WHERE clicked_at IS NULL
- INSERT events type='email_clicked' com properties={url}
- Redirect 302 para a URL original

src/app/api/unsubscribe/[id]/route.ts:
- GET request → buscar email_send → buscar contact
- UPDATE contacts SET consent_email = 'unsubscribed'
- INSERT events type='unsubscribed'
- Retornar página HTML "Você foi descadastrado com sucesso"
```

### 1.6 Corrigir src/app/api/webhooks/resend/route.ts
```
- Receber webhooks do Resend (delivered, bounced, complained)
- Buscar email_send pelo resend_message_id
- Atualizar status e timestamps (delivered_at, bounced_at, bounce_type)
- Atualizar campaign.stats incrementando contadores
```

### 1.7 Corrigir cron de flows src/app/api/cron/process-flows/route.ts
```
- Verificar Authorization header (CRON_SECRET env var)
- Buscar flow_executions WHERE status='waiting' AND next_step_at <= now()
- Para cada: chamar processNode(execution.id, execution.current_node_id)
- Configurar no vercel.json: cron a cada 1 minuto
```

---

## FASE 2 — Shopify Integration Completa
**Objetivo: Conectar loja, receber webhooks, sincronizar dados**

### 2.1 Corrigir OAuth flow
```
src/lib/shopify/oauth.ts:
- generateAuthUrl com SHOPIFY_API_KEY, redirect para /api/auth/shopify/callback
- exchangeCodeForToken POST para Shopify

src/app/api/auth/shopify/callback/route.ts:
- Trocar code por access_token
- UPDATE stores SET shopify_domain, shopify_access_token
- Chamar registerWebhooks()
- Gerar webhook_secret e salvar na store
- Redirect para /settings/integrations?success=true
```

### 2.2 Completar webhook handler src/app/api/webhooks/shopify/route.ts
```
Adicionar handlers faltantes:
- orders/fulfilled → INSERT events type='order_fulfilled' com tracking_number, tracking_url
- orders/cancelled → INSERT events type='order_cancelled' com cancel_reason
- orders/paid → INSERT events type='order_paid'
- refunds/create → INSERT events type='refund_created' com refund_amount
- products/update → UPSERT products com todos os campos
- checkouts/update → UPDATE evento started_checkout existente

Para CADA handler:
1. Upsert contact pelo email
2. Insert evento com properties completas
3. Atualizar métricas do contact (total_spent, total_orders, avg_order_value)
4. Chamar processEvent() para triggar flows
```

### 2.3 Completar sync src/lib/shopify/sync.ts
```
- syncCustomers: paginação com Link header, bulk upsert contacts
- syncProducts: paginação, bulk upsert products
- syncOrders: paginação, criar events para cada order
- Endpoint GET /api/auth/shopify/sync para sync manual via botão na UI
```

### 2.4 Criar pixel/script de tracking para loja
```
src/app/api/track/pixel.js/route.ts:
- Servir JavaScript que a loja Shopify embeda
- Script captura: page views, add to cart, viewed product
- Envia para POST /api/track com visitor_id, session_id, UTMs, click_ids
- Instalar via Shopify ScriptTag API no callback do OAuth
```

---

## FASE 3 — Audiência Completa (Contacts, Segments, Lists)
**Objetivo: Gestão completa de contatos como Klaviyo**

### 3.1 CSV Import funcional
```
src/components/contacts/import-csv.tsx (já existe na branch):
- Upload CSV, preview colunas, mapear campos
- Processar em batches de 100
- Upsert contacts por email (não duplicar)
- Mostrar progresso e resultado (importados, atualizados, erros)
```

### 3.2 Segment resolver real
```
src/lib/segments/resolver.ts:
- Receber conditions JSONB do segment
- Traduzir para query SQL parametrizada
- Suportar condições: 
  - consent_email = subscribed/unsubscribed
  - total_spent >, <, =
  - total_orders >, <, =
  - last_order_at > X dias atrás
  - tags contains
  - city/state/country =
  - source =
  - evento X aconteceu/não aconteceu nos últimos Y dias
- Retornar lista de contact_ids
- Atualizar segment.contact_count e segment.last_calculated_at
```

### 3.3 Cron de segments
```
src/app/api/cron/process-segments/route.ts:
- Para cada segment: rodar resolver, atualizar contact_count
- Rodar a cada 15 minutos via vercel.json cron
```

### 3.4 Contato profile page completa
```
src/app/(dashboard)/audience/profiles/[id]/page.tsx:
- Tab Timeline: query events WHERE contact_id ORDER BY created_at DESC
- Tab Emails: query email_sends WHERE contact_id
- Tab Pedidos: query events WHERE type='placed_order'
- Tab Listas: query list_members JOIN lists
- Ações: editar tags, adicionar à lista, suprimir (unsubscribe)
```

### 3.5 Bulk actions na tabela de contatos
```
- Selecionar múltiplos contatos via checkbox
- Ações: adicionar tag, remover tag, adicionar à lista, exportar CSV
```

---

## FASE 4 — Flow Builder Completo
**Objetivo: Automações funcionais como Klaviyo Flows**

### 4.1 Flows pré-built funcionais
```
Criar flows prontos que o usuário ativa com 1 clique:
- Welcome Series (trigger: customer_created → email boas-vindas → delay 2d → email cupom)
- Abandoned Cart (trigger: started_checkout → delay 1h → email carrinho → delay 24h → email urgência)
- Post-Purchase (trigger: placed_order → delay 3d → email review → delay 7d → email cross-sell)
- Winback (trigger: customer_created → delay 60d sem compra → email saudade → delay 7d → email cupom)
- Browse Abandonment (trigger: viewed_product → delay 2h → email produto visto)

Cada flow: INSERT na tabela flows com flow_definition completo (nodes + edges)
           Usar template_ids dos templates pré-built
           Status 'draft' até o usuário ativar
```

### 4.2 Trigger por segmento e lista
```
- trigger_type='segment': quando contato entra no segment
- trigger_type='list': quando contato é adicionado à lista
- trigger_type='date_property': ex: aniversário do contato
- Verificar no cron process-flows
```

### 4.3 Flow analytics
```
- Mostrar stats por node: quantos passaram, quantos emails enviados, open rate por node
- Query email_sends WHERE flow_id GROUP BY template_id
```

---

## FASE 5 — Templates & Editor
**Objetivo: Editor profissional com templates prontos**

### 5.1 Templates pré-built carregados no banco
```
Os 8 JSONs já existem na branch (src/lib/email/templates/*.json)
Criar script/endpoint que faz INSERT na tabela templates com:
- is_prebuilt = true
- store_id = store do usuário
- design_json = conteúdo do JSON
- category = tipo (welcome, abandoned-cart, post-purchase, etc.)
- Chamar quando store é criada (no register ou onboarding)
```

### 5.2 Template preview
```
- Endpoint POST /api/templates/preview que renderiza HTML com dados de exemplo
- Mostrar preview na galeria de templates
- Gerar thumbnail (pode ser screenshot server-side ou placeholder por categoria)
```

### 5.3 Editor salvando corretamente
```
- Unlayer exportHtml → salvar html + design_json na tabela templates
- Auto-save a cada 30 segundos
- Botão "Enviar teste" que envia para email do usuário
```

---

## FASE 6 — Campaigns Completas
**Objetivo: Criar, agendar, enviar e analisar campanhas**

### 6.1 Campaign wizard funcional
```
Step 1 - Info: nome, tags, toggle A/B test
Step 2 - Destinatários: selecionar segment OU list, mostrar estimativa de contatos
Step 3 - Conteúdo: selecionar template, editar subject, preview text, sender
Step 4 - Revisar: resumo, botões "Enviar agora" ou "Agendar"

Se A/B test: 
- Subject A e Subject B
- Split % (slider)
- Duração teste (horas)
- Após duração: enviar winner para restante
```

### 6.2 Agendamento
```
- Se scheduled_at definido: marcar status='scheduled'
- Cron verifica campaigns WHERE status='scheduled' AND scheduled_at <= now()
- Inicia envio automaticamente
```

### 6.3 Campaign report page
```
src/app/(dashboard)/campaigns/[id]/page.tsx:
- Métricas: sent, delivered, opened, clicked, bounced, unsubscribed
- Open rate, click rate, bounce rate (calculados dos stats)
- Gráfico timeline (opens/clicks por hora nas primeiras 48h)
- Click map: URLs mais clicadas
- Tabela de contatos que abriram/clicaram
- Revenue atribuído (se contato fez pedido em 24h após click)
```

---

## FASE 7 — Analytics Dashboard
**Objetivo: Dados reais em todos os gráficos**

### 7.1 Dashboard principal com dados reais
```
- Emails enviados: COUNT email_sends últimos 30 dias
- Taxa de abertura: AVG opens/sent
- Taxa de clique: AVG clicks/sent
- Contatos ativos: COUNT contacts WHERE consent_email='subscribed'
- Flows ativos: COUNT flows WHERE status='live'
- Revenue total: SUM events.revenue WHERE type='placed_order' últimos 30 dias
- Gráfico: GROUP BY date(created_at) últimos 30 dias
```

### 7.2 Analytics page
```
- Filtro de período (7d, 30d, 90d, custom)
- Métricas por canal (email, whatsapp)
- Top campaigns por open rate e revenue
- Top flows por revenue
- Crescimento de lista (novos contatos por dia)
- Mapa de cliques agregado
```

---

## FASE 8 — Settings & Configurações
**Objetivo: Todas as configurações funcionais**

### 8.1 Shopify connect
```
- Input shop domain + botão conectar → redirect OAuth
- Status badge (conectado/desconectado)
- Botões sync manual (customers, products, orders)
- Botão desconectar (limpa tokens)
```

### 8.2 Email/Domínio (Resend)
```
- Input domínio → POST /api/domains (cria no Resend)
- Exibir DNS records retornados (tabela com tipo, nome, valor + botão copiar)
- Botão verificar → POST /api/domains/verify
- Status badge (verificado/pendente)
- Inputs sender_name, sender_email, reply_to → salvar na store
```

### 8.3 WhatsApp
```
- Inputs: Phone Number ID, Business Account ID, Access Token
- Salvar na store (wa_phone_number_id, wa_business_account_id, wa_access_token)
- Botão "Enviar mensagem teste"
- Webhook verification endpoint para Meta
```

### 8.4 Account/Team
```
- Alterar nome da store
- Convidar membros (email + role)
- Tabela membros com role badges
- Remover membros
```

---

## FASE 9 — Forms & Pop-ups
**Objetivo: Formulários embeddable para capturar leads**

### 9.1 Form builder
```
- Drag-and-drop campos (nome, email, telefone, custom)
- Personalizar cores, textos, botão
- Selecionar lista destino
- Gerar embed code (HTML/JS)
```

### 9.2 Form submit endpoint
```
POST /api/forms/submit:
- Validar campos obrigatórios
- Upsert contact
- Adicionar à lista do form
- Trigger flow se configurado
- Retornar success
- CORS headers para funcionar em sites externos
```

---

## FASE 10 — Polish & Produção
**Objetivo: Sistema estável e profissional**

### 10.1 Error handling
```
- Try-catch em todos endpoints
- Log de erros estruturado
- Retry automático para falhas de envio (3 tentativas)
- Toast de erro/sucesso em toda ação da UI
```

### 10.2 Loading states
```
- Skeleton em TODA página durante carregamento
- Botões com loading spinner durante ações
- Disabled state em forms durante submit
```

### 10.3 Empty states
```
- TODA tabela/lista vazia tem: ícone + texto + CTA
- Ex: "Nenhum contato. Conecte Shopify ou importe CSV."
```

### 10.4 Onboarding
```
- Após registro: wizard 6 steps (já existe na branch)
- Guiar: nome da loja → conectar Shopify → importar contatos → configurar domínio → primeiro flow → primeiro form
- Marcar progresso no store.settings
```

### 10.5 vercel.json crons
```json
{
  "crons": [
    { "path": "/api/cron/process-flows", "schedule": "* * * * *" },
    { "path": "/api/cron/process-segments", "schedule": "*/15 * * * *" }
  ]
}
```

---

## ORDEM DE EXECUÇÃO PARA O CLAUDE CODE

1. **FASE 1** — Core email loop (sem isso nada funciona)
2. **FASE 2** — Shopify (fonte de dados principal)
3. **FASE 3** — Audiência (contacts, segments, lists com dados reais)
4. **FASE 4** — Flows completos (automações são o coração do Klaviyo)
5. **FASE 5** — Templates (editor e pré-builts)
6. **FASE 6** — Campaigns (envio manual de emails)
7. **FASE 7** — Analytics (dashboards com dados reais)
8. **FASE 8** — Settings (configurações funcionais)
9. **FASE 9** — Forms (captura de leads)
10. **FASE 10** — Polish (UX profissional)

## REGRAS PARA O CLAUDE CODE

- Ler CLAUDE.md e DESIGN-SYSTEM.md antes de qualquer mudança
- Branch padrão: feat/onboarding-dashboard
- NUNCA usar `any` — tipar tudo com os types de src/types/index.ts
- TODA query filtra por store_id (multi-tenant)
- Testar `pnpm build` após cada fase — SÓ commit se compilar
- Interface em PT-BR, código em inglês
- Imports com @/ alias
- Seguir paleta laranja #F97316 — NUNCA roxo/violeta

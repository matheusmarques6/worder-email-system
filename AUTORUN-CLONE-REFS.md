# AUTORUN-CLONE-REFS.md — Referências, APIs e Repositórios

Este documento é a FONTE DE VERDADE para versões de API, documentação oficial, e código de referência.
Todo Claude Code deve consultar este arquivo ANTES de implementar qualquer integração.

---

## 📌 VERSÕES DE API (CONFIRMADAS MARÇO 2026)

### Shopify REST Admin API — Versão `2026-01` (latest stable)

| Item | Valor |
|------|-------|
| Versão | **2026-01** (latest stable). Release candidate: 2026-04 |
| Base URL | `https://{shop}.myshopify.com/admin/api/2026-01/` |
| Auth | Header `X-Shopify-Access-Token: {access_token}` |
| Rate Limit | 40 requests/segundo (REST), bucket leaky |
| Status | REST é legacy desde Oct 2024, mas FUNCIONA e é mais simples para webhooks |

**Documentação oficial:**
- REST Admin API Reference: https://shopify.dev/docs/api/admin-rest
- REST Admin API versioning: https://shopify.dev/docs/api/admin-rest/usage/versioning
- Webhooks: https://shopify.dev/docs/api/admin-rest/2026-01/resources/webhook
- OAuth: https://shopify.dev/docs/apps/build/authentication/oauth
- Orders: https://shopify.dev/docs/api/admin-rest/2026-01/resources/order
- Customers: https://shopify.dev/docs/api/admin-rest/2026-01/resources/customer
- Products: https://shopify.dev/docs/api/admin-rest/2026-01/resources/product
- Checkout: https://shopify.dev/docs/api/admin-rest/2026-01/resources/checkout (deprecated, usar Storefront API)
- Changelog: https://shopify.dev/changelog
- Rate Limits: https://shopify.dev/docs/api/usage/rate-limits
- Webhook topics: https://shopify.dev/docs/api/admin-rest/2026-01/resources/webhook#event-topics
- npm @shopify/shopify-api: https://www.npmjs.com/package/@shopify/shopify-api

**Endpoints usados no projeto:**
```
GET  /admin/api/2026-01/customers.json?limit=250          → sync customers
GET  /admin/api/2026-01/products.json?limit=250            → sync products
GET  /admin/api/2026-01/orders.json?limit=250&status=any   → sync orders
POST /admin/api/2026-01/webhooks.json                      → register webhook
GET  /admin/api/2026-01/webhooks.json                      → list webhooks
DEL  /admin/api/2026-01/webhooks/{id}.json                 → delete webhook
POST /admin/oauth/access_token                              → exchange code for token
```

**Webhook topics para registrar:**
orders/create, orders/paid, orders/updated, orders/cancelled, orders/fulfilled, checkouts/create, checkouts/update, customers/create, customers/update, products/update, refunds/create

**HMAC Verification:**
```typescript
import crypto from 'crypto'
function verifyShopifyWebhook(rawBody: string, hmacHeader: string, secret: string): boolean {
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader))
}
```

---

### Resend API — Sem versionamento (sempre latest)

| Item | Valor |
|------|-------|
| Base URL | `https://api.resend.com` |
| Auth | Header `Authorization: Bearer re_xxxxx` |
| Rate Limit | Free: 2 emails/segundo. Pro+: 50/segundo |
| Free tier | 3.000 emails/mês, 1 domínio |
| npm | `resend` (latest) |

**Documentação oficial:**
- Introdução: https://resend.com/docs/api-reference/introduction
- Send Email: https://resend.com/docs/api-reference/emails/send-email
- Batch Send: https://resend.com/docs/api-reference/emails/send-batch-emails
- Domains: https://resend.com/docs/api-reference/domains/create-domain
- Verify Domain: https://resend.com/docs/api-reference/domains/verify-domain
- Webhooks: https://resend.com/docs/api-reference/webhooks
- Tags: https://resend.com/docs/api-reference/emails/send-email#body-parameters (tags parameter)
- Changelog: https://resend.com/changelog
- Dashboard domains: https://resend.com/docs/dashboard/domains/introduction
- Next.js guide: https://resend.com/docs/send-with-nextjs

**Endpoints:**
```
POST /emails              → enviar email
POST /emails/batch        → enviar em lote (até 100)
POST /domains             → adicionar domínio
POST /domains/{id}/verify → verificar domínio
GET  /domains/{id}        → status do domínio + DNS records
GET  /emails/{id}         → status de um email
```

**Send Email payload:**
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
const { data, error } = await resend.emails.send({
  from: 'Nome <noreply@seudominio.com>',
  to: ['destinatario@email.com'],
  subject: 'Assunto',
  html: '<p>HTML aqui</p>',
  reply_to: 'suporte@seudominio.com',
  tags: [{ name: 'campaign_id', value: 'xxx' }]
})
// data.id = resend message id para tracking
```

**Webhook events (configurar em resend.com/webhooks):**
email.sent, email.delivered, email.delivery_delayed, email.bounced, email.complained, email.opened, email.clicked

**Features recentes (2025-2026):**
- Idempotency keys para evitar envio duplicado
- Schedule emails até 30 dias
- Batch validation modes
- Tags em batch emails
- Suppression list automática
- Deliverability Insights gratuito

---

### WhatsApp Cloud API — Graph API `v21.0`

| Item | Valor |
|------|-------|
| Versão | **Graph API v21.0** (stable 2026) |
| Base URL | `https://graph.facebook.com/v21.0/{phone_number_id}/messages` |
| Auth | Header `Authorization: Bearer {system_user_token}` |
| Rate Limit | 500 msgs/segundo (send+receive) |
| Pricing | Per-template-message (desde Jul 2025) |

**Documentação oficial:**
- Get Started: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- Message API: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
- Templates: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
- Webhooks: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- Media: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media
- Phone Numbers: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers
- Business Management: https://developers.facebook.com/docs/whatsapp/business-management-api
- Pricing: https://developers.facebook.com/docs/whatsapp/pricing
- WhatsApp Flows: https://developers.facebook.com/docs/whatsapp/flows

**Enviar texto:**
```typescript
const response = await fetch(
  `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'text',
      text: { body: message }
    })
  }
)
```

**Enviar template:**
```typescript
body: JSON.stringify({
  messaging_product: 'whatsapp',
  to: phone,
  type: 'template',
  template: {
    name: 'abandoned_cart',
    language: { code: 'pt_BR' },
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: customerName },
        { type: 'currency', currency: { fallback_value: 'R$199,90', code: 'BRL', amount_1000: 199900 } }
      ]
    }]
  }
})
```

**Webhook verification:**
```typescript
// GET handler - Meta sends verify challenge
const mode = searchParams.get('hub.mode')
const token = searchParams.get('hub.verify_token')
const challenge = searchParams.get('hub.challenge')
if (mode === 'subscribe' && token === process.env.WA_WEBHOOK_VERIFY_TOKEN) {
  return new Response(challenge, { status: 200 })
}
```

**Status updates (webhook POST):**
entry[0].changes[0].value.statuses → { id, status: 'sent'|'delivered'|'read'|'failed', timestamp }

---

### Supabase — @supabase/ssr (latest)

| Item | Valor |
|------|-------|
| npm client | `@supabase/supabase-js` (latest) |
| npm ssr | `@supabase/ssr` (para Next.js App Router) |
| Auth | Built-in com supabase.auth |
| RLS | Habilitado em TODAS tabelas |
| Realtime | Disponível para subscriptions |

**Documentação:**
- Supabase JS: https://supabase.com/docs/reference/javascript
- SSR (Next.js): https://supabase.com/docs/guides/auth/server-side/nextjs
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- Auth helpers: https://supabase.com/docs/guides/auth
- Middleware pattern: https://supabase.com/docs/guides/auth/server-side/creating-a-client

**Pattern para Next.js 15 App Router:**
- client.ts: createBrowserClient() — para components 'use client'
- server.ts: createServerClient() com cookies() — para Server Components e Server Actions
- admin.ts: createClient() com SERVICE_ROLE_KEY — para webhooks/cron (bypassa RLS)

---

### Unlayer — react-email-editor (latest)

| Item | Valor |
|------|-------|
| npm | `react-email-editor` |
| Funciona sem Project ID | SIM, editor 100% funcional |
| Com Project ID (free) | Upload de imagens nativo + template library |

**Documentação:**
- npm: https://www.npmjs.com/package/react-email-editor
- GitHub: https://github.com/unlayer/react-email-editor
- Docs: https://docs.unlayer.com/
- Merge tags: https://docs.unlayer.com/docs/merge-tags
- Custom tools: https://docs.unlayer.com/docs/custom-tools
- Export HTML: https://docs.unlayer.com/docs/export-html

---

### React Flow — @xyflow/react (latest)

| Item | Valor |
|------|-------|
| npm | `@xyflow/react` (novo namespace desde v12) |
| Docs | https://reactflow.dev/learn |

**Documentação:**
- Getting started: https://reactflow.dev/learn
- Custom nodes: https://reactflow.dev/learn/customization/custom-nodes
- Handles: https://reactflow.dev/api-reference/types/handle
- Edges: https://reactflow.dev/learn/customization/custom-edges
- Sub flows: https://reactflow.dev/learn/layouting/sub-flows
- GitHub: https://github.com/xyflow/xyflow

---

### react-querybuilder (latest)

| Item | Valor |
|------|-------|
| npm | `react-querybuilder` + `@react-querybuilder/dnd` |
| GitHub | https://github.com/react-querybuilder/react-querybuilder |

**Documentação:**
- Docs: https://react-querybuilder.js.org/docs/intro
- Customization: https://react-querybuilder.js.org/docs/components/querybuilder
- Export to SQL: https://react-querybuilder.js.org/docs/utils/export

---

## 📦 REPOSITÓRIOS DE REFERÊNCIA — NOSSOS

### 1. AdTracked — github.com/matheusmarques6/adtracked

Shopify ad tracking SaaS com webhook handler completo, OAuth, tracking server-side.

| Arquivo no repo | Path original | Linhas | O que contém |
|----------------|---------------|--------|-------------|
| webhook-handler.ts | app/api/webhooks/shopify/route.ts | ~1173 | Handler completo: HMAC verify, switch por topic, orders/create, orders/paid, orders/fulfilled, checkouts, customers, products. Upsert contacts, criar events, update métricas. |
| register-webhooks.ts | app/api/shopify/register-webhooks/route.ts | ~209 | Auto-registro de webhooks: GET existentes, DELETE duplicados, POST novos. |
| track-endpoint.ts | app/api/track/route.ts | ~1625 | Tracking server-side: recebe eventos client-side, UTMs, click IDs (fbclid, gclid, ttclid), session tracking, upsert contacts. |
| tracker.js | public/tracker.js | ~741 | Client-side tracker JS: captura page views, UTMs, click IDs, envia para /api/track. |
| shopify-pixel.js | public/shopify-pixel.js | ~440 | Shopify Web Pixels: captura checkout events no checkout Shopify. |
| klaviyo-service.ts | lib/services/klaviyo.ts | ~456 | Estrutura de eventos e-commerce: identify, track, map de eventos para properties. |
| shopify-oauth.ts | app/api/auth/shopify/route.ts | ~80 | Inicia OAuth: gera URL com scopes e redirect. |
| shopify-callback.ts | app/api/auth/shopify/callback/route.ts | ~120 | Callback OAuth: troca code por token, salva no banco. |

**Como usar:** O AUTORUN-CLAUDE-1 deve COPIAR a lógica do webhook-handler.ts (especialmente o switch por topic e a estrutura de cada handler) e do register-webhooks.ts, adaptando para tabelas Supabase.

### 2. Acelle Mail — github.com/matheusmarques6/worder-email

Plataforma email Laravel completa. Código PHP mas lógica 100% aplicável.

| Arquivo no repo | O que contém | Quem usa |
|----------------|-------------|---------|
| Automation2.php (app/Models/) | Flow execution engine: status machine (inactive/active/paused), run() processa nodes, waitFor() para delays, checkCondition() para IF/ELSE. | Claude 3 |
| AutoTrigger.php (app/Models/) | Event → Flow matching: check() verifica se evento corresponde ao trigger configurado, getFlows() busca flows ativos. | Claude 3 |
| RunAutomation.php (app/Jobs/) | Cron job: busca executions com status='waiting' e next_step_at vencido, processa cada um. | Claude 3 |
| Campaign.php (app/Models/) | State machine de campanha: draft→sending→sent→paused. Stats tracking. Resolve recipients. | Claude 5 |
| CampaignController.php (app/Http/Controllers/) | Open pixel endpoint (1x1 GIF), click redirect com tracking, unsubscribe handler. | Claude 2 |
| SendMessage.php (app/Jobs/) | Pipeline: render template → substituir merge tags → reescrever URLs para tracking → injetar pixel → enviar → logar resultado. | Claude 2 |
| StringHelper.php (app/Library/) | Merge tag engine: regex {{tag}}, {{tag|default}}, loops para {{items}}, condicionais {{#if}}. | Claude 2 |
| Segment.php + SegmentCondition.php (app/Models/) | Segment builder: conditions JSON → tradução para SQL WHERE clauses, AND/OR combinator, count contacts. | Claude 4 |
| Subscriber.php (app/Models/) | Contact model: consent management, properties JSONB, tag system, list membership. | Claude 4 |
| SendingDomain.php (app/Models/) | Domain verification: DNS records generation, verify status, DKIM/SPF/DMARC. | Claude 1 |
| MailList.php (app/Models/) | List management: add/remove subscribers, import CSV, export, statistics. | Claude 4 |
| Template.php (app/Models/) | Template CRUD: design_json para editor, html renderizado, categories, cloning. | Claude 2 |
| TrackingLog.php (app/Models/) | Tracking model: email_id, contact_id, type (open/click/bounce/complaint), timestamps. | Claude 2 |

---

## 📦 REPOSITÓRIOS OPEN-SOURCE DE REFERÊNCIA

### 3. shadcn-next-workflows — github.com/nobruf/shadcn-next-workflows (150+ stars)

React Flow + shadcn/ui + Next.js. Canvas visual com custom nodes.

**O que clonar:**
- Estrutura de nodes customizados com shadcn
- Drag-and-drop da sidebar para o canvas
- Serialização/deserialização do React Flow JSON
- Layout ELK para auto-posicionamento

**Usar em:** Claude 3 (flow builder canvas)

### 4. Dittofeed — github.com/dittofeed/dittofeed (2.5k+ stars, MIT, TypeScript)

Customer engagement platform open-source. Journey engine + segment builder.

**O que estudar:**
- packages/backend-lib/src/journeys/ → Journey execution engine em TypeScript
- packages/backend-lib/src/segments/ → Segment resolver, condition→SQL
- packages/dashboard-lib/src/components/ → UI components para dashboard
- packages/backend-lib/src/messaging/ → Email/SMS sending pipeline

**Usar em:** Claude 3 (engine), Claude 4 (segments)

### 5. Plunk — github.com/useplunk/plunk (4.9k stars, AGPL, TypeScript)

Email platform open-source. Sending engine, domain verification, tracking.

**O que estudar:**
- packages/api/src/controllers/email.ts → Sending com tracking
- packages/api/src/controllers/track.ts → Open/click tracking endpoints
- packages/api/src/services/domain.ts → Domain verification flow
- packages/api/src/services/events.ts → Event system
- packages/api/src/controllers/campaigns.ts → Campaign sending pipeline

**Usar em:** Claude 1 (domains), Claude 2 (sending/tracking)

### 6. Shopify Webhook Project — github.com/sukhchain88/Shopify-webhook-project (TypeScript)

Webhook handlers Shopify com BullMQ queue.

**O que estudar:**
- src/webhooks/ → Handler por topic (orders, customers, products)
- src/queue/ → BullMQ job processing (inspiração para batch processing)

**Usar em:** Claude 1 (webhooks)

### 7. WhatsApp API Examples — github.com/fbsamples/whatsapp-api-examples (Oficial Meta)

Exemplos oficiais da Meta para WhatsApp Cloud API.

**O que estudar:**
- send-messages/ → Envio de text, template, media, interactive
- receive-messages/ → Webhook processing
- e-commerce/ → Templates de carrinho abandonado, confirmação de pedido

**Usar em:** Claude 3 (WhatsApp integration)

### 8. Automation Workflow (React Flow) — github.com/Azim-Ahmed/Automation-workflow (100+ stars)

Exemplos avançados de React Flow para automações.

**O que estudar:**
- Conditional routing (YES/NO edges)
- ELK layout algorithm
- Custom edge labels
- Node grouping

**Usar em:** Claude 3 (flow canvas avançado)

### 9. react-querybuilder — github.com/react-querybuilder/react-querybuilder (3k+ stars)

Query builder com AND/OR operators customizáveis.

**O que estudar:**
- examples/ → Exemplos com Material UI, Chakra, Bootstrap
- website/ → Demo interativa
- packages/react-querybuilder/src/ → Core engine

**Usar em:** Claude 4 (segment builder)

### 10. Mautic — github.com/mautic/mautic (7k+ stars, PHP)

Marketing automation platform open-source completa.

**O que estudar:**
- app/bundles/CampaignBundle/ → Campaign builder engine
- app/bundles/EmailBundle/ → Email sending + tracking
- app/bundles/LeadBundle/ → Contact management + segments + scoring
- app/bundles/FormBundle/ → Form builder + submission handling

**Usar em:** Referência de arquitetura geral, sign-up forms

### 11. Listmonk — github.com/knadh/listmonk (15k+ stars, Go)

Newsletter/mailing list manager. Referência para performance de envio.

**O que estudar:**
- internal/messenger/ → Email sending com rate limiting
- internal/manager/ → Campaign manager com batch processing
- frontend/ → React UI para lista de campanhas e analytics

**Usar em:** Referência para batch sending e UI

---

## 📋 SCRIPT DE CLONAGEM

Execute isto no Claude Code ANTES dos 5 paralelos para ter os arquivos locais:

```bash
#!/bin/bash
set -e
echo "📦 Clonando referências..."

mkdir -p reference/{adtracked,acelle,plunk-ref,dittofeed-ref}

# 1. AdTracked (nosso)
echo "→ AdTracked..."
git clone --depth 1 https://github.com/matheusmarques6/adtracked.git /tmp/adtracked 2>/dev/null || true
cp /tmp/adtracked/app/api/webhooks/shopify/route.ts reference/adtracked/webhook-handler.ts 2>/dev/null || true
cp /tmp/adtracked/app/api/shopify/register-webhooks/route.ts reference/adtracked/register-webhooks.ts 2>/dev/null || true
cp /tmp/adtracked/app/api/track/route.ts reference/adtracked/track-endpoint.ts 2>/dev/null || true
cp /tmp/adtracked/public/tracker.js reference/adtracked/tracker.js 2>/dev/null || true
cp /tmp/adtracked/public/shopify-pixel.js reference/adtracked/shopify-pixel.js 2>/dev/null || true
cp /tmp/adtracked/lib/services/klaviyo.ts reference/adtracked/klaviyo-service.ts 2>/dev/null || true
cp /tmp/adtracked/app/api/auth/shopify/route.ts reference/adtracked/shopify-oauth.ts 2>/dev/null || true
cp /tmp/adtracked/app/api/auth/shopify/callback/route.ts reference/adtracked/shopify-callback.ts 2>/dev/null || true

# 2. Acelle Mail (nosso)
echo "→ Acelle Mail..."
git clone --depth 1 https://github.com/matheusmarques6/worder-email.git /tmp/acelle 2>/dev/null || true
for f in Automation2 AutoTrigger Campaign Segment SegmentCondition Subscriber SendingDomain SendingServer Template MailList TrackingLog; do
  find /tmp/acelle -name "${f}.php" -path "*/Models/*" -exec cp {} reference/acelle/ \; 2>/dev/null || true
done
find /tmp/acelle -name "CampaignController.php" -path "*/Controllers/*" -exec cp {} reference/acelle/ \; 2>/dev/null || true
find /tmp/acelle -name "AutomationController.php" -path "*/Controllers/*" -exec cp {} reference/acelle/ \; 2>/dev/null || true
find /tmp/acelle -name "SegmentController.php" -path "*/Controllers/*" -exec cp {} reference/acelle/ \; 2>/dev/null || true
find /tmp/acelle -name "SendMessage.php" -path "*/Jobs/*" -exec cp {} reference/acelle/ \; 2>/dev/null || true
find /tmp/acelle -name "RunAutomation.php" -path "*/Jobs/*" -exec cp {} reference/acelle/ \; 2>/dev/null || true
find /tmp/acelle -name "StringHelper.php" -exec cp {} reference/acelle/ \; 2>/dev/null || true

# 3. shadcn-workflows (canvas React Flow)
echo "→ shadcn-next-workflows..."
git clone --depth 1 https://github.com/nobruf/shadcn-next-workflows.git reference/shadcn-workflows 2>/dev/null || true

# 4. WhatsApp examples (oficial Meta)
echo "→ WhatsApp examples..."
git clone --depth 1 https://github.com/fbsamples/whatsapp-api-examples.git reference/whatsapp-examples 2>/dev/null || true

# 5. Plunk (sending engine + tracking)
echo "→ Plunk (key files)..."
git clone --depth 1 https://github.com/useplunk/plunk.git /tmp/plunk 2>/dev/null || true
cp -r /tmp/plunk/packages/api/src/controllers/ reference/plunk-ref/controllers/ 2>/dev/null || true
cp -r /tmp/plunk/packages/api/src/services/ reference/plunk-ref/services/ 2>/dev/null || true

# 6. Dittofeed (journey engine + segments)
echo "→ Dittofeed (key dirs)..."
git clone --depth 1 https://github.com/dittofeed/dittofeed.git /tmp/dittofeed 2>/dev/null || true
cp -r /tmp/dittofeed/packages/backend-lib/src/journeys/ reference/dittofeed-ref/journeys/ 2>/dev/null || true
cp -r /tmp/dittofeed/packages/backend-lib/src/segments/ reference/dittofeed-ref/segments/ 2>/dev/null || true

# Cleanup
rm -rf /tmp/adtracked /tmp/acelle /tmp/plunk /tmp/dittofeed

echo ""
echo "✅ Referências clonadas:"
echo "  adtracked/       → $(ls reference/adtracked/ 2>/dev/null | wc -l) arquivos"
echo "  acelle/           → $(ls reference/acelle/ 2>/dev/null | wc -l) arquivos"
echo "  shadcn-workflows/ → $(ls reference/shadcn-workflows/ 2>/dev/null | head -1)"
echo "  whatsapp-examples/→ $(ls reference/whatsapp-examples/ 2>/dev/null | head -1)"
echo "  plunk-ref/        → $(ls reference/plunk-ref/ 2>/dev/null | wc -l) dirs"
echo "  dittofeed-ref/    → $(ls reference/dittofeed-ref/ 2>/dev/null | wc -l) dirs"
echo ""
echo "NÃO commitar reference/ — já está no .gitignore"
```

---

## 🗺️ MAPA: QUAL REFERÊNCIA CADA CLAUDE USA

| Claude | Referência principal | O que copiar/adaptar |
|--------|---------------------|---------------------|
| **1 (Shopify)** | `reference/adtracked/webhook-handler.ts` | Switch por topic, HMAC verify, upsert logic |
| **1 (Shopify)** | `reference/adtracked/register-webhooks.ts` | Auto-registro com GET+DELETE+POST |
| **1 (Shopify)** | `reference/adtracked/shopify-oauth.ts` + `shopify-callback.ts` | OAuth flow completo |
| **1 (Tracking)** | `reference/adtracked/track-endpoint.ts` | Server-side tracking com UTMs e click IDs |
| **1 (Domain)** | `reference/plunk-ref/services/domain.ts` + `reference/acelle/SendingDomain.php` | DNS verification flow |
| **2 (Editor)** | Unlayer docs + `reference/acelle/Template.php` | Template CRUD + categories |
| **2 (Sending)** | `reference/acelle/SendMessage.php` + `reference/plunk-ref/controllers/email.ts` | Pipeline render→send→log |
| **2 (Tags)** | `reference/acelle/StringHelper.php` | Merge tag regex engine |
| **2 (Tracking)** | `reference/acelle/CampaignController.php` + `reference/plunk-ref/controllers/track.ts` | Open pixel, click redirect, unsubscribe |
| **3 (Canvas)** | `reference/shadcn-workflows/` | React Flow + custom nodes + sidebar |
| **3 (Engine)** | `reference/acelle/Automation2.php` + `reference/dittofeed-ref/journeys/` | Flow execution, delay, conditions |
| **3 (Triggers)** | `reference/acelle/AutoTrigger.php` + `reference/acelle/RunAutomation.php` | Event→flow matching, cron processing |
| **3 (WhatsApp)** | `reference/whatsapp-examples/` | Templates e-commerce, envio, webhooks |
| **4 (Segments)** | `reference/acelle/SegmentCondition.php` + `reference/dittofeed-ref/segments/` | Condition→SQL translation |
| **4 (Contacts)** | `reference/acelle/Subscriber.php` + `reference/acelle/MailList.php` | Contact model, list membership |
| **5 (Campaign)** | `reference/acelle/Campaign.php` | State machine, stats, resolve recipients |
| **5 (Analytics)** | `reference/plunk-ref/controllers/campaigns.ts` | Metrics aggregation |

---

## 📐 NPM PACKAGES — VERSÕES EXATAS

Instalar no projeto:
```json
{
  "@supabase/supabase-js": "latest",
  "@supabase/ssr": "latest",
  "@shopify/shopify-api": "latest",
  "resend": "latest",
  "react-email-editor": "latest",
  "@xyflow/react": "latest",
  "react-querybuilder": "latest",
  "@react-querybuilder/dnd": "latest",
  "papaparse": "latest",
  "recharts": "latest",
  "date-fns": "latest",
  "zod": "latest",
  "lucide-react": "latest",
  "uuid": "latest",
  "nanoid": "latest"
}
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Shopify REST é legacy** mas FUNCIONA perfeitamente para webhooks e sync. GraphQL é recomendado para novos apps mas adiciona complexidade desnecessária para o MVP.

2. **Resend free tier** = 3.000 emails/mês, 100 emails/dia, 1 domínio. Para produção com 250+ clientes, vai precisar do plano Pro ($20/mês para 50k emails).

3. **WhatsApp pricing mudou em Jul 2025**: de conversation-based para per-template-message. Service conversations (cliente inicia) são gratuitas ou muito baratas.

4. **Supabase RLS é obrigatório** em produção. TODOS os 5 Claudes devem usar admin client (service_role) APENAS em webhooks e crons. Client-side queries devem passar pelo RLS.

5. **Unlayer funciona 100% sem Project ID**. Não é bloqueante para o MVP. Registrar em unlayer.com só quando precisar de upload de imagens nativo.

# AUTORUN-CLAUDE-1.md — Shopify + Domain + Server-Side Tracking + CDP

Leia CLAUDE.md e DESIGN-SYSTEM.md. git pull origin main. Execute TUDO sem parar.

SÓ edite: src/lib/shopify/, src/lib/tracking/, src/components/settings/, src/app/(dashboard)/settings/, src/app/api/auth/shopify/, src/app/api/webhooks/shopify/, src/app/api/domains/, src/app/api/track/

---

## MÓDULO A: Shopify OAuth

src/lib/shopify/oauth.ts:
- generateAuthUrl(shopDomain, storeId) → URL OAuth com SHOPIFY_API_KEY, SHOPIFY_SCOPES, redirect para /api/auth/shopify/callback?store_id=X
- exchangeCodeForToken(shop, code) → POST https://{shop}/admin/oauth/access_token → retorna access_token

src/app/api/auth/shopify/route.ts:
- GET ?shop=xxx.myshopify.com&store_id=xxx → redirect para Shopify consent

src/app/api/auth/shopify/callback/route.ts:
- GET ?code=xxx&shop=xxx&store_id=xxx → troca code por token → UPDATE stores SET shopify_domain, shopify_access_token → chamar registerWebhooks → redirect /settings/integrations?success=true

## MÓDULO B: Webhook Registration

src/lib/shopify/webhooks.ts:
- registerWebhooks(shop, accessToken, storeId):
  Topics: orders/create, orders/paid, orders/updated, orders/cancelled, orders/fulfilled, checkouts/create, checkouts/update, customers/create, customers/update, products/update, refunds/create
  Para cada: GET webhooks existentes → deletar duplicados → POST criar novo com address=${APP_URL}/api/webhooks/shopify

## MÓDULO C: Webhook Handler (MAIS IMPORTANTE)

src/app/api/webhooks/shopify/route.ts — 1 arquivo grande, handler completo:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// Verify HMAC
function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  try { return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac)) }
  catch { return false }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const topic = req.headers.get('x-shopify-topic') || ''
  const shopDomain = req.headers.get('x-shopify-shop-domain') || ''
  const supabase = createAdminClient()

  // Find store
  const { data: store } = await supabase.from('stores').select('*').eq('shopify_domain', shopDomain).single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  // Verify HMAC if webhook_secret exists
  if (store.webhook_secret) {
    const sig = req.headers.get('x-shopify-hmac-sha256') || ''
    if (!verifyWebhook(body, sig, store.webhook_secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const data = JSON.parse(body)

  switch (topic) {
    case 'orders/create': await handleOrderCreate(supabase, store, data); break
    case 'orders/paid': await handleOrderPaid(supabase, store, data); break
    case 'orders/fulfilled': await handleOrderFulfilled(supabase, store, data); break
    case 'orders/cancelled': await handleOrderCancelled(supabase, store, data); break
    case 'checkouts/create':
    case 'checkouts/update': await handleCheckout(supabase, store, data); break
    case 'customers/create':
    case 'customers/update': await handleCustomer(supabase, store, data); break
    case 'products/update': await handleProduct(supabase, store, data); break
    case 'refunds/create': await handleRefund(supabase, store, data); break
  }

  return NextResponse.json({ success: true })
}
```

Implementar CADA handler:

handleOrderCreate(supabase, store, order):
1. Upsert contact: buscar por email na store. Se não existe, INSERT contacts com email, phone, first_name, last_name, city, state, country, zip do billing_address, shopify_customer_id, source='shopify'. Se existe, UPDATE dados.
2. Criar evento: INSERT events com store_id, contact_id, event_type='placed_order', revenue=parseFloat(total_price), properties={ order_id: order.id, order_number: order.name, total: total_price, subtotal: subtotal_price, discount: total_discounts, tax: total_tax, items: line_items.map(i => ({ product_id: i.product_id, title: i.title, quantity: i.quantity, price: i.price, sku: i.sku })), billing_address, shipping_address }
3. Update contact metrics: total_orders += 1, total_spent += total_price, avg_order_value = total_spent / total_orders, last_order_at = now
4. Marcar abandoned cart como recovered: UPDATE events SET properties = properties || '{"recovered":true}' WHERE contact_id AND event_type='started_checkout' AND created_at > now()-24h

handleOrderPaid: INSERT events type='order_paid' com properties={order_id, payment_method (se disponível)}

handleOrderFulfilled: INSERT events type='order_fulfilled' com properties={order_id, tracking_number, tracking_url, tracking_company} extraídos de fulfillments[0]

handleOrderCancelled: INSERT events type='order_cancelled' com properties={order_id, cancel_reason}

handleCheckout: Upsert contact pelo email do checkout. INSERT events type='started_checkout' com properties={checkout_token, abandoned_checkout_url, items, total, email}. Esse evento será usado pelo flow de abandoned cart.

handleCustomer: Upsert contacts com TODOS os campos: email, phone, first_name, last_name, shopify_customer_id, city, state, country, zip, tags (do customer.tags separado por vírgula), consent_email (marketing_consent do Shopify), source='shopify'

handleProduct: Upsert products: shopify_product_id, title, handle, image_url (images[0]?.src), price (variants[0]?.price), compare_at_price, vendor, product_type, tags, status

handleRefund: INSERT events type='refund_created' com properties={order_id, refund_amount}

## MÓDULO D: Server-Side Tracking Endpoint (inspirado AdTracked)

src/app/api/track/route.ts:
- CORS headers (Access-Control-Allow-Origin: *)
- OPTIONS handler
- POST handler: recebe JSON payload com:
  store_id, visitor_id, session_id, event_name, event_id, page_url, user_agent,
  utm_params: { source, medium, campaign, content, term },
  click_ids: { fbclid, gclid, gbraid, wbraid, ttclid, fbc, fbp },
  user_data: { email, phone, first_name, last_name },
  custom_data: { content_type, content_ids, value, currency, product_name, product_id }
- Buscar store pelo store_id
- Se tem user_data.email: upsert contact
- INSERT events com event_type do payload, properties com custom_data + utm + click_ids
- Retornar { success: true }

src/lib/tracking/session.ts:
- createOrUpdateSession(storeId, visitorId, sessionId, data) → upsert na tabela events com type='session_start' e properties com UTMs e click_ids

## MÓDULO E: Shopify Sync

src/lib/shopify/sync.ts:
- syncCustomers(store): GET /admin/api/2024-01/customers.json?limit=250 → paginação → bulk upsert contacts
- syncProducts(store): GET /admin/api/2024-01/products.json?limit=250 → bulk upsert products
- syncOrders(store): GET /admin/api/2024-01/orders.json?limit=250&status=any → criar events
Tratar paginação com Link header do Shopify.

## MÓDULO F: Domain Settings + Sender Config UI

src/app/api/domains/route.ts:
- POST {domain}: Resend API POST /domains → salvar resend_domain_id na store → retornar DNS records
- GET: buscar domínio + status da store

src/app/api/domains/verify/route.ts:
- POST: Resend API POST /domains/{id}/verify → update domain_verified

src/app/(dashboard)/settings/integrations/page.tsx:
Card Shopify: input domínio, botão "Conectar", status badge (Conectado verde / Desconectado cinza), data sync, botão sync manual, botão desconectar.
Seguir DESIGN-SYSTEM.md: bg-white border rounded-lg p-6.

src/app/(dashboard)/settings/email/page.tsx:
Seção 1 "Domínio de Envio": input domínio, botão Adicionar, tabela DNS com 3 colunas (Tipo, Nome, Valor) com botão copiar em cada, botão Verificar, badge status.
Seção 2 "Remetente Padrão": inputs sender_name, sender_email, reply_to, botão Salvar.

Criar componentes: src/components/settings/shopify-connect.tsx, domain-config.tsx, sender-config.tsx

## FINALIZAR

pnpm build → corrigir → git pull origin main && git add -A && git commit -m "feat: shopify domain tracking" && git push origin main
Se conflito: git pull --rebase && git push. NÃO PARE.

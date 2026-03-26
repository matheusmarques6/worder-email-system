# AUTORUN-CLAUDE-1.md — Shopify Integration + Domain Settings

Leia CLAUDE.md e DESIGN-SYSTEM.md. Execute TUDO abaixo em sequência sem parar. Antes de começar: `git pull origin main` para pegar o código base.

Você SÓ cria/edita arquivos nestas pastas:
src/lib/shopify/, src/components/settings/, src/app/(dashboard)/settings/, src/app/api/auth/shopify/, src/app/api/webhooks/shopify/, src/app/api/domains/

---

## MÓDULO A: Shopify OAuth

Criar src/lib/shopify/oauth.ts:
- generateAuthUrl(shopDomain, storeId): gera URL OAuth Shopify com client_id=SHOPIFY_API_KEY, scope=SHOPIFY_SCOPES, redirect_uri=${NEXT_PUBLIC_APP_URL}/api/auth/shopify/callback?store_id=${storeId}
- exchangeCodeForToken(shop, code): POST https://{shop}/admin/oauth/access_token com client_id, client_secret, code. Retorna access_token.

Criar src/app/api/auth/shopify/route.ts:
- GET: recebe ?shop=xxx.myshopify.com&store_id=xxx → gera auth URL → redirect

Criar src/app/api/auth/shopify/callback/route.ts:
- GET: recebe ?code=xxx&shop=xxx&store_id=xxx → exchangeCodeForToken → update stores SET shopify_domain=shop, shopify_access_token=token WHERE id=store_id → chamar registerWebhooks → redirect /settings/integrations?success=true

## MÓDULO B: Webhook Registration + Handler

Criar src/lib/shopify/webhooks.ts:
- registerWebhooks(shop, accessToken, storeId): 
  - Topics: orders/create, orders/paid, orders/updated, orders/cancelled, orders/fulfilled, checkouts/create, checkouts/update, customers/create, customers/update, products/update, refunds/create
  - Para cada: POST https://{shop}/admin/api/2024-01/webhooks.json com address=${APP_URL}/api/webhooks/shopify
  - Antes de criar: GET webhooks existentes, deletar duplicados

Criar src/app/api/webhooks/shopify/route.ts:
- POST handler completo:
  - Ler raw body com request.text()
  - Verificar HMAC: crypto.createHmac('sha256', secret).update(body).digest('base64') === header x-shopify-hmac-sha256. Usar timingSafeEqual.
  - Buscar store por shopify_domain (usar admin client, bypassa RLS)
  - Switch por x-shopify-topic:

  orders/create:
    → Buscar ou criar contact pelo email do customer (upsert em contacts com store_id)
    → INSERT events: store_id, contact_id, event_type='placed_order', properties={order_id, order_number, total, items, billing_address}, revenue=total_price
    → UPDATE contact: total_orders +1, total_spent +total_price, last_order_at=now

  orders/paid:
    → INSERT events type='order_paid'
    → UPDATE orders financial_status na tabela events (properties)

  orders/fulfilled:
    → INSERT events type='order_fulfilled' com properties={tracking_url, tracking_number}

  orders/cancelled:
    → INSERT events type='order_cancelled'

  checkouts/create e checkouts/update:
    → INSERT events type='started_checkout' com properties={checkout_token, items, total, abandoned_checkout_url, email}
    → Upsert contact se tem email

  customers/create e customers/update:
    → Upsert contact: email, phone, first_name, last_name, city, state, country, zip, shopify_customer_id

  products/update:
    → Upsert product: shopify_product_id, title, handle, image_url, price, compare_at_price, vendor, product_type, tags

  refunds/create:
    → INSERT events type='refund_created' com properties={refund_amount, order_id}

  Retornar NextResponse.json({ success: true })

Criar src/lib/shopify/sync.ts:
- syncCustomers(store): GET /admin/api/2024-01/customers.json → bulk upsert contacts
- syncProducts(store): GET /admin/api/2024-01/products.json → bulk upsert products
- syncOrders(store): GET /admin/api/2024-01/orders.json → criar events

## MÓDULO C: Domain + Sender Settings

Criar src/app/api/domains/route.ts:
- POST: recebe {domain}. Chama Resend API: POST https://api.resend.com/domains com Authorization Bearer RESEND_API_KEY. Salva resend_domain_id na store. Retorna DNS records.
- GET: busca domínio atual da store + status

Criar src/app/api/domains/verify/route.ts:
- POST: chama Resend API POST /domains/{id}/verify. Atualiza domain_verified na store.

Criar src/app/(dashboard)/settings/integrations/page.tsx:
- Card Shopify: input domínio loja, botão "Conectar Shopify", status conexão (conectado/desconectado com badge), data último sync, botão reconectar/desconectar
- Seguir DESIGN-SYSTEM.md para cores e componentes

Criar src/app/(dashboard)/settings/email/page.tsx:
- Seção Domínio: input domínio, botão adicionar, tabela DNS records (Tipo, Nome, Valor com botão copiar cada), botão verificar, status badge
- Seção Sender: inputs sender_name, sender_email, reply_to_email, botão salvar

Criar src/components/settings/shopify-connect.tsx:
- Card com status, domain, botões. Badge verde "Conectado" ou cinza "Desconectado"

Criar src/components/settings/domain-config.tsx:
- Form de domínio + tabela DNS records copiáveis

Criar src/components/settings/sender-config.tsx:
- Form sender name/email/reply-to

## FINALIZAR

Rodar `pnpm build`. Corrigir TODOS erros até passar.
`git pull origin main && git add -A && git commit -m "feat: shopify oauth webhooks domain settings" && git push origin main`

Se push falhar por conflito: `git pull --rebase origin main` e tentar push novamente.
NÃO PARE até o push ser feito com sucesso.

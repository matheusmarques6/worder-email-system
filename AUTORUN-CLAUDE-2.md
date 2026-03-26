# AUTORUN-CLAUDE-2.md — Email Editor + Sending + Tracking

Leia CLAUDE.md e DESIGN-SYSTEM.md. Execute TUDO abaixo em sequência sem parar. Antes de começar: `git pull origin main`.

Você SÓ cria/edita arquivos nestas pastas:
src/lib/email/, src/components/editor/, src/app/(dashboard)/templates/, src/app/api/t/, src/app/api/webhooks/resend/, src/app/api/unsubscribe/

---

## MÓDULO A: Unlayer Email Editor + Templates

Criar src/components/editor/merge-tags.ts:
```typescript
export const mergeTags = {
  first_name: { name: 'Nome', value: '{{first_name}}', sample: 'João' },
  last_name: { name: 'Sobrenome', value: '{{last_name}}', sample: 'Silva' },
  email: { name: 'Email', value: '{{email}}', sample: 'joao@email.com' },
  phone: { name: 'Telefone', value: '{{phone}}', sample: '(11) 99999-9999' },
  store_name: { name: 'Nome da Loja', value: '{{store_name}}', sample: 'Minha Loja' },
  store_url: { name: 'URL da Loja', value: '{{store_url}}', sample: 'https://minhaloja.com.br' },
  order_number: { name: 'Nº Pedido', value: '{{order_number}}', sample: '#1234' },
  order_total: { name: 'Total Pedido', value: '{{order_total}}', sample: 'R$ 199,90' },
  cart_total: { name: 'Total Carrinho', value: '{{cart_total}}', sample: 'R$ 299,90' },
  cart_url: { name: 'Link Carrinho', value: '{{cart_url}}', sample: 'https://minhaloja.com.br/cart' },
  product_name: { name: 'Nome Produto', value: '{{product_name}}', sample: 'Camiseta Premium' },
  product_price: { name: 'Preço Produto', value: '{{product_price}}', sample: 'R$ 89,90' },
  product_image: { name: 'Imagem Produto', value: '{{product_image}}', sample: 'https://via.placeholder.com/300' },
  product_url: { name: 'Link Produto', value: '{{product_url}}', sample: 'https://minhaloja.com.br/produto' },
}
```

Criar src/components/editor/email-editor.tsx:
- Componente 'use client' que wrappa react-email-editor
- Props: designJson (opcional, para carregar template existente), onSave(html: string, json: object)
- Configurar: mergeTags do arquivo acima, locale 'pt-BR', appearance theme 'modern_light'
- Se NEXT_PUBLIC_UNLAYER_PROJECT_ID existir, passar como projectId
- Expor ref com métodos exportHtml e loadDesign

Criar src/components/editor/template-gallery.tsx:
- Grid 3 colunas de cards
- Cada card: área cinza como thumbnail (ou preview), nome, badge de categoria, botões Editar/Clonar/Deletar
- Filtro por categoria: Todos, E-commerce, Welcome, Abandono, Pós-compra, Newsletter
- Busca por nome
- Empty state: "Nenhum template encontrado. Crie seu primeiro template!"

Criar src/app/(dashboard)/templates/page.tsx:
- Título "Templates", botão "Criar Template" (laranja)
- TemplateGallery com dados do Supabase (SELECT from templates WHERE store_id)

Criar src/app/(dashboard)/templates/new/page.tsx:
- Form: nome (input), categoria (select com opções acima)
- Duas opções: "Começar do zero" e "Usar template pré-construído" (mostrar 5 cards dos prebuilt)
- Ao criar: INSERT templates → redirect /templates/[id]/edit

Criar src/app/(dashboard)/templates/[id]/edit/page.tsx:
- Página fullscreen com EmailEditor
- Buscar template do Supabase → se tem design_json, loadDesign()
- Header fixo com: botão Voltar, nome do template, botão "Enviar Teste" (abre dialog com input email), botão "Salvar" (laranja, exporta HTML+JSON e UPDATE no Supabase)

Criar 5 templates pré-built como arquivos JSON em src/lib/email/templates/:
- welcome.json — Email de boas-vindas com merge tags {{first_name}}, {{store_name}}
- abandoned-cart.json — Lembrete de carrinho com {{cart_items}}, {{cart_total}}, {{cart_url}}
- order-confirm.json — Confirmação pedido com {{order_number}}, {{order_total}}
- post-purchase.json — Pós-compra com review request
- newsletter.json — Newsletter genérico
Cada um: layout simples responsivo, header com logo placeholder, body com content, footer com unsubscribe link. Usar design JSON válido do Unlayer.

## MÓDULO B: Merge Tag Engine + Resend Sending

Criar src/lib/email/render.ts:
- renderMergeTags(html: string, data: Record<string,string>): string
  Regex para {{tag}} e {{tag|fallback}}. Substituir por valor ou fallback.

- rewriteUrlsForTracking(html: string, emailSendId: string, baseUrl: string): string
  Regex para href="URL" em tags <a>. Substituir por: ${baseUrl}/api/t/c/${emailSendId}?url=${encodeURIComponent(originalUrl)}

- injectOpenPixel(html: string, emailSendId: string, baseUrl: string): string
  Inserir antes de </body>: <img src="${baseUrl}/api/t/o/${emailSendId}" width="1" height="1" style="display:none" alt="" />

- addUnsubscribeLink(html: string, emailSendId: string, baseUrl: string): string
  Se html não contém "unsubscribe", inserir antes de </body>: link para /api/unsubscribe/${emailSendId}

- prepareEmailHtml(html, contact, store, emailSendId): string
  Pipeline: renderMergeTags → rewriteUrlsForTracking → injectOpenPixel → addUnsubscribeLink

Criar src/lib/email/resend.ts:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(params: { to: string, from: string, senderName: string, subject: string, html: string, replyTo?: string }) {
  const { data, error } = await resend.emails.send({
    from: `${params.senderName} <${params.from}>`,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    reply_to: params.replyTo,
  })
  if (error) return { error: error.message }
  return { id: data?.id }
}
```

Criar src/lib/email/send-campaign-email.ts:
- sendCampaignEmail(contact, template, campaign, store): buscar template HTML → construir data de merge tags com dados do contact e store → prepareEmailHtml → sendEmail → INSERT email_sends com status, contact_id, campaign_id, resend_message_id

## MÓDULO C: Open/Click Tracking + Bounce Handling

Criar src/app/api/t/o/[id]/route.ts:
- GET handler. id = email_send_id
- Admin client: buscar email_send por id
- Se existe e opened_at null → UPDATE opened_at = new Date().toISOString()
- INSERT events: type='email_opened', contact_id do email_send
- Retornar: `new Response(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64'), { headers: { 'Content-Type':'image/gif', 'Cache-Control':'no-store,no-cache,must-revalidate' } })`

Criar src/app/api/t/c/[id]/route.ts:
- GET handler. id = email_send_id, url = searchParams.get('url')
- Admin client: buscar email_send
- Se clicked_at null → UPDATE clicked_at
- INSERT events type='email_clicked' com properties: { url: decodeURIComponent(url) }
- Retornar: `NextResponse.redirect(decodeURIComponent(url), 302)`

Criar src/app/api/unsubscribe/[id]/route.ts:
- GET handler. id = email_send_id
- Buscar email_send → contact_id
- UPDATE contacts SET consent_email='unsubscribed' WHERE id=contact_id
- Retornar HTML simples: página com "Você foi descadastrado com sucesso. Não receberá mais emails do {{store_name}}."

Criar src/app/api/webhooks/resend/route.ts:
- POST handler
- Parse body JSON. Switch por type:
  email.delivered → UPDATE email_sends SET delivered_at WHERE resend_message_id
  email.bounced → UPDATE email_sends SET bounced_at, bounce_type. UPDATE contacts SET consent_email='bounced'
  email.complained → UPDATE contacts SET consent_email='unsubscribed'
- Retornar { received: true }

## FINALIZAR

Rodar `pnpm build`. Corrigir TODOS erros até passar.
`git pull origin main && git add -A && git commit -m "feat: email editor sending tracking complete" && git push origin main`

Se push falhar: `git pull --rebase origin main` e push novamente.
NÃO PARE até o push ser feito com sucesso.

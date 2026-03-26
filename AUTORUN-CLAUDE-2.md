# AUTORUN-CLAUDE-2.md — Email Editor + Sending + Tracking + A/B Testing

Leia CLAUDE.md e DESIGN-SYSTEM.md. git pull origin main. Execute TUDO sem parar.

SÓ edite: src/lib/email/, src/components/editor/, src/app/(dashboard)/templates/, src/app/api/t/, src/app/api/webhooks/resend/, src/app/api/unsubscribe/

---

## MÓDULO A: Unlayer Editor + Template CRUD

src/components/editor/merge-tags.ts — Exportar objeto com TODOS merge tags:
first_name, last_name, email, phone, store_name, store_url, order_number, order_total, order_tracking_url, cart_total, cart_url, cart_items, product_name, product_price, product_image, product_url. Cada um com name (PT-BR), value ({{tag}}), sample (exemplo real).

src/components/editor/email-editor.tsx — 'use client'. Wrapper react-email-editor:
- Props: designJson?, onSave(html, json), height (default '100vh')
- Config: mergeTags, locale 'pt-BR', appearance theme 'modern_light', projectId opcional
- ref com exportHtml e loadDesign

src/components/editor/template-gallery.tsx — Grid responsivo (3 cols desktop, 2 tablet, 1 mobile):
- Card: bg-white border rounded-lg overflow-hidden hover:shadow-md transition
- Thumbnail area: h-48 bg-gray-100 com preview ou placeholder (Mail icon grande cinza)
- Info: p-4, nome text-sm font-medium, badge categoria (text-xs), data criação
- Actions: hover overlay com Editar/Clonar/Deletar
- Filtro: tabs de categoria (Todos, E-commerce, Welcome, Abandono, Pós-compra, Newsletter, Custom)
- Busca: input com Search icon
- Empty state com CTA

src/app/(dashboard)/templates/page.tsx — "Templates" h1, botão "Criar Template" (laranja), TemplateGallery com dados Supabase.

src/app/(dashboard)/templates/new/page.tsx — Nome input, Categoria select. Duas opções: "Em branco" (card com Plus icon) e "Templates prontos" (grid 5 cards dos prebuilt com preview). Criar → INSERT templates → redirect /templates/[id]/edit.

src/app/(dashboard)/templates/[id]/edit/page.tsx — FULLSCREEN. Header fixo h-14: botão Voltar (ArrowLeft), nome template (editável inline), botão "Enviar Teste" (secondary), botão "Salvar" (laranja). EmailEditor ocupando todo o resto. Buscar template → loadDesign. Salvar → exportHtml → UPDATE design_json + html.

Criar 8 templates pré-built em src/lib/email/templates/ como Unlayer JSON:
welcome.json, abandoned-cart.json, order-confirm.json, post-purchase.json, winback.json, newsletter.json, review-request.json, boleto-reminder.json
Cada um: layout responsivo, header com logo placeholder, body com merge tags, footer com unsubscribe. Cores neutras (cinza/branco) para funcionar com qualquer marca.

## MÓDULO B: Merge Tag Engine + Sending

src/lib/email/render.ts:
- renderMergeTags(html, data: Record<string,string>): Regex para {{tag}} e {{tag|fallback}}. Substituir ou usar fallback.
- rewriteUrlsForTracking(html, emailSendId, baseUrl): Todo href="URL" em <a> → ${baseUrl}/api/t/c/${emailSendId}?url=${encodeURIComponent(url)}. Ignorar mailto: e #.
- injectOpenPixel(html, emailSendId, baseUrl): Antes de </body>: <img src="${baseUrl}/api/t/o/${emailSendId}" width="1" height="1" style="display:none" />
- addUnsubscribeLink(html, emailSendId, baseUrl): Se não contém "unsubscribe": adicionar link antes de </body>
- prepareEmailHtml(html, contact, store, emailSendId, eventData?): Pipeline completo. Montar data com dados do contact + store + eventData. Retornar HTML pronto.

src/lib/email/resend.ts:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
export async function sendEmail({ to, from, senderName, subject, html, replyTo, tags }: {...}) {
  const { data, error } = await resend.emails.send({
    from: `${senderName} <${from}>`, to: [to], subject, html, reply_to: replyTo,
    tags: tags ? Object.entries(tags).map(([name, value]) => ({ name, value })) : undefined
  })
  if (error) return { error: error.message }
  return { id: data?.id }
}
```

src/lib/email/send-campaign-email.ts:
- sendCampaignEmail(contact, template, store, campaignId?, flowId?):
  1. Montar mergeData com dados do contact e store
  2. Criar email_send row com status='queued'
  3. prepareEmailHtml com o emailSendId
  4. Renderizar subject com merge tags também
  5. sendEmail via Resend
  6. UPDATE email_send com resend_message_id e status='sent'
  7. Se erro: status='failed'
  Retornar { success, emailSendId }

## MÓDULO C: A/B Testing

Adicionar à tabela campaigns (via properties no stats JSON, sem alterar schema):
- O A/B test fica no campo stats da campanha: stats.ab_test = { enabled: true, variant_a: { subject, percentage: 50 }, variant_b: { subject, percentage: 50 }, winner: null }
- Na hora do envio: se ab_test.enabled, dividir contacts em 2 grupos, enviar subject A para grupo A e subject B para grupo B
- Após 4h (ou configurável): comparar open_rate dos 2 grupos. Winner = o com melhor open rate
- Resultado salvo em stats.ab_test.winner

src/lib/email/ab-test.ts:
- splitContactsForABTest(contacts[], percentageA): retorna { groupA: [], groupB: [] }
- determineWinner(campaignId): buscar email_sends agrupados por subject → calcular open rate → retornar winner
- applyWinner(campaignId): enviar subject winner para contacts restantes (se teste era parcial)

## MÓDULO D: Open/Click/Bounce Tracking

src/app/api/t/o/[id]/route.ts — GET:
Admin client. Buscar email_send. Se opened_at null → UPDATE opened_at. INSERT events type='email_opened'. Retornar GIF 1x1:
```typescript
const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
return new Response(pixel, { headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store,no-cache' } })
```

src/app/api/t/c/[id]/route.ts — GET ?url=xxx:
Buscar email_send. UPDATE clicked_at. INSERT events type='email_clicked' com { url }. Redirect 302.

src/app/api/unsubscribe/[id]/route.ts — GET:
Buscar email_send → contact_id. UPDATE contacts consent_email='unsubscribed'. INSERT events type='unsubscribed'. Retornar HTML: página branca com "Você foi descadastrado com sucesso."

src/app/api/webhooks/resend/route.ts — POST:
Switch type: email.delivered → UPDATE email_sends delivered_at. email.bounced → bounced_at + contacts consent='bounced'. email.complained → contacts consent='unsubscribed'.

## FINALIZAR

pnpm build → corrigir → git pull --rebase origin main && git add -A && git commit -m "feat: email editor sending tracking ab-testing" && git push origin main
NÃO PARE.

# AUTORUN-CLAUDE-5.md — Campaigns + A/B Test + Analytics + Product Recommendations

Leia CLAUDE.md e DESIGN-SYSTEM.md. git pull origin main. Execute TUDO sem parar.

SÓ edite: src/lib/analytics/, src/lib/recommendations/, src/components/campaigns/, src/app/(dashboard)/campaigns/, src/app/(dashboard)/analytics/, src/app/api/campaigns/

---

## MÓDULO A: Campaign List + Table

src/app/(dashboard)/campaigns/page.tsx:
- H1 "Campanhas", botão "Nova Campanha" (laranja)
- Tabs: Todas, Enviadas, Agendadas, Rascunhos
- DataTable: Nome, Status badge (Draft=cinza, Scheduled=amarelo, Sending=laranja, Sent=verde, Cancelled=vermelho), Data, Enviados, Abertos %, Clicados %, Revenue R$
- Sorting por data, open rate. Busca por nome.
- Actions: Ver relatório (se sent), Editar (se draft), Duplicar, Cancelar (se scheduled), Deletar (se draft)
- Empty state: ícone Mail, "Nenhuma campanha. Crie e envie seu primeiro email!" + CTA

src/components/campaigns/campaign-table.tsx — DataTable com badges, formatação %, R$.

## MÓDULO B: Campaign Wizard (4 steps)

src/app/(dashboard)/campaigns/new/page.tsx — Wizard completo com progress indicator:

STEP 1 — INFORMAÇÕES:
- Input nome (obrigatório, placeholder "Ex: Black Friday 2024")
- Input tags (chips, enter para adicionar)
- Checkbox "Teste A/B" → se marcado, expandir: input Subject A, input Subject B, slider % split (default 50/50), input "Enviar winner após X horas" (default 4)

STEP 2 — DESTINATÁRIOS:
- Radio: "Enviar para Lista" ou "Enviar para Segmento"
- Se Lista: Select dropdown das lists com contagem. Se nenhuma: link "Criar lista primeiro"
- Se Segmento: Select dropdown dos segments com contagem. Se nenhum: link "Criar segmento"
- Badge grande: "Será enviado para X contatos" (verde se >0, amarelo se 0)
- Checkbox "Excluir contatos não engajados (não abriram email nos últimos 90 dias)"
- Checkbox "Smart Sending — Não enviar para quem recebeu email nas últimas 16 horas"

STEP 3 — CONTEÚDO:
- Select template: dropdown dos templates da store + botão "Criar template" (abre nova aba)
- Se template selecionado: mostrar thumbnail preview
- Input Subject line (obrigatório). Se A/B: mostrar "Subject A" e "Subject B" lado a lado
- Input Preview text (opcional, hint: "Texto que aparece após o subject no inbox")
- Inputs sender: Sender Name (default store.sender_name), Sender Email (default store.sender_email)
- Botão "Enviar email de teste" → Dialog: input email, botão enviar → POST /api/campaigns/test

STEP 4 — REVISAR E ENVIAR:
- Grid 2x3 de cards resumo: Destinatários (count), Subject (text), Sender (name <email>), Template (nome), A/B Test (Sim/Não), Smart Sending (Sim/Não)
- Preview do email em iframe (HTML do template com merge tags de exemplo: João Silva, pedido #1234, R$ 199,90)
- 2 botões: "Enviar Agora" (laranja, primary, com confirm dialog "Enviar para X contatos?") e "Agendar" (secondary)
- Se Agendar: date picker + time picker. Info timezone do browser.
- INSERT/UPDATE campaign com todos dados → redirect /campaigns ou iniciar envio

Navegação: Anterior/Próximo. Validação Zod por step (nome required, lista/segmento required, template required, subject required). Step indicator: círculos 1-2-3-4 com linha entre, ativo=brand-500 filled, concluído=brand-500 check, futuro=gray-300.

src/components/campaigns/campaign-wizard.tsx — Componente wizard reutilizável.

## MÓDULO C: Campaign Send API

src/app/api/campaigns/send/route.ts — POST { campaignId }:
1. Buscar campaign com template e store
2. Resolver contacts: se list_id → via list_members join contacts. Se segment_id → importar resolveSegment de lib/segments/resolver
3. Filtrar consent_email = 'subscribed'
4. Se exclude_unengaged: filtrar quem abriu email nos últimos 90d
5. Se smart_sending: filtrar quem NÃO recebeu email nas últimas 16h
6. UPDATE campaign status='sending'
7. Se A/B test enabled:
   - Dividir contacts: grupo A (X%) e grupo B (Y%)
   - Para grupo A: enviar com subject A
   - Para grupo B: enviar com subject B
   - Agendar check de winner em stats.ab_test.check_after_hours
8. Para cada contact:
   - Importar prepareEmailHtml de lib/email/render
   - Montar mergeData com contact + store data
   - Criar email_send row status='queued'
   - prepareEmailHtml com emailSendId
   - Renderizar subject com merge tags
   - sendEmail via Resend
   - UPDATE email_send com resend_message_id, status='sent'
9. UPDATE campaign: status='sent', sent_at=now(), stats com totais
10. Retornar { success, sent_count }

src/app/api/campaigns/test/route.ts — POST { campaignId, testEmail }:
Buscar campaign + template. Render com dados de exemplo. Enviar 1 email. Retornar success.

## MÓDULO D: Campaign Report

src/app/(dashboard)/campaigns/[id]/page.tsx:
- Header: botão Voltar, nome, status badge, data envio, subject
- 6 metric cards (2 rows x 3):
  Enviados (total, ícone Send), Entregues (total-bounced, ícone Check), Taxa Abertura (%, ícone Eye, verde se >20% senão amarelo),
  Taxa Clique (%, ícone MousePointerClick), Bounced (count + %, ícone AlertTriangle, vermelho se >2%), Unsubscribed (count, ícone UserMinus)
- Se A/B test: card extra mostrando "Variante A: {subject} — X% open rate" vs "Variante B: {subject} — Y% open rate". Badge "Winner" no melhor.
- Recharts AreaChart: 2 linhas (opens=brand-500, clicks=blue-500) ao longo do tempo. X axis = hora (primeiras 48h) depois dia.
- Tabela recipients: email, status badge (delivered/opened/clicked/bounced), opened_at (hora relativa), clicked_at. Paginação 50/page. Busca por email.

src/components/campaigns/campaign-report.tsx — Componente reutilizável.

## MÓDULO E: Analytics Dashboard

src/lib/analytics/metrics.ts:
```typescript
export async function getCampaignMetrics(campaignId: string)
// total, delivered, opened (unique), clicked (unique), bounced, unsubscribed, revenue
// Rates: open_rate, click_rate, bounce_rate, unsubscribe_rate

export async function getDashboardMetrics(storeId: string, days = 30)
// emails_sent, avg_open_rate, avg_click_rate, active_contacts, live_flows, total_revenue_attributed

export async function getEmailsOverTime(storeId: string, days = 30)
// GROUP BY date_trunc('day', created_at) → [{day, sent, opened, clicked}]

export async function getTopCampaigns(storeId: string, limit = 5)
// ORDER BY open rate DESC

export async function getTopFlows(storeId: string, limit = 5)
// ORDER BY emails_sent DESC

export async function getRevenueAttribution(storeId: string, days = 30)
// Events placed_order que tem campaign_id ou flow_id no email_send associado
// Atribuição: se contact recebeu email E comprou dentro de 5 dias → atribuir revenue ao email
```

src/app/(dashboard)/analytics/page.tsx:
- H1 "Analytics", tabs período: 7d / 30d / 90d / Custom
- Row 4 metric cards: Revenue Atribuído (R$), Emails Enviados, Taxa Abertura Média, Taxa Clique Média
- Recharts AreaChart: emails enviados por dia (brand-500) + opens (emerald-500) overlay
- Recharts BarChart: revenue atribuído por semana
- Tabela "Top Campanhas": nome, enviados, open rate, click rate, revenue
- Tabela "Top Automações": nome, tipo trigger, entered, emails_sent, revenue

## MÓDULO F: Product Recommendations

src/lib/recommendations/engine.ts:
- getRecommendationsForContact(contactId, storeId, limit=4):
  1. Buscar últimos 5 events type='placed_order' do contact → extrair product_ids das properties
  2. Buscar products da store EXCLUINDO os já comprados
  3. Ordenar por: mesma category primeiro, depois por popularidade (count de placed_order events com esse product)
  4. Retornar array de { product_id, title, image_url, price, url }

- getPopularProducts(storeId, limit=4):
  1. Buscar events type='placed_order' dos últimos 30d
  2. Extrair product_ids e contar frequência
  3. Buscar products pelos mais frequentes
  4. Retornar array

- getBrowseBasedRecommendations(contactId, storeId, limit=4):
  1. Buscar events type='viewed_product' do contact (últimos 7d)
  2. Extrair categories
  3. Buscar products das mesmas categories que NÃO foram comprados
  4. Retornar

Estas recomendações ficam disponíveis como merge tags nos templates:
{{recommended_products}} → renderiza como grid de product cards no email
Implementar como custom block no Unlayer ou como HTML renderizado no prepareEmailHtml.

## MÓDULO G: Atualizar Dashboard com dados reais

Voltar em src/app/(dashboard)/page.tsx e substituir dados mock por chamadas reais:
- getDashboardMetrics(store.id, 30) para os metric cards
- getEmailsOverTime(store.id, 30) para o gráfico
- getTopCampaigns(store.id, 5) para a tabela

## FINALIZAR

pnpm build → corrigir → git pull --rebase origin main && git add -A && git commit -m "feat: campaigns analytics recommendations" && git push origin main
NÃO PARE.

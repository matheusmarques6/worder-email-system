# AUTORUN-CLAUDE-5.md — Campaigns + Analytics

Leia CLAUDE.md e DESIGN-SYSTEM.md. Execute TUDO abaixo em sequência sem parar. Antes de começar: `git pull origin main`.

Você SÓ cria/edita arquivos nestas pastas:
src/lib/analytics/, src/components/campaigns/, src/app/(dashboard)/campaigns/, src/app/(dashboard)/analytics/, src/app/api/campaigns/

---

## MÓDULO A: Campaign List + Creation Wizard

Criar src/app/(dashboard)/campaigns/page.tsx:
- Título "Campanhas", botão "Nova Campanha" (laranja)
- DataTable com colunas: Nome, Status (badge Draft=cinza, Scheduled=amarelo, Sending=laranja, Sent=verde), Data Envio (dd/mm/yyyy HH:mm ou "—"), Enviados, Abertos (%), Clicados (%)
- Busca por nome. Filtro por status (tabs ou select)
- Clicar em campanha enviada → /campaigns/[id]
- Empty state: "Nenhuma campanha ainda. Envie seu primeiro email para seus contatos!"

Criar src/components/campaigns/campaign-table.tsx:
- shadcn DataTable. Colunas sortáveis. Status badge. Formatação de rates como "45.2%"
- Ação por row: Editar (se draft), Ver relatório (se sent), Duplicar, Deletar

Criar src/app/(dashboard)/campaigns/new/page.tsx:
- Wizard de 4 steps com indicador visual de progresso (step 1 de 4, step 2 de 4...)

  Step 1 — Informações:
  Input nome da campanha (obrigatório). Input tags (opcional, chips).

  Step 2 — Destinatários:
  Select "Enviar para": dropdown com opção "Lista" ou "Segmento"
  Se Lista: dropdown das lists da store com contagem
  Se Segmento: dropdown dos segments da store com contagem
  Mostrar badge: "Será enviado para X contatos"
  Toggle: "Excluir contatos não engajados" (checkbox)
  Toggle: "Smart Sending — Não enviar para quem recebeu email nas últimas 16h" (checkbox)

  Step 3 — Conteúdo:
  Select template: dropdown dos templates + botão "Criar novo template" (abre em nova aba)
  Input Subject line (obrigatório)
  Input Preview text (opcional)
  Input Sender name (pré-preenchido com store.sender_name)
  Input Sender email (pré-preenchido com store.sender_email)
  Botão "Enviar email de teste" → dialog com input email → POST /api/campaigns/test

  Step 4 — Revisar e enviar:
  Resumo em cards: destinatários count, subject, sender, template nome
  Preview do email (iframe com HTML do template, merge tags substituídos com dados de exemplo)
  Dois botões: "Enviar Agora" (laranja, primary) e "Agendar" (secondary)
  Se Agendar: date picker + time picker + info de timezone

- Navegação: botões Anterior/Próximo. Validação Zod antes de avançar.
- State gerenciado com useState ou useReducer

Criar src/components/campaigns/campaign-wizard.tsx:
- Componente do wizard reutilizável com steps, validação, navegação

Criar src/app/api/campaigns/send/route.ts:
- POST handler. Recebe { campaignId }
- Buscar campaign + template + lista ou segmento
- Resolver contacts: se list_id → SELECT contacts via list_members. Se segment_id → importar resolveSegment de lib/segments
- Filtrar: apenas consent_email = 'subscribed'
- Se smart_sending: filtrar contacts que NÃO receberam email nas últimas 16h (check email_sends)
- UPDATE campaign status='sending'
- Para cada contact:
  - Importar prepareEmailHtml de lib/email/render e sendEmail de lib/email/resend
  - Preparar HTML com merge tags do contact e store
  - Enviar via Resend
  - INSERT email_sends com status='sent', campaign_id, contact_id, resend_message_id, subject, sender_email
- UPDATE campaign: status='sent', sent_at=now(), stats JSON com totais
- Retornar { success, sent_count }

Criar src/app/api/campaigns/test/route.ts:
- POST handler. Recebe { campaignId, testEmail }
- Buscar campaign + template
- Renderizar HTML com dados de exemplo (João Silva, pedido #1234, etc.)
- Enviar para testEmail via Resend
- Retornar { success }

## MÓDULO B: Campaign Report

Criar src/app/(dashboard)/campaigns/[id]/page.tsx:
- Header: nome campanha, status badge, data envio, subject line, botão Voltar
- 6 metric cards em row (2 rows de 3):
  Enviados (total), Entregues (total - bounced), Taxa Abertura (% opened/delivered),
  Taxa Clique (% clicked/delivered), Bounced (%), Unsubscribed (count)
- Recharts AreaChart: opens e clicks ao longo do tempo (agrupar por hora nas primeiras 48h, depois por dia)
  Duas linhas: opens (cor brand-500) e clicks (cor blue-500)
- Tabela de recipients: email, status (badge: delivered/opened/clicked/bounced), opened_at (hora), clicked_at (hora)
  Paginação 50 por página

Criar src/components/campaigns/campaign-report.tsx:
- Componente reutilizável que recebe campaignId e renderiza o relatório

## MÓDULO C: Analytics Page + Dashboard Metrics

Criar src/lib/analytics/metrics.ts:
```typescript
export async function getCampaignMetrics(campaignId: string) {
  // SELECT de email_sends WHERE campaign_id
  // Calcular: total, delivered (not bounced), opened (opened_at not null unique), clicked, bounced, unsubscribed
  // Rates: open_rate = opened/delivered*100, click_rate = clicked/delivered*100
}

export async function getDashboardMetrics(storeId: string, days: number = 30) {
  // Emails enviados: COUNT email_sends WHERE store_id AND created_at > now()-days
  // Open rate: média
  // Click rate: média
  // Contatos ativos: COUNT contacts WHERE consent_email='subscribed'
  // Flows ativos: COUNT flows WHERE status='live'
  // Retornar objeto com todos os valores
}

export async function getEmailsOverTime(storeId: string, days: number = 30) {
  // SELECT date_trunc('day', created_at) as day, COUNT(*) as count
  // FROM email_sends WHERE store_id AND created_at > now()-days
  // GROUP BY day ORDER BY day
  // Retornar array [{day, count}] para Recharts
}

export async function getTopCampaigns(storeId: string, limit: number = 5) {
  // SELECT campaigns com stats, ORDER BY stats->>'opened' DESC, LIMIT
}
```

Criar src/app/(dashboard)/analytics/page.tsx:
- Título "Analytics"
- Filtro de período: tabs 7d / 30d / 90d
- Recharts AreaChart: emails enviados por dia (cor brand-500)
- Recharts LineChart: open rate por dia (cor emerald-500)
- Tabela: Top 5 campanhas por open rate
- Tabela: Top 5 flows por emails enviados
- Seguir DESIGN-SYSTEM.md

## FINALIZAR

`pnpm build` → corrigir tudo → `git pull origin main && git add -A && git commit -m "feat: campaigns analytics complete" && git push origin main`
Se push falhar: `git pull --rebase origin main` e push novamente. NÃO PARE.

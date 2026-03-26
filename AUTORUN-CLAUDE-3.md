# AUTORUN-CLAUDE-3.md — Flow Builder + Execution Engine + WhatsApp

Leia CLAUDE.md e DESIGN-SYSTEM.md. Execute TUDO abaixo em sequência sem parar. Antes de começar: `git pull origin main`.

Você SÓ cria/edita arquivos nestas pastas:
src/lib/flows/, src/lib/whatsapp/, src/components/flows/, src/app/(dashboard)/flows/, src/app/(dashboard)/settings/whatsapp/, src/app/api/webhooks/whatsapp/, src/app/api/cron/, src/types/flows.ts

---

## MÓDULO A: Flow Builder Canvas + Custom Nodes

Criar src/types/flows.ts:
```typescript
export type FlowNodeType = 'trigger' | 'send_email' | 'send_whatsapp' | 'time_delay' | 'conditional' | 'trigger_split'
export type FlowTriggerType = 'metric' | 'list' | 'segment' | 'date_property'
export type FlowStatus = 'draft' | 'live' | 'manual' | 'paused'
export interface TriggerConfig { metric?: string; list_id?: string; segment_id?: string; filters?: Record<string,unknown>[] }
export interface DelayConfig { value: number; unit: 'minutes' | 'hours' | 'days' | 'weeks' }
export interface ConditionConfig { type: string; field?: string; operator?: string; value?: unknown }
export interface EmailActionConfig { template_id?: string; subject?: string }
export interface WhatsAppActionConfig { message_type: 'text' | 'template'; message?: string; template_name?: string }
```

Criar src/components/flows/flow-canvas.tsx:
- 'use client' com ReactFlowProvider, ReactFlow, MiniMap, Controls, Background
- Zustand store (ou useState) para nodes e edges
- onNodesChange, onEdgesChange, onConnect handlers
- onDrop handler para receber nodes da sidebar
- nodeTypes registrados: trigger, send_email, send_whatsapp, time_delay, conditional
- Cada node clicável abre panel de configuração à direita

Criar src/components/flows/flow-sidebar.tsx:
- 3 grupos: Triggers (Métrica, Lista, Segmento), Ações (Enviar Email, Enviar WhatsApp, Esperar), Lógica (Condição YES/NO)
- Cada item: ícone lucide + label, draggable com onDragStart setData

Criar src/components/flows/nodes/trigger-node.tsx:
- Visual: borda roxa, ícone Zap (lucide), label do trigger type, 1 handle bottom (source)
- Config panel: select trigger type, se metric: select de eventos (placed_order, started_checkout, etc.)

Criar src/components/flows/nodes/email-node.tsx:
- Visual: borda azul, ícone Mail, label do subject ou "Selecionar template", handles top+bottom
- Config: select template (dropdown dos templates da store), input subject, input preview text

Criar src/components/flows/nodes/whatsapp-node.tsx:
- Visual: borda verde (#25D366), ícone MessageCircle, handles top+bottom
- Config: select tipo (texto/template), textarea mensagem ou input template name

Criar src/components/flows/nodes/delay-node.tsx:
- Visual: borda cinza, ícone Clock, mostra "Esperar 2 horas", handles top+bottom
- Config: input número + select unidade (minutos/horas/dias/semanas)

Criar src/components/flows/nodes/condition-node.tsx:
- Visual: formato diamond/losango amarelo, ícone GitBranch, 1 handle top, 2 handles bottom (YES verde, NO vermelho)
- Config: select tipo condição, campo, operador, valor

## MÓDULO B: Páginas de Flows

Criar src/app/(dashboard)/flows/page.tsx:
- Tabela: nome, trigger type, status badge (Live=verde, Draft=cinza, Manual=amarelo), métricas (entered, emails_sent)
- Botão "Criar Automação" (laranja)
- Empty state: "Crie sua primeira automação para engajar clientes automaticamente"

Criar src/app/(dashboard)/flows/new/page.tsx:
- Form: nome do flow, select trigger type
- Seção "Ou comece com um template": 5 cards dos templates pré-built:
  Welcome Series, Carrinho Abandonado, Pós-Compra, Recuperação Boleto, Win-back
- Ao criar: INSERT flows com flow_definition vazio (só trigger node) → redirect /flows/[id]

Criar src/app/(dashboard)/flows/[id]/page.tsx:
- Layout fullscreen: sidebar esquerda (flow-sidebar) + canvas central (flow-canvas)
- Header fixo: botão Voltar, nome do flow (editável), toggle status (Draft/Live), botão Salvar
- Carregar flow do Supabase → deserializar flow_definition JSON → renderizar nodes+edges
- Salvar: serializar nodes+edges → UPDATE flow_definition

Criar src/components/flows/flow-templates.ts:
- 5 objetos com { name, description, category, trigger_type, trigger_config, nodes: [], edges: [] }
- Nodes já posicionados com coordenadas x,y corretas
- Welcome: trigger(list) → email1 → delay(2d) → email2 → delay(3d) → email3
- Abandoned Cart: trigger(started_checkout) → delay(1h) → condition(placed_order?) → NO:email → delay(24h) → whatsapp
- Post-Purchase: trigger(placed_order) → email_confirm → delay(7d) → condition(fulfilled?) → YES:email_review
- Boleto Recovery: trigger(placed_order) → condition(payment=pending) → YES:delay(24h) → email → delay(48h) → whatsapp
- Win-back: trigger(segment) → email1 → delay(7d) → email2_cupom → delay(14d) → whatsapp

## MÓDULO C: Flow Execution Engine

Criar src/lib/flows/engine.ts:
```typescript
export async function processEvent(storeId: string, eventType: string, contactId: string, eventData: Record<string,unknown>) {
  // 1. Buscar flows WHERE store_id AND status='live' AND trigger_type='metric' AND trigger_config->>'metric' = eventType
  // 2. Para cada flow: verificar se já existe flow_execution ativo para contact+flow
  // 3. Se não: INSERT flow_execution status='active', current_node_id = primeiro node após trigger
  // 4. Chamar processNode()
}
```

Criar src/lib/flows/actions.ts:
```typescript
export async function processNode(executionId: string, nodeId: string) {
  // Buscar flow_execution + flow.flow_definition
  // Encontrar node por id no flow_definition.nodes
  // Switch node.type:
  //   'send_email': buscar template, importar sendCampaignEmail de lib/email, enviar. Avançar para próximo node.
  //   'send_whatsapp': importar de lib/whatsapp, enviar. Avançar.
  //   'time_delay': calcular next_step_at = now + delay. UPDATE execution status='waiting', next_step_at. PARAR (cron continua depois).
  //   'conditional': chamar evaluateCondition. Se true → seguir edge YES. Se false → edge NO. Avançar.
  // Após processar: encontrar próximo node via edges. Se existe → processNode recursivo. Se não → status='completed'.
}
```

Criar src/lib/flows/conditions.ts:
- evaluateCondition(condition, contactId, storeId): boolean
- Tipos: has_placed_order (check events), property_equals (check contacts), total_spent_greater (check contacts.total_spent), in_list (check list_members), opened_email (check events type=email_opened)

Criar src/lib/flows/triggers.ts:
- matchesTrigger(flow, eventType, eventData): boolean — verifica se evento corresponde ao trigger do flow

Criar src/app/api/cron/process-flows/route.ts:
- GET handler (Vercel Cron)
- SELECT flow_executions WHERE status='waiting' AND next_step_at <= now() LIMIT 50
- Para cada: chamar processNode(execution.id, execution.current_node_id)
- Retornar { processed: count }

Criar ou atualizar vercel.json na raiz:
```json
{ "crons": [{ "path": "/api/cron/process-flows", "schedule": "* * * * *" }] }
```

## MÓDULO D: WhatsApp Integration

Criar src/lib/whatsapp/client.ts:
- sendText(phone, message, config: {phoneNumberId, accessToken}): POST https://graph.facebook.com/v21.0/{phoneNumberId}/messages com { messaging_product:'whatsapp', to:phone, type:'text', text:{body:message} }
- sendTemplate(phone, templateName, params, config): POST com type:'template', template:{name, language:{code:'pt_BR'}, components}

Criar src/app/(dashboard)/settings/whatsapp/page.tsx:
- Form: Phone Number ID, Business Account ID, Access Token (password input)
- Botão "Testar Conexão" → envia msg teste
- Status de conexão badge
- Seguir DESIGN-SYSTEM.md

Criar src/app/api/webhooks/whatsapp/route.ts:
- GET: verificação do webhook Meta (hub.verify_token === WA_WEBHOOK_VERIFY_TOKEN)
- POST: processar status updates (sent/delivered/read) → UPDATE whatsapp_sends

## FINALIZAR

`pnpm build` → corrigir tudo → `git pull origin main && git add -A && git commit -m "feat: flow builder engine whatsapp complete" && git push origin main`
Se push falhar: `git pull --rebase origin main` e push novamente. NÃO PARE.

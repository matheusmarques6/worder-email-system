# AUTORUN-CLAUDE-3.md — Flow Builder + Engine + WhatsApp + SMS

Leia CLAUDE.md e DESIGN-SYSTEM.md. git pull origin main. Execute TUDO sem parar.

SÓ edite: src/lib/flows/, src/lib/whatsapp/, src/lib/sms/, src/components/flows/, src/app/(dashboard)/flows/, src/app/(dashboard)/settings/whatsapp/, src/app/(dashboard)/settings/sms/, src/app/api/webhooks/whatsapp/, src/app/api/webhooks/sms/, src/app/api/cron/, src/types/flows.ts, vercel.json

---

## MÓDULO A: Types + Custom Nodes

src/types/flows.ts — Tipos completos:
FlowNodeType = 'trigger' | 'send_email' | 'send_whatsapp' | 'send_sms' | 'time_delay' | 'conditional' | 'trigger_split' | 'update_profile' | 'webhook'
FlowTriggerType = 'metric' | 'list' | 'segment' | 'date_property'
FlowStatus = 'draft' | 'live' | 'manual' | 'paused'
Interfaces para config de cada node: TriggerConfig, DelayConfig, ConditionConfig, EmailActionConfig, WhatsAppActionConfig, SMSActionConfig, WebhookActionConfig

src/components/flows/nodes/ — 7 custom nodes. CADA node deve ter:
- Visual: borda colorida, ícone lucide, label, handles (sourceHandle bottom, targetHandle top)
- Ao clicar: abre panel de configuração na sidebar direita
- Tamanho consistente: min-w-[200px], p-4

trigger-node.tsx: borda roxo-500, ícone Zap, dropdown tipo trigger. Se metric: dropdown eventos (Placed Order, Started Checkout, Viewed Product, Added to Cart, Order Fulfilled, Customer Created). Se list: dropdown listas. Se segment: dropdown segmentos. 1 handle bottom.

email-node.tsx: borda blue-500, ícone Mail, mostra subject ou "Selecionar template". Config: select template, input subject, input preview text. Handles top+bottom.

whatsapp-node.tsx: borda green-500 (#25D366), ícone MessageCircle. Config: tipo (texto/template), textarea mensagem ou input template name + params.

sms-node.tsx: borda cyan-500, ícone Smartphone. Config: textarea mensagem (160 chars counter). Handles top+bottom.

delay-node.tsx: borda gray-400, ícone Clock, mostra "Esperar X horas". Config: input número + select unidade (minutos/horas/dias/semanas).

condition-node.tsx: borda amber-500, ícone GitBranch. 1 handle top, 2 handles bottom (YES label verde, NO label vermelho). Config: tipo condição (has done event, property equals, total spent >, in list, opened email), campo, operador, valor.

webhook-node.tsx: borda indigo-500, ícone Globe. Config: URL input, method select (POST/GET), headers JSON editor.

## MÓDULO B: Canvas + Sidebar + Pages

src/components/flows/flow-canvas.tsx — 'use client':
ReactFlowProvider, ReactFlow com nodeTypes registrados, MiniMap (bottom-right, bg transparente), Controls (bottom-left), Background dots.
State: nodes e edges com useState ou Zustand.
onDrop: recebe tipo do node da sidebar, cria novo node nas coordenadas do drop.
onConnect: cria edge entre nodes. Validar que não conecta a si mesmo.
Estilo: bg-gray-50.

src/components/flows/flow-sidebar.tsx — Sidebar esquerda do canvas (w-64 border-r bg-white):
3 seções com Collapsible:
"Triggers": Métrica (Zap), Lista (List), Segmento (Target)
"Ações": Enviar Email (Mail), Enviar WhatsApp (MessageCircle), Enviar SMS (Smartphone), Esperar (Clock), Webhook (Globe)
"Lógica": Condição (GitBranch), Atualizar Perfil (UserCog)
Cada item: draggable, onDragStart com dataTransfer.setData('nodeType', type). Visual: border rounded-lg p-3 flex items-center gap-2 cursor-grab hover:bg-gray-50.

src/components/flows/flow-config-panel.tsx — Panel direita (w-80 border-l bg-white p-4):
Renderiza config do node selecionado. Switch por node.type. Inputs/selects específicos de cada tipo. Botão "Aplicar" que atualiza o node.data.

src/app/(dashboard)/flows/page.tsx — Tabela flows: nome, trigger type, status badge, entered, emails_sent. Botão "Criar Automação". Empty state.

src/app/(dashboard)/flows/new/page.tsx — Nome input + trigger type select. Seção "Templates Prontos": 8 cards com ícone, nome, descrição curta. Criar → INSERT flows → redirect /flows/[id].

src/app/(dashboard)/flows/[id]/page.tsx — FULLSCREEN layout:
Header fixo h-14: ArrowLeft voltar, nome (editável), badge status, toggle Live/Draft, botão Salvar (laranja)
Body flex: flow-sidebar (w-64) + flow-canvas (flex-1) + flow-config-panel (w-80, só aparece se node selecionado)
Carregar flow → deserializar flow_definition → setNodes/setEdges
Salvar: serializar → UPDATE flow_definition

## MÓDULO C: 8 Flow Templates Pré-construídos

src/components/flows/flow-templates.ts — 8 templates com nodes posicionados:

1. Welcome Series: trigger(list) →y100→ email "Boas-vindas" →y250→ delay(2d) →y400→ email "Conheça nossos produtos" →y550→ delay(3d) →y700→ email "Cupom 10% primeira compra"

2. Carrinho Abandonado: trigger(started_checkout) → delay(1h) → condition(placed_order?) → NO: email "Esqueceu algo?" → delay(24h) → email "Última chance!" → delay(48h) → whatsapp "Seu carrinho expira"

3. Pós-Compra: trigger(placed_order) → email "Pedido confirmado" → delay(3d) → condition(fulfilled?) → YES: delay(7d) → email "Como foi sua compra? Deixe um review"

4. Recuperação Boleto: trigger(placed_order) → condition(financial_status=pending) → YES: delay(24h) → email "Lembrete de pagamento" → delay(48h) → sms "Seu boleto vence amanhã" → delay(72h) → whatsapp "Última chance"

5. Win-back: trigger(segment "Em Risco") → email "Sentimos sua falta" → delay(7d) → email "Cupom exclusivo 15%" → delay(14d) → whatsapp "Última chance"

6. Review Request: trigger(order_fulfilled) → delay(7d) → email "Conte sua experiência" → delay(5d) → condition(left_review?) → NO: sms "Avalie e ganhe 5% off"

7. VIP Upgrade: trigger(segment "Compradores Recorrentes") → email "Bem-vindo ao Clube VIP" → delay(1d) → email "Seus benefícios exclusivos"

8. Browse Abandonment: trigger(viewed_product) → delay(30min) → condition(added_to_cart?) → NO: email "Vimos que você gostou de {{product_name}}"

Cada template: { name, description, category, icon, trigger_type, trigger_config, nodes: FlowNode[], edges: Edge[] } com coordenadas x,y corretas.

## MÓDULO D: Flow Execution Engine

src/lib/flows/engine.ts — processEvent(storeId, eventType, contactId, eventData):
1. SELECT flows WHERE store_id AND status='live' AND trigger_type='metric' AND trigger_config->>'metric' = eventType
2. Para cada flow: verificar se JÁ existe flow_execution ativo (evitar duplicata)
3. Se não: encontrar primeiro node após trigger via edges → INSERT flow_execution status='active', current_node_id
4. Chamar processNode(executionId, nodeId)

src/lib/flows/actions.ts — processNode(executionId, nodeId):
Buscar execution + flow.flow_definition. Encontrar node.
Switch node.type:
- 'send_email': importar sendCampaignEmail. Buscar template pelo template_id do node.data. Enviar. Avançar.
- 'send_whatsapp': importar de lib/whatsapp. Enviar. Avançar.
- 'send_sms': importar de lib/sms. Enviar. Avançar.
- 'time_delay': calcular next_step_at. UPDATE execution status='waiting', next_step_at. PARAR.
- 'conditional': evaluateCondition. Se true → edge YES. Se false → edge NO. Avançar.
- 'update_profile': UPDATE contacts com propriedade configurada. Avançar.
- 'webhook': fetch(url, { method, headers, body }). Avançar.
Avançar = encontrar próximo node via edges → se existe: processNode recursivo. Se não: status='completed'.

src/lib/flows/conditions.ts — evaluateCondition(condition, contactId, storeId): boolean
Tipos: has_placed_order, has_opened_email, property_equals, total_spent_gt, in_list, in_segment, financial_status_equals

src/lib/flows/triggers.ts — matchesTrigger + findFlowsForEvent

src/app/api/cron/process-flows/route.ts — GET (Vercel Cron 1min):
SELECT flow_executions WHERE status='waiting' AND next_step_at <= now() LIMIT 50. Para cada: processNode.

## MÓDULO E: WhatsApp + SMS

src/lib/whatsapp/client.ts:
- sendText(phone, message, config) → POST graph.facebook.com/v21.0/{phoneNumberId}/messages
- sendTemplate(phone, templateName, params, config) → POST com type template

src/lib/sms/client.ts:
- sendSMS(phone, message, config) → Para MVP, usar API simples (Twilio ou similar). Criar interface genérica: { send(phone, message): Promise<{id, status}> }
- Se não configurado, logar warning e não enviar

src/app/(dashboard)/settings/whatsapp/page.tsx — Form: Phone Number ID, Business Account ID, Access Token. Botão testar. Badge status.

src/app/(dashboard)/settings/sms/page.tsx — Form: provider (select Twilio/outro), API credentials. Botão testar.

src/app/api/webhooks/whatsapp/route.ts — GET verify + POST status updates
src/app/api/webhooks/sms/route.ts — POST delivery receipts

vercel.json atualizar crons se necessário.

## FINALIZAR

pnpm build → corrigir → git pull --rebase origin main && git add -A && git commit -m "feat: flows whatsapp sms engine" && git push origin main
NÃO PARE.

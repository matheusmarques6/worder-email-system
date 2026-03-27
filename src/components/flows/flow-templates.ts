import type { FlowTemplate, FlowNode, FlowEdge } from "@/types/flows";

export const flowTemplates: FlowTemplate[] = [
  // 1. Welcome Series
  {
    name: "Welcome Series",
    description: "Série de boas-vindas para novos inscritos",
    category: "onboarding",
    icon: "Mail",
    triggerType: "list",
    triggerConfig: { triggerType: "list" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Entrou na Lista", type: "trigger", config: { triggerType: "list" } },
      },
      {
        id: "node_2",
        type: "send_email",
        position: { x: 250, y: 150 },
        data: { label: "Boas-vindas", type: "send_email", config: { subject: "Bem-vindo! Conheça nossa loja", previewText: "Estamos felizes em ter você" } },
      },
      {
        id: "node_3",
        type: "time_delay",
        position: { x: 250, y: 300 },
        data: { label: "Esperar 2 dias", type: "time_delay", config: { value: 2, unit: "days" } },
      },
      {
        id: "node_4",
        type: "send_email",
        position: { x: 250, y: 450 },
        data: { label: "Conheça nossos produtos", type: "send_email", config: { subject: "Conheça nossos produtos mais vendidos", previewText: "" } },
      },
      {
        id: "node_5",
        type: "time_delay",
        position: { x: 250, y: 600 },
        data: { label: "Esperar 3 dias", type: "time_delay", config: { value: 3, unit: "days" } },
      },
      {
        id: "node_6",
        type: "send_email",
        position: { x: 250, y: 750 },
        data: { label: "Cupom 10% primeira compra", type: "send_email", config: { subject: "Presente especial: 10% off na primeira compra", previewText: "Use o cupom exclusivo" } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", animated: true },
      { id: "edge_4-5", source: "node_4", target: "node_5", animated: true },
      { id: "edge_5-6", source: "node_5", target: "node_6", animated: true },
    ] as FlowEdge[],
  },

  // 2. Carrinho Abandonado
  {
    name: "Carrinho Abandonado",
    description: "Recupere vendas de checkouts incompletos",
    category: "recovery",
    icon: "ShoppingCart",
    triggerType: "metric",
    triggerConfig: { triggerType: "metric", metric: "started_checkout" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Checkout Iniciado", type: "trigger", config: { triggerType: "metric", metric: "started_checkout" } },
      },
      {
        id: "node_2",
        type: "time_delay",
        position: { x: 250, y: 150 },
        data: { label: "Esperar 1 hora", type: "time_delay", config: { value: 1, unit: "hours" } },
      },
      {
        id: "node_3",
        type: "conditional",
        position: { x: 250, y: 300 },
        data: { label: "Fez pedido?", type: "conditional", config: { type: "has_placed_order" } },
      },
      {
        id: "node_4",
        type: "send_email",
        position: { x: 400, y: 450 },
        data: { label: "Esqueceu algo?", type: "send_email", config: { subject: "Você esqueceu algo no carrinho!", previewText: "" } },
      },
      {
        id: "node_5",
        type: "time_delay",
        position: { x: 400, y: 600 },
        data: { label: "Esperar 24 horas", type: "time_delay", config: { value: 24, unit: "hours" } },
      },
      {
        id: "node_6",
        type: "send_email",
        position: { x: 400, y: 750 },
        data: { label: "Última chance!", type: "send_email", config: { subject: "Última chance! Seu carrinho vai expirar", previewText: "" } },
      },
      {
        id: "node_7",
        type: "time_delay",
        position: { x: 400, y: 900 },
        data: { label: "Esperar 48 horas", type: "time_delay", config: { value: 48, unit: "hours" } },
      },
      {
        id: "node_8",
        type: "send_whatsapp",
        position: { x: 400, y: 1050 },
        data: { label: "Seu carrinho expira", type: "send_whatsapp", config: { type: "text", message: "Olá {{first_name}}, seu carrinho está prestes a expirar. Finalize sua compra agora!" } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", sourceHandle: "no", animated: true },
      { id: "edge_4-5", source: "node_4", target: "node_5", animated: true },
      { id: "edge_5-6", source: "node_5", target: "node_6", animated: true },
      { id: "edge_6-7", source: "node_6", target: "node_7", animated: true },
      { id: "edge_7-8", source: "node_7", target: "node_8", animated: true },
    ] as FlowEdge[],
  },

  // 3. Pós-Compra
  {
    name: "Pós-Compra",
    description: "Acompanhamento após pedido realizado",
    category: "post-purchase",
    icon: "Package",
    triggerType: "metric",
    triggerConfig: { triggerType: "metric", metric: "placed_order" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Pedido Realizado", type: "trigger", config: { triggerType: "metric", metric: "placed_order" } },
      },
      {
        id: "node_2",
        type: "send_email",
        position: { x: 250, y: 150 },
        data: { label: "Pedido confirmado", type: "send_email", config: { subject: "Seu pedido #{{order_number}} foi confirmado!", previewText: "" } },
      },
      {
        id: "node_3",
        type: "time_delay",
        position: { x: 250, y: 300 },
        data: { label: "Esperar 3 dias", type: "time_delay", config: { value: 3, unit: "days" } },
      },
      {
        id: "node_4",
        type: "conditional",
        position: { x: 250, y: 450 },
        data: { label: "Pedido enviado?", type: "conditional", config: { type: "has_placed_order" } },
      },
      {
        id: "node_5",
        type: "time_delay",
        position: { x: 250, y: 600 },
        data: { label: "Esperar 7 dias", type: "time_delay", config: { value: 7, unit: "days" } },
      },
      {
        id: "node_6",
        type: "send_email",
        position: { x: 250, y: 750 },
        data: { label: "Como foi sua compra?", type: "send_email", config: { subject: "Como foi sua experiência com a compra?", previewText: "Deixe um review" } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", animated: true },
      { id: "edge_4-5", source: "node_4", target: "node_5", sourceHandle: "yes", animated: true },
      { id: "edge_5-6", source: "node_5", target: "node_6", animated: true },
    ] as FlowEdge[],
  },

  // 4. Recuperação Boleto
  {
    name: "Recuperação Boleto",
    description: "Lembrete para pagamentos pendentes",
    category: "recovery",
    icon: "Receipt",
    triggerType: "metric",
    triggerConfig: { triggerType: "metric", metric: "placed_order" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Pedido Realizado", type: "trigger", config: { triggerType: "metric", metric: "placed_order" } },
      },
      {
        id: "node_2",
        type: "conditional",
        position: { x: 250, y: 150 },
        data: { label: "Pagamento pendente?", type: "conditional", config: { type: "financial_status_equals", value: "pending" } },
      },
      {
        id: "node_3",
        type: "time_delay",
        position: { x: 250, y: 300 },
        data: { label: "Esperar 24 horas", type: "time_delay", config: { value: 24, unit: "hours" } },
      },
      {
        id: "node_4",
        type: "send_email",
        position: { x: 250, y: 450 },
        data: { label: "Lembrete de pagamento", type: "send_email", config: { subject: "Lembrete: seu pagamento está pendente", previewText: "" } },
      },
      {
        id: "node_5",
        type: "time_delay",
        position: { x: 250, y: 600 },
        data: { label: "Esperar 48 horas", type: "time_delay", config: { value: 48, unit: "hours" } },
      },
      {
        id: "node_6",
        type: "send_sms",
        position: { x: 250, y: 750 },
        data: { label: "Seu boleto vence amanhã", type: "send_sms", config: { message: "Olá {{first_name}}, seu boleto vence amanhã. Pague agora e garanta seu pedido!" } },
      },
      {
        id: "node_7",
        type: "time_delay",
        position: { x: 250, y: 900 },
        data: { label: "Esperar 72 horas", type: "time_delay", config: { value: 72, unit: "hours" } },
      },
      {
        id: "node_8",
        type: "send_whatsapp",
        position: { x: 250, y: 1050 },
        data: { label: "Última chance", type: "send_whatsapp", config: { type: "text", message: "Olá {{first_name}}, última chance para pagar seu boleto! Seu pedido será cancelado em breve." } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", sourceHandle: "yes", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", animated: true },
      { id: "edge_4-5", source: "node_4", target: "node_5", animated: true },
      { id: "edge_5-6", source: "node_5", target: "node_6", animated: true },
      { id: "edge_6-7", source: "node_6", target: "node_7", animated: true },
      { id: "edge_7-8", source: "node_7", target: "node_8", animated: true },
    ] as FlowEdge[],
  },

  // 5. Win-back
  {
    name: "Win-back",
    description: "Reengaje clientes inativos",
    category: "retention",
    icon: "UserMinus",
    triggerType: "segment",
    triggerConfig: { triggerType: "segment" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Entrou no Segmento", type: "trigger", config: { triggerType: "segment" } },
      },
      {
        id: "node_2",
        type: "send_email",
        position: { x: 250, y: 150 },
        data: { label: "Sentimos sua falta", type: "send_email", config: { subject: "Sentimos sua falta, {{first_name}}!", previewText: "" } },
      },
      {
        id: "node_3",
        type: "time_delay",
        position: { x: 250, y: 300 },
        data: { label: "Esperar 7 dias", type: "time_delay", config: { value: 7, unit: "days" } },
      },
      {
        id: "node_4",
        type: "send_email",
        position: { x: 250, y: 450 },
        data: { label: "Cupom exclusivo 15%", type: "send_email", config: { subject: "Cupom exclusivo de 15% só para você!", previewText: "Válido por 48 horas" } },
      },
      {
        id: "node_5",
        type: "time_delay",
        position: { x: 250, y: 600 },
        data: { label: "Esperar 14 dias", type: "time_delay", config: { value: 14, unit: "days" } },
      },
      {
        id: "node_6",
        type: "send_whatsapp",
        position: { x: 250, y: 750 },
        data: { label: "Última chance", type: "send_whatsapp", config: { type: "text", message: "Olá {{first_name}}, última chance de usar seu cupom de 15%! Aproveite antes que expire." } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", animated: true },
      { id: "edge_4-5", source: "node_4", target: "node_5", animated: true },
      { id: "edge_5-6", source: "node_5", target: "node_6", animated: true },
    ] as FlowEdge[],
  },

  // 6. Review Request
  {
    name: "Review Request",
    description: "Solicite avaliações após entrega",
    category: "engagement",
    icon: "Star",
    triggerType: "metric",
    triggerConfig: { triggerType: "metric", metric: "order_fulfilled" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Pedido Entregue", type: "trigger", config: { triggerType: "metric", metric: "order_fulfilled" } },
      },
      {
        id: "node_2",
        type: "time_delay",
        position: { x: 250, y: 150 },
        data: { label: "Esperar 7 dias", type: "time_delay", config: { value: 7, unit: "days" } },
      },
      {
        id: "node_3",
        type: "send_email",
        position: { x: 250, y: 300 },
        data: { label: "Conte sua experiência", type: "send_email", config: { subject: "Como foi sua experiência? Conte para nós!", previewText: "Sua opinião é muito importante" } },
      },
      {
        id: "node_4",
        type: "time_delay",
        position: { x: 250, y: 450 },
        data: { label: "Esperar 5 dias", type: "time_delay", config: { value: 5, unit: "days" } },
      },
      {
        id: "node_5",
        type: "conditional",
        position: { x: 250, y: 600 },
        data: { label: "Deixou review?", type: "conditional", config: { type: "left_review" } },
      },
      {
        id: "node_6",
        type: "send_sms",
        position: { x: 400, y: 750 },
        data: { label: "Avalie e ganhe 5% off", type: "send_sms", config: { message: "Olá {{first_name}}, avalie sua compra e ganhe 5% de desconto na próxima!" } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", animated: true },
      { id: "edge_4-5", source: "node_4", target: "node_5", animated: true },
      { id: "edge_5-6", source: "node_5", target: "node_6", sourceHandle: "no", animated: true },
    ] as FlowEdge[],
  },

  // 7. VIP Upgrade
  {
    name: "VIP Upgrade",
    description: "Boas-vindas ao programa de fidelidade",
    category: "loyalty",
    icon: "Crown",
    triggerType: "segment",
    triggerConfig: { triggerType: "segment" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Entrou no Segmento VIP", type: "trigger", config: { triggerType: "segment" } },
      },
      {
        id: "node_2",
        type: "send_email",
        position: { x: 250, y: 150 },
        data: { label: "Bem-vindo ao Clube VIP", type: "send_email", config: { subject: "Parabéns! Você agora é VIP", previewText: "Benefícios exclusivos" } },
      },
      {
        id: "node_3",
        type: "time_delay",
        position: { x: 250, y: 300 },
        data: { label: "Esperar 1 dia", type: "time_delay", config: { value: 1, unit: "days" } },
      },
      {
        id: "node_4",
        type: "send_email",
        position: { x: 250, y: 450 },
        data: { label: "Seus benefícios exclusivos", type: "send_email", config: { subject: "Conheça seus benefícios exclusivos VIP", previewText: "" } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", animated: true },
    ] as FlowEdge[],
  },

  // 8. Browse Abandonment
  {
    name: "Browse Abandonment",
    description: "Recupere visitantes que viram produtos",
    category: "recovery",
    icon: "Eye",
    triggerType: "metric",
    triggerConfig: { triggerType: "metric", metric: "viewed_product" },
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        position: { x: 250, y: 0 },
        data: { label: "Visualizou Produto", type: "trigger", config: { triggerType: "metric", metric: "viewed_product" } },
      },
      {
        id: "node_2",
        type: "time_delay",
        position: { x: 250, y: 150 },
        data: { label: "Esperar 30 minutos", type: "time_delay", config: { value: 30, unit: "minutes" } },
      },
      {
        id: "node_3",
        type: "conditional",
        position: { x: 250, y: 300 },
        data: { label: "Adicionou ao carrinho?", type: "conditional", config: { type: "added_to_cart" } },
      },
      {
        id: "node_4",
        type: "send_email",
        position: { x: 400, y: 450 },
        data: { label: "Vimos que você gostou", type: "send_email", config: { subject: "Vimos que você gostou de {{product_name}}", previewText: "Volte e aproveite!" } },
      },
    ] as FlowNode[],
    edges: [
      { id: "edge_1-2", source: "node_1", target: "node_2", animated: true },
      { id: "edge_2-3", source: "node_2", target: "node_3", animated: true },
      { id: "edge_3-4", source: "node_3", target: "node_4", sourceHandle: "no", animated: true },
    ] as FlowEdge[],
  },
];

import type { FlowTemplate } from "@/types/flows"

export const prebuiltFlows: FlowTemplate[] = [
  // 1. Welcome Series
  {
    name: "Série de Boas-vindas",
    description:
      "Receba novos clientes com um e-mail de boas-vindas e envie um cupom 2 dias depois.",
    category: "onboarding",
    icon: "👋",
    triggerType: "metric",
    triggerConfig: {
      triggerType: "metric",
      metric: "customer_created",
    },
    nodes: [
      {
        id: "trigger-1",
        type: "default",
        position: { x: 250, y: 0 },
        data: {
          label: "Cliente criado",
          type: "trigger",
          config: { triggerType: "metric", metric: "customer_created" },
        },
      },
      {
        id: "email-welcome",
        type: "default",
        position: { x: 250, y: 120 },
        data: {
          label: "E-mail de boas-vindas",
          type: "send_email",
          config: {
            subject: "Bem-vindo(a) à nossa loja!",
          } satisfies { subject: string },
        },
      },
      {
        id: "delay-2d",
        type: "default",
        position: { x: 250, y: 240 },
        data: {
          label: "Aguardar 2 dias",
          type: "time_delay",
          config: { value: 2, unit: "days" },
        },
      },
      {
        id: "email-coupon",
        type: "default",
        position: { x: 250, y: 360 },
        data: {
          label: "E-mail com cupom",
          type: "send_email",
          config: {
            subject: "Um presente especial para você 🎁",
          } satisfies { subject: string },
        },
      },
    ],
    edges: [
      { id: "e-t-w", source: "trigger-1", target: "email-welcome" },
      { id: "e-w-d", source: "email-welcome", target: "delay-2d" },
      { id: "e-d-c", source: "delay-2d", target: "email-coupon" },
    ],
  },

  // 2. Abandoned Cart
  {
    name: "Carrinho Abandonado",
    description:
      "Recupere vendas enviando lembretes para quem iniciou o checkout mas não finalizou.",
    category: "revenue",
    icon: "🛒",
    triggerType: "metric",
    triggerConfig: {
      triggerType: "metric",
      metric: "started_checkout",
    },
    nodes: [
      {
        id: "trigger-1",
        type: "default",
        position: { x: 250, y: 0 },
        data: {
          label: "Checkout iniciado",
          type: "trigger",
          config: { triggerType: "metric", metric: "started_checkout" },
        },
      },
      {
        id: "delay-1h",
        type: "default",
        position: { x: 250, y: 120 },
        data: {
          label: "Aguardar 1 hora",
          type: "time_delay",
          config: { value: 1, unit: "hours" },
        },
      },
      {
        id: "email-abandoned",
        type: "default",
        position: { x: 250, y: 240 },
        data: {
          label: "E-mail carrinho abandonado",
          type: "send_email",
          config: {
            subject: "Você esqueceu algo no carrinho!",
          } satisfies { subject: string },
        },
      },
      {
        id: "delay-24h",
        type: "default",
        position: { x: 250, y: 360 },
        data: {
          label: "Aguardar 24 horas",
          type: "time_delay",
          config: { value: 24, unit: "hours" },
        },
      },
      {
        id: "email-urgency",
        type: "default",
        position: { x: 250, y: 480 },
        data: {
          label: "E-mail de urgência",
          type: "send_email",
          config: {
            subject: "Últimas unidades! Finalize sua compra",
          } satisfies { subject: string },
        },
      },
    ],
    edges: [
      { id: "e-t-d1", source: "trigger-1", target: "delay-1h" },
      { id: "e-d1-ea", source: "delay-1h", target: "email-abandoned" },
      { id: "e-ea-d2", source: "email-abandoned", target: "delay-24h" },
      { id: "e-d2-eu", source: "delay-24h", target: "email-urgency" },
    ],
  },

  // 3. Post-Purchase
  {
    name: "Pós-compra",
    description:
      "Engaje clientes após a compra com e-mail de agradecimento e sugestões de produtos.",
    category: "engagement",
    icon: "📦",
    triggerType: "metric",
    triggerConfig: {
      triggerType: "metric",
      metric: "placed_order",
    },
    nodes: [
      {
        id: "trigger-1",
        type: "default",
        position: { x: 250, y: 0 },
        data: {
          label: "Pedido realizado",
          type: "trigger",
          config: { triggerType: "metric", metric: "placed_order" },
        },
      },
      {
        id: "delay-3d",
        type: "default",
        position: { x: 250, y: 120 },
        data: {
          label: "Aguardar 3 dias",
          type: "time_delay",
          config: { value: 3, unit: "days" },
        },
      },
      {
        id: "email-postpurchase",
        type: "default",
        position: { x: 250, y: 240 },
        data: {
          label: "E-mail pós-compra",
          type: "send_email",
          config: {
            subject: "Como foi sua experiência?",
          } satisfies { subject: string },
        },
      },
      {
        id: "delay-7d",
        type: "default",
        position: { x: 250, y: 360 },
        data: {
          label: "Aguardar 7 dias",
          type: "time_delay",
          config: { value: 7, unit: "days" },
        },
      },
      {
        id: "email-crosssell",
        type: "default",
        position: { x: 250, y: 480 },
        data: {
          label: "E-mail cross-sell",
          type: "send_email",
          config: {
            subject: "Produtos que combinam com sua compra",
          } satisfies { subject: string },
        },
      },
    ],
    edges: [
      { id: "e-t-d1", source: "trigger-1", target: "delay-3d" },
      { id: "e-d1-ep", source: "delay-3d", target: "email-postpurchase" },
      { id: "e-ep-d2", source: "email-postpurchase", target: "delay-7d" },
      { id: "e-d2-ec", source: "delay-7d", target: "email-crosssell" },
    ],
  },

  // 4. Winback
  {
    name: "Reativação de Clientes",
    description:
      "Reconquiste clientes inativos após 60 dias sem comprar.",
    category: "winback",
    icon: "🔄",
    triggerType: "metric",
    triggerConfig: {
      triggerType: "metric",
      metric: "placed_order",
    },
    nodes: [
      {
        id: "trigger-1",
        type: "default",
        position: { x: 250, y: 0 },
        data: {
          label: "Pedido realizado",
          type: "trigger",
          config: { triggerType: "metric", metric: "placed_order" },
        },
      },
      {
        id: "delay-60d",
        type: "default",
        position: { x: 250, y: 120 },
        data: {
          label: "Aguardar 60 dias",
          type: "time_delay",
          config: { value: 60, unit: "days" },
        },
      },
      {
        id: "cond-has-order",
        type: "default",
        position: { x: 250, y: 240 },
        data: {
          label: "Comprou nos últimos 60 dias?",
          type: "conditional",
          config: { type: "has_placed_order" },
        },
      },
      {
        id: "email-winback",
        type: "default",
        position: { x: 400, y: 360 },
        data: {
          label: "E-mail de reativação",
          type: "send_email",
          config: {
            subject: "Sentimos sua falta! Volte e ganhe desconto",
          } satisfies { subject: string },
        },
      },
    ],
    edges: [
      { id: "e-t-d", source: "trigger-1", target: "delay-60d" },
      { id: "e-d-c", source: "delay-60d", target: "cond-has-order" },
      {
        id: "e-c-no",
        source: "cond-has-order",
        target: "email-winback",
        sourceHandle: "no",
      },
    ],
  },

  // 5. Browse Abandonment
  {
    name: "Abandono de Navegação",
    description:
      "Envie um lembrete para quem visualizou um produto mas não comprou.",
    category: "revenue",
    icon: "👀",
    triggerType: "metric",
    triggerConfig: {
      triggerType: "metric",
      metric: "viewed_product",
    },
    nodes: [
      {
        id: "trigger-1",
        type: "default",
        position: { x: 250, y: 0 },
        data: {
          label: "Produto visualizado",
          type: "trigger",
          config: { triggerType: "metric", metric: "viewed_product" },
        },
      },
      {
        id: "delay-2h",
        type: "default",
        position: { x: 250, y: 120 },
        data: {
          label: "Aguardar 2 horas",
          type: "time_delay",
          config: { value: 2, unit: "hours" },
        },
      },
      {
        id: "email-viewed",
        type: "default",
        position: { x: 250, y: 240 },
        data: {
          label: "E-mail produto visualizado",
          type: "send_email",
          config: {
            subject: "Ainda interessado? O produto está esperando por você",
          } satisfies { subject: string },
        },
      },
    ],
    edges: [
      { id: "e-t-d", source: "trigger-1", target: "delay-2h" },
      { id: "e-d-e", source: "delay-2h", target: "email-viewed" },
    ],
  },
]

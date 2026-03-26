import type { FlowNode, FlowEdge } from "@/types/flows";

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export const flowTemplates: FlowTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Series",
    description: "Série de boas-vindas para novos inscritos",
    triggerType: "list",
    nodes: [
      { id: "t1", type: "trigger", position: { x: 250, y: 0 }, data: { type: "trigger", label: "Trigger", config: { triggerType: "Lista" } } },
      { id: "e1", type: "send_email", position: { x: 250, y: 120 }, data: { type: "send_email", label: "Email 1", config: { templateName: "Boas-vindas" } } },
      { id: "d1", type: "time_delay", position: { x: 250, y: 240 }, data: { type: "time_delay", label: "Esperar", config: { duration: 2, unit: "dias" } } },
      { id: "e2", type: "send_email", position: { x: 250, y: 360 }, data: { type: "send_email", label: "Email 2", config: { templateName: "Conheça nossa loja" } } },
      { id: "d2", type: "time_delay", position: { x: 250, y: 480 }, data: { type: "time_delay", label: "Esperar", config: { duration: 3, unit: "dias" } } },
      { id: "e3", type: "send_email", position: { x: 250, y: 600 }, data: { type: "send_email", label: "Email 3", config: { templateName: "Cupom de desconto" } } },
    ],
    edges: [
      { id: "e-t1-e1", source: "t1", target: "e1" },
      { id: "e-e1-d1", source: "e1", target: "d1" },
      { id: "e-d1-e2", source: "d1", target: "e2" },
      { id: "e-e2-d2", source: "e2", target: "d2" },
      { id: "e-d2-e3", source: "d2", target: "e3" },
    ],
  },
  {
    id: "abandoned-cart",
    name: "Carrinho Abandonado",
    description: "Recupere vendas de checkouts abandonados",
    triggerType: "metric",
    nodes: [
      { id: "t1", type: "trigger", position: { x: 250, y: 0 }, data: { type: "trigger", label: "Trigger", config: { triggerType: "started_checkout" } } },
      { id: "d1", type: "time_delay", position: { x: 250, y: 120 }, data: { type: "time_delay", label: "Esperar", config: { duration: 1, unit: "hours" } } },
      { id: "c1", type: "conditional", position: { x: 250, y: 240 }, data: { type: "conditional", label: "Condição", config: { conditionLabel: "Comprou?" } } },
      { id: "e1", type: "send_email", position: { x: 100, y: 380 }, data: { type: "send_email", label: "Email", config: { templateName: "Carrinho abandonado" } } },
      { id: "d2", type: "time_delay", position: { x: 100, y: 500 }, data: { type: "time_delay", label: "Esperar", config: { duration: 24, unit: "hours" } } },
      { id: "w1", type: "send_whatsapp", position: { x: 100, y: 620 }, data: { type: "send_whatsapp", label: "WhatsApp", config: { message: "Olá! Notamos que você deixou itens no carrinho." } } },
    ],
    edges: [
      { id: "e-t1-d1", source: "t1", target: "d1" },
      { id: "e-d1-c1", source: "d1", target: "c1" },
      { id: "e-c1-e1", source: "c1", target: "e1", sourceHandle: "no" },
      { id: "e-e1-d2", source: "e1", target: "d2" },
      { id: "e-d2-w1", source: "d2", target: "w1" },
    ],
  },
  {
    id: "post-purchase",
    name: "Pós-Compra",
    description: "Engaje clientes após a compra",
    triggerType: "metric",
    nodes: [
      { id: "t1", type: "trigger", position: { x: 250, y: 0 }, data: { type: "trigger", label: "Trigger", config: { triggerType: "placed_order" } } },
      { id: "e1", type: "send_email", position: { x: 250, y: 120 }, data: { type: "send_email", label: "Email", config: { templateName: "Confirmação de pedido" } } },
      { id: "d1", type: "time_delay", position: { x: 250, y: 240 }, data: { type: "time_delay", label: "Esperar", config: { duration: 7, unit: "dias" } } },
      { id: "c1", type: "conditional", position: { x: 250, y: 360 }, data: { type: "conditional", label: "Condição", config: { conditionLabel: "Pedido enviado?" } } },
      { id: "e2", type: "send_email", position: { x: 400, y: 500 }, data: { type: "send_email", label: "Email", config: { templateName: "Avalie sua compra" } } },
    ],
    edges: [
      { id: "e-t1-e1", source: "t1", target: "e1" },
      { id: "e-e1-d1", source: "e1", target: "d1" },
      { id: "e-d1-c1", source: "d1", target: "c1" },
      { id: "e-c1-e2", source: "c1", target: "e2", sourceHandle: "yes" },
    ],
  },
  {
    id: "boleto",
    name: "Recuperação Boleto",
    description: "Lembre clientes sobre boletos pendentes",
    triggerType: "metric",
    nodes: [
      { id: "t1", type: "trigger", position: { x: 250, y: 0 }, data: { type: "trigger", label: "Trigger", config: { triggerType: "placed_order" } } },
      { id: "c1", type: "conditional", position: { x: 250, y: 120 }, data: { type: "conditional", label: "Condição", config: { conditionLabel: "Pagamento pendente?" } } },
      { id: "d1", type: "time_delay", position: { x: 250, y: 260 }, data: { type: "time_delay", label: "Esperar", config: { duration: 24, unit: "hours" } } },
      { id: "e1", type: "send_email", position: { x: 250, y: 380 }, data: { type: "send_email", label: "Email", config: { templateName: "Lembrete de boleto" } } },
      { id: "d2", type: "time_delay", position: { x: 250, y: 500 }, data: { type: "time_delay", label: "Esperar", config: { duration: 48, unit: "hours" } } },
      { id: "w1", type: "send_whatsapp", position: { x: 250, y: 620 }, data: { type: "send_whatsapp", label: "WhatsApp", config: { message: "Seu boleto está próximo do vencimento!" } } },
    ],
    edges: [
      { id: "e-t1-c1", source: "t1", target: "c1" },
      { id: "e-c1-d1", source: "c1", target: "d1", sourceHandle: "yes" },
      { id: "e-d1-e1", source: "d1", target: "e1" },
      { id: "e-e1-d2", source: "e1", target: "d2" },
      { id: "e-d2-w1", source: "d2", target: "w1" },
    ],
  },
  {
    id: "winback",
    name: "Win-back",
    description: "Reengaje clientes inativos",
    triggerType: "segment",
    nodes: [
      { id: "t1", type: "trigger", position: { x: 250, y: 0 }, data: { type: "trigger", label: "Trigger", config: { triggerType: "Segmento Churning" } } },
      { id: "e1", type: "send_email", position: { x: 250, y: 120 }, data: { type: "send_email", label: "Email", config: { templateName: "Sentimos sua falta" } } },
      { id: "d1", type: "time_delay", position: { x: 250, y: 240 }, data: { type: "time_delay", label: "Esperar", config: { duration: 7, unit: "dias" } } },
      { id: "e2", type: "send_email", position: { x: 250, y: 360 }, data: { type: "send_email", label: "Email", config: { templateName: "Cupom especial" } } },
      { id: "d2", type: "time_delay", position: { x: 250, y: 480 }, data: { type: "time_delay", label: "Esperar", config: { duration: 14, unit: "dias" } } },
      { id: "w1", type: "send_whatsapp", position: { x: 250, y: 600 }, data: { type: "send_whatsapp", label: "WhatsApp", config: { message: "Temos uma oferta especial para você!" } } },
    ],
    edges: [
      { id: "e-t1-e1", source: "t1", target: "e1" },
      { id: "e-e1-d1", source: "e1", target: "d1" },
      { id: "e-d1-e2", source: "d1", target: "e2" },
      { id: "e-e2-d2", source: "e2", target: "d2" },
      { id: "e-d2-w1", source: "d2", target: "w1" },
    ],
  },
];

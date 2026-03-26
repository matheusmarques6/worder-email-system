import type { RuleGroupType } from "react-querybuilder"

export interface PrebuiltSegment {
  id: string
  name: string
  description: string
  icon: string
  rules: RuleGroupType
}

export const prebuiltSegments: PrebuiltSegment[] = [
  {
    id: "engaged-subscribers",
    name: "Inscritos Engajados",
    description: "Abriram email nos últimos 30 dias e estão inscritos",
    icon: "Sparkles",
    rules: {
      combinator: "and",
      rules: [
        { field: "consent_email", operator: "=", value: "subscribed" },
        { field: "event:email_opened", operator: ">=", value: "1" },
      ],
    },
  },
  {
    id: "unengaged-subscribers",
    name: "Não Engajados",
    description: "Não abriram email nos últimos 90 dias mas estão inscritos",
    icon: "UserX",
    rules: {
      combinator: "and",
      rules: [
        { field: "consent_email", operator: "=", value: "subscribed" },
        { field: "event:email_opened", operator: "=", value: "0" },
      ],
    },
  },
  {
    id: "repeat-buyers",
    name: "Compradores Recorrentes",
    description: "Clientes com 2 ou mais pedidos realizados",
    icon: "Repeat",
    rules: {
      combinator: "and",
      rules: [
        { field: "total_orders", operator: ">=", value: "2" },
      ],
    },
  },
  {
    id: "new-subscribers",
    name: "Novos Inscritos",
    description: "Cadastrados nos últimos 7 dias",
    icon: "UserPlus",
    rules: {
      combinator: "and",
      rules: [
        { field: "created_at", operator: "in_last_days", value: "7" },
      ],
    },
  },
  {
    id: "never-purchased",
    name: "Nunca Comprou",
    description: "Inscritos que nunca realizaram um pedido",
    icon: "ShoppingBag",
    rules: {
      combinator: "and",
      rules: [
        { field: "total_orders", operator: "=", value: "0" },
        { field: "consent_email", operator: "=", value: "subscribed" },
      ],
    },
  },
  {
    id: "churn-risk",
    name: "Em Risco de Churn",
    description: "Último pedido há mais de 60 dias com pelo menos 1 pedido",
    icon: "AlertTriangle",
    rules: {
      combinator: "and",
      rules: [
        { field: "last_order_at", operator: "in_last_days", value: "60" },
        { field: "total_orders", operator: ">=", value: "1" },
      ],
    },
  },
  {
    id: "vip-spenders",
    name: "VIP (Top Spenders)",
    description: "Clientes que gastaram mais de R$ 500",
    icon: "Crown",
    rules: {
      combinator: "and",
      rules: [
        { field: "total_spent", operator: ">", value: "500" },
      ],
    },
  },
  {
    id: "recent-buyers",
    name: "Compradores Recentes",
    description: "Realizaram pedido nos últimos 30 dias",
    icon: "ShoppingCart",
    rules: {
      combinator: "and",
      rules: [
        { field: "last_order_at", operator: "in_last_days", value: "30" },
      ],
    },
  },
  {
    id: "cart-abandoners",
    name: "Abandonaram Carrinho",
    description: "Iniciaram checkout nos últimos 7 dias sem finalizar pedido",
    icon: "ShoppingBag",
    rules: {
      combinator: "and",
      rules: [
        { field: "event:started_checkout", operator: ">=", value: "1" },
        { field: "event:placed_order", operator: "=", value: "0" },
      ],
    },
  },
  {
    id: "email-fans",
    name: "Fãs de Email",
    description: "Abriram 5 ou mais emails nos últimos 30 dias",
    icon: "Heart",
    rules: {
      combinator: "and",
      rules: [
        { field: "event:email_opened", operator: ">=", value: "5" },
      ],
    },
  },
]

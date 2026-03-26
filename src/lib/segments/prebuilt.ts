export const prebuiltSegments = [
  {
    name: "Engajados (30d)",
    conditions: {
      combinator: "and" as const,
      rules: [
        { field: "event:email_opened", operator: "in_last_days", value: "30" },
      ],
    },
  },
  {
    name: "Não Engajados (90d+)",
    conditions: {
      combinator: "and" as const,
      rules: [
        { field: "event:email_opened", operator: "zero", value: "" },
        { field: "created_at", operator: "less_than", value: "90" },
      ],
    },
  },
  {
    name: "Compradores Recorrentes",
    conditions: {
      combinator: "and" as const,
      rules: [
        { field: "total_orders", operator: "greater_than", value: "1" },
      ],
    },
  },
  {
    name: "Novos (7d)",
    conditions: {
      combinator: "and" as const,
      rules: [
        { field: "created_at", operator: "in_last_days", value: "7" },
      ],
    },
  },
  {
    name: "Nunca Comprou",
    conditions: {
      combinator: "and" as const,
      rules: [
        { field: "total_orders", operator: "equals", value: "0" },
      ],
    },
  },
  {
    name: "Em Risco de Churn",
    conditions: {
      combinator: "and" as const,
      rules: [
        { field: "total_orders", operator: "greater_than", value: "0" },
        { field: "last_order_at", operator: "less_than", value: "60" },
      ],
    },
  },
];

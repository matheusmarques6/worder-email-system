import type { RuleGroupType } from "react-querybuilder"

export const segmentFields = [
  { name: "email", label: "Email", inputType: "text" },
  { name: "first_name", label: "Nome", inputType: "text" },
  { name: "last_name", label: "Sobrenome", inputType: "text" },
  { name: "phone", label: "Telefone", inputType: "text" },
  { name: "subscribed", label: "Inscrito", valueEditorType: "select" as const, values: [{ name: "true", label: "Sim" }, { name: "false", label: "Não" }] },
  { name: "total_orders", label: "Total de Pedidos", inputType: "number" },
  { name: "total_spent", label: "Total Gasto", inputType: "number" },
  { name: "created_at", label: "Data de Cadastro", inputType: "date" },
  { name: "city", label: "Cidade", inputType: "text" },
  { name: "state", label: "Estado", inputType: "text" },
]

export const segmentOperators = [
  { name: "equals", label: "é igual a" },
  { name: "not_equals", label: "não é igual a" },
  { name: "contains", label: "contém" },
  { name: "greater_than", label: "maior que" },
  { name: "less_than", label: "menor que" },
  { name: "is_set", label: "está preenchido" },
  { name: "is_not_set", label: "não está preenchido" },
]

export function convertToSegmentRules(query: RuleGroupType): {
  combinator: "and" | "or"
  rules: Array<{ field: string; operator: string; value: string | number | boolean }>
} {
  return {
    combinator: query.combinator as "and" | "or",
    rules: query.rules
      .filter((r) => "field" in r)
      .map((r) => {
        const rule = r as { field: string; operator: string; value: string }
        return {
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
        }
      }),
  }
}

export const defaultSegmentQuery: RuleGroupType = {
  combinator: "and",
  rules: [],
}

"use client";

import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const fields = [
  { value: "email", label: "Email", type: "text" },
  { value: "first_name", label: "Nome", type: "text" },
  { value: "city", label: "Cidade", type: "text" },
  { value: "country", label: "País", type: "text" },
  { value: "total_spent", label: "Total Gasto", type: "number" },
  { value: "total_orders", label: "Total Pedidos", type: "number" },
  { value: "consent_email", label: "Consent Email", type: "select" },
  { value: "created_at", label: "Data de Criação", type: "date" },
  { value: "last_order_at", label: "Último Pedido", type: "date" },
  { value: "event:placed_order", label: "Pedido Realizado", type: "event" },
  { value: "event:email_opened", label: "Email Aberto", type: "event" },
  { value: "event:email_clicked", label: "Email Clicado", type: "event" },
  { value: "event:started_checkout", label: "Checkout Iniciado", type: "event" },
];

const operators: Record<string, { value: string; label: string }[]> = {
  text: [
    { value: "equals", label: "é igual a" },
    { value: "not_equals", label: "não é igual a" },
    { value: "contains", label: "contém" },
    { value: "is_set", label: "está preenchido" },
  ],
  number: [
    { value: "equals", label: "é igual a" },
    { value: "greater_than", label: "maior que" },
    { value: "less_than", label: "menor que" },
    { value: "between", label: "entre" },
  ],
  date: [
    { value: "in_last_days", label: "nos últimos X dias" },
    { value: "greater_than", label: "depois de" },
    { value: "less_than", label: "antes de" },
  ],
  select: [
    { value: "equals", label: "é igual a" },
    { value: "not_equals", label: "não é igual a" },
  ],
  event: [
    { value: "at_least", label: "pelo menos X vezes" },
    { value: "zero", label: "zero vezes" },
    { value: "in_last_days", label: "nos últimos X dias" },
  ],
};

export function SegmentBuilder() {
  const [combinator, setCombinator] = useState<"and" | "or">("and");
  const [rules, setRules] = useState<Rule[]>([
    { id: "1", field: "total_orders", operator: "greater_than", value: "1" },
  ]);
  const [estimatedCount] = useState(342);

  const addRule = () => {
    setRules([
      ...rules,
      { id: Date.now().toString(), field: "email", operator: "contains", value: "" },
    ]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const getFieldType = (fieldValue: string) => {
    const field = fields.find((f) => f.value === fieldValue);
    return field?.type || "text";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Contatos que correspondem a</span>
        <button
          onClick={() => setCombinator(combinator === "and" ? "or" : "and")}
          className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700"
        >
          {combinator === "and" ? "TODAS" : "QUALQUER"}
        </button>
        <span className="text-sm text-gray-500">as condições:</span>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => {
          const fieldType = getFieldType(rule.field);
          const availableOperators = operators[fieldType] || operators.text;

          return (
            <div key={rule.id} className="flex items-center gap-3">
              <select
                value={rule.field}
                onChange={(e) => updateRule(rule.id, { field: e.target.value, operator: (operators[getFieldType(e.target.value)] || operators.text)[0].value })}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {fields.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              <select
                value={rule.operator}
                onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {availableOperators.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              {rule.operator !== "is_set" && rule.operator !== "zero" && (
                <Input
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  placeholder="Valor"
                  className="max-w-[200px]"
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRule(rule.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button variant="secondary" onClick={addRule} size="sm">
        <Plus className="mr-1 h-4 w-4" />
        Adicionar condição
      </Button>

      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
        <Users className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-600">
          Contagem estimada:{" "}
          <span className="font-semibold text-gray-900">
            {estimatedCount.toLocaleString("pt-BR")} contatos
          </span>
        </span>
      </div>
    </div>
  );
}

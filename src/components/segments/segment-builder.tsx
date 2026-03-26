"use client"

import { useCallback, useEffect, useState } from "react"
import {
  QueryBuilder,
  type RuleGroupType,
  type RuleType,
  type Field,
  type OptionGroup,
  type ValueEditorProps,
  type FieldSelectorProps,
  type OperatorSelectorProps,
  type CombinatorSelectorProps,
  type ActionWithRulesAndAddersProps,
  type ActionProps,
} from "react-querybuilder"
import { Plus, FolderPlus, X } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"

interface ListOption {
  name: string
  label: string
}

function buildFields(listOptions: ListOption[]): Field[] {
  return [
    // Profile properties
    { name: "email", label: "Email", inputType: "text" },
    { name: "first_name", label: "Nome", inputType: "text" },
    { name: "last_name", label: "Sobrenome", inputType: "text" },
    { name: "phone", label: "Telefone", inputType: "text" },
    { name: "city", label: "Cidade", inputType: "text" },
    { name: "state", label: "Estado", inputType: "text" },
    { name: "country", label: "País", inputType: "text" },
    { name: "tags", label: "Tags", inputType: "text" },
    {
      name: "source",
      label: "Origem",
      inputType: "text",
      valueEditorType: "select",
      values: [
        { name: "shopify", label: "Shopify" },
        { name: "import", label: "Importação" },
        { name: "form", label: "Formulário" },
        { name: "api", label: "API" },
      ],
    },
    {
      name: "consent_email",
      label: "Consentimento Email",
      inputType: "text",
      valueEditorType: "select",
      values: [
        { name: "subscribed", label: "Inscrito" },
        { name: "unsubscribed", label: "Cancelado" },
        { name: "bounced", label: "Bounced" },
      ],
    },
    {
      name: "consent_whatsapp",
      label: "Consentimento WhatsApp",
      inputType: "text",
      valueEditorType: "select",
      values: [
        { name: "subscribed", label: "Inscrito" },
        { name: "unsubscribed", label: "Cancelado" },
        { name: "none", label: "Nenhum" },
      ],
    },
    { name: "total_spent", label: "Total Gasto (R$)", inputType: "number" },
    { name: "total_orders", label: "Total de Pedidos", inputType: "number" },
    { name: "avg_order_value", label: "Ticket Médio (R$)", inputType: "number" },
    { name: "created_at", label: "Data de Cadastro", inputType: "date" },
    { name: "last_order_at", label: "Último Pedido", inputType: "date" },
    // Event-based
    {
      name: "event:placed_order",
      label: "Evento: Pedido Realizado",
      inputType: "number",
    },
    {
      name: "event:started_checkout",
      label: "Evento: Checkout Iniciado",
      inputType: "number",
    },
    {
      name: "event:email_opened",
      label: "Evento: Email Aberto",
      inputType: "number",
    },
    {
      name: "event:email_clicked",
      label: "Evento: Email Clicado",
      inputType: "number",
    },
    {
      name: "event:viewed_product",
      label: "Evento: Produto Visualizado",
      inputType: "number",
    },
    // List membership
    {
      name: "in_list",
      label: "Está na Lista",
      inputType: "text",
      valueEditorType: "select",
      values: listOptions.length > 0
        ? listOptions
        : [{ name: "", label: "Carregando listas..." }],
    },
    {
      name: "not_in_list",
      label: "Não Está na Lista",
      inputType: "text",
      valueEditorType: "select",
      values: listOptions.length > 0
        ? listOptions
        : [{ name: "", label: "Carregando listas..." }],
    },
  ]
}

function buildFieldGroups(fields: Field[]): OptionGroup<Field>[] {
  return [
    {
      label: "Propriedades do Perfil",
      options: fields.filter(
        (f) =>
          !f.name.startsWith("event:") &&
          f.name !== "in_list" &&
          f.name !== "not_in_list"
      ),
    },
    {
      label: "Eventos",
      options: fields.filter((f) => f.name.startsWith("event:")),
    },
    {
      label: "Listas",
      options: fields.filter(
        (f) => f.name === "in_list" || f.name === "not_in_list"
      ),
    },
  ]
}

interface OperatorOption {
  name: string
  label: string
}

function getOperatorsForField(fieldName: string, currentFields?: Field[]): OperatorOption[] {
  const fieldList = currentFields ?? buildFields([])
  const field = fieldList.find((f) => f.name === fieldName)
  if (!field) return [{ name: "=", label: "igual a" }]

  if (field.name.startsWith("event:") || field.inputType === "number") {
    return [
      { name: "=", label: "igual a" },
      { name: "!=", label: "diferente de" },
      { name: ">", label: "maior que" },
      { name: "<", label: "menor que" },
      { name: ">=", label: "maior ou igual a" },
      { name: "<=", label: "menor ou igual a" },
      { name: "between", label: "entre" },
    ]
  }

  if (field.inputType === "date") {
    return [
      { name: "before", label: "antes de" },
      { name: "after", label: "depois de" },
      { name: "in_last_days", label: "nos últimos X dias" },
      { name: "in_last_months", label: "nos últimos X meses" },
    ]
  }

  if (field.valueEditorType === "select") {
    return [
      { name: "=", label: "igual a" },
      { name: "!=", label: "diferente de" },
    ]
  }

  // Text fields
  return [
    { name: "equals", label: "igual a" },
    { name: "not_equals", label: "diferente de" },
    { name: "contains", label: "contém" },
    { name: "starts_with", label: "começa com" },
    { name: "ends_with", label: "termina com" },
    { name: "is_set", label: "está preenchido" },
    { name: "is_not_set", label: "está vazio" },
  ]
}

// Custom field selector
function CustomFieldSelector(props: FieldSelectorProps) {
  const { value, handleOnChange } = props

  return (
    <Select value={value as string} onValueChange={handleOnChange}>
      <SelectTrigger className="w-[200px] h-9 text-sm">
        <SelectValue placeholder="Selecione o campo" />
      </SelectTrigger>
      <SelectContent>
        {fieldGroups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel className="text-xs text-gray-400 uppercase tracking-wider">
              {group.label}
            </SelectLabel>
            {group.options.map((field) => (
              <SelectItem key={field.name} value={field.name}>
                {field.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

// Custom operator selector
function CustomOperatorSelector(props: OperatorSelectorProps) {
  const { value, handleOnChange, field } = props
  const operators = getOperatorsForField(field as string)

  return (
    <Select value={value as string} onValueChange={handleOnChange}>
      <SelectTrigger className="w-[180px] h-9 text-sm">
        <SelectValue placeholder="Operador" />
      </SelectTrigger>
      <SelectContent>
        {operators.map((op) => (
          <SelectItem key={op.name} value={op.name}>
            {op.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Custom value editor
function CustomValueEditor(props: ValueEditorProps) {
  const { value, handleOnChange, field, operator, fieldData } = props

  // No value needed for is_set / is_not_set
  if (operator === "is_set" || operator === "is_not_set") {
    return null
  }

  // Select editor for fields with predefined values
  const fieldDef = fields.find((f) => f.name === field)
  if (
    fieldDef?.valueEditorType === "select" &&
    fieldDef.values &&
    Array.isArray(fieldDef.values) &&
    fieldDef.values.length > 0
  ) {
    const selectValues = fieldDef.values as Array<{
      name: string
      label: string
    }>
    return (
      <Select
        value={value as string}
        onValueChange={handleOnChange}
      >
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {selectValues.map((v) => (
            <SelectItem key={v.name} value={v.name}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Date input
  if (fieldDef?.inputType === "date" && (operator === "before" || operator === "after")) {
    return (
      <Input
        type="date"
        value={value as string}
        onChange={(e) => handleOnChange(e.target.value)}
        className="w-[160px] h-9 text-sm"
      />
    )
  }

  // Number input for days/months and number fields
  if (
    fieldDef?.inputType === "number" ||
    fieldDef?.name.startsWith("event:") ||
    operator === "in_last_days" ||
    operator === "in_last_months"
  ) {
    const placeholder =
      operator === "in_last_days"
        ? "Dias"
        : operator === "in_last_months"
          ? "Meses"
          : "Valor"

    return (
      <Input
        type="number"
        value={value as string}
        onChange={(e) => handleOnChange(e.target.value)}
        placeholder={placeholder}
        className="w-[120px] h-9 text-sm"
      />
    )
  }

  // Default text input
  return (
    <Input
      type="text"
      value={value as string}
      onChange={(e) => handleOnChange(e.target.value)}
      placeholder="Valor"
      className="w-[160px] h-9 text-sm"
    />
  )
}

// Custom combinator selector (AND/OR toggle)
function CustomCombinatorSelector(props: CombinatorSelectorProps) {
  const { value, handleOnChange } = props

  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "and"
            ? "bg-brand-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
        onClick={() => handleOnChange("and")}
      >
        E (AND)
      </button>
      <button
        type="button"
        className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${
          value === "or"
            ? "bg-brand-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
        onClick={() => handleOnChange("or")}
      >
        OU (OR)
      </button>
    </div>
  )
}

// Custom add rule button
function CustomAddRuleAction(props: ActionWithRulesAndAddersProps) {
  const { handleOnClick } = props

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-sm"
      onClick={handleOnClick}
    >
      <Plus className="mr-1 h-[18px] w-[18px]" />
      Adicionar condição
    </Button>
  )
}

// Custom add group button
function CustomAddGroupAction(props: ActionWithRulesAndAddersProps) {
  const { handleOnClick } = props

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-sm text-gray-500"
      onClick={handleOnClick}
    >
      <FolderPlus className="mr-1 h-[18px] w-[18px]" />
      Adicionar grupo
    </Button>
  )
}

// Custom remove rule button
function CustomRemoveRuleAction(props: ActionProps) {
  const { handleOnClick } = props

  return (
    <button
      type="button"
      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      onClick={handleOnClick}
      title="Remover"
    >
      <X className="h-[18px] w-[18px]" />
    </button>
  )
}

// Custom remove group button
function CustomRemoveGroupAction(props: ActionWithRulesAndAddersProps) {
  const { handleOnClick } = props

  return (
    <button
      type="button"
      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      onClick={handleOnClick}
      title="Remover grupo"
    >
      <X className="h-[18px] w-[18px]" />
    </button>
  )
}

interface SegmentBuilderProps {
  query: RuleGroupType
  onQueryChange: (query: RuleGroupType) => void
}

export function SegmentBuilder({ query, onQueryChange }: SegmentBuilderProps) {
  const handleQueryChange = useCallback(
    (newQuery: RuleGroupType) => {
      onQueryChange(newQuery)
    },
    [onQueryChange]
  )

  return (
    <div className="segment-builder">
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={handleQueryChange}
        controlElements={{
          fieldSelector: CustomFieldSelector,
          operatorSelector: CustomOperatorSelector,
          valueEditor: CustomValueEditor,
          combinatorSelector: CustomCombinatorSelector,
          addRuleAction: CustomAddRuleAction,
          addGroupAction: CustomAddGroupAction,
          removeRuleAction: CustomRemoveRuleAction,
          removeGroupAction: CustomRemoveGroupAction,
        }}
        controlClassnames={{
          queryBuilder: "space-y-3",
          ruleGroup:
            "rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3",
          header: "flex items-center gap-2 flex-wrap",
          body: "space-y-2",
          rule: "flex items-center gap-2 flex-wrap bg-white rounded-lg border border-gray-100 p-3",
        }}
        getOperators={(field) =>
          getOperatorsForField(field).map((op) => ({
            name: op.name,
            label: op.label,
          }))
        }
      />
      <style jsx global>{`
        .segment-builder .queryBuilder {
          padding: 0;
          background: transparent;
        }
        .segment-builder .ruleGroup-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .segment-builder .ruleGroup-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .segment-builder .rule {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #f3f4f6;
          padding: 0.75rem;
        }
        .segment-builder .ruleGroup {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 1rem;
        }
        .segment-builder .ruleGroup .ruleGroup {
          background: #f3f4f6;
        }
        .segment-builder .betweenRules {
          display: none;
        }
      `}</style>
    </div>
  )
}

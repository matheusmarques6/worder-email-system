"use client"

import { useState } from "react"
import { QueryBuilder, type RuleGroupType } from "react-querybuilder"
import { segmentFields, segmentOperators, defaultSegmentQuery, convertToSegmentRules } from "@/lib/segments/query-builder"

interface SegmentBuilderProps {
  initialQuery?: RuleGroupType
  onSave: (rules: { combinator: "and" | "or"; rules: Array<{ field: string; operator: string; value: string | number | boolean }> }) => void
}

export default function SegmentBuilder({ initialQuery, onSave }: SegmentBuilderProps) {
  const [query, setQuery] = useState<RuleGroupType>(initialQuery ?? defaultSegmentQuery)

  const handleSave = () => {
    const rules = convertToSegmentRules(query)
    onSave(rules)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Condições do Segmento</h3>
        <QueryBuilder
          fields={segmentFields}
          operators={segmentOperators}
          query={query}
          onQueryChange={setQuery}
          controlClassnames={{
            queryBuilder: "space-y-2",
            ruleGroup: "border border-gray-200 rounded-lg p-4 space-y-2",
            rule: "flex items-center gap-2 flex-wrap",
            addRule: "text-sm text-brand-600 hover:text-brand-700 font-medium",
            addGroup: "text-sm text-gray-500 hover:text-gray-700 font-medium",
            removeRule: "text-sm text-red-500 hover:text-red-700",
            removeGroup: "text-sm text-red-500 hover:text-red-700",
          }}
        />
      </div>
      <button
        onClick={handleSave}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
      >
        Salvar Segmento
      </button>
    </div>
  )
}

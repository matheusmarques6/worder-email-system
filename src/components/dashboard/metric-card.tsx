import { ArrowUp, ArrowDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  change?: number | string
  changeType?: "positive" | "negative"
}

export function MetricCard({ label, value, icon: Icon, change, changeType }: MetricCardProps) {
  const numericChange = typeof change === "number" ? change : undefined
  const resolvedType =
    changeType ||
    (numericChange !== undefined
      ? numericChange >= 0
        ? "positive"
        : "negative"
      : undefined)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
          {label}
        </span>
        <div className="rounded-lg bg-brand-50 p-2">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-gray-900 leading-tight">{value}</p>
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1 mt-2">
          {resolvedType === "positive" ? (
            <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
          ) : resolvedType === "negative" ? (
            <ArrowDown className="h-3.5 w-3.5 text-red-500" />
          ) : null}
          <span
            className={`text-sm font-medium ${
              resolvedType === "positive"
                ? "text-emerald-600"
                : resolvedType === "negative"
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {typeof change === "number" ? `${Math.abs(change)}%` : change}
          </span>
        </div>
      )}
    </div>
  )
}

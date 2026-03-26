import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative"
  icon: LucideIcon
}

export function MetricCard({ label, value, change, changeType, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="rounded-lg bg-brand-50 p-2">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {change && (
        <p
          className={`mt-1 text-xs ${
            changeType === "positive"
              ? "text-emerald-600"
              : changeType === "negative"
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  )
}

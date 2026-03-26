import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  change?: string
  changeType?: "positive" | "negative"
  icon: LucideIcon
}

export function MetricCard({
  label,
  value,
  change,
  changeType = "positive",
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-brand-50 rounded-lg p-2">
          <Icon size={20} className="text-brand-600" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {change && (
        <p
          className={cn(
            "text-xs mt-1",
            changeType === "positive" ? "text-emerald-600" : "text-red-500"
          )}
        >
          {changeType === "positive" ? "↑" : "↓"} {change}
        </p>
      )}
    </div>
  )
}

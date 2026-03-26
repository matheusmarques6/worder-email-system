import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: number;
  loading?: boolean;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-5 animate-pulse rounded bg-gray-200" />
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <Icon className="mb-4 h-5 w-5 text-gray-400" />
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <p
          className={cn(
            "mt-1 text-xs",
            change >= 0 ? "text-emerald-600" : "text-red-500"
          )}
        >
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs anterior
        </p>
      )}
    </div>
  );
}

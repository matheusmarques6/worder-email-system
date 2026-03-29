const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-amber-100 text-amber-700",
  sending: "bg-orange-100 text-orange-700",
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  live: "bg-emerald-100 text-emerald-700",
  subscribed: "bg-emerald-100 text-emerald-700",
  unsubscribed: "bg-gray-100 text-gray-700",
  paused: "bg-yellow-100 text-yellow-700",
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  sending: "Enviando",
  sent: "Enviado",
  failed: "Falhou",
  live: "Ativo",
  subscribed: "Inscrito",
  unsubscribed: "Cancelado",
  paused: "Pausado",
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()
  const styles = statusStyles[normalizedStatus] || "bg-gray-100 text-gray-700"
  const label = statusLabels[normalizedStatus] || status

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {label}
    </span>
  )
}

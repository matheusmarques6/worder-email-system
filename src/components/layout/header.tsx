"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  campaigns: "Campanhas",
  flows: "Automações",
  templates: "Templates",
  audience: "Audiência",
  profiles: "Perfis",
  segments: "Segmentos",
  lists: "Listas",
  forms: "Formulários",
  analytics: "Analytics",
  settings: "Configurações",
  integrations: "Integrações",
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  account: "Conta",
  new: "Novo",
  edit: "Editar",
}

export function Header() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = routeLabels[segment] ?? segment
    return { href, label }
  })

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ href: "/", label: "Dashboard" })
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6">
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-500 hover:text-gray-700"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </header>
  )
}

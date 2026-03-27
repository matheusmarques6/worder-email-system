"use client"

import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/campaigns": "Campanhas",
  "/campaigns/new": "Nova Campanha",
  "/flows": "Automações",
  "/flows/new": "Nova Automação",
  "/templates": "Templates",
  "/templates/new": "Novo Template",
  "/audience/profiles": "Perfis",
  "/audience/segments": "Segmentos",
  "/audience/segments/new": "Novo Segmento",
  "/audience/lists": "Listas",
  "/forms": "Formulários",
  "/forms/new": "Novo Formulário",
  "/analytics": "Analytics",
  "/settings/integrations": "Integrações",
  "/settings/email": "Email",
  "/settings/whatsapp": "WhatsApp",
  "/settings/sms": "SMS",
  "/settings/account": "Conta",
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: { label: string; href: string }[] = []

  if (pathname === "/") {
    return [{ label: "Dashboard", href: "/" }]
  }

  let currentPath = ""
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = routeLabels[currentPath]
    if (label) {
      crumbs.push({ label, href: currentPath })
    }
  }

  if (crumbs.length === 0) {
    crumbs.push({ label: "Dashboard", href: "/" })
  }

  return crumbs
}

export function Header() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6">
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={
                index === breadcrumbs.length - 1
                  ? "font-medium text-gray-900"
                  : "text-gray-500"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>
    </header>
  )
}

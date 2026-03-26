"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  campaigns: "Campanhas",
  flows: "Automações",
  templates: "Templates",
  audience: "Audiência",
  profiles: "Perfis",
  segments: "Segmentos",
  lists: "Listas",
  analytics: "Analytics",
  settings: "Configurações",
  integrations: "Integrações",
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  forms: "Formulários",
  new: "Novo",
  edit: "Editar",
  account: "Conta",
}

export function Header() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = routeLabels[segment] || segment
    return { href, label }
  })

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.href}>
              <BreadcrumbSeparator />
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

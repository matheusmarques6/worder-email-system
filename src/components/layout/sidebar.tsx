"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Mail,
  Zap,
  FileText,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Campanhas", href: "/campaigns", icon: Mail },
  { label: "Automações", href: "/flows", icon: Zap },
  { label: "Templates", href: "/templates", icon: FileText },
  {
    label: "Audiência",
    icon: Users,
    children: [
      { label: "Perfis", href: "/audience/profiles" },
      { label: "Segmentos", href: "/audience/segments" },
      { label: "Listas", href: "/audience/lists" },
    ],
  },
  { label: "Formulários", href: "/forms", icon: ClipboardList },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    label: "Configurações",
    icon: Settings,
    children: [
      { label: "Integrações", href: "/settings/integrations" },
      { label: "Email", href: "/settings/email" },
      { label: "WhatsApp", href: "/settings/whatsapp" },
      { label: "SMS", href: "/settings/sms" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Audiência: true,
    Configurações: false,
  })

  function toggleExpand(label: string) {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="bg-sidebar h-screen fixed w-60 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center">
          <span className="text-white font-bold text-lg">Convertfy</span>
          <span className="text-brand-400 font-bold text-lg ml-1">Mail</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon

            if (item.children) {
              const isChildActive = item.children.some((child) =>
                isActive(child.href)
              )
              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      isChildActive
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {item.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform",
                        expanded[item.label] && "rotate-180"
                      )}
                    />
                  </button>
                  {expanded[item.label] && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block px-3 py-1.5 rounded-md text-sm transition-colors",
                              isActive(child.href)
                                ? "text-white bg-sidebar-active border-l-[3px] border-brand-500"
                                : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }

            return (
              <li key={item.label}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive(item.href!)
                      ? "text-white bg-sidebar-active border-l-[3px] border-brand-500"
                      : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Separator */}
      <div className="h-px bg-gray-700/50 mx-4 my-2" />

      {/* Footer */}
      <div className="px-3 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}

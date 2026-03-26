"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  Zap,
  FileText,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  UserCircle,
  ListFilter,
  BookUser,
  Link2,
  AtSign,
  MessageCircle,
  Smartphone,
  ClipboardList,
} from "lucide-react"

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: <MessageSquare size={18} />,
  },
  {
    label: "Campanhas",
    href: "/campaigns",
    icon: <Mail size={18} />,
  },
  {
    label: "Automações",
    href: "/flows",
    icon: <Zap size={18} />,
  },
  {
    label: "Templates",
    href: "/templates",
    icon: <FileText size={18} />,
  },
  {
    label: "Audiência",
    icon: <Users size={18} />,
    children: [
      { label: "Perfis", href: "/audience/profiles" },
      { label: "Segmentos", href: "/audience/segments" },
      { label: "Listas", href: "/audience/lists" },
    ],
  },
  {
    label: "Formulários",
    href: "/forms",
    icon: <ClipboardList size={18} />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 size={18} />,
  },
]

const settingsItems: NavItem[] = [
  {
    label: "Configurações",
    icon: <Settings size={18} />,
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

  function renderItem(item: NavItem) {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expanded[item.label]
    const active = item.href ? isActive(item.href) : false
    const childActive = item.children?.some((c) => isActive(c.href)) ?? false

    return (
      <div key={item.label}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
              childActive
                ? "text-white bg-sidebar-active"
                : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
            }`}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <Link
            href={item.href!}
            className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
              active
                ? "text-white bg-sidebar-active border-l-[3px] border-brand-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="ml-8">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`block px-5 py-2 text-sm transition-colors ${
                  isActive(child.href)
                    ? "text-white border-l-[3px] border-brand-500 bg-sidebar-active"
                    : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="bg-sidebar h-screen fixed w-60 flex flex-col z-40">
      <div className="px-5 py-5">
        <Link href="/" className="text-lg font-bold">
          <span className="text-white">Convertfy</span>{" "}
          <span className="text-brand-400">Mail</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {navItems.map(renderItem)}
        <div className="h-px bg-gray-700/50 mx-4 my-2" />
        {settingsItems.map(renderItem)}
      </nav>

      <div className="border-t border-gray-700/50 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 hover:text-gray-200 text-sm w-full px-1 py-2 transition-colors"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

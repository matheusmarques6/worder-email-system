"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Send,
  Zap,
  Layout,
  FileText,
  Users,
  Filter,
  List,
  BarChart3,
  Plug,
  Mail,
  MessageCircle,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { useStore } from "@/hooks/use-store"
import { createClient } from "@/lib/supabase/client"

interface NavChild {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children?: NavChild[]
}

type NavEntry = NavItem | "separator"

const navItems: NavEntry[] = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Campanhas", href: "/campaigns", icon: Send },
  { label: "Automações", href: "/flows", icon: Zap },
  { label: "Templates", href: "/templates", icon: Layout },
  { label: "Formulários", href: "/forms", icon: FileText },
  "separator",
  {
    label: "Audiência",
    href: "/audience",
    icon: Users,
    children: [
      { label: "Perfis", href: "/audience/profiles", icon: Users },
      { label: "Segmentos", href: "/audience/segments", icon: Filter },
      { label: "Listas", href: "/audience/lists", icon: List },
    ],
  },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  "separator",
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "Integrações", href: "/settings/integrations", icon: Plug },
      { label: "Email", href: "/settings/email", icon: Mail },
      { label: "WhatsApp", href: "/settings/whatsapp", icon: MessageCircle },
      { label: "Conta", href: "/settings/account", icon: Settings },
    ],
  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { store } = useStore()

  const storeName = store?.name || "Minha Loja"

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="bg-sidebar h-screen fixed w-[220px] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-0">
          <span className="text-white font-bold text-xl">Convertfy</span>
          <span className="text-brand-500 font-bold text-xl">Mail</span>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-3 py-1">
        {navItems.map((entry, index) => {
          if (entry === "separator") {
            return (
              <div key={`sep-${index}`} className="h-px bg-gray-700/50 mx-1 my-3" />
            )
          }
          return (
            <NavItemComponent
              key={entry.href}
              item={entry}
              pathname={pathname}
            />
          )
        })}
      </nav>

      {/* Rodapé - Informações do usuário */}
      <div className="border-t border-gray-700/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitials(storeName)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {storeName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-200 flex-shrink-0 cursor-pointer"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavItemComponent({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const hasChildren = item.children && item.children.length > 0
  const childActive = hasChildren
    ? item.children!.some((child) => isActive(pathname, child.href))
    : false
  const [expanded, setExpanded] = useState(childActive)
  const active = hasChildren ? childActive : isActive(pathname, item.href)

  const Icon = item.icon

  if (hasChildren) {
    return (
      <div className="mb-0.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
            active
              ? "bg-[rgba(242,107,42,0.08)] text-white border-l-[3px] border-brand-500"
              : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            <span>{item.label}</span>
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        {expanded && (
          <div className="ml-4 mt-1 space-y-0.5">
            {item.children!.map((child) => {
              const childIsActive = isActive(pathname, child.href)
              const ChildIcon = child.icon
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    childIsActive
                      ? "bg-[rgba(242,107,42,0.08)] text-white border-l-[3px] border-brand-500"
                      : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
                  }`}
                >
                  <ChildIcon size={16} />
                  <span>{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
        active
          ? "bg-[rgba(242,107,42,0.08)] text-white border-l-[3px] border-brand-500"
          : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
      }`}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </Link>
  )
}

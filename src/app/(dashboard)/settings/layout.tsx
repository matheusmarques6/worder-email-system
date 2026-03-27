"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  User,
  Users,
  CreditCard,
  Eye,
  BarChart3,
  Link2,
  Mail,
  MessageCircle,
  Smartphone,
  Activity,
  Code,
  Shield,
} from "lucide-react"

type NavItem =
  | { label: string; href: string; icon: React.ComponentType<{ className?: string }>; type?: never }
  | { type: "separator"; label?: never; href?: never; icon?: never }

const settingsNav: NavItem[] = [
  { label: "Conta", href: "/settings/account", icon: User },
  { label: "Equipe", href: "/settings/users", icon: Users },
  { label: "Faturamento", href: "/settings/billing", icon: CreditCard },
  { type: "separator" },
  { label: "Integrações", href: "/settings/integrations", icon: Link2 },
  { label: "Email", href: "/settings/email", icon: Mail },
  { label: "WhatsApp", href: "/settings/whatsapp", icon: MessageCircle },
  { label: "SMS", href: "/settings/sms", icon: Smartphone },
  { type: "separator" },
  { label: "Rastreamento", href: "/settings/tracking", icon: Eye },
  { label: "Atribuição", href: "/settings/attribution", icon: BarChart3 },
  { label: "UTM", href: "/settings/utm", icon: Activity },
  { type: "separator" },
  { label: "API", href: "/settings/api", icon: Code },
  { label: "Segurança", href: "/settings/security", icon: Shield },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-8">
      <nav className="w-56 flex-shrink-0">
        <div className="space-y-1">
          {settingsNav.map((item, i) => {
            if (item.type === "separator") {
              return <div key={i} className="my-3 h-px bg-gray-200" />
            }

            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-l-2 border-brand-500 bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

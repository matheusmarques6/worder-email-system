"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  UserCircle,
  List,
  Filter,
  Plug,
  AtSign,
  MessageCircle,
  Smartphone,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
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
  { label: "Formulários", href: "/forms", icon: FileEdit },
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
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Audiência: true,
    Configurações: false,
  });

  function toggleExpand(label: string) {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {navItems.map((item, idx) => {
          const showSeparator =
            idx === 4 || idx === 6;

          return (
            <div key={item.label}>
              {showSeparator && (
                <div className="h-px bg-gray-700/50 mx-1 my-2" />
              )}

              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover transition-colors"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon size={18} className="mr-3" />
                      {item.label}
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform",
                        expanded[item.label] && "rotate-180"
                      )}
                    />
                  </button>

                  {expanded[item.label] && (
                    <div className="mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center pl-10 pr-3 py-2 rounded-md text-sm transition-colors",
                            isActive(child.href)
                              ? "bg-sidebar-active text-white border-l-[3px] border-brand-500"
                              : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                    isActive(item.href!)
                      ? "bg-sidebar-active text-white border-l-[3px] border-brand-500"
                      : "text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover"
                  )}
                >
                  <item.icon size={18} className="mr-3" />
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700/50 px-3 py-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-400 hover:text-gray-200 hover:bg-sidebar-hover transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          Sair
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Zap,
  Mail,
  LayoutTemplate,
  Users,
  Settings,
  UserCircle,
  ListFilter,
  List,
  Link2,
  AtSign,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: BarChart3 },
  { label: "Campanhas", href: "/campaigns", icon: Mail },
  { label: "Automações", href: "/flows", icon: Zap },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  {
    label: "Audiência",
    href: "/audience",
    icon: Users,
    children: [
      { label: "Perfis", href: "/audience/profiles" },
      { label: "Segmentos", href: "/audience/segments" },
      { label: "Listas", href: "/audience/lists" },
    ],
  },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "Integrações", href: "/settings/integrations" },
      { label: "Email", href: "/settings/email" },
      { label: "WhatsApp", href: "/settings/whatsapp" },
    ],
  },
];

const childIcons: Record<string, React.ElementType> = {
  "/audience/profiles": UserCircle,
  "/audience/segments": ListFilter,
  "/audience/lists": List,
  "/settings/integrations": Link2,
  "/settings/email": AtSign,
  "/settings/whatsapp": MessageCircle,
};

export function Sidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "/audience",
    "/settings",
  ]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSection = (href: string) => {
    setExpandedSections((prev) =>
      prev.includes(href)
        ? prev.filter((s) => s !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#1A1D21]">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-brand-500" />
          <span className="text-lg font-semibold text-white">
            Convertfy Mail
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const expanded = expandedSections.includes(item.href);

          if (item.children) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => toggleSection(item.href)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "text-white"
                      : "text-gray-400 hover:bg-[#2C3035] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>
                {expanded && (
                  <div className="mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = childIcons[child.href];
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg py-2 pl-8 pr-3 text-sm transition-colors",
                            childActive
                              ? "border-l-[3px] border-brand-500 bg-[#35393E] text-white"
                              : "text-gray-400 hover:bg-[#2C3035] hover:text-gray-200"
                          )}
                        >
                          {ChildIcon && (
                            <ChildIcon className="h-[18px] w-[18px]" />
                          )}
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "border-l-[3px] border-brand-500 bg-[#35393E] text-white"
                  : "text-gray-400 hover:bg-[#2C3035] hover:text-gray-200"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#1A1D21] p-2 text-white lg:hidden"
      >
        {mobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 transform transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-60 flex-shrink-0 lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}

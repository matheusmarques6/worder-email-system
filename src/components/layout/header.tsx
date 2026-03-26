"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/campaigns": "Campanhas",
  "/flows": "Automações",
  "/templates": "Templates",
  "/audience/profiles": "Perfis",
  "/audience/segments": "Segmentos",
  "/audience/lists": "Listas",
  "/analytics": "Analytics",
  "/forms": "Formulários",
  "/settings/integrations": "Integrações",
  "/settings/email": "Email",
  "/settings/whatsapp": "WhatsApp",
  "/settings/sms": "SMS",
  "/settings/account": "Conta",
};

const parentLabels: Record<string, string> = {
  audience: "Audiência",
  settings: "Configurações",
  campaigns: "Campanhas",
  flows: "Automações",
  templates: "Templates",
  forms: "Formulários",
};

function getBreadcrumbs(pathname: string) {
  if (pathname === "/") return [{ label: "Dashboard", href: "/" }];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label =
      routeLabels[currentPath] ||
      parentLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center">
            {i > 0 && (
              <ChevronRight size={14} className="mx-2 text-gray-400" />
            )}
            <span
              className={
                i === breadcrumbs.length - 1
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Avatar / Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-medium hover:bg-brand-200 transition-colors"
        >
          <User size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-sm py-1 z-50">
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/settings/account");
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User size={16} className="mr-2" />
              Minha conta
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={16} className="mr-2" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

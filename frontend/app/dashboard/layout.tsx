"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/medicamentos", label: "Medicamentos", icon: "💊" },
  { href: "#", label: "Dispensação", icon: "📦", disabled: true },
  { href: "#", label: "Beneficiados", icon: "👥", disabled: true },
  { href: "#", label: "Profissionais", icon: "👨‍⚕️", disabled: true },
  { href: "#", label: "Relatórios", icon: "📊", disabled: true },
  { href: "#", label: "Configurações", icon: "⚙️", disabled: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Usuário");

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const u = JSON.parse(sessionStorage.getItem("usuario") ?? "{}");
      if (u?.login) setUserName(u.login);
    } catch {
      // ignore
    }
  }, [router]);

  async function handleLogout() {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try { await logout(token); } catch { /* ignore */ }
    }
    sessionStorage.clear();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-800">
          <span className="text-2xl">💊</span>
          <div>
            <div className="font-bold text-sm leading-tight">S.I.B.</div>
            <div className="text-xs text-blue-300 leading-tight">Sistema de Informação Básica</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = !item.disabled && pathname === item.href;
            if (item.disabled) {
              return (
                <span
                  key={item.label}
                  className="flex items-center gap-3 px-6 py-3 text-sm text-blue-400 opacity-50 cursor-not-allowed"
                >
                  <span>{item.icon}</span>
                  {item.label}
                  <span className="ml-auto text-xs bg-blue-800 px-2 py-0.5 rounded-full">Em breve</span>
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors
                  ${isActive
                    ? "bg-blue-700 text-white font-semibold border-r-4 border-blue-300"
                    : "text-blue-100 hover:bg-blue-800"
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-6 py-4 border-t border-blue-800 text-xs text-blue-300">
          <div className="truncate">{userName}</div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
          {/* Hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 text-sm font-medium text-gray-700 truncate">
            S.I.B. – Sistema de Informação Básica
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">{userName}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

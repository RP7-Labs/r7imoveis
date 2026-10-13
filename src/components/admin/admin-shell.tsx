"use client";

import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/admin/leads", label: "Leads", icon: MessageSquareText },
  { href: "/admin/paginas", label: "Conteúdo do site", icon: FileText },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({
  userName,
  userRole,
  children,
}: {
  userName: string;
  userRole: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav aria-label="Menu administrativo" className="flex-1 px-3 py-4">
      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-petrol-500 text-white"
                    : "text-petrol-100 hover:bg-petrol-800",
                )}
              >
                <item.icon className="size-4.5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const userBlock = (
    <div className="border-t border-petrol-800 p-4">
      <p className="truncate text-sm font-medium text-white">{userName}</p>
      <p className="text-xs capitalize text-petrol-300">{userRole}</p>
      <div className="mt-3 flex gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex-1 rounded-lg border border-petrol-700 px-3 py-1.5 text-center text-xs text-petrol-200 hover:bg-petrol-800"
        >
          Ver site
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-1.5 rounded-lg border border-petrol-700 px-3 py-1.5 text-xs text-petrol-200 hover:bg-petrol-800"
        >
          <LogOut className="size-3.5" aria-hidden />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-graphite-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 hidden w-64 flex-col bg-petrol-900 lg:flex">
        <div className="border-b border-petrol-800 px-5 py-5">
          <Logo size="sm" />
        </div>
        {nav}
        {userBlock}
      </aside>

      {/* Topbar mobile */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-petrol-800 bg-petrol-900 px-4 py-3 lg:hidden">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-white hover:bg-petrol-800"
        >
          <Menu className="size-6" aria-hidden />
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-graphite-950/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-petrol-900">
            <div className="flex items-center justify-between border-b border-petrol-800 px-5 py-4">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-white hover:bg-petrol-800"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {nav}
            {userBlock}
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 pt-16 lg:pl-64 lg:pt-0">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

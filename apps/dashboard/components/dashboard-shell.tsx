"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp,
  Package,
  ChefHat,
  LayoutGrid,
  LogOut,
  FolderTree,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/", icon: <TrendingUp className="w-5 h-5" />, label: "Przegląd" },
  { href: "/orders", icon: <Package className="w-5 h-5" />, label: "Zamówienia" },
  { href: "/kds", icon: <ChefHat className="w-5 h-5" />, label: "KDS" },
  { href: "/products", icon: <LayoutGrid className="w-5 h-5" />, label: "Produkty" },
  { href: "/categories", icon: <FolderTree className="w-5 h-5" />, label: "Kategorie" },
  { href: "/reports", icon: <BarChart3 className="w-5 h-5" />, label: "Raporty" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-neutral-900 text-white min-h-screen fixed left-0 top-0 flex flex-col z-50">
          <div className="p-6 border-b border-neutral-800">
            <h1 className="text-xl font-black text-red-500 tracking-tight">WebowoROS</h1>
            <p className="text-xs text-neutral-400 mt-1">Panel administracyjny</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                    isActive
                      ? "bg-red-600/20 text-red-400"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-neutral-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-2 text-sm text-neutral-400 hover:text-white transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Wyloguj
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

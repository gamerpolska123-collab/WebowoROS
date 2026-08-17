"use client";

import DashboardShell from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { useStats } from "@/lib/hooks";
import { TrendingUp, ShoppingCart, Users, DollarSign, Clock, ChefHat, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { data: stats, loading } = useStats();

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Dashboard</h2>
            <p className="text-neutral-500">Witaj z powrotem, {user?.firstName}!</p>
          </div>
          <div className="text-sm text-neutral-400">
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="Przychód dzisiaj" value={`${stats?.todayRevenue?.toFixed(2) || '0.00'} zł`} trend="+12%" color="green" />
          <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Zamówienia dzisiaj" value={stats?.todayOrders || '0'} trend="+5" color="blue" />
          <StatCard icon={<Users className="w-5 h-5" />} label="Nowi klienci" value={stats?.newCustomers || '0'} trend="+3" color="purple" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Średni koszyk" value={`${stats?.avgOrderValue?.toFixed(2) || '0.00'} zł`} trend="-2%" color="orange" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard href="/orders" icon={<Clock className="w-6 h-6" />} title="Oczekujące zamówienia" description={`${stats?.pendingOrders || 0} zamówień czeka na realizację`} color="yellow" />
          <QuickActionCard href="/kds" icon={<ChefHat className="w-6 h-6" />} title="KDS — Kuchnia" description="Zarządzaj produkcją w czasie rzeczywistym" color="red" />
          <QuickActionCard href="/products" icon={<CheckCircle className="w-6 h-6" />} title="Zarządzanie menu" description="Edytuj produkty, ceny i dostępność" color="green" />
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  const colors: Record<string, string> = { green: 'bg-green-50 text-green-700', blue: 'bg-blue-50 text-blue-700', purple: 'bg-purple-50 text-purple-700', orange: 'bg-orange-50 text-orange-700' };
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color] || colors.green}`}>{icon}</div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}

function QuickActionCard({ href, icon, title, description, color }: any) {
  const colors: Record<string, string> = { yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200', red: 'bg-red-50 text-red-700 border-red-200', green: 'bg-green-50 text-green-700 border-green-200' };
  return (
    <Link href={href} className={`block p-6 rounded-xl border shadow-sm hover:shadow-md transition ${colors[color] || colors.green}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </Link>
  );
}

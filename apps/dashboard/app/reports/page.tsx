"use client";

import DashboardShell from "@/components/dashboard-shell";
import SalesReport from "./components/sales-report";

export default function ReportsPage() {
  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Raporty</h1>
        <SalesReport />
      </div>
    </DashboardShell>
  );
}

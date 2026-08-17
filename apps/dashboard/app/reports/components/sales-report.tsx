"use client";

import { useState } from "react";
import { useSalesReport } from "@/lib/hooks";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, BarChart3 } from "lucide-react";

export default function SalesReport() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [days, setDays] = useState(30);
  const { data, loading, error } = useSalesReport(period, days);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-semibold">Błąd ładowania raportu</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const report = data?.data || [];
  const summary = data?.summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Raport Sprzedaży
        </h2>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="daily">Dzienny</option>
            <option value="weekly">Tygodniowy</option>
            <option value="monthly">Miesięczny</option>
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value={7}>Ostatnie 7 dni</option>
            <option value={30}>Ostatnie 30 dni</option>
            <option value={90}>Ostatnie 90 dni</option>
            <option value={365}>Ostatni rok</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Całkowity przychód</p>
              <p className="text-2xl font-bold">{summary.totalRevenue.toFixed(2)} zł</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Liczba zamówień</p>
              <p className="text-2xl font-bold">{summary.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Średnia wartość zamówienia</p>
              <p className="text-2xl font-bold">{summary.avgOrderValue.toFixed(2)} zł</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Przychód w czasie</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={report}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} zł`} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)} zł`, "Przychód"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
              name="Przychód"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Chart */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Liczba zamówień</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={report}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [value, "Zamówienia"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <Legend />
            <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Zamówienia" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AOV Chart */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Średnia wartość zamówienia (AOV)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={report}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} zł`} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)} zł`, "AOV"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgOrderValue"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: "#a855f7", r: 4 }}
              name="AOV"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Szczegóły</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Data</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Przychód</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Zamówienia</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">AOV</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {report.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3 text-right font-medium">{row.revenue.toFixed(2)} zł</td>
                  <td className="px-4 py-3 text-right">{row.orders}</td>
                  <td className="px-4 py-3 text-right">{row.avgOrderValue.toFixed(2)} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

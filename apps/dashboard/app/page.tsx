import { Card, CardContent, CardHeader, CardTitle } from '@ros/ui';

const stats = [
  { label: 'Dzisiejsze zamówienia', value: '24', change: '+12%', icon: '📦', color: 'text-primary' },
  { label: 'Przychód dzisiaj', value: '1,247 zł', change: '+8%', icon: '💰', color: 'text-accent' },
  { label: 'Średni czas dostawy', value: '32 min', change: '-5 min', icon: '🚚', color: 'text-secondary' },
  { label: 'Aktywni klienci', value: '18', change: '+3', icon: '👥', color: 'text-gold' },
];

const recentOrders = [
  { id: '#1024', customer: 'Jan Kowalski', items: 'Margherita, Cola', total: '44.00 zł', status: 'W drodze', statusColor: 'text-accent' },
  { id: '#1023', customer: 'Anna Nowak', items: 'Capriciosa x2', total: '78.00 zł', status: 'W przygotowaniu', statusColor: 'text-secondary' },
  { id: '#1022', customer: 'Piotr Wiśniewski', items: 'Zestaw Rodzinny', total: '89.00 zł', status: 'Dostarczone', statusColor: 'text-gray-400' },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <p className="text-xs text-gray-400 mt-3">{stat.change} vs wczoraj</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Ostatnie zamówienia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Klient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Produkty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Suma</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-gray-600">{order.id}</td>
                    <td className="py-3 px-4 font-medium">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-500">{order.items}</td>
                    <td className="py-3 px-4 font-semibold">{order.total}</td>
                    <td className={`py-3 px-4 font-medium ${order.statusColor}`}>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white cursor-pointer hover:bg-primaryDark transition-colors">
          <CardContent className="p-6 text-center">
            <span className="text-4xl block mb-3">🍕</span>
            <p className="font-semibold">Dodaj nowy produkt</p>
          </CardContent>
        </Card>
        <Card className="bg-accent text-white cursor-pointer hover:bg-accentLight transition-colors">
          <CardContent className="p-6 text-center">
            <span className="text-4xl block mb-3">📋</span>
            <p className="font-semibold">Otwórz KDS</p>
          </CardContent>
        </Card>
        <Card className="bg-gold text-white cursor-pointer hover:bg-goldLight transition-colors">
          <CardContent className="p-6 text-center">
            <span className="text-4xl block mb-3">📊</span>
            <p className="font-semibold">Raporty sprzedaży</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

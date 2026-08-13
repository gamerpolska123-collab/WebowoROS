import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ROS Dashboard',
  description: 'Restaurant Order System — Panel Administracyjny',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} font-inter bg-gray-50 text-dark`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-dark text-white flex flex-col">
            <div className="p-6 border-b border-white/10">
              <h1 className="font-poppins text-xl font-bold">🍕 ROS</h1>
              <p className="text-xs text-white/60 mt-1">Panel Administracyjny</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {[
                { icon: '📊', label: 'Dashboard', href: '/' },
                { icon: '📦', label: 'Zamówienia', href: '/orders' },
                { icon: '🍕', label: 'Produkty', href: '/products' },
                { icon: '📋', label: 'KDS', href: '/kds' },
                { icon: '⚙️', label: 'Ustawienia', href: '/settings' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-white/60">admin@ros.pl</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark">Dashboard</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">📅 13.08.2026</span>
                <span className="text-sm text-accent font-semibold">● System online</span>
              </div>
            </header>
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

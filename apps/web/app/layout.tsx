import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebowoROS — Zamówienia Online",
  description: "Szybkie zamówienia online z Twojej ulubionej pizzerii. Bez pośredników.",
  manifest: "/manifest.json",
  themeColor: "#E63946",
  openGraph: {
    title: "WebowoROS — Zamówienia Online",
    description: "Szybkie zamówienia online z Twojej ulubionej pizzerii.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then((reg) => console.log('SW registered:', reg.scope))
                .catch((err) => console.log('SW registration failed:', err));
            });
          }
        `}} />
      </body>
    </html>
  );
}

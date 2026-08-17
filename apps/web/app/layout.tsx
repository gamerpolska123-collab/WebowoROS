import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
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
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleScript = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || "https://plausible.io/js/script.js";

  return (
    <html lang="pl">
      <head>
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src={plausibleScript}
          />
        )}
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
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

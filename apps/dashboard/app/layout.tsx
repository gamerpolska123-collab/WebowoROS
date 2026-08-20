import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/lib/auth-guard";
import "../sentry.client.config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebowoROS — Panel Administracyjny",
  description: "Zarządzanie zamówieniami, menu i kuchnią.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <AuthProvider><AuthGuard>{children}</AuthGuard></AuthProvider>
      </body>
    </html>
  );
}

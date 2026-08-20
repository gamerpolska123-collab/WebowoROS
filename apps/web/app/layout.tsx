import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorker } from "./service-worker";
import "../sentry.client.config";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: { default: "WebowoROS — Zamówienia Online", template: "%s | WebowoROS" },
  description: "Szybkie zamówienia online z Twojej ulubionej pizzerii. Bez pośredników, bez prowizji.",
  keywords: ["pizza", "zamówienia online", "dostawa", "restauracja", "jedzenie"],
  authors: [{ name: "WebowoROS" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "WebowoROS — Zamówienia Online",
    description: "Szybkie zamówienia online z Twojej ulubionej pizzerii. Bez pośredników.",
    type: "website",
    locale: "pl_PL",
    siteName: "WebowoROS",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebowoROS — Zamówienia Online",
    description: "Szybkie zamówienia online z Twojej ulubionej pizzerii.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E63946" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleScript = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || "https://plausible.io/js/script.js";

  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src={plausibleScript}
          />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem("webowo-dark-mode");
                  if (theme === "true" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                    document.documentElement.classList.add("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300`}>
        <Providers>
          {children}
        </Providers>
        <ServiceWorker />
      </body>
    </html>
  );
}

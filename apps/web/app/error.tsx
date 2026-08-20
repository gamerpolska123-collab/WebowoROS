"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error.message, error.digest || "");
    }
    // Log to Sentry or similar in production
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl" />
          <div className="relative bg-white dark:bg-neutral-900 rounded-full p-6 shadow-xl">
            <AlertTriangle className="w-16 h-16 text-amber-500" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-3">
          Coś poszło nie tak
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-2">
          {error.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."}
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-8 font-mono">
            ID błędu: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Spróbuj ponownie
          </button>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
          >
            <Home className="w-4 h-4" />
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}

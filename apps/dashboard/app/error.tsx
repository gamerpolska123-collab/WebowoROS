"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Dashboard ErrorBoundary]', error.message, error.digest || '');
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center max-w-md px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Błąd panelu</h2>
        <p className="text-neutral-600 mb-6">
          {error.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}

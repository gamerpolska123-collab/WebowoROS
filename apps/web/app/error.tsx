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
    console.error("Web error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold text-red-500 mb-4">Coś poszło nie tak</h1>
        <p className="text-neutral-400 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}

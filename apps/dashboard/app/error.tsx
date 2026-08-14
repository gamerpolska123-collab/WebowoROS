"use client";

import { useEffect } from "react";
import { Button } from "@ros/ui";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-black text-red-500 mb-4">💥 Ups!</h1>
        <p className="text-lg text-white mb-2">Coś poszło nie tak</p>
        <p className="text-neutral-400 text-sm mb-6">{error.message}</p>
        <Button onClick={reset}>Spróbuj ponownie</Button>
      </div>
    </div>
  );
}

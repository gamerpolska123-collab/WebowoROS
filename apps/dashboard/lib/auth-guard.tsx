"use client";

import { useLayoutEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

const PUBLIC_PATHS = ["/login", "/forbidden"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }

    if (user && !isPublic) {
      const allowed = ["admin", "kitchen", "driver"];
      if (!allowed.includes(user.role)) {
        router.replace("/forbidden");
        return;
      }
    }

    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  // Na publicznych ścieżkach renderuj od razu
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  // Niezalogowany na chronionej ścieżce — nie renderuj (redirect w useEffect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

const PUBLIC_AUTH_PATHS = ["/login", "/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const isPublicAuthRoute = PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setReady(true);
    });

    void useAuthStore.persist.rehydrate();

    return unsub;
  }, []);

  if (!ready && !isPublicAuthRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <p className="text-sm text-gray-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}

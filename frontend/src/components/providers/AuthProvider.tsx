"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}

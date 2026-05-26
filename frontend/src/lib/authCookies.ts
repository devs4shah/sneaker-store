import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/constants";
import type { UserRole } from "@/types/auth";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function setAuthCookies(accessToken: string, role: UserRole) {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:";
  const base = `path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure ? "; Secure" : ""}`;

  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; ${base}`;
  document.cookie = `${AUTH_ROLE_COOKIE}=${encodeURIComponent(role)}; ${base}`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;

  const expire = "path=/; max-age=0";
  document.cookie = `${AUTH_TOKEN_COOKIE}=; ${expire}`;
  document.cookie = `${AUTH_ROLE_COOKIE}=; ${expire}`;
}

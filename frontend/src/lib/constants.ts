export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const AUTH_STORAGE_KEY = "prosneaker-auth";
export const AUTH_TOKEN_COOKIE = "prosneaker-token";
export const AUTH_ROLE_COOKIE = "prosneaker-role";

export const ADMIN_ROLE = "ROLE_ADMIN" as const;

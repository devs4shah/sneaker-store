import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import type { ApiErrorBody } from "@/types/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_PUBLIC_PATHS = ["/login", "/register"];

function shouldRedirectToLogin(pathname: string): boolean {
  return !AUTH_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      useCartStore.getState().reset();
      useWishlistStore.getState().reset();
      if (typeof window !== "undefined" && shouldRedirectToLogin(window.location.pathname)) {
        const callbackUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?callbackUrl=${callbackUrl}`;
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message;
    if (message) {
      return message;
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please check your connection and try again.";
    }
    return error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string> | null {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data;
    }
  }
  return null;
}

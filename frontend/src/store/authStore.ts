import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearAuthCookies, setAuthCookies } from "@/lib/authCookies";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import type { User, UserRole } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  isAuthenticated: boolean;
  setAuth: (payload: {
    user: User;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  }) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenType: "Bearer",
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken, tokenType }) => {
        setAuthCookies(accessToken, user.role);
        set({
          user,
          accessToken,
          refreshToken,
          tokenType,
          isAuthenticated: true,
        });
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        clearAuthCookies();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          tokenType: "Bearer",
          isAuthenticated: false,
        });
      },

      isAdmin: () => get().user?.role === ("ROLE_ADMIN" as UserRole),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => () => {
        const { accessToken, user } = useAuthStore.getState();
        if (accessToken && user) {
          setAuthCookies(accessToken, user.role);
        }
      },
    },
  ),
);

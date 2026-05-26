import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  AuthData,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthData> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(
      "/api/auth/login",
      payload,
    );
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthData> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(
      "/api/auth/register",
      payload,
    );
    return data.data;
  },

  async refresh(refreshToken: string): Promise<AuthData> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(
      "/api/auth/refresh",
      { refreshToken },
    );
    return data.data;
  },
};

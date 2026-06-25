import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/auth";
import type { ChangePasswordFormValues, ProfileFormValues } from "@/lib/validations/profile";

export const userService = {
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>("/api/users/profile");
    return data.data;
  },

  async updateProfile(payload: ProfileFormValues): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>("/api/users/profile", payload);
    return data.data;
  },

  async changePassword(payload: Pick<ChangePasswordFormValues, "currentPassword" | "newPassword">): Promise<void> {
    await apiClient.put<ApiResponse<null>>("/api/users/change-password", payload);
  },
};

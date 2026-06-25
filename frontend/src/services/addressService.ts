import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Address, AddressPayload } from "@/types/address";

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const { data } = await apiClient.get<ApiResponse<Address[]>>("/api/users/addresses");
    return data.data;
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    const { data } = await apiClient.post<ApiResponse<Address>>("/api/users/addresses", payload);
    return data.data;
  },

  async updateAddress(id: string, payload: AddressPayload): Promise<Address> {
    const { data } = await apiClient.put<ApiResponse<Address>>(`/api/users/addresses/${id}`, payload);
    return data.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/api/users/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const { data } = await apiClient.put<ApiResponse<Address>>(`/api/users/addresses/${id}/default`);
    return data.data;
  },
};

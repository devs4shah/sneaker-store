import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { CreateOrderRequest, Order } from "@/types/order";

export const orderService = {
  async checkout(request: CreateOrderRequest): Promise<Order> {
    const { data } = await apiClient.post<ApiResponse<Order>>("/api/orders/checkout", request);
    return data.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/api/orders/${orderId}`);
    return data.data;
  },
};

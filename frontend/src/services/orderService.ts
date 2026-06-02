import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { CreateOrderRequest, Order, OrderListItem, PageResponse } from "@/types/order";

export const orderService = {
  async checkout(request: CreateOrderRequest): Promise<Order> {
    const { data } = await apiClient.post<ApiResponse<Order>>("/api/orders/checkout", request);
    return data.data;
  },

  async getMyOrders(page = 0, size = 20): Promise<PageResponse<OrderListItem>> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<OrderListItem>>>(
      "/api/orders",
      { params: { page, size, sort: "createdAt,desc" } },
    );
    return data.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/api/orders/${orderId}`);
    return data.data;
  },

  async getMyOrdersWithItems(page = 0, size = 20): Promise<Order[]> {
    const list = await this.getMyOrders(page, size);
    if (list.content.length === 0) {
      return [];
    }
    return Promise.all(list.content.map((summary) => this.getOrder(summary.id)));
  },
};

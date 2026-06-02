import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Order } from "@/types/order";
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderStatus,
  AdminPaymentStatus,
  PageResponse,
} from "@/types/adminOrder";

interface AdminOrdersQuery {
  page: number;
  size: number;
  orderStatus?: AdminOrderStatus;
  paymentStatus?: AdminPaymentStatus;
}

export const adminOrderService = {
  async getOrders(query: AdminOrdersQuery): Promise<PageResponse<AdminOrderListItem>> {
    const { page, size, orderStatus, paymentStatus } = query;
    const { data } = await apiClient.get<ApiResponse<PageResponse<AdminOrderListItem>>>(
      "/api/admin/orders",
      {
        params: {
          page,
          size,
          sort: "createdAt,desc",
          ...(orderStatus ? { orderStatus } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
        },
      },
    );
    return data.data;
  },

  async getOrder(orderId: string): Promise<AdminOrderDetail> {
    const { data } = await apiClient.get<ApiResponse<AdminOrderDetail>>(
      `/api/admin/orders/${orderId}`,
    );
    return data.data;
  },

  async updateOrderStatus(orderId: string, status: AdminOrderStatus): Promise<Order> {
    const { data } = await apiClient.patch<ApiResponse<Order>>(
      `/api/admin/orders/${orderId}/status`,
      { status },
    );
    return data.data;
  },
};

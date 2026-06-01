import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Order } from "@/types/order";
import type {
  PaymentFailureRequest,
  RazorpayOrderPayload,
  VerifyPaymentRequest,
} from "@/types/payment";

export const paymentService = {
  async createPaymentOrder(orderId: string): Promise<RazorpayOrderPayload> {
    const { data } = await apiClient.post<ApiResponse<RazorpayOrderPayload>>(
      "/api/payments/create-order",
      { orderId },
    );
    return data.data;
  },

  async verifyPayment(request: VerifyPaymentRequest): Promise<Order> {
    const { data } = await apiClient.post<ApiResponse<Order>>("/api/payments/verify", request);
    return data.data;
  },

  async reportPaymentFailure(request: PaymentFailureRequest): Promise<Order> {
    const { data } = await apiClient.post<ApiResponse<Order>>("/api/payments/failure", request);
    return data.data;
  },
};

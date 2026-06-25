import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  AdminAnalyticsData,
  AnalyticsSummary,
  CouponAnalytics,
  LowStockAnalytics,
  MonthlySales,
  PaymentBreakdown,
  TopCategoryAnalytics,
  TopProductAnalytics,
  UserSpendAnalytics,
} from "@/types/adminAnalytics";

export const adminAnalyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    const { data } = await apiClient.get<ApiResponse<AnalyticsSummary>>(
      "/api/admin/analytics/summary",
    );
    return data.data;
  },

  async getMonthlySales(): Promise<MonthlySales[]> {
    const { data } = await apiClient.get<ApiResponse<MonthlySales[]>>(
      "/api/admin/analytics/monthly-sales",
    );
    return data.data;
  },

  async getTopProducts(): Promise<TopProductAnalytics[]> {
    const { data } = await apiClient.get<ApiResponse<TopProductAnalytics[]>>(
      "/api/admin/analytics/top-products",
    );
    return data.data;
  },

  async getTopCategories(): Promise<TopCategoryAnalytics[]> {
    const { data } = await apiClient.get<ApiResponse<TopCategoryAnalytics[]>>(
      "/api/admin/analytics/top-categories",
    );
    return data.data;
  },

  async getPaymentBreakdown(): Promise<PaymentBreakdown[]> {
    const { data } = await apiClient.get<ApiResponse<PaymentBreakdown[]>>(
      "/api/admin/analytics/payment-breakdown",
    );
    return data.data;
  },

  async getCouponAnalytics(): Promise<CouponAnalytics[]> {
    const { data } = await apiClient.get<ApiResponse<CouponAnalytics[]>>(
      "/api/admin/analytics/coupons",
    );
    return data.data;
  },

  async getLowStock(): Promise<LowStockAnalytics[]> {
    const { data } = await apiClient.get<ApiResponse<LowStockAnalytics[]>>(
      "/api/admin/analytics/low-stock",
    );
    return data.data;
  },

  async getUsers(): Promise<UserSpendAnalytics[]> {
    const { data } = await apiClient.get<ApiResponse<UserSpendAnalytics[]>>(
      "/api/admin/analytics/users",
    );
    return data.data;
  },

  async getAll(): Promise<AdminAnalyticsData> {
    const [
      summary,
      monthlySales,
      topProducts,
      topCategories,
      paymentBreakdown,
      coupons,
      lowStock,
      users,
    ] = await Promise.all([
      this.getSummary(),
      this.getMonthlySales(),
      this.getTopProducts(),
      this.getTopCategories(),
      this.getPaymentBreakdown(),
      this.getCouponAnalytics(),
      this.getLowStock(),
      this.getUsers(),
    ]);

    return {
      summary,
      monthlySales,
      topProducts,
      topCategories,
      paymentBreakdown,
      coupons,
      lowStock,
      users,
    };
  },
};

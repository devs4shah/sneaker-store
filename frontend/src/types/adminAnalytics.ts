export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

export interface MonthlySales {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProductAnalytics {
  sneakerId: string;
  sneakerName: string;
  quantitySold: number;
  revenueGenerated: number;
}

export interface TopCategoryAnalytics {
  category: string;
  productsSold: number;
  revenueGenerated: number;
}

export interface PaymentBreakdown {
  paymentMethod: string;
  orderCount: number;
  revenue: number;
}

export interface CouponAnalytics {
  couponCode: string;
  usageCount: number;
  totalDiscountProvided: number;
}

export interface LowStockAnalytics {
  sneakerId: string;
  sneakerName: string;
  brand: string;
  stockQuantity: number;
}

export interface UserSpendAnalytics {
  userId: string;
  email: string;
  totalSpend: number;
}

export interface AdminAnalyticsData {
  summary: AnalyticsSummary;
  monthlySales: MonthlySales[];
  topProducts: TopProductAnalytics[];
  topCategories: TopCategoryAnalytics[];
  paymentBreakdown: PaymentBreakdown[];
  coupons: CouponAnalytics[];
  lowStock: LowStockAnalytics[];
  users: UserSpendAnalytics[];
}

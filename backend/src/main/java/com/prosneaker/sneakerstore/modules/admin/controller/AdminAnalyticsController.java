package com.prosneaker.sneakerstore.modules.admin.controller;

import com.prosneaker.sneakerstore.modules.admin.dto.AnalyticsSummaryResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.CouponAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.LowStockAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.MonthlySalesResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.PaymentBreakdownResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.TopCategoryAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.TopProductAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.UserSpendAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.service.AnalyticsService;
import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ApiResponse<AnalyticsSummaryResponse> getSummary() {
        return ApiResponse.success(analyticsService.getSummary());
    }

    @GetMapping("/monthly-sales")
    public ApiResponse<List<MonthlySalesResponse>> getMonthlySales() {
        return ApiResponse.success(analyticsService.getMonthlySales());
    }

    @GetMapping("/top-products")
    public ApiResponse<List<TopProductAnalyticsResponse>> getTopProducts() {
        return ApiResponse.success(analyticsService.getTopProducts());
    }

    @GetMapping("/top-categories")
    public ApiResponse<List<TopCategoryAnalyticsResponse>> getTopCategories() {
        return ApiResponse.success(analyticsService.getTopCategories());
    }

    @GetMapping("/payment-breakdown")
    public ApiResponse<List<PaymentBreakdownResponse>> getPaymentBreakdown() {
        return ApiResponse.success(analyticsService.getPaymentBreakdown());
    }

    @GetMapping("/coupons")
    public ApiResponse<List<CouponAnalyticsResponse>> getCouponAnalytics() {
        return ApiResponse.success(analyticsService.getCouponAnalytics());
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<LowStockAnalyticsResponse>> getLowStockProducts() {
        return ApiResponse.success(analyticsService.getLowStockProducts());
    }

    @GetMapping("/users")
    public ApiResponse<List<UserSpendAnalyticsResponse>> getUserSpending() {
        return ApiResponse.success(analyticsService.getUserSpending());
    }
}

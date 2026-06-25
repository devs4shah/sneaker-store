package com.prosneaker.sneakerstore.modules.admin.service;

import com.prosneaker.sneakerstore.modules.admin.dto.AnalyticsSummaryResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.CouponAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.LowStockAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.MonthlySalesResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.PaymentBreakdownResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.TopCategoryAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.TopProductAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.UserSpendAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int TOP_ITEMS_LIMIT = 10;

    private final AnalyticsRepository analyticsRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary() {
        return AnalyticsSummaryResponse.builder()
                .totalRevenue(analyticsRepository.getTotalRevenue())
                .totalOrders(analyticsRepository.countOrders())
                .totalUsers(analyticsRepository.countUsers())
                .totalProducts(analyticsRepository.countProducts())
                .build();
    }

    @Transactional(readOnly = true)
    public List<MonthlySalesResponse> getMonthlySales() {
        Map<YearMonth, MonthlySalesResponse> salesByMonth = new HashMap<>();

        for (Map<String, Object> row : analyticsRepository.getMonthlySalesRaw()) {
            int year = ((Number) row.get("year")).intValue();
            int month = ((Number) row.get("month_num")).intValue();
            YearMonth yearMonth = YearMonth.of(year, month);

            salesByMonth.put(
                    yearMonth,
                    MonthlySalesResponse.builder()
                            .month(formatMonthLabel(month))
                            .revenue(toBigDecimal(row.get("revenue")))
                            .orders(((Number) row.get("orders")).longValue())
                            .build());
        }

        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        List<MonthlySalesResponse> result = new ArrayList<>();

        for (int i = 11; i >= 0; i--) {
            YearMonth yearMonth = currentMonth.minusMonths(i);
            MonthlySalesResponse existing = salesByMonth.get(yearMonth);

            if (existing != null) {
                result.add(existing);
            } else {
                result.add(MonthlySalesResponse.builder()
                        .month(formatMonthLabel(yearMonth.getMonthValue()))
                        .revenue(BigDecimal.ZERO)
                        .orders(0L)
                        .build());
            }
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<TopProductAnalyticsResponse> getTopProducts() {
        return analyticsRepository.getTopProducts(TOP_ITEMS_LIMIT);
    }

    @Transactional(readOnly = true)
    public List<TopCategoryAnalyticsResponse> getTopCategories() {
        return analyticsRepository.getTopCategories(TOP_ITEMS_LIMIT);
    }

    @Transactional(readOnly = true)
    public List<PaymentBreakdownResponse> getPaymentBreakdown() {
        return analyticsRepository.getPaymentBreakdown();
    }

    @Transactional(readOnly = true)
    public List<CouponAnalyticsResponse> getCouponAnalytics() {
        return analyticsRepository.getCouponAnalytics();
    }

    @Transactional(readOnly = true)
    public List<LowStockAnalyticsResponse> getLowStockProducts() {
        return analyticsRepository.getLowStockProducts();
    }

    @Transactional(readOnly = true)
    public List<UserSpendAnalyticsResponse> getUserSpending() {
        return analyticsRepository.getUserSpending();
    }

    private static String formatMonthLabel(int month) {
        return Month.of(month)
                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                .replace(".", "");
    }

    private static BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        return new BigDecimal(value.toString());
    }
}

package com.prosneaker.sneakerstore.modules.admin.repository;

import com.prosneaker.sneakerstore.modules.admin.dto.CouponAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.LowStockAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.PaymentBreakdownResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.TopCategoryAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.TopProductAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.UserSpendAnalyticsResponse;
import com.prosneaker.sneakerstore.modules.inventory.InventoryConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class AnalyticsRepository {

    private static final String PAID_ORDER_FILTER =
            "payment_status = 'PAID' AND order_status <> 'CANCELLED'";

    private static final String CUSTOMER_ROLE_FILTER = "role = 'ROLE_USER'";

    private final JdbcTemplate jdbcTemplate;

    public BigDecimal getTotalRevenue() {
        BigDecimal revenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE " + PAID_ORDER_FILTER,
                BigDecimal.class);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    public long countOrders() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE order_status <> 'CANCELLED'",
                Long.class);
        return count != null ? count : 0L;
    }

    public long countUsers() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE " + CUSTOMER_ROLE_FILTER,
                Long.class);
        return count != null ? count : 0L;
    }

    public long countProducts() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM sneakers", Long.class);
        return count != null ? count : 0L;
    }

    public List<Map<String, Object>> getMonthlySalesRaw() {
        return jdbcTemplate.queryForList("""
                SELECT
                    EXTRACT(YEAR FROM created_at) AS year,
                    EXTRACT(MONTH FROM created_at) AS month_num,
                    COALESCE(SUM(final_amount), 0) AS revenue,
                    COUNT(*) AS orders
                FROM orders
                WHERE %s
                  AND created_at >= date_trunc('month', CURRENT_TIMESTAMP) - INTERVAL '11 months'
                GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
                ORDER BY year, month_num
                """.formatted(PAID_ORDER_FILTER));
    }

    public List<TopProductAnalyticsResponse> getTopProducts(int limit) {
        return jdbcTemplate.query(
                """
                        SELECT
                            oi.sneaker_id,
                            oi.sneaker_name,
                            COALESCE(SUM(oi.quantity), 0) AS quantity_sold,
                            COALESCE(SUM(oi.sneaker_price * oi.quantity), 0) AS revenue_generated
                        FROM order_items oi
                        INNER JOIN orders o ON o.id = oi.order_id
                        WHERE %s
                        GROUP BY oi.sneaker_id, oi.sneaker_name
                        ORDER BY quantity_sold DESC, revenue_generated DESC
                        LIMIT ?
                        """.formatted(PAID_ORDER_FILTER),
                (rs, rowNum) -> TopProductAnalyticsResponse.builder()
                        .sneakerId(UUID.fromString(rs.getString("sneaker_id")))
                        .sneakerName(rs.getString("sneaker_name"))
                        .quantitySold(rs.getLong("quantity_sold"))
                        .revenueGenerated(rs.getBigDecimal("revenue_generated"))
                        .build(),
                limit);
    }

    public List<TopCategoryAnalyticsResponse> getTopCategories(int limit) {
        return jdbcTemplate.query(
                """
                        SELECT
                            c.name AS category,
                            COALESCE(SUM(oi.quantity), 0) AS products_sold,
                            COALESCE(SUM(oi.sneaker_price * oi.quantity), 0) AS revenue_generated
                        FROM order_items oi
                        INNER JOIN orders o ON o.id = oi.order_id
                        INNER JOIN sneakers s ON s.id = oi.sneaker_id
                        INNER JOIN categories c ON c.id = s.category_id
                        WHERE %s
                        GROUP BY c.name
                        ORDER BY revenue_generated DESC, products_sold DESC
                        LIMIT ?
                        """.formatted(PAID_ORDER_FILTER),
                (rs, rowNum) -> TopCategoryAnalyticsResponse.builder()
                        .category(rs.getString("category"))
                        .productsSold(rs.getLong("products_sold"))
                        .revenueGenerated(rs.getBigDecimal("revenue_generated"))
                        .build(),
                limit);
    }

    public List<PaymentBreakdownResponse> getPaymentBreakdown() {
        return jdbcTemplate.query(
                """
                        SELECT
                            payment_status,
                            COUNT(*) AS order_count,
                            COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN final_amount ELSE 0 END), 0) AS revenue
                        FROM orders
                        GROUP BY payment_status
                        ORDER BY order_count DESC
                        """,
                (rs, rowNum) -> PaymentBreakdownResponse.builder()
                        .paymentMethod(formatPaymentMethod(rs.getString("payment_status")))
                        .orderCount(rs.getLong("order_count"))
                        .revenue(rs.getBigDecimal("revenue"))
                        .build());
    }

    public List<CouponAnalyticsResponse> getCouponAnalytics() {
        return jdbcTemplate.query(
                """
                        SELECT
                            oc.coupon_code,
                            COUNT(DISTINCT oc.order_id) AS usage_count,
                            COALESCE(SUM(oc.discount_amount), 0) AS total_discount
                        FROM order_coupons oc
                        INNER JOIN orders o ON o.id = oc.order_id
                        WHERE %s
                        GROUP BY oc.coupon_code
                        ORDER BY usage_count DESC, total_discount DESC
                        """.formatted(PAID_ORDER_FILTER),
                (rs, rowNum) -> CouponAnalyticsResponse.builder()
                        .couponCode(rs.getString("coupon_code"))
                        .usageCount(rs.getLong("usage_count"))
                        .totalDiscountProvided(rs.getBigDecimal("total_discount"))
                        .build());
    }

    public List<LowStockAnalyticsResponse> getLowStockProducts() {
        return jdbcTemplate.query(
                """
                        SELECT id, name, brand, stock_quantity
                        FROM sneakers
                        WHERE stock_quantity <= ?
                        ORDER BY stock_quantity ASC, name ASC
                        """,
                (rs, rowNum) -> LowStockAnalyticsResponse.builder()
                        .sneakerId(UUID.fromString(rs.getString("id")))
                        .sneakerName(rs.getString("name"))
                        .brand(rs.getString("brand"))
                        .stockQuantity(rs.getInt("stock_quantity"))
                        .build(),
                InventoryConstants.LOW_STOCK_THRESHOLD);
    }

    public List<UserSpendAnalyticsResponse> getUserSpending() {
        return jdbcTemplate.query(
                """
                        SELECT
                            u.id,
                            u.email,
                            COALESCE(SUM(o.final_amount), 0) AS total_spend
                        FROM users u
                        LEFT JOIN orders o ON o.user_id = u.id AND %s
                        WHERE %s
                        GROUP BY u.id, u.email
                        ORDER BY total_spend DESC, u.email ASC
                        """.formatted(PAID_ORDER_FILTER, CUSTOMER_ROLE_FILTER),
                (rs, rowNum) -> UserSpendAnalyticsResponse.builder()
                        .userId(UUID.fromString(rs.getString("id")))
                        .email(rs.getString("email"))
                        .totalSpend(rs.getBigDecimal("total_spend"))
                        .build());
    }

    private static String formatPaymentMethod(String paymentStatus) {
        return switch (paymentStatus) {
            case "PAID" -> "Razorpay (Paid)";
            case "PENDING" -> "Razorpay (Pending)";
            case "FAILED" -> "Razorpay (Failed)";
            case "REFUNDED" -> "Razorpay (Refunded)";
            default -> "Razorpay (" + paymentStatus + ")";
        };
    }
}

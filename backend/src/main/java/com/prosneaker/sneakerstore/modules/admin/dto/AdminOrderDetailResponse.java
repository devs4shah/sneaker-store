package com.prosneaker.sneakerstore.modules.admin.dto;

import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class AdminOrderDetailResponse {

    private final UUID orderId;
    private final String orderNumber;
    private final CustomerInfo customer;
    private final List<ItemInfo> items;
    private final BigDecimal totalAmount;
    private final List<CouponInfo> appliedCoupons;
    private final BigDecimal discountAmount;
    private final BigDecimal finalAmount;
    private final int totalQuantity;
    private final PaymentInfo payment;
    private final OrderStatus orderStatus;
    private final String shippingAddress;
    private final String city;
    private final String postalCode;
    private final String country;
    private final Instant createdAt;

    @Getter
    @Builder
    public static class CustomerInfo {
        private final UUID userId;
        private final String name;
        private final String email;
    }

    @Getter
    @Builder
    public static class ItemInfo {
        private final UUID itemId;
        private final UUID sneakerId;
        private final String sneakerName;
        private final int quantity;
        private final BigDecimal unitPrice;
        private final BigDecimal lineSubtotal;
        private final String imageUrl;
    }

    @Getter
    @Builder
    public static class CouponInfo {
        private final String couponCode;
        private final BigDecimal discountAmount;
    }

    @Getter
    @Builder
    public static class PaymentInfo {
        private final PaymentStatus paymentStatus;
        private final String razorpayOrderId;
        private final String razorpayPaymentId;
    }
}

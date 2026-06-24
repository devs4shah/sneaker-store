package com.prosneaker.sneakerstore.modules.orders.dto;

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
public class OrderResponse {

    private final UUID id;
    private final String orderNumber;
    private final BigDecimal totalAmount;
    private final List<OrderCouponResponse> appliedCoupons;
    private final BigDecimal discountAmount;
    private final BigDecimal finalAmount;
    private final OrderStatus orderStatus;
    private final PaymentStatus paymentStatus;
    private final String shippingAddress;
    private final String city;
    private final String postalCode;
    private final String country;
    private final int totalQuantity;
    private final List<OrderItemResponse> items;
    private final Instant createdAt;
}

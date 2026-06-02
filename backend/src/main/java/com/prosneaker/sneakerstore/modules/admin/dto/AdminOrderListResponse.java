package com.prosneaker.sneakerstore.modules.admin.dto;

import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class AdminOrderListResponse {

    private final UUID orderId;
    private final String customerName;
    private final String customerEmail;
    private final BigDecimal totalAmount;
    private final PaymentStatus paymentStatus;
    private final OrderStatus orderStatus;
    private final Instant createdAt;
}

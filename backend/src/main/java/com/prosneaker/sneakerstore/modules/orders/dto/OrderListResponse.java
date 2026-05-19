package com.prosneaker.sneakerstore.modules.orders.dto;

import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class OrderListResponse {

    private final UUID id;
    private final String orderNumber;
    private final BigDecimal totalAmount;
    private final OrderStatus orderStatus;
    private final PaymentStatus paymentStatus;
    private final int totalQuantity;
    private final Instant createdAt;
}

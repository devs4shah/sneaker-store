package com.prosneaker.sneakerstore.modules.orders.dto;

import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
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
    private final OrderStatus status;
    private final BigDecimal totalAmount;
    private final String shippingAddress;
    private final String city;
    private final String postalCode;
    private final String country;
    private final List<OrderItemResponse> items;
    private final Instant createdAt;
}

package com.prosneaker.sneakerstore.modules.orders.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class OrderItemResponse {

    private final UUID id;
    private final String sneakerName;
    private final BigDecimal sneakerPrice;
    private final int quantity;
    private final String imageUrl;
    private final BigDecimal lineSubtotal;
}

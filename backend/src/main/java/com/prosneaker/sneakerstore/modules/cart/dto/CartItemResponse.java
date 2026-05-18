package com.prosneaker.sneakerstore.modules.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class CartItemResponse {

    private final UUID id;
    private final UUID sneakerId;
    private final String sneakerName;
    private final String brand;
    private final String imageUrl;
    private final double sizeValue;
    private final int quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal subtotal;
}

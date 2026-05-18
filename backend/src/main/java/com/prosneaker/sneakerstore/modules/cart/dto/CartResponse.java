package com.prosneaker.sneakerstore.modules.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CartResponse {

    private final UUID id;
    private final List<CartItemResponse> items;
    private final int totalItems;
    private final BigDecimal totalAmount;
}

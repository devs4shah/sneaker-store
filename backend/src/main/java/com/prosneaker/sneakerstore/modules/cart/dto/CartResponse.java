package com.prosneaker.sneakerstore.modules.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CartResponse {

    private UUID id;
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal subtotal;
}

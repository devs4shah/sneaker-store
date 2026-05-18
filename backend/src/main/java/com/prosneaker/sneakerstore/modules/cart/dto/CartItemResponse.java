package com.prosneaker.sneakerstore.modules.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class CartItemResponse {

    private UUID id;
    private UUID sneakerId;
    private String sneakerName;
    private String brand;
    private String imageUrl;
    private double size;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}

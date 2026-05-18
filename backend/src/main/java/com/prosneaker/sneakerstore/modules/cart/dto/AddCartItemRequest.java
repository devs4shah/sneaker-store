package com.prosneaker.sneakerstore.modules.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddCartItemRequest {

    @NotNull(message = "Sneaker ID is required")
    private UUID sneakerId;

    @NotNull(message = "Size is required")
    private Double sizeValue;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}

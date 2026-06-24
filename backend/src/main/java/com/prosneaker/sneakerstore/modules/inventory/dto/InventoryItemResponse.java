package com.prosneaker.sneakerstore.modules.inventory.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class InventoryItemResponse {

    private final UUID sneakerId;
    private final String name;
    private final String brand;
    private final String categoryName;
    private final BigDecimal price;
    private final int stockQuantity;
    private final boolean lowStock;
    private final boolean outOfStock;
    private final StockStatus stockStatus;
}

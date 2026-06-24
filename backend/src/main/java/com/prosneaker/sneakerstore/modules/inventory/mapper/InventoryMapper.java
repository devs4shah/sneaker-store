package com.prosneaker.sneakerstore.modules.inventory.mapper;

import com.prosneaker.sneakerstore.modules.inventory.InventoryConstants;
import com.prosneaker.sneakerstore.modules.inventory.dto.InventoryItemResponse;
import com.prosneaker.sneakerstore.modules.inventory.dto.StockStatus;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public InventoryItemResponse toResponse(Sneaker sneaker) {
        int stock = sneaker.getStockQuantity();
        StockStatus status = resolveStatus(stock);

        return InventoryItemResponse.builder()
                .sneakerId(sneaker.getId())
                .name(sneaker.getName())
                .brand(sneaker.getBrand())
                .categoryName(sneaker.getCategory() != null ? sneaker.getCategory().getName() : null)
                .price(sneaker.getPrice())
                .stockQuantity(stock)
                .lowStock(status == StockStatus.LOW_STOCK)
                .outOfStock(status == StockStatus.OUT_OF_STOCK)
                .stockStatus(status)
                .build();
    }

    public StockStatus resolveStatus(int stockQuantity) {
        if (stockQuantity <= 0) {
            return StockStatus.OUT_OF_STOCK;
        }
        if (stockQuantity <= InventoryConstants.LOW_STOCK_THRESHOLD) {
            return StockStatus.LOW_STOCK;
        }
        return StockStatus.IN_STOCK;
    }
}

package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class LowStockAnalyticsResponse {

    private final UUID sneakerId;
    private final String sneakerName;
    private final String brand;
    private final int stockQuantity;
}

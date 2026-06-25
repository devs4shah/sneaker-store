package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class TopProductAnalyticsResponse {

    private final UUID sneakerId;
    private final String sneakerName;
    private final long quantitySold;
    private final BigDecimal revenueGenerated;
}

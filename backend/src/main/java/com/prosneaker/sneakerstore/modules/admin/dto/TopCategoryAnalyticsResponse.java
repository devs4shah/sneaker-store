package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TopCategoryAnalyticsResponse {

    private final String category;
    private final long productsSold;
    private final BigDecimal revenueGenerated;
}

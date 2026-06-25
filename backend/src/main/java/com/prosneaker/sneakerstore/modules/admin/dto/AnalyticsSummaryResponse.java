package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AnalyticsSummaryResponse {

    private final BigDecimal totalRevenue;
    private final long totalOrders;
    private final long totalUsers;
    private final long totalProducts;
}

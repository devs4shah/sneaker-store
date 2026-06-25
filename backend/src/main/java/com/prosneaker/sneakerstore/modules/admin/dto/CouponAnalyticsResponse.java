package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CouponAnalyticsResponse {

    private final String couponCode;
    private final long usageCount;
    private final BigDecimal totalDiscountProvided;
}

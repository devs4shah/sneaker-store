package com.prosneaker.sneakerstore.modules.coupons.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CouponValidationResponse {

    private final boolean valid;
    private final String message;
    private final List<AppliedCouponLineResponse> appliedCoupons;
    private final BigDecimal discount;
    private final BigDecimal finalAmount;
}

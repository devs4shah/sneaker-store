package com.prosneaker.sneakerstore.modules.coupons.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AppliedCouponResult {

    private final List<AppliedCouponLineResponse> appliedCoupons;
    private final BigDecimal discountAmount;
    private final BigDecimal finalAmount;
}

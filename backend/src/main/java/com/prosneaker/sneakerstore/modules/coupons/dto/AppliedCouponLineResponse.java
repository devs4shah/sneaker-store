package com.prosneaker.sneakerstore.modules.coupons.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AppliedCouponLineResponse {

    private final String couponCode;
    private final BigDecimal discountAmount;
}

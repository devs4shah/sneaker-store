package com.prosneaker.sneakerstore.modules.coupons.dto;

import com.prosneaker.sneakerstore.modules.coupons.entity.CouponType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AvailableCouponResponse {

    private final String code;
    private final CouponType couponType;
    private final BigDecimal discountValue;
    private final BigDecimal minimumOrderAmount;
    private final BigDecimal maximumDiscount;
    private final boolean applicable;
    private final String unavailableReason;
}

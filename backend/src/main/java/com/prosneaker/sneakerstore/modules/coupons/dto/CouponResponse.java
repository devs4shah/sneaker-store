package com.prosneaker.sneakerstore.modules.coupons.dto;

import com.prosneaker.sneakerstore.modules.coupons.entity.CouponType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class CouponResponse {

    private final UUID id;
    private final String code;
    private final CouponType couponType;
    private final BigDecimal discountValue;
    private final BigDecimal minimumOrderAmount;
    private final BigDecimal maximumDiscount;
    private final Integer usageLimit;
    private final int usedCount;
    private final Instant validFrom;
    private final Instant validUntil;
    private final boolean active;
    private final Instant createdAt;
    private final Instant updatedAt;
}

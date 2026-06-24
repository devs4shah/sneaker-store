package com.prosneaker.sneakerstore.modules.orders.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class OrderCouponResponse {

    private final String couponCode;
    private final BigDecimal discountAmount;
}

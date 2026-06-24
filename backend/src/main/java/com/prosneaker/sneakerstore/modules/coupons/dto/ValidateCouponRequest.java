package com.prosneaker.sneakerstore.modules.coupons.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ValidateCouponRequest {

    @NotNull(message = "Cart total is required")
    @DecimalMin(value = "0.00", message = "Cart total cannot be negative")
    private BigDecimal cartTotal;

    @NotNull(message = "Coupon codes are required")
    private List<String> couponCodes = new ArrayList<>();
}

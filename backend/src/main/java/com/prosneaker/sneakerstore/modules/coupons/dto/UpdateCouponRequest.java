package com.prosneaker.sneakerstore.modules.coupons.dto;

import com.prosneaker.sneakerstore.modules.coupons.entity.CouponType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class UpdateCouponRequest {

    @Size(max = 50)
    private String code;

    private CouponType couponType;

    @DecimalMin(value = "0.01", message = "Discount value must be greater than zero")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
    private BigDecimal minimumOrderAmount;

    @DecimalMin(value = "0.01", message = "Maximum discount must be greater than zero")
    private BigDecimal maximumDiscount;

    private Integer usageLimit;

    private Instant validFrom;

    private Instant validUntil;

    private Boolean active;
}

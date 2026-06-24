package com.prosneaker.sneakerstore.modules.coupons.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.AvailableCouponResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.CouponValidationResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.ValidateCouponRequest;
import com.prosneaker.sneakerstore.modules.coupons.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ApiResponse<CouponValidationResponse> validateCoupon(@Valid @RequestBody ValidateCouponRequest request) {
        return ApiResponse.success(couponService.validateCoupon(request));
    }

    @GetMapping("/available")
    public ApiResponse<List<AvailableCouponResponse>> getAvailableCoupons(
            @RequestParam(defaultValue = "0") BigDecimal cartTotal,
            @RequestParam(required = false) List<String> appliedCouponCodes) {
        return ApiResponse.success(couponService.getAvailableCoupons(cartTotal, appliedCouponCodes));
    }
}

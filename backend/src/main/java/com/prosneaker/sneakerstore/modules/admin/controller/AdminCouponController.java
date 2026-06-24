package com.prosneaker.sneakerstore.modules.admin.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.CouponResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.CreateCouponRequest;
import com.prosneaker.sneakerstore.modules.coupons.dto.UpdateCouponRequest;
import com.prosneaker.sneakerstore.modules.coupons.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CouponResponse> createCoupon(@Valid @RequestBody CreateCouponRequest request) {
        return ApiResponse.success("Coupon created successfully", couponService.createCoupon(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<CouponResponse>> listCoupons(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(couponService.getCoupons(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CouponResponse> getCoupon(@PathVariable UUID id) {
        return ApiResponse.success(couponService.getCouponById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<CouponResponse> updateCoupon(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCouponRequest request) {
        return ApiResponse.success("Coupon updated successfully", couponService.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
    }
}

package com.prosneaker.sneakerstore.modules.coupons.service;

import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.coupons.dto.AppliedCouponLineResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.AppliedCouponResult;
import com.prosneaker.sneakerstore.modules.coupons.dto.AvailableCouponResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.CouponResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.CouponValidationResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.CreateCouponRequest;
import com.prosneaker.sneakerstore.modules.coupons.dto.UpdateCouponRequest;
import com.prosneaker.sneakerstore.modules.coupons.dto.ValidateCouponRequest;
import com.prosneaker.sneakerstore.modules.coupons.entity.Coupon;
import com.prosneaker.sneakerstore.modules.coupons.entity.CouponType;
import com.prosneaker.sneakerstore.modules.coupons.mapper.CouponMapper;
import com.prosneaker.sneakerstore.modules.coupons.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    @Transactional
    public CouponResponse createCoupon(CreateCouponRequest request) {
        validateDateRange(request.getValidFrom(), request.getValidUntil());
        validateCouponTypeRules(request.getCouponType(), request.getDiscountValue(), request.getMaximumDiscount());

        String normalizedCode = normalizeCode(request.getCode());
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(normalizedCode)
                .couponType(request.getCouponType())
                .discountValue(request.getDiscountValue())
                .minimumOrderAmount(defaultAmount(request.getMinimumOrderAmount()))
                .maximumDiscount(request.getMaximumDiscount())
                .usageLimit(request.getUsageLimit())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .active(request.getActive() == null || request.getActive())
                .build();

        return couponMapper.toResponse(couponRepository.save(coupon));
    }

    @Transactional(readOnly = true)
    public PageResponse<CouponResponse> getCoupons(Pageable pageable) {
        Page<Coupon> page = couponRepository.findAll(pageable);
        return PageMapper.toPageResponse(page, couponMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(UUID id) {
        return couponMapper.toResponse(findCoupon(id));
    }

    @Transactional
    public CouponResponse updateCoupon(UUID id, UpdateCouponRequest request) {
        Coupon coupon = findCoupon(id);

        if (request.getCode() != null) {
            String normalizedCode = normalizeCode(request.getCode());
            if (!normalizedCode.equalsIgnoreCase(coupon.getCode())
                    && couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
                throw new BusinessException(ErrorCode.CONFLICT, "Coupon code already exists");
            }
            coupon.setCode(normalizedCode);
        }

        CouponType couponType = request.getCouponType() != null ? request.getCouponType() : coupon.getCouponType();
        BigDecimal discountValue = request.getDiscountValue() != null
                ? request.getDiscountValue()
                : coupon.getDiscountValue();
        BigDecimal maximumDiscount = request.getMaximumDiscount() != null
                ? request.getMaximumDiscount()
                : coupon.getMaximumDiscount();

        validateCouponTypeRules(couponType, discountValue, maximumDiscount);

        if (request.getCouponType() != null) {
            coupon.setCouponType(request.getCouponType());
        }
        if (request.getDiscountValue() != null) {
            coupon.setDiscountValue(request.getDiscountValue());
        }
        if (request.getMinimumOrderAmount() != null) {
            coupon.setMinimumOrderAmount(request.getMinimumOrderAmount());
        }
        if (request.getMaximumDiscount() != null) {
            coupon.setMaximumDiscount(request.getMaximumDiscount());
        }
        if (request.getUsageLimit() != null) {
            coupon.setUsageLimit(request.getUsageLimit());
        }

        Instant validFrom = request.getValidFrom() != null ? request.getValidFrom() : coupon.getValidFrom();
        Instant validUntil = request.getValidUntil() != null ? request.getValidUntil() : coupon.getValidUntil();
        validateDateRange(validFrom, validUntil);

        if (request.getValidFrom() != null) {
            coupon.setValidFrom(request.getValidFrom());
        }
        if (request.getValidUntil() != null) {
            coupon.setValidUntil(request.getValidUntil());
        }
        if (request.getActive() != null) {
            coupon.setActive(request.getActive());
        }

        return couponMapper.toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        Coupon coupon = findCoupon(id);
        couponRepository.delete(coupon);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(ValidateCouponRequest request) {
        return validateCoupons(request.getCouponCodes(), request.getCartTotal());
    }

    @Transactional(readOnly = true)
    public List<AvailableCouponResponse> getAvailableCoupons(BigDecimal cartTotal, List<String> appliedCouponCodes) {
        BigDecimal normalizedTotal = normalizeAmount(cartTotal);
        List<String> normalizedApplied = normalizeCouponCodes(appliedCouponCodes);
        Set<String> appliedSet = new HashSet<>(normalizedApplied);
        Instant now = Instant.now();

        CouponValidationResponse currentStack = validateCoupons(normalizedApplied, normalizedTotal);
        BigDecimal runningBalance = currentStack.getFinalAmount();

        return couponRepository.findCurrentlyAvailableCoupons(now).stream()
                .filter(coupon -> !appliedSet.contains(coupon.getCode().toUpperCase(Locale.ROOT)))
                .map(coupon -> toAvailableCouponResponse(coupon, normalizedTotal, runningBalance))
                .toList();
    }

    @Transactional
    public AppliedCouponResult applyCouponsToOrder(List<String> couponCodes, BigDecimal subtotal) {
        CouponValidationResponse validation = validateCoupons(couponCodes, subtotal);
        if (!validation.isValid()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, validation.getMessage());
        }
        return toAppliedCouponResult(validation);
    }

    @Transactional
    public AppliedCouponResult revalidateAndApplyForPayment(List<String> couponCodes, BigDecimal subtotal) {
        return applyCouponsToOrder(couponCodes, subtotal);
    }

    @Transactional
    public void incrementUsageAfterPayment(List<String> couponCodes) {
        if (couponCodes == null || couponCodes.isEmpty()) {
            return;
        }

        for (String couponCode : normalizeCouponCodes(couponCodes)) {
            Coupon coupon = couponRepository.findByCodeForUpdate(couponCode)
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Coupon not found"));

            if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Coupon usage limit exceeded");
            }

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }
    }

    private CouponValidationResponse validateCoupons(List<String> rawCouponCodes, BigDecimal cartTotal) {
        BigDecimal subtotal = normalizeAmount(cartTotal);
        List<String> couponCodes = normalizeCouponCodes(rawCouponCodes);

        if (couponCodes.isEmpty()) {
            return validStackResponse(List.of(), BigDecimal.ZERO, subtotal);
        }

        Set<String> seenCodes = new LinkedHashSet<>();
        for (String code : couponCodes) {
            if (!seenCodes.add(code)) {
                return invalidResponse("Coupon already applied: " + code, subtotal);
            }
        }

        List<AppliedCouponLineResponse> appliedLines = new ArrayList<>();
        BigDecimal runningBalance = subtotal;
        BigDecimal totalDiscount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (String code : couponCodes) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(code).orElse(null);
            if (coupon == null) {
                return invalidResponse("Coupon invalid", subtotal);
            }

            String eligibilityError = validateCouponEligibility(coupon, subtotal);
            if (eligibilityError != null) {
                return invalidResponse(eligibilityError, subtotal);
            }

            if (runningBalance.compareTo(BigDecimal.ZERO) <= 0) {
                return invalidResponse("No remaining balance to apply coupon " + coupon.getCode(), subtotal);
            }

            BigDecimal lineDiscount = calculateDiscount(coupon, runningBalance);
            if (lineDiscount.compareTo(BigDecimal.ZERO) <= 0) {
                return invalidResponse("Coupon " + coupon.getCode() + " does not reduce the order total", subtotal);
            }

            runningBalance = runningBalance.subtract(lineDiscount).max(BigDecimal.ZERO);
            totalDiscount = totalDiscount.add(lineDiscount);
            appliedLines.add(AppliedCouponLineResponse.builder()
                    .couponCode(coupon.getCode())
                    .discountAmount(lineDiscount)
                    .build());
        }

        return validStackResponse(appliedLines, totalDiscount, runningBalance);
    }

    private CouponValidationResponse validStackResponse(
            List<AppliedCouponLineResponse> appliedLines,
            BigDecimal totalDiscount,
            BigDecimal finalAmount) {
        return CouponValidationResponse.builder()
                .valid(true)
                .message(appliedLines.isEmpty() ? "No coupons applied" : "Coupons applied successfully")
                .appliedCoupons(appliedLines)
                .discount(totalDiscount.setScale(2, RoundingMode.HALF_UP))
                .finalAmount(finalAmount.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private String validateCouponEligibility(Coupon coupon, BigDecimal originalSubtotal) {
        if (!coupon.isActive()) {
            return "Coupon invalid";
        }

        Instant now = Instant.now();
        if (now.isBefore(coupon.getValidFrom())) {
            return "Coupon is not active yet";
        }
        if (now.isAfter(coupon.getValidUntil())) {
            return "Coupon expired";
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return "Coupon usage limit exceeded";
        }

        if (originalSubtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            return "Minimum order not met";
        }

        return null;
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal amountAfterPriorCoupons) {
        BigDecimal discount = switch (coupon.getCouponType()) {
            case FIXED -> coupon.getDiscountValue().min(amountAfterPriorCoupons);
            case PERCENTAGE -> amountAfterPriorCoupons
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        };

        if (coupon.getCouponType() == CouponType.PERCENTAGE && coupon.getMaximumDiscount() != null) {
            discount = discount.min(coupon.getMaximumDiscount());
        }

        return discount.min(amountAfterPriorCoupons).setScale(2, RoundingMode.HALF_UP);
    }

    private AppliedCouponResult toAppliedCouponResult(CouponValidationResponse validation) {
        return AppliedCouponResult.builder()
                .appliedCoupons(validation.getAppliedCoupons())
                .discountAmount(validation.getDiscount())
                .finalAmount(validation.getFinalAmount())
                .build();
    }

    private CouponValidationResponse invalidResponse(String message, BigDecimal cartTotal) {
        return CouponValidationResponse.builder()
                .valid(false)
                .message(message)
                .appliedCoupons(List.of())
                .discount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                .finalAmount(normalizeAmount(cartTotal))
                .build();
    }

    private AvailableCouponResponse toAvailableCouponResponse(
            Coupon coupon,
            BigDecimal cartTotal,
            BigDecimal runningBalance) {
        String eligibilityError = validateCouponEligibility(coupon, cartTotal);
        boolean applicable = eligibilityError == null && runningBalance.compareTo(BigDecimal.ZERO) > 0;
        String unavailableReason = eligibilityError;
        if (applicable && runningBalance.compareTo(BigDecimal.ZERO) <= 0) {
            applicable = false;
            unavailableReason = "No remaining balance for another coupon";
        }

        return AvailableCouponResponse.builder()
                .code(coupon.getCode())
                .couponType(coupon.getCouponType())
                .discountValue(coupon.getDiscountValue())
                .minimumOrderAmount(coupon.getMinimumOrderAmount())
                .maximumDiscount(coupon.getMaximumDiscount())
                .applicable(applicable)
                .unavailableReason(unavailableReason)
                .build();
    }

    private List<String> normalizeCouponCodes(List<String> rawCouponCodes) {
        if (rawCouponCodes == null || rawCouponCodes.isEmpty()) {
            return List.of();
        }

        List<String> normalized = new ArrayList<>();
        for (String rawCode : rawCouponCodes) {
            if (rawCode == null || rawCode.isBlank()) {
                continue;
            }
            normalized.add(normalizeCode(rawCode));
        }
        return normalized;
    }

    private Coupon findCoupon(UUID id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Coupon not found"));
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : amount;
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Amount cannot be negative");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private void validateDateRange(Instant validFrom, Instant validUntil) {
        if (validFrom == null || validUntil == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Validity period is required");
        }
        if (!validUntil.isAfter(validFrom)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Valid until must be after valid from");
        }
    }

    private void validateCouponTypeRules(
            CouponType couponType,
            BigDecimal discountValue,
            BigDecimal maximumDiscount) {
        if (couponType == CouponType.PERCENTAGE) {
            if (discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Percentage discount cannot exceed 100");
            }
        }
        if (couponType == CouponType.FIXED && maximumDiscount != null) {
            throw new BusinessException(
                    ErrorCode.BAD_REQUEST,
                    "Maximum discount applies only to percentage coupons");
        }
    }
}

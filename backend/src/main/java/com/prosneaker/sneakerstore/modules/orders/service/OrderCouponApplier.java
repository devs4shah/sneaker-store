package com.prosneaker.sneakerstore.modules.orders.service;

import com.prosneaker.sneakerstore.modules.coupons.dto.AppliedCouponLineResponse;
import com.prosneaker.sneakerstore.modules.coupons.dto.AppliedCouponResult;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderCoupon;

import java.util.Comparator;
import java.util.List;

public final class OrderCouponApplier {

    private OrderCouponApplier() {
    }

    public static void applyToOrder(Order order, AppliedCouponResult result) {
        order.getAppliedCoupons().clear();

        int sortOrder = 0;
        for (AppliedCouponLineResponse line : result.getAppliedCoupons()) {
            order.getAppliedCoupons().add(OrderCoupon.builder()
                    .order(order)
                    .couponCode(line.getCouponCode())
                    .discountAmount(line.getDiscountAmount())
                    .sortOrder(sortOrder++)
                    .build());
        }

        order.setDiscountAmount(result.getDiscountAmount());
        order.setFinalAmount(result.getFinalAmount());
    }

    public static List<String> extractCouponCodes(Order order) {
        return order.getAppliedCoupons().stream()
                .sorted(Comparator.comparingInt(OrderCoupon::getSortOrder))
                .map(OrderCoupon::getCouponCode)
                .toList();
    }

    public static void initializeAppliedCoupons(Order order) {
        if (order != null) {
            order.getAppliedCoupons().size();
        }
    }
}

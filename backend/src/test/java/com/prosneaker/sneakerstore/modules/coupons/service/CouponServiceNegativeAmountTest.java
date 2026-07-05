package com.prosneaker.sneakerstore.modules.coupons.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class CouponServiceNegativeAmountTest {

    @Autowired
    private CouponService couponService;

    @Test
    void rejectsNegativeCartTotalForAvailableCoupons() {
        assertThrows(
                BusinessException.class,
                () -> couponService.getAvailableCoupons(new BigDecimal("-5.00"), List.of()));
    }
}

package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentBreakdownResponse {

    private final String paymentMethod;
    private final long orderCount;
    private final BigDecimal revenue;
}

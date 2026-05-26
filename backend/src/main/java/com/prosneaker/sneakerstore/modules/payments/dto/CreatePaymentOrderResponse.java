package com.prosneaker.sneakerstore.modules.payments.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class CreatePaymentOrderResponse {

    private final UUID paymentId;
    private final UUID orderId;
    private final String orderNumber;
    private final String razorpayOrderId;
    private final String razorpayKeyId;
    private final BigDecimal amount;
    private final String currency;
}

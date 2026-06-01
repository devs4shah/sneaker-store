package com.prosneaker.sneakerstore.modules.payments.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class RazorpayOrderResponse {

    private final UUID orderId;
    private final String orderNumber;
    private final String razorpayOrderId;
    private final long amount;
    private final String currency;
}

package com.prosneaker.sneakerstore.modules.payments.dto;

import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import com.prosneaker.sneakerstore.modules.payments.entity.PaymentRecordStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class PaymentResponse {

    private final UUID id;
    private final UUID orderId;
    private final String orderNumber;
    private final String razorpayOrderId;
    private final String razorpayPaymentId;
    private final BigDecimal amount;
    private final PaymentRecordStatus paymentStatus;
    private final String paymentMethod;
    private final PaymentStatus orderPaymentStatus;
    private final Instant createdAt;
}

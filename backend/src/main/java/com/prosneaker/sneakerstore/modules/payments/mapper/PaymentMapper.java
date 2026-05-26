package com.prosneaker.sneakerstore.modules.payments.mapper;

import com.prosneaker.sneakerstore.modules.payments.dto.PaymentResponse;
import com.prosneaker.sneakerstore.modules.payments.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .paymentMethod(payment.getPaymentMethod())
                .orderPaymentStatus(payment.getOrder().getPaymentStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}

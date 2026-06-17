package com.prosneaker.sneakerstore.modules.notification.dto;

import java.math.BigDecimal;

public record OrderEmailContext(
        String customerName,
        String customerEmail,
        String orderId,
        String orderNumber,
        BigDecimal orderAmount,
        String orderStatus,
        String paymentStatus
) {
}

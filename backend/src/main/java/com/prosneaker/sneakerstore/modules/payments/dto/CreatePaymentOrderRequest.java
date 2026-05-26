package com.prosneaker.sneakerstore.modules.payments.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreatePaymentOrderRequest {

    @NotNull(message = "Order ID is required")
    private UUID orderId;
}

package com.prosneaker.sneakerstore.modules.orders.dto;

import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;
}

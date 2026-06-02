package com.prosneaker.sneakerstore.modules.orders.dto;

import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status is required")
    @JsonAlias("orderStatus")
    private OrderStatus status;
}

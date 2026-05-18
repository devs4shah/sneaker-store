package com.prosneaker.sneakerstore.modules.orders.mapper;

import com.prosneaker.sneakerstore.modules.orders.dto.OrderItemResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderResponse;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .city(order.getCity())
                .postalCode(order.getPostalCode())
                .country(order.getCountry())
                .items(order.getItems().stream().map(this::toItemResponse).toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return OrderItemResponse.builder()
                .id(item.getId())
                .sneakerId(item.getSneaker().getId())
                .sneakerName(item.getSneakerName())
                .brand(item.getBrand())
                .sizeValue(item.getSizeValue())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(subtotal)
                .build();
    }
}

package com.prosneaker.sneakerstore.modules.orders.mapper;

import com.prosneaker.sneakerstore.modules.orders.dto.OrderItemResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderListResponse;
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
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddress(order.getShippingAddress())
                .city(order.getCity())
                .postalCode(order.getPostalCode())
                .country(order.getCountry())
                .totalQuantity(order.getTotalQuantity())
                .items(order.getItems().stream().map(this::toItemResponse).toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public OrderListResponse toListResponse(Order order) {
        return OrderListResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .totalQuantity(order.getTotalQuantity())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        BigDecimal lineSubtotal = item.getSneakerPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return OrderItemResponse.builder()
                .id(item.getId())
                .sneakerName(item.getSneakerName())
                .sneakerPrice(item.getSneakerPrice())
                .quantity(item.getQuantity())
                .imageUrl(item.getImageUrl())
                .lineSubtotal(lineSubtotal)
                .build();
    }
}

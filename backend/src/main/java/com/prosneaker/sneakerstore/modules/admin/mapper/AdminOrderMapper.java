package com.prosneaker.sneakerstore.modules.admin.mapper;

import com.prosneaker.sneakerstore.modules.admin.dto.AdminOrderDetailResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.AdminOrderListResponse;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AdminOrderMapper {

    public AdminOrderListResponse toListResponse(Order order) {
        String customerName = order.getUser().getFirstName() + " " + order.getUser().getLastName();
        return AdminOrderListResponse.builder()
                .orderId(order.getId())
                .customerName(customerName.trim())
                .customerEmail(order.getUser().getEmail())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public AdminOrderDetailResponse toDetailResponse(Order order) {
        String customerName = order.getUser().getFirstName() + " " + order.getUser().getLastName();
        return AdminOrderDetailResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .customer(AdminOrderDetailResponse.CustomerInfo.builder()
                        .userId(order.getUser().getId())
                        .name(customerName.trim())
                        .email(order.getUser().getEmail())
                        .build())
                .items(order.getItems().stream().map(this::toItemInfo).toList())
                .totalAmount(order.getTotalAmount())
                .totalQuantity(order.getTotalQuantity())
                .payment(AdminOrderDetailResponse.PaymentInfo.builder()
                        .paymentStatus(order.getPaymentStatus())
                        .razorpayOrderId(order.getRazorpayOrderId())
                        .razorpayPaymentId(order.getRazorpayPaymentId())
                        .build())
                .orderStatus(order.getOrderStatus())
                .shippingAddress(order.getShippingAddress())
                .city(order.getCity())
                .postalCode(order.getPostalCode())
                .country(order.getCountry())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private AdminOrderDetailResponse.ItemInfo toItemInfo(OrderItem item) {
        BigDecimal lineSubtotal = item.getSneakerPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return AdminOrderDetailResponse.ItemInfo.builder()
                .itemId(item.getId())
                .sneakerId(item.getSneaker().getId())
                .sneakerName(item.getSneakerName())
                .quantity(item.getQuantity())
                .unitPrice(item.getSneakerPrice())
                .lineSubtotal(lineSubtotal)
                .imageUrl(item.getImageUrl())
                .build();
    }
}

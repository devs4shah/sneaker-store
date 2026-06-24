package com.prosneaker.sneakerstore.modules.notification.mapper;

import com.prosneaker.sneakerstore.modules.notification.dto.OrderEmailContext;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.users.entity.User;

public final class OrderEmailContextMapper {

    private OrderEmailContextMapper() {
    }

    public static OrderEmailContext from(Order order) {
        User user = order.getUser();
        String customerName = (user.getFirstName() + " " + user.getLastName()).trim();

        return new OrderEmailContext(
                customerName,
                user.getEmail(),
                order.getId().toString(),
                order.getOrderNumber(),
                order.getFinalAmount(),
                order.getOrderStatus().name(),
                order.getPaymentStatus().name()
        );
    }
}

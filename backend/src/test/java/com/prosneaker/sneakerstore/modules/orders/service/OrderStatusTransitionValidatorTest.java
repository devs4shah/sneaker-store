package com.prosneaker.sneakerstore.modules.orders.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OrderStatusTransitionValidatorTest {

    private OrderStatusTransitionValidator validator;

    @BeforeEach
    void setUp() {
        validator = new OrderStatusTransitionValidator();
    }

    @Test
    void allowsPendingToProcessing() {
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PENDING, OrderStatus.PROCESSING));
    }

    @Test
    void allowsProcessingToShipped() {
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PROCESSING, OrderStatus.SHIPPED));
    }

    @Test
    void allowsShippedToDelivered() {
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED));
    }

    @Test
    void allowsSameStatus() {
        assertDoesNotThrow(() -> validator.validateTransition(OrderStatus.PROCESSING, OrderStatus.PROCESSING));
    }

    @Test
    void rejectsDeliveredToProcessing() {
        assertThrows(BusinessException.class,
                () -> validator.validateTransition(OrderStatus.DELIVERED, OrderStatus.PROCESSING));
    }

    @Test
    void rejectsCancelledToProcessing() {
        assertThrows(BusinessException.class,
                () -> validator.validateTransition(OrderStatus.CANCELLED, OrderStatus.PROCESSING));
    }

    @Test
    void rejectsPendingToShipped() {
        assertThrows(BusinessException.class,
                () -> validator.validateTransition(OrderStatus.PENDING, OrderStatus.SHIPPED));
    }
}

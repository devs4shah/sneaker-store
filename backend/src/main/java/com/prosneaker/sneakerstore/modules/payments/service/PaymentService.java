package com.prosneaker.sneakerstore.modules.payments.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderResponse;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import com.prosneaker.sneakerstore.modules.inventory.service.InventoryService;
import com.prosneaker.sneakerstore.modules.notification.mapper.OrderEmailContextMapper;
import com.prosneaker.sneakerstore.modules.notification.service.EmailService;
import com.prosneaker.sneakerstore.modules.orders.mapper.OrderMapper;
import com.prosneaker.sneakerstore.modules.orders.repository.OrderRepository;
import com.prosneaker.sneakerstore.modules.payments.dto.PaymentFailureRequest;
import com.prosneaker.sneakerstore.modules.payments.dto.RazorpayOrderResponse;
import com.prosneaker.sneakerstore.modules.payments.dto.VerifyPaymentRequest;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final UserDetailsServiceImpl userDetailsService;
    private final RazorpayGatewayService razorpayGatewayService;
    private final EmailService emailService;
    private final InventoryService inventoryService;

    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(String email, UUID orderId) {
        Order order = getOwnedOrder(email, orderId);

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Order is already paid");
        }

        if (order.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Order payment cannot be processed");
        }

        inventoryService.validateOrderStock(order);

        RazorpayGatewayService.CreatedRazorpayOrder created = razorpayGatewayService.createOrder(
                order.getOrderNumber(),
                order.getTotalAmount());

        order.setRazorpayOrderId(created.razorpayOrderId());
        if (order.getPaymentStatus() == PaymentStatus.FAILED) {
            order.setPaymentStatus(PaymentStatus.PENDING);
        }
        orderRepository.save(order);

        return RazorpayOrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .razorpayOrderId(created.razorpayOrderId())
                .amount(created.amountInPaise())
                .currency(created.currency())
                .build();
    }

    @Transactional
    public OrderResponse verifyPayment(String email, VerifyPaymentRequest request) {
        Order order = getOwnedOrder(email, request.getOrderId());

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return orderMapper.toResponse(order);
        }

        if (order.getRazorpayOrderId() != null
                && !order.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Razorpay order id does not match store order");
        }

        razorpayGatewayService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        inventoryService.validateOrderStock(order);
        inventoryService.deductOrderStock(order);

        order.setRazorpayOrderId(request.getRazorpayOrderId());
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setPaymentStatus(PaymentStatus.PAID);
        if (order.getOrderStatus() == OrderStatus.PENDING) {
            order.setOrderStatus(OrderStatus.PROCESSING);
        }

        Order saved = orderRepository.save(order);
        Order savedWithItems = orderRepository.findByIdWithItems(saved.getId()).orElse(saved);
        emailService.sendPaymentSuccessEmail(OrderEmailContextMapper.from(savedWithItems));
        return orderMapper.toResponse(savedWithItems);
    }

    @Transactional
    public OrderResponse recordPaymentFailure(String email, PaymentFailureRequest request) {
        Order order = getOwnedOrder(email, request.getOrderId());

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return orderMapper.toResponse(order);
        }

        order.setPaymentStatus(PaymentStatus.FAILED);
        Order saved = orderRepository.save(order);
        return orderMapper.toResponse(
                orderRepository.findByIdWithItems(saved.getId()).orElse(saved));
    }

    private Order getOwnedOrder(String email, UUID orderId) {
        User user = userDetailsService.getUserByEmail(email);
        return orderRepository.findByIdAndUserIdWithItems(orderId, user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));
    }
}

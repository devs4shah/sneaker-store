package com.prosneaker.sneakerstore.modules.payments.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import com.prosneaker.sneakerstore.modules.orders.repository.OrderRepository;
import com.prosneaker.sneakerstore.modules.payments.dto.CreatePaymentOrderRequest;
import com.prosneaker.sneakerstore.modules.payments.dto.CreatePaymentOrderResponse;
import com.prosneaker.sneakerstore.modules.payments.dto.PaymentResponse;
import com.prosneaker.sneakerstore.modules.payments.dto.VerifyPaymentRequest;
import com.prosneaker.sneakerstore.modules.payments.entity.Payment;
import com.prosneaker.sneakerstore.modules.payments.entity.PaymentRecordStatus;
import com.prosneaker.sneakerstore.modules.payments.mapper.PaymentMapper;
import com.prosneaker.sneakerstore.modules.payments.repository.PaymentRepository;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;
    private final RazorpayGatewayService razorpayGatewayService;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional
    public CreatePaymentOrderResponse createPaymentOrder(String email, CreatePaymentOrderRequest request) {
        User user = userDetailsService.getUserByEmail(email);
        Order order = orderRepository.findByIdAndUserIdWithItems(request.getOrderId(), user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Order is already paid");
        }

        if (paymentRepository.existsByOrderIdAndPaymentStatus(order.getId(), PaymentRecordStatus.SUCCESS)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Order already has a successful payment");
        }

        var existingPending = paymentRepository.findTopByOrderIdAndPaymentStatusOrderByCreatedAtDesc(
                order.getId(), PaymentRecordStatus.PENDING);

        if (existingPending.isPresent()) {
            Payment pending = existingPending.get();
            return buildCreateResponse(pending, order);
        }

        String razorpayOrderId = razorpayGatewayService.createRazorpayOrder(order);

        Payment payment = Payment.builder()
                .order(order)
                .razorpayOrderId(razorpayOrderId)
                .amount(order.getTotalAmount())
                .paymentStatus(PaymentRecordStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);
        return buildCreateResponse(payment, order);
    }

    @Transactional
    public PaymentResponse verifyPayment(String email, VerifyPaymentRequest request) {
        User user = userDetailsService.getUserByEmail(email);

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Payment not found"));

        Order order = payment.getOrder();
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Payment does not belong to this user");
        }

        if (payment.getPaymentStatus() == PaymentRecordStatus.SUCCESS) {
            return paymentMapper.toResponse(payment);
        }

        boolean signatureValid = razorpayGatewayService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        if (!signatureValid) {
            markPaymentFailed(payment, order);
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Payment verification failed");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setPaymentMethod(razorpayGatewayService.fetchPaymentMethod(request.getRazorpayPaymentId()));
        payment.setPaymentStatus(PaymentRecordStatus.SUCCESS);

        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepository.save(order);

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    private void markPaymentFailed(Payment payment, Order order) {
        payment.setPaymentStatus(PaymentRecordStatus.FAILED);
        paymentRepository.save(payment);

        if (order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
        }
    }

    private CreatePaymentOrderResponse buildCreateResponse(Payment payment, Order order) {
        return CreatePaymentOrderResponse.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayKeyId(razorpayGatewayService.getPublicKeyId())
                .amount(payment.getAmount())
                .currency(razorpayGatewayService.getCurrency())
                .build();
    }
}

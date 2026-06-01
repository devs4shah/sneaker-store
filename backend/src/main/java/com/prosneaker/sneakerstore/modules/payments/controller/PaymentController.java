package com.prosneaker.sneakerstore.modules.payments.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderResponse;
import com.prosneaker.sneakerstore.modules.payments.dto.CreatePaymentOrderRequest;
import com.prosneaker.sneakerstore.modules.payments.dto.PaymentFailureRequest;
import com.prosneaker.sneakerstore.modules.payments.dto.RazorpayOrderResponse;
import com.prosneaker.sneakerstore.modules.payments.dto.VerifyPaymentRequest;
import com.prosneaker.sneakerstore.modules.payments.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ApiResponse<RazorpayOrderResponse> createRazorpayOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        return ApiResponse.success(
                "Razorpay order created",
                paymentService.createRazorpayOrder(requireAuthenticatedEmail(userDetails), request.getOrderId()));
    }

    @PostMapping("/verify")
    public ApiResponse<OrderResponse> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyPaymentRequest request) {
        return ApiResponse.success(
                "Payment verified successfully",
                paymentService.verifyPayment(requireAuthenticatedEmail(userDetails), request));
    }

    @PostMapping("/failure")
    public ApiResponse<OrderResponse> recordPaymentFailure(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentFailureRequest request) {
        return ApiResponse.success(
                "Payment failure recorded",
                paymentService.recordPaymentFailure(requireAuthenticatedEmail(userDetails), request));
    }

    private String requireAuthenticatedEmail(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}

package com.prosneaker.sneakerstore.modules.payments.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.payments.dto.CreatePaymentOrderRequest;
import com.prosneaker.sneakerstore.modules.payments.dto.CreatePaymentOrderResponse;
import com.prosneaker.sneakerstore.modules.payments.dto.PaymentResponse;
import com.prosneaker.sneakerstore.modules.payments.dto.VerifyPaymentRequest;
import com.prosneaker.sneakerstore.modules.payments.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CreatePaymentOrderResponse> createPaymentOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        return ApiResponse.success(
                "Payment order created",
                paymentService.createPaymentOrder(requireAuthenticatedEmail(userDetails), request));
    }

    @PostMapping("/verify")
    public ApiResponse<PaymentResponse> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyPaymentRequest request) {
        return ApiResponse.success(
                "Payment verified successfully",
                paymentService.verifyPayment(requireAuthenticatedEmail(userDetails), request));
    }

    private String requireAuthenticatedEmail(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}

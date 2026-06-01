package com.prosneaker.sneakerstore.modules.payments.service;

import com.prosneaker.sneakerstore.config.razorpay.RazorpayProperties;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class RazorpayGatewayService {

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;

    public CreatedRazorpayOrder createOrder(String receipt, BigDecimal amountInRupees) {
        long amountInPaise = toPaise(amountInRupees);
        if (amountInPaise < 100) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Order amount must be at least INR 1.00");
        }

        JSONObject request = new JSONObject();
        request.put("amount", amountInPaise);
        request.put("currency", razorpayProperties.getCurrency());
        request.put("receipt", receipt);
        request.put("payment_capture", 1);

        try {
            Order razorpayOrder = razorpayClient.orders.create(request);
            return new CreatedRazorpayOrder(
                    razorpayOrder.get("id"),
                    amountInPaise,
                    razorpayProperties.getCurrency());
        } catch (RazorpayException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Unknown Razorpay error";
            if (message.contains("Authentication failed")) {
                throw new BusinessException(
                        ErrorCode.BAD_REQUEST,
                        "Razorpay rejected your API credentials (key id + secret). "
                                + "Regenerate Test API keys in the Razorpay Dashboard, update "
                                + "application-local.properties (razorpay.key, razorpay.secret), set the same key id "
                                + "in frontend .env.local as NEXT_PUBLIC_RAZORPAY_KEY, then restart backend and frontend.");
            }
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Failed to create Razorpay order: " + message);
        }
    }

    public void verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", razorpayOrderId);
        attributes.put("razorpay_payment_id", razorpayPaymentId);
        attributes.put("razorpay_signature", razorpaySignature);

        try {
            Utils.verifyPaymentSignature(attributes, razorpayProperties.getSecret());
        } catch (RazorpayException ex) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Payment verification failed");
        }
    }

    public long toPaise(BigDecimal amountInRupees) {
        return amountInRupees
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    public record CreatedRazorpayOrder(String razorpayOrderId, long amountInPaise, String currency) {
    }
}

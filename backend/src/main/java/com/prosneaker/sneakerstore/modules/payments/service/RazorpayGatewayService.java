package com.prosneaker.sneakerstore.modules.payments.service;

import com.prosneaker.sneakerstore.config.RazorpayProperties;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.payments.exception.PaymentGatewayException;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayGatewayService {

    private final RazorpayProperties razorpayProperties;
    private final Environment environment;

    private volatile RazorpayClient client;

    public String createRazorpayOrder(Order order) {
        try {
            JSONObject request = new JSONObject();
            request.put("amount", toPaise(order.getTotalAmount()));
            request.put("currency", razorpayProperties.getCurrency());
            request.put("receipt", order.getOrderNumber());
            request.put("notes", new JSONObject()
                    .put("orderId", order.getId().toString())
                    .put("orderNumber", order.getOrderNumber()));

            com.razorpay.Order razorpayOrder = getClient().orders.create(request);
            return razorpayOrder.get("id");
        } catch (RazorpayException ex) {
            log.error("Failed to create Razorpay order for {}", order.getOrderNumber(), ex);
            throw new PaymentGatewayException(
                    ErrorCode.INTERNAL_ERROR,
                    "Unable to create Razorpay payment order",
                    ex);
        }
    }

    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        ensureCredentialsPresent();
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", signature);
            return Utils.verifyPaymentSignature(attributes, razorpayProperties.getSecret());
        } catch (RazorpayException ex) {
            log.warn("Razorpay signature verification failed for order {}", razorpayOrderId, ex);
            return false;
        }
    }

    public String fetchPaymentMethod(String razorpayPaymentId) {
        try {
            com.razorpay.Payment payment = getClient().payments.fetch(razorpayPaymentId);
            Object method = payment.get("method");
            return method != null ? method.toString() : null;
        } catch (RazorpayException ex) {
            log.warn("Unable to fetch Razorpay payment method for {}", razorpayPaymentId, ex);
            return null;
        }
    }

    public String getPublicKeyId() {
        ensureCredentialsPresent();
        return razorpayProperties.getKey();
    }

    public String getCurrency() {
        return razorpayProperties.getCurrency();
    }

    private RazorpayClient getClient() {
        ensureCredentialsPresent();
        if (client == null) {
            synchronized (this) {
                if (client == null) {
                    try {
                        client = new RazorpayClient(
                                razorpayProperties.getKey(), razorpayProperties.getSecret());
                    } catch (RazorpayException ex) {
                        log.error("Failed to create Razorpay client", ex);
                        throw new PaymentGatewayException(
                                ErrorCode.INTERNAL_ERROR,
                                "Invalid Razorpay credentials. Check razorpay.key and razorpay.secret in application-local.properties",
                                ex);
                    }
                }
            }
        }
        return client;
    }

    private void ensureCredentialsPresent() {
        if (!razorpayProperties.isConfigured()) {
            String profiles = String.join(", ", environment.getActiveProfiles());
            throw new PaymentGatewayException(
                    ErrorCode.INTERNAL_ERROR,
                    "Razorpay is not configured. Active profile(s): [" + profiles + "]. "
                            + "Add razorpay.key and razorpay.secret to src/main/resources/application-local.properties "
                            + "and ensure spring.profiles.active=local.");
        }
    }

    private int toPaise(BigDecimal amountInRupees) {
        return amountInRupees.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }
}

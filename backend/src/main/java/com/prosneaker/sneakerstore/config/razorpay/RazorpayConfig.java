package com.prosneaker.sneakerstore.config.razorpay;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
@EnableConfigurationProperties(RazorpayProperties.class)
public class RazorpayConfig {

    @Bean
    public RazorpayClient razorpayClient(RazorpayProperties properties) {
        if (!StringUtils.hasText(properties.getKey()) || !StringUtils.hasText(properties.getSecret())) {
            throw new IllegalStateException("Razorpay credentials are not configured");
        }
        log.info(
                "Razorpay client using key id {} (must match frontend NEXT_PUBLIC_RAZORPAY_KEY)",
                maskKeyId(properties.getKey()));
        try {
            return new RazorpayClient(properties.getKey(), properties.getSecret());
        } catch (RazorpayException ex) {
            throw new IllegalStateException("Failed to initialize Razorpay client", ex);
        }
    }

    private static String maskKeyId(String keyId) {
        if (keyId.length() <= 12) {
            return keyId;
        }
        return keyId.substring(0, 12) + "...";
    }
}

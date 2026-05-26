package com.prosneaker.sneakerstore.config;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

/**
 * Razorpay settings loaded from Spring configuration (application-local.properties for dev).
 */
@Slf4j
@Getter
@Setter
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayProperties implements InitializingBean {

    @Autowired
    private Environment environment;

    private String key;
    private String secret;
    private String currency = "INR";

    @Override
    public void afterPropertiesSet() {
        String profiles = environment != null
                ? String.join(",", environment.getActiveProfiles())
                : "unknown";

        if (isConfigured()) {
            log.info("Razorpay configured (key: {}..., profiles: {})", mask(key), profiles);
        } else {
            log.warn("""
                    Razorpay credentials missing. Active profiles: {}
                    Add src/main/resources/application-local.properties with:
                      razorpay.key=rzp_test_xxx
                      razorpay.secret=your_secret""",
                    profiles);
        }
    }

    public boolean isConfigured() {
        return StringUtils.hasText(key) && StringUtils.hasText(secret);
    }

    private static String mask(String key) {
        if (key == null || key.length() < 12) {
            return "***";
        }
        return key.substring(0, 12);
    }
}

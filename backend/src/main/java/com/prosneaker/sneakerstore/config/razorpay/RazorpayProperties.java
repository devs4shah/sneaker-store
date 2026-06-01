package com.prosneaker.sneakerstore.config.razorpay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayProperties {

    private String key;
    private String secret;
    private String currency = "INR";
}

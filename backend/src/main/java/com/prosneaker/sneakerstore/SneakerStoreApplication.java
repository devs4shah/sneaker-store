package com.prosneaker.sneakerstore;

import com.prosneaker.sneakerstore.config.RazorpayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(RazorpayProperties.class)
public class SneakerStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(SneakerStoreApplication.class, args);
    }
}

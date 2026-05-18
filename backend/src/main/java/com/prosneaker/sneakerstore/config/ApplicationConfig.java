package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.config.security.JwtProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class ApplicationConfig {
}

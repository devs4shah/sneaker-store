package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.config.mail.MailProperties;
import com.prosneaker.sneakerstore.config.security.JwtProperties;
import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, ImageStorageProperties.class, MailProperties.class})
public class ApplicationConfig {
}

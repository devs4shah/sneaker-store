package com.prosneaker.sneakerstore.config.mail;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {

    private String from = "noreply@prosneaker.com";

    /**
     * Default recipient for POST /api/test/email when request body omits "to".
     */
    private String testRecipient;
}

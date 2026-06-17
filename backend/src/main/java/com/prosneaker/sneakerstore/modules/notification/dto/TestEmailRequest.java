package com.prosneaker.sneakerstore.modules.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TestEmailRequest {

    @NotBlank(message = "Recipient email (to) is required")
    @Email(message = "A valid recipient email is required")
    private String to;
}

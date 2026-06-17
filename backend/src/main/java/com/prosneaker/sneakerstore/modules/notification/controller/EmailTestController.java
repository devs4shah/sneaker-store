package com.prosneaker.sneakerstore.modules.notification.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.notification.dto.TestEmailRequest;
import com.prosneaker.sneakerstore.modules.notification.dto.TestEmailResponse;
import com.prosneaker.sneakerstore.modules.notification.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @PostMapping("/email")
    public ApiResponse<TestEmailResponse> sendTestEmail(@Valid @RequestBody TestEmailRequest request) {
        String to = request.getTo();
        try {
            String sentTo = emailService.sendTestEmail(to);
            TestEmailResponse response = TestEmailResponse.builder()
                    .success(true)
                    .message("Test email sent successfully")
                    .sentTo(sentTo)
                    .build();
            return ApiResponse.success("Test email sent successfully", response);
        } catch (IllegalStateException ex) {
            log.warn("Test email configuration error: {}", ex.getMessage());
            return ApiResponse.error(ex.getMessage());
        } catch (MessagingException ex) {
            log.error("Failed to send test email", ex);
            return ApiResponse.error("Failed to send test email: " + ex.getMessage());
        }
    }
}

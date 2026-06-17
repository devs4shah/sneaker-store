package com.prosneaker.sneakerstore.modules.notification.service;

import com.prosneaker.sneakerstore.config.mail.MailProperties;
import com.prosneaker.sneakerstore.modules.notification.dto.OrderEmailContext;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;
    private final EmailTemplateRenderer templateRenderer;

    @Async
    public void sendOrderPlacedEmail(OrderEmailContext context) {
        sendOrderNotification(context, "order-placed", "Order placed – ProSneaker");
    }

    @Async
    public void sendPaymentSuccessEmail(OrderEmailContext context) {
        sendOrderNotification(context, "payment-success", "Payment received – ProSneaker");
    }

    @Async
    public void sendOrderShippedEmail(OrderEmailContext context) {
        sendOrderNotification(context, "order-shipped", "Your order has shipped – ProSneaker");
    }

    @Async
    public void sendOrderDeliveredEmail(OrderEmailContext context) {
        sendOrderNotification(context, "order-delivered", "Your order was delivered – ProSneaker");
    }

    public String sendTestEmail(String to) throws MessagingException {
        String recipient = resolveRecipient(to);
        OrderEmailContext sample = new OrderEmailContext(
                "ProSneaker Admin",
                recipient,
                UUID.randomUUID().toString(),
                "PSN-TEST-0001",
                new BigDecimal("1999.00"),
                "PROCESSING",
                "PAID"
        );

        sendHtmlEmail(recipient, "ProSneaker SMTP test", templateRenderer.render("test-email", sample));
        log.info("Test email sent successfully to {}", recipient);
        return recipient;
    }

    private void sendOrderNotification(OrderEmailContext context, String templateName, String subject) {
        try {
            sendHtmlEmail(
                    context.customerEmail(),
                    subject,
                    templateRenderer.render(templateName, context));
            log.info(
                    "Sent {} email for order {} to {}",
                    templateName,
                    context.orderId(),
                    context.customerEmail());
        } catch (Exception ex) {
            log.error(
                    "Failed to send {} email for order {} to {}: {}",
                    templateName,
                    context.orderId(),
                    context.customerEmail(),
                    ex.getMessage(),
                    ex);
        }
    }

    private String resolveRecipient(String to) {
        if (to != null && !to.isBlank()) {
            return to.trim();
        }
        String configured = mailProperties.getTestRecipient();
        if (configured != null && !configured.isBlank()) {
            return configured.trim();
        }
        throw new IllegalStateException(
                "Recipient email is required. Provide \"to\" in the request body or set app.mail.test-recipient.");
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(mailProperties.getFrom());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }
}

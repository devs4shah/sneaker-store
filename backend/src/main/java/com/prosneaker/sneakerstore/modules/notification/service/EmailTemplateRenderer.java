package com.prosneaker.sneakerstore.modules.notification.service;

import com.prosneaker.sneakerstore.modules.notification.dto.OrderEmailContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.Year;
import java.util.Locale;
import java.util.Map;

@Component
public class EmailTemplateRenderer {

    private static final NumberFormat INR_FORMAT =
            NumberFormat.getCurrencyInstance(Locale.forLanguageTag("en-IN"));

    static {
        INR_FORMAT.setRoundingMode(RoundingMode.HALF_UP);
    }

    public String render(String templateName, OrderEmailContext context) {
        String template = loadTemplate(templateName);
        Map<String, String> values = Map.of(
                "customerName", safe(context.customerName()),
                "orderId", safe(context.orderId()),
                "orderNumber", safe(context.orderNumber()),
                "orderAmount", formatAmount(context.orderAmount()),
                "orderStatus", formatStatus(context.orderStatus()),
                "paymentStatus", formatStatus(context.paymentStatus()),
                "year", String.valueOf(Year.now().getValue())
        );

        String rendered = template;
        for (Map.Entry<String, String> entry : values.entrySet()) {
            rendered = rendered.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return rendered;
    }

    private String loadTemplate(String templateName) {
        String path = "email-templates/" + templateName + ".html";
        try (InputStream inputStream = new ClassPathResource(path).getInputStream()) {
            return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to load email template: " + path, ex);
        }
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return INR_FORMAT.format(0);
        }
        return INR_FORMAT.format(amount);
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) {
            return "N/A";
        }
        return status.toLowerCase(Locale.ROOT).replace('_', ' ');
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}

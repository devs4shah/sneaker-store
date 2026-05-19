package com.prosneaker.sneakerstore.modules.orders.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;
    private static final int MAX_ATTEMPTS = 10;

    private final OrderRepository orderRepository;

    public String generate() {
        String datePart = LocalDate.now().format(DATE_FORMAT);
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String orderNumber = "PSN-" + datePart + "-" + String.format("%06d", RANDOM.nextInt(1_000_000));
            if (!orderRepository.existsByOrderNumber(orderNumber)) {
                return orderNumber;
            }
        }
        throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Unable to generate unique order number");
    }
}

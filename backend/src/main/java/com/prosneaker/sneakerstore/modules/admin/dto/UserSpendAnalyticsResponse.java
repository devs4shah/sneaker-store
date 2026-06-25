package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class UserSpendAnalyticsResponse {

    private final UUID userId;
    private final String email;
    private final BigDecimal totalSpend;
}

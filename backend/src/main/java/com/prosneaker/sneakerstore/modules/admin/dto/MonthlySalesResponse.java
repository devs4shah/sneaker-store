package com.prosneaker.sneakerstore.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MonthlySalesResponse {

    private final String month;
    private final BigDecimal revenue;
    private final long orders;
}

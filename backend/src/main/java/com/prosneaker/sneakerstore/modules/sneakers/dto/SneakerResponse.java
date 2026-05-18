package com.prosneaker.sneakerstore.modules.sneakers.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class SneakerResponse {

    private final UUID id;
    private final String brand;
    private final String name;
    private final String description;
    private final BigDecimal price;
    private final String category;
    private final String color;
    private final int stock;
    private final String imageUrl;
    private final boolean active;
    private final List<SneakerSizeResponse> sizes;
    private final Instant createdAt;
}

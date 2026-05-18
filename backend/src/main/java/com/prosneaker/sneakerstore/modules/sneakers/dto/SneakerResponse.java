package com.prosneaker.sneakerstore.modules.sneakers.dto;

import com.prosneaker.sneakerstore.modules.sneakers.entity.Gender;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class SneakerResponse {

    private UUID id;
    private String name;
    private String brand;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private Gender gender;
    private String color;
    private double size;
    private CategoryResponse category;
    private List<SneakerImageResponse> images;
    private Instant createdAt;
    private Instant updatedAt;
}

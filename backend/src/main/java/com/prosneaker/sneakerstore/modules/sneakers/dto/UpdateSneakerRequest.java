package com.prosneaker.sneakerstore.modules.sneakers.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateSneakerRequest {

    private String brand;
    private String name;
    private String description;

    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    private String category;
    private String color;
    private String imageUrl;
    private Boolean active;
}

package com.prosneaker.sneakerstore.modules.sneakers.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CreateSneakerRequest {

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Color is required")
    private String color;

    private String imageUrl;

    @NotEmpty(message = "At least one size is required")
    @Valid
    private List<SizeStockRequest> sizes;

    @Getter
    @Setter
    public static class SizeStockRequest {

        @NotNull(message = "Size is required")
        private Double sizeValue;

        @NotNull(message = "Stock is required")
        private Integer stock;
    }
}

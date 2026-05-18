package com.prosneaker.sneakerstore.modules.sneakers.dto;

import com.prosneaker.sneakerstore.modules.sneakers.entity.Gender;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateSneakerRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Brand is required")
    @Size(max = 100)
    private String brand;

    @Size(max = 5000)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Color is required")
    @Size(max = 50)
    private String color;

    @NotNull(message = "Size is required")
    @Positive(message = "Size must be greater than zero")
    private Double size;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    private List<String> imageUrls;
}

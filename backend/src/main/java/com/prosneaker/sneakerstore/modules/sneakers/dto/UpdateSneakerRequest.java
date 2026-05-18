package com.prosneaker.sneakerstore.modules.sneakers.dto;

import com.prosneaker.sneakerstore.modules.sneakers.entity.Gender;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class UpdateSneakerRequest {

    @Size(max = 200)
    private String name;

    @Size(max = 100)
    private String brand;

    @Size(max = 5000)
    private String description;

    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    private Gender gender;

    @Size(max = 50)
    private String color;

    @Positive(message = "Size must be greater than zero")
    private Double size;

    private UUID categoryId;

    private List<@Size(max = 500) String> imageUrls;
}

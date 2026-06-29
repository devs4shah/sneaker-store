package com.prosneaker.sneakerstore.modules.sneakers.mapper;

import com.prosneaker.sneakerstore.modules.sneakers.dto.CategoryResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerImageResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerResponse;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Category;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerImage;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class SneakerMapper {

    public SneakerResponse toResponse(Sneaker sneaker) {
        return SneakerResponse.builder()
                .id(sneaker.getId())
                .name(sneaker.getName())
                .brand(sneaker.getBrand())
                .description(sneaker.getDescription())
                .price(sneaker.getPrice())
                .stockQuantity(sneaker.getStockQuantity())
                .gender(sneaker.getGender())
                .color(sneaker.getColor())
                .size(sneaker.getSize())
                .category(toCategoryResponse(sneaker.getCategory()))
                .images(sneaker.getImages().stream()
                        .sorted(Comparator.comparingInt(SneakerImage::getDisplayOrder))
                        .map(this::toImageResponse)
                        .toList())
                .createdAt(sneaker.getCreatedAt())
                .updatedAt(sneaker.getUpdatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    private SneakerImageResponse toImageResponse(SneakerImage image) {
        return SneakerImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .displayOrder(image.getDisplayOrder())
                .build();
    }
}

package com.prosneaker.sneakerstore.modules.sneakers.mapper;

import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerSizeResponse;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerSize;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SneakerMapper {

    public SneakerResponse toResponse(Sneaker sneaker, List<SneakerSize> sizes) {
        return SneakerResponse.builder()
                .id(sneaker.getId())
                .brand(sneaker.getBrand())
                .name(sneaker.getName())
                .description(sneaker.getDescription())
                .price(sneaker.getPrice())
                .category(sneaker.getCategory())
                .color(sneaker.getColor())
                .stock(sneaker.getStock())
                .imageUrl(sneaker.getImageUrl())
                .active(sneaker.isActive())
                .sizes(sizes.stream().map(this::toSizeResponse).toList())
                .createdAt(sneaker.getCreatedAt())
                .build();
    }

    public SneakerSizeResponse toSizeResponse(SneakerSize size) {
        return SneakerSizeResponse.builder()
                .id(size.getId())
                .sizeValue(size.getSizeValue())
                .stock(size.getStock())
                .build();
    }
}

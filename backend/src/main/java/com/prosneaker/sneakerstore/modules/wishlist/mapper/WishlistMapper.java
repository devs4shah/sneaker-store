package com.prosneaker.sneakerstore.modules.wishlist.mapper;

import com.prosneaker.sneakerstore.modules.sneakers.mapper.SneakerMapper;
import com.prosneaker.sneakerstore.modules.wishlist.dto.WishlistItemResponse;
import com.prosneaker.sneakerstore.modules.wishlist.entity.WishlistItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WishlistMapper {

    private final SneakerMapper sneakerMapper;

    public WishlistItemResponse toResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .sneakerId(item.getSneaker().getId())
                .sneaker(sneakerMapper.toResponse(item.getSneaker()))
                .addedAt(item.getCreatedAt())
                .build();
    }
}

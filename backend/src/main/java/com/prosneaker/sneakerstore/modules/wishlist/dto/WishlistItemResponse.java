package com.prosneaker.sneakerstore.modules.wishlist.dto;

import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class WishlistItemResponse {

    private final UUID id;
    private final UUID sneakerId;
    private final SneakerResponse sneaker;
    private final Instant addedAt;
}

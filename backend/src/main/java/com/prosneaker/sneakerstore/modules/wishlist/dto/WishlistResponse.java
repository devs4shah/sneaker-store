package com.prosneaker.sneakerstore.modules.wishlist.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class WishlistResponse {

    private final int totalItems;
    private final List<WishlistItemResponse> items;
}

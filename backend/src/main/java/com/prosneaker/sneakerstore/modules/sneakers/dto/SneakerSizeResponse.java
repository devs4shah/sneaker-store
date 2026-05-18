package com.prosneaker.sneakerstore.modules.sneakers.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class SneakerSizeResponse {

    private final UUID id;
    private final double sizeValue;
    private final int stock;
}

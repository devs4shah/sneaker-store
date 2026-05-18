package com.prosneaker.sneakerstore.modules.sneakers.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class SneakerImageResponse {

    private UUID id;
    private String imageUrl;
}

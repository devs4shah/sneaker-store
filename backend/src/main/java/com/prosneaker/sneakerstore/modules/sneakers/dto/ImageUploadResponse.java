package com.prosneaker.sneakerstore.modules.sneakers.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ImageUploadResponse {

    private UUID sneakerId;
    private int uploadedCount;
    private List<SneakerImageResponse> images;
}

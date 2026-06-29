package com.prosneaker.sneakerstore.modules.sneakers.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ReorderSneakerImagesRequest {

    @NotEmpty(message = "Image order is required")
    private List<UUID> imageIds;
}

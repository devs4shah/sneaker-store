package com.prosneaker.sneakerstore.modules.reviews.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class ReviewResponse {

    private final UUID id;
    private final UUID sneakerId;
    private final UUID userId;
    private final String reviewerName;
    private final int rating;
    private final String comment;
    private final Instant createdAt;
    private final Instant updatedAt;
}

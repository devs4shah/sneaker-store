package com.prosneaker.sneakerstore.modules.reviews.dto;

import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SneakerReviewsResponse {

    private final double averageRating;
    private final long reviewCount;
    private final ReviewResponse userReview;
    private final PageResponse<ReviewResponse> reviews;
}

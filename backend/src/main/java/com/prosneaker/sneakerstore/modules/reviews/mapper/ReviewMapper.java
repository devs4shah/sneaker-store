package com.prosneaker.sneakerstore.modules.reviews.mapper;

import com.prosneaker.sneakerstore.modules.reviews.dto.ReviewResponse;
import com.prosneaker.sneakerstore.modules.reviews.entity.Review;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        User user = review.getUser();
        String reviewerName = (user.getFirstName() + " " + user.getLastName()).trim();

        return ReviewResponse.builder()
                .id(review.getId())
                .sneakerId(review.getSneaker().getId())
                .userId(user.getId())
                .reviewerName(reviewerName)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}

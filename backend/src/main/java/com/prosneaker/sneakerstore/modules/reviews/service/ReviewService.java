package com.prosneaker.sneakerstore.modules.reviews.service;

import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.orders.repository.OrderRepository;
import com.prosneaker.sneakerstore.modules.reviews.dto.CreateReviewRequest;
import com.prosneaker.sneakerstore.modules.reviews.dto.ReviewResponse;
import com.prosneaker.sneakerstore.modules.reviews.dto.SneakerReviewsResponse;
import com.prosneaker.sneakerstore.modules.reviews.dto.UpdateReviewRequest;
import com.prosneaker.sneakerstore.modules.reviews.entity.Review;
import com.prosneaker.sneakerstore.modules.reviews.mapper.ReviewMapper;
import com.prosneaker.sneakerstore.modules.reviews.repository.ReviewRepository;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final SneakerRepository sneakerRepository;
    private final OrderRepository orderRepository;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional
    public ReviewResponse createReview(String email, CreateReviewRequest request) {
        User user = userDetailsService.getUserByEmail(email);
        Sneaker sneaker = sneakerRepository.findById(request.getSneakerId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));

        if (reviewRepository.existsByUser_IdAndSneaker_Id(user.getId(), sneaker.getId())) {
            throw new BusinessException(ErrorCode.CONFLICT, "You have already reviewed this sneaker");
        }

        assertUserPurchasedSneaker(user.getId(), sneaker.getId());

        Review review = Review.builder()
                .user(user)
                .sneaker(sneaker)
                .rating(request.getRating())
                .comment(normalizeComment(request.getComment()))
                .build();

        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public SneakerReviewsResponse getReviewsBySneaker(UUID sneakerId, Pageable pageable, String email) {
        if (!sneakerRepository.existsById(sneakerId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found");
        }

        Page<Review> page = reviewRepository.findBySneakerId(sneakerId, pageable);
        double averageRating = reviewRepository.getAverageRatingBySneakerId(sneakerId);
        long reviewCount = reviewRepository.countBySneakerId(sneakerId);
        ReviewResponse userReview = resolveUserReview(email, sneakerId);

        return SneakerReviewsResponse.builder()
                .averageRating(roundAverage(averageRating))
                .reviewCount(reviewCount)
                .userReview(userReview)
                .reviews(PageMapper.toPageResponse(page, reviewMapper::toResponse))
                .build();
    }

    @Transactional
    public ReviewResponse updateReview(String email, UUID reviewId, UpdateReviewRequest request) {
        User user = userDetailsService.getUserByEmail(email);
        Review review = reviewRepository.findDetailedById(reviewId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Review not found"));

        assertReviewOwner(user.getId(), review);

        review.setRating(request.getRating());
        review.setComment(normalizeComment(request.getComment()));

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(String email, UUID reviewId) {
        User user = userDetailsService.getUserByEmail(email);
        Review review = reviewRepository.findDetailedById(reviewId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Review not found"));

        assertReviewOwner(user.getId(), review);
        reviewRepository.delete(review);
    }

    private void assertUserPurchasedSneaker(UUID userId, UUID sneakerId) {
        if (!orderRepository.hasUserPurchasedSneaker(userId, sneakerId)) {
            throw new BusinessException(
                    ErrorCode.FORBIDDEN,
                    "You can only review sneakers you have purchased");
        }
    }

    private void assertReviewOwner(UUID userId, Review review) {
        if (!review.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only modify your own review");
        }
    }

    private String normalizeComment(String comment) {
        if (comment == null) {
            return null;
        }
        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private double roundAverage(double average) {
        return Math.round(average * 10.0) / 10.0;
    }

    private ReviewResponse resolveUserReview(String email, UUID sneakerId) {
        if (email == null || email.isBlank()) {
            return null;
        }
        User user = userDetailsService.getUserByEmail(email);
        return reviewRepository.findByUserIdAndSneakerId(user.getId(), sneakerId)
                .map(reviewMapper::toResponse)
                .orElse(null);
    }
}

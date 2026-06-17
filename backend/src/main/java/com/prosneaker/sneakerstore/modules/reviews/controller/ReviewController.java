package com.prosneaker.sneakerstore.modules.reviews.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.reviews.dto.CreateReviewRequest;
import com.prosneaker.sneakerstore.modules.reviews.dto.ReviewResponse;
import com.prosneaker.sneakerstore.modules.reviews.dto.SneakerReviewsResponse;
import com.prosneaker.sneakerstore.modules.reviews.dto.UpdateReviewRequest;
import com.prosneaker.sneakerstore.modules.reviews.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewResponse> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.success(
                "Review submitted successfully",
                reviewService.createReview(requireAuthenticatedEmail(userDetails), request));
    }

    @GetMapping("/sneaker/{id}")
    public ApiResponse<SneakerReviewsResponse> getReviewsBySneaker(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.success(reviewService.getReviewsBySneaker(id, pageable, email));
    }

    @PutMapping("/{id}")
    public ApiResponse<ReviewResponse> updateReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ApiResponse.success(
                "Review updated successfully",
                reviewService.updateReview(requireAuthenticatedEmail(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        reviewService.deleteReview(requireAuthenticatedEmail(userDetails), id);
    }

    private String requireAuthenticatedEmail(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}

package com.prosneaker.sneakerstore.modules.wishlist.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.wishlist.dto.WishlistResponse;
import com.prosneaker.sneakerstore.modules.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<WishlistResponse> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.success(wishlistService.getWishlist(requireAuthenticatedEmail(userDetails)));
    }

    @PostMapping("/{sneakerId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WishlistResponse> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID sneakerId) {
        return ApiResponse.success(
                "Added to wishlist",
                wishlistService.addToWishlist(requireAuthenticatedEmail(userDetails), sneakerId));
    }

    @DeleteMapping("/{sneakerId}")
    public ApiResponse<WishlistResponse> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID sneakerId) {
        return ApiResponse.success(
                "Removed from wishlist",
                wishlistService.removeFromWishlist(requireAuthenticatedEmail(userDetails), sneakerId));
    }

    private String requireAuthenticatedEmail(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}

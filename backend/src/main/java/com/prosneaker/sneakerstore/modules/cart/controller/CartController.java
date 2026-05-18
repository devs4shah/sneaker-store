package com.prosneaker.sneakerstore.modules.cart.controller;

import com.prosneaker.sneakerstore.modules.cart.dto.AddCartItemRequest;
import com.prosneaker.sneakerstore.modules.cart.dto.CartResponse;
import com.prosneaker.sneakerstore.modules.cart.dto.UpdateCartItemRequest;
import com.prosneaker.sneakerstore.modules.cart.service.CartService;
import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.success(cartService.getCart(userDetails.getUsername()));
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddCartItemRequest request) {
        return ApiResponse.success(cartService.addItem(userDetails.getUsername(), request));
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<CartResponse> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.success(cartService.updateItem(userDetails.getUsername(), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID itemId) {
        return ApiResponse.success(cartService.removeItem(userDetails.getUsername(), itemId));
    }

    @DeleteMapping
    public ApiResponse<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ApiResponse.success("Cart cleared", null);
    }
}

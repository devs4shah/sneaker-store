package com.prosneaker.sneakerstore.modules.orders.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.CreateOrderRequest;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderResponse;
import com.prosneaker.sneakerstore.modules.orders.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.success("Order placed", orderService.checkout(userDetails.getUsername(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(orderService.getUserOrders(userDetails.getUsername(), pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getMyOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        return ApiResponse.success(orderService.getUserOrder(userDetails.getUsername(), id));
    }
}

package com.prosneaker.sneakerstore.modules.admin.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.UpdateOrderStatusRequest;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.service.OrderService;
import com.prosneaker.sneakerstore.modules.users.dto.UserResponse;
import com.prosneaker.sneakerstore.modules.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;

    @GetMapping("/users")
    public ApiResponse<PageResponse<UserResponse>> listUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(userService.getAllUsers(pageable));
    }

    @GetMapping("/orders")
    public ApiResponse<PageResponse<OrderResponse>> listOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(orderService.getAllOrders(status, pageable));
    }

    @PatchMapping("/orders/{id}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.success("Order status updated", orderService.updateOrderStatus(id, request));
    }
}

package com.prosneaker.sneakerstore.modules.admin.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.inventory.dto.InventoryItemResponse;
import com.prosneaker.sneakerstore.modules.inventory.dto.UpdateInventoryRequest;
import com.prosneaker.sneakerstore.modules.inventory.service.InventoryService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ApiResponse<PageResponse<InventoryItemResponse>> getInventory(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.success(inventoryService.getInventory(pageable));
    }

    @PatchMapping("/{sneakerId}")
    public ApiResponse<InventoryItemResponse> updateInventory(
            @PathVariable UUID sneakerId,
            @Valid @RequestBody UpdateInventoryRequest request) {
        return ApiResponse.success(
                "Stock updated successfully",
                inventoryService.updateStock(sneakerId, request));
    }
}

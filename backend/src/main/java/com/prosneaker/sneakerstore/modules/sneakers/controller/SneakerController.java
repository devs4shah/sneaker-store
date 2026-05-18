package com.prosneaker.sneakerstore.modules.sneakers.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.CreateSneakerRequest;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.UpdateSneakerRequest;
import com.prosneaker.sneakerstore.modules.sneakers.service.SneakerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/sneakers")
@RequiredArgsConstructor
public class SneakerController {

    private final SneakerService sneakerService;

    @GetMapping
    public ApiResponse<PageResponse<SneakerResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(
                sneakerService.search(search, brand, categoryId, minPrice, maxPrice, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<SneakerResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(sneakerService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SneakerResponse> create(@Valid @RequestBody CreateSneakerRequest request) {
        return ApiResponse.success("Sneaker created", sneakerService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<SneakerResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSneakerRequest request) {
        return ApiResponse.success("Sneaker updated", sneakerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        sneakerService.delete(id);
    }
}

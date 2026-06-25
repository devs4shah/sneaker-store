package com.prosneaker.sneakerstore.modules.addresses.controller;

import com.prosneaker.sneakerstore.modules.addresses.dto.AddressRequest;
import com.prosneaker.sneakerstore.modules.addresses.dto.AddressResponse;
import com.prosneaker.sneakerstore.modules.addresses.service.AddressService;
import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressResponse>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.success(addressService.getAddresses(requireEmail(userDetails)));
    }

    @PostMapping
    public ApiResponse<AddressResponse> createAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        return ApiResponse.success("Address created", addressService.createAddress(requireEmail(userDetails), request));
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request) {
        return ApiResponse.success("Address updated", addressService.updateAddress(requireEmail(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        addressService.deleteAddress(requireEmail(userDetails), id);
        return ApiResponse.success("Address deleted", null);
    }

    @PutMapping("/{id}/default")
    public ApiResponse<AddressResponse> setDefaultAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        return ApiResponse.success("Default address updated", addressService.setDefaultAddress(requireEmail(userDetails), id));
    }

    private static String requireEmail(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}

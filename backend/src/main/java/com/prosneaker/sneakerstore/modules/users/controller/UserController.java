package com.prosneaker.sneakerstore.modules.users.controller;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.users.dto.ChangePasswordRequest;
import com.prosneaker.sneakerstore.modules.users.dto.UpdateProfileRequest;
import com.prosneaker.sneakerstore.modules.users.dto.UserResponse;
import com.prosneaker.sneakerstore.modules.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping({"/profile", "/me"})
    public ApiResponse<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.success(userService.getCurrentUserProfile(requireEmail(userDetails)));
    }

    @PutMapping({"/profile", "/me"})
    public ApiResponse<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userService.updateProfile(requireEmail(userDetails), request));
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(requireEmail(userDetails), request);
        return ApiResponse.success("Password updated successfully", null);
    }

    private static String requireEmail(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}

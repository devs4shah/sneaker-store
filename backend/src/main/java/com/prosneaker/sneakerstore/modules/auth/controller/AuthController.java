package com.prosneaker.sneakerstore.modules.auth.controller;

import com.prosneaker.sneakerstore.modules.auth.dto.AuthResponse;
import com.prosneaker.sneakerstore.modules.auth.dto.LoginRequest;
import com.prosneaker.sneakerstore.modules.auth.dto.RefreshTokenRequest;
import com.prosneaker.sneakerstore.modules.auth.dto.RegisterRequest;
import com.prosneaker.sneakerstore.modules.auth.service.AuthService;
import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Registration successful", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.refresh(request));
    }
}

package com.prosneaker.sneakerstore.modules.auth.dto;

import com.prosneaker.sneakerstore.modules.users.dto.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final UserResponse user;
}
